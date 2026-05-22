using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Models.DTOs;
using web_Trang_suc_BE.Models.Entities;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrdersController(AppDbContext context) { _context = context; }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllOrders([FromQuery] string? search)
        {
            var query = _context.Orders!.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(o => 
                    o.Id.ToLower().Contains(searchLower) || 
                    o.FirstName.ToLower().Contains(searchLower) || 
                    o.LastName.ToLower().Contains(searchLower) ||
                    (o.Email != null && o.Email.ToLower().Contains(searchLower)) ||
                    (o.Phone != null && o.Phone.Contains(searchLower)));
            }

            var list = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    id = o.Id,
                    firstName = o.FirstName,
                    lastName = o.LastName,
                    email = o.Email,
                    phone = o.Phone,
                    totalAmount = o.TotalAmount,
                    orderStatus = o.OrderStatus,
                    paymentStatus = o.PaymentStatus,
                    createdAt = o.CreatedAt
                })
                .ToListAsync();
            return Ok(list);
        }

        [Authorize]
        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyOrders()
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var list = await _context.Orders!
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    id = o.Id,
                    totalAmount = o.TotalAmount,
                    orderStatus = o.OrderStatus,
                    paymentStatus = o.PaymentStatus,
                    createdAt = o.CreatedAt,
                    recipientName = o.FirstName + " " + o.LastName,
                    address = o.Address,
                    items = o.Items.Select(i => new {
                        productName = i.Product != null ? i.Product.Name : "Sản phẩm",
                        productImage = (i.Product != null && i.Product.Images != null && i.Product.Images.Count > 0) ? i.Product.Images.First().Url : "",
                        quantity = i.Quantity,
                        size = i.Size,
                        price = i.PriceAtPurchase
                    }).ToList()
                })
                .ToListAsync();
            return Ok(list);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrderDetails(string id)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var order = await _context.Orders!
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Variant)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            // Only allow owner or admin to see details
            if (role != "admin" && order.UserId != userId) return Forbid();

            return Ok(order);
        }

        [HttpPost("place-order")]
        public async Task<ActionResult> PlaceOrder([FromBody] CheckoutDto dto)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Generate Order ID
                var orderId = "ORD-" + DateTime.Now.ToString("yyMMdd") + new Random().Next(1000, 9999);
                
                // 2. Handle Name Splitting
                string firstName = dto.RecipientName;
                string lastName = "";
                var nameParts = dto.RecipientName.Trim().Split(' ');
                if (nameParts.Length > 1)
                {
                    lastName = nameParts[nameParts.Length - 1];
                    firstName = string.Join(" ", nameParts.Take(nameParts.Length - 1));
                }

                // 3. Setup Order Object (Base)
                var order = new Order
                {
                    Id = orderId,
                    UserId = string.IsNullOrEmpty(userId) ? null : userId,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Address = dto.Address,
                    Company = dto.Company,
                    Apartment = dto.Apartment,
                    City = dto.City,
                    Country = dto.Country,
                    PostalCode = dto.PostalCode,
                    ShippingMethod = dto.ShippingMethod,
                    PaymentMethod = dto.PaymentMethod,
                    DiscountCode = dto.DiscountCode,
                    CreatedAt = DateTime.Now,
                    OrderStatus = "Chờ xác nhận",
                    PaymentStatus = "Pending"
                };

                decimal subtotal = 0;

                // 4. Validate Items and Compute Subtotal
                foreach (var itemDto in dto.Items)
                {
                    var variant = await _context.ProductVariants!
                        .Include(v => v.Product)
                        .FirstOrDefaultAsync(v => v.Id == itemDto.ProductVariantId);

                    if (variant == null) return BadRequest($"Sản phẩm (Variant ID: {itemDto.ProductVariantId}) không tồn tại.");
                    
                    if (variant.StockQuantity < itemDto.Quantity)
                        return BadRequest($"Sản phẩm {variant.Product?.Name} (Size: {variant.Size}) không đủ tồn kho.");

                    // Use variant price if set, else fallback to main product price
                    decimal unitPrice = variant.Price > 0 ? variant.Price : (variant.Product?.Price ?? 0);
                    subtotal += unitPrice * itemDto.Quantity;

                    // Trừ tồn kho ngay khi đặt đơn hàng (trừ phi sau này bị Hủy thì sẽ hoàn lại)
                    variant.StockQuantity -= itemDto.Quantity;

                    // Create OrderItem
                    order.Items.Add(new OrderItem
                    {
                        OrderId = orderId,
                        ProductId = variant.ProductId,
                        VariantId = variant.Id,
                        Quantity = itemDto.Quantity,
                        Size = variant.Size,
                        PriceAtPurchase = unitPrice
                    });
                }

                // 5. Handle Shipping Fee
                order.ShippingFee = dto.ShippingMethod?.ToLower() switch {
                    var m when m != null && m.Contains("express") => 60000,
                    "standard" => 30000,
                    _ => 0 // free hoặc bất kỳ giá trị nào khác
                };

                // 6. Handle Discount Code Validation
                if (!string.IsNullOrEmpty(dto.DiscountCode))
                {
                    var promotion = await _context.Promotions!
                        .FirstOrDefaultAsync(p => p.Code.ToLower() == dto.DiscountCode.ToLower() && p.IsActive);

                    if (promotion != null)
                    {
                        decimal discount = subtotal * (promotion.Discount / 100m);
                        if (promotion.MaxDiscountAmount.HasValue && discount > promotion.MaxDiscountAmount.Value)
                        {
                            discount = promotion.MaxDiscountAmount.Value;
                        }
                        order.DiscountAmount = discount;
                        promotion.UsedCount++;
                    }
                }

                // 7. Calculate Final Total
                order.TotalAmount = subtotal + order.ShippingFee - order.DiscountAmount;
                if (order.TotalAmount < 0) order.TotalAmount = 0;

                // 8. Save Everything
                _context.Orders!.Add(order);

                // Clear items from cart after placing order
                if (!string.IsNullOrEmpty(userId))
                {
                    var cart = await _context.Carts
                        .Include(c => c.CartItems)
                        .FirstOrDefaultAsync(c => c.UserId == userId);

                    if (cart != null)
                    {
                        var orderedVariantIds = dto.Items.Select(i => i.ProductVariantId).ToList();
                        var itemsToRemove = cart.CartItems
                            .Where(ci => ci.VariantId.HasValue && orderedVariantIds.Contains(ci.VariantId.Value))
                            .ToList();

                        if (itemsToRemove.Any())
                        {
                            _context.CartItems.RemoveRange(itemsToRemove);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return Ok(new { orderId = order.Id, total = order.TotalAmount });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine("PLACE ORDER ERROR: " + ex.Message);
                return StatusCode(500, "Lỗi máy chủ khi xử lý đơn hàng: " + ex.Message);
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders!.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });

            var allowedStatuses = new[] { "Chờ xác nhận", "Chờ lấy hàng", "Chờ giao hàng", "Hoàn tất", "Hủy" };
            if (!allowedStatuses.Contains(dto.Status))
                return BadRequest(new { message = "Trạng thái không hợp lệ: " + dto.Status });

            // Nếu đổi sang trạng thái Hủy, thực hiện hoàn lại tồn kho
            if (dto.Status == "Hủy" && order.OrderStatus != "Hủy")
            {
                foreach (var item in order.Items)
                {
                    var variant = await _context.ProductVariants!
                        .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                    if (variant != null)
                        variant.StockQuantity += item.Quantity;
                }
            }
            // Nếu đổi từ Hủy sang trạng thái khác, thực hiện trừ lại tồn kho
            else if (dto.Status != "Hủy" && order.OrderStatus == "Hủy")
            {
                foreach (var item in order.Items)
                {
                    var variant = await _context.ProductVariants!
                        .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                    if (variant != null)
                        variant.StockQuantity = Math.Max(0, variant.StockQuantity - item.Quantity);
                }
            }

            // Đồng bộ trạng thái thanh toán sang Paid khi ở Chờ lấy hàng, Chờ giao hàng, hoặc Hoàn tất
            if (dto.Status == "Chờ lấy hàng" || dto.Status == "Chờ giao hàng" || dto.Status == "Hoàn tất")
            {
                if (order.PaymentStatus != "Paid")
                {
                    order.PaymentStatus = "Paid";
                    order.PaidAt = DateTime.Now;
                }
            }
            else if (dto.Status == "Hủy")
            {
                order.PaymentStatus = "Failed";
            }
            else if (dto.Status == "Chờ xác nhận")
            {
                order.PaymentStatus = "Pending";
            }

            order.OrderStatus = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = order.OrderStatus, paymentStatus = order.PaymentStatus });
        }

        [HttpPatch("{id}/receive")]
        [Authorize]
        public async Task<IActionResult> MarkOrderAsReceived(string id)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var order = await _context.Orders!.FindAsync(id);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });

            if (order.UserId != userId) return Forbid();

            if (order.OrderStatus != "Chờ giao hàng")
                return BadRequest(new { message = "Chỉ có thể xác nhận nhận hàng khi đơn đang được giao" });

            order.OrderStatus = "Hoàn tất";
            if (order.PaymentStatus != "Paid")
            {
                order.PaymentStatus = "Paid";
                order.PaidAt = DateTime.Now;
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = order.OrderStatus, paymentStatus = order.PaymentStatus });
        }

        [HttpPatch("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(string id)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var order = await _context.Orders!.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });

            if (order.UserId != userId) return Forbid();

            // Chỉ cho phép hủy khi chưa thanh toán (Chờ xác nhận)
            if (order.PaymentStatus == "Paid")
                return BadRequest(new { message = "Không thể hủy đơn đã thanh toán" });

            if (order.OrderStatus == "Hủy")
                return BadRequest(new { message = "Đơn hàng đã ở trạng thái hủy" });

            // Hoàn lại tồn kho
            foreach (var item in order.Items)
            {
                var variant = await _context.ProductVariants!
                    .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                if (variant != null)
                    variant.StockQuantity += item.Quantity;
            }

            order.OrderStatus = "Hủy";
            order.PaymentStatus = "Failed";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã hủy đơn hàng", status = order.OrderStatus });
        }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}