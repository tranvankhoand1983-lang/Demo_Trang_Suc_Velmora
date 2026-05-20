using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using web_Trang_suc_BE.Models;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayOSController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;
        private readonly PayOSClient _payOS;

        public PayOSController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;

            var clientId = _configuration["PayOS:ClientId"] ?? "";
            var apiKey = _configuration["PayOS:ApiKey"] ?? "";
            var checksumKey = _configuration["PayOS:ChecksumKey"] ?? "";
            
            // SDK 2.x constructor takes clientId, apiKey, checksumKey, and partnerCode (null if none)
            _payOS = new PayOSClient(clientId, apiKey, checksumKey);
        }

        public class CreatePayOSRequestDto
        {
            public string OrderId { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string Description { get; set; } = string.Empty;
        }

        [HttpPost("create-payment-link")]
        public async Task<IActionResult> CreatePaymentLink([FromBody] CreatePayOSRequestDto request)
        {
            try
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

                // Tạo orderCode dạng số nguyên từ timestamp (PayOS yêu cầu số)
                var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() % 1_000_000_000;

                // Lưu mapping orderCode -> orderId vào DB hoặc dùng description
                // Đơn giản: dùng description để chứa orderId thật
                var items = new List<PaymentLinkItem>
                {
                    new PaymentLinkItem
                    {
                        Name = "Đơn hàng " + request.OrderId,
                        Quantity = 1,
                        Price = (long)request.Amount
                    }
                };

                var paymentData = new CreatePaymentLinkRequest
                {
                    OrderCode = orderCode,
                    Amount = (long)request.Amount,
                    Description = request.OrderId, // Dùng orderId thật làm description để nhận lại
                    Items = items,
                    CancelUrl = $"{frontendUrl}/orders",
                    ReturnUrl = $"{frontendUrl}/checkout/success?orderId={request.OrderId}"
                };

                var response = await _payOS.PaymentRequests.CreateAsync(paymentData);

                // Lưu orderCode vào DB để dùng khi webhook về
                var order = await _context.Orders!.FindAsync(request.OrderId);
                if (order != null)
                {
                    order.PaymentStatus = "Pending";
                    await _context.SaveChangesAsync();
                }

                return Ok(new { url = response.CheckoutUrl, orderCode = orderCode });
            }
            catch (Exception ex)
            {
                Console.WriteLine("PayOS Error: " + ex.Message);
                return StatusCode(500, new { message = "Không thể tạo link thanh toán PayOS", error = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] Webhook webhookData)
        {
            try
            {
                var webhookBody = await _payOS.Webhooks.VerifyAsync(webhookData);

                // Description chứa orderId thật
                var orderId = webhookBody.Description;
                if (string.IsNullOrEmpty(orderId))
                    return Ok(new { success = false, message = "No orderId in description" });

                var order = await _context.Orders!
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return Ok(new { success = false, message = "Order not found" });

                if (webhookBody.Code == "00") // Thanh toán thành công
                {
                    if (order.PaymentStatus != "Paid")
                    {
                        order.PaymentStatus = "Paid";
                        order.OrderStatus = "Chờ lấy hàng";
                        order.PaidAt = DateTime.Now;

                        // Trừ tồn kho khi tiền về thành công
                        foreach (var item in order.Items)
                        {
                            var variant = await _context.ProductVariants!
                                .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                            if (variant != null)
                                variant.StockQuantity = Math.Max(0, variant.StockQuantity - item.Quantity);
                        }

                        await _context.SaveChangesAsync();
                    }
                }
                else // Thanh toán thất bại/hủy
                {
                    if (order.PaymentStatus != "Paid")
                    {
                        order.PaymentStatus = "Failed";
                        order.OrderStatus = "Hủy";

                        // Hoàn lại tồn kho
                        foreach (var item in order.Items)
                        {
                            var variant = await _context.ProductVariants!
                                .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                            if (variant != null)
                                variant.StockQuantity += item.Quantity;
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine("PayOS Webhook Error: " + ex.Message);
                return Ok(new { success = false, message = ex.Message });
            }
        }

        // Endpoint để FE kiểm tra trạng thái sau khi redirect về
        [HttpGet("check-status/{orderId}")]
        public async Task<IActionResult> CheckOrderStatus(string orderId)
        {
            var order = await _context.Orders!
                .Where(o => o.Id == orderId)
                .Select(o => new { o.Id, o.OrderStatus, o.PaymentStatus })
                .FirstOrDefaultAsync();

            if (order == null) return NotFound();
            return Ok(order);
        }

        // Endpoint đồng bộ trạng thái thanh toán từ frontend redirect (giải pháp cho localhost không có webhook)
        [HttpGet("sync-status")]
        public async Task<IActionResult> SyncStatusFromRedirect([FromQuery] string orderId, [FromQuery] string status)
        {
            try
            {
                var order = await _context.Orders!.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
                if (order == null) return NotFound(new { success = false, message = "Order not found" });

                if (status == "PAID" && order.PaymentStatus != "Paid")
                {
                    order.PaymentStatus = "Paid";
                    order.OrderStatus = "Chờ lấy hàng";
                    order.PaidAt = DateTime.Now;

                    // Trừ tồn kho khi tiền về thành công
                    foreach (var item in order.Items)
                    {
                        var variant = await _context.ProductVariants!
                            .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                        if (variant != null)
                            variant.StockQuantity = Math.Max(0, variant.StockQuantity - item.Quantity);
                    }

                    await _context.SaveChangesAsync();
                }
                else if (status == "CANCELLED" && order.PaymentStatus != "Paid")
                {
                    order.PaymentStatus = "Failed";
                    order.OrderStatus = "Hủy";
                    // Không cần hoàn lại tồn kho vì tồn kho chưa bị trừ
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = true, paymentStatus = order.PaymentStatus, orderStatus = order.OrderStatus });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
