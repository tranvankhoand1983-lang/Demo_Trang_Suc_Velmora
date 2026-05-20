using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using web_Trang_suc_BE.Helpers;
using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Models.Entities;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public PaymentController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public class PaymentRequestDto
        {
            public string OrderId { get; set; } = string.Empty;
            public decimal Amount { get; set; }
        }

        [HttpPost("create-vnpay-url")]
        public IActionResult CreatePaymentUrl([FromBody] PaymentRequestDto request)
        {
            var ipAddr = Utils.GetIpAddress(HttpContext);

            var vnp_Returnurl = _configuration["Vnpay:ReturnUrl"];
            var vnp_Url = _configuration["Vnpay:BaseUrl"];
            var vnp_TmnCode = _configuration["Vnpay:TmnCode"];
            var vnp_HashSecret = _configuration["Vnpay:HashSecret"];

            if (string.IsNullOrEmpty(vnp_TmnCode) || string.IsNullOrEmpty(vnp_HashSecret))
            {
                return BadRequest("VNPAY configuration is missing.");
            }

            var vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(request.Amount * 100)).ToString()); 
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", ipAddr);
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang:" + request.OrderId);
            vnpay.AddRequestData("vnp_OrderType", "other"); // default
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl ?? string.Empty);
            vnpay.AddRequestData("vnp_TxnRef", request.OrderId);

            var paymentUrl = vnpay.CreateRequestUrl(vnp_Url ?? string.Empty, vnp_HashSecret);

            return Ok(new { url = paymentUrl });
        }

        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VnpayReturn()
        {
            var vnpayData = Request.Query;
            var vnpay = new VnPayLibrary();

            foreach (var kv in vnpayData)
            {
                if (!string.IsNullOrEmpty(kv.Key) && kv.Key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(kv.Key, kv.Value.ToString());
                }
            }

            var vnp_orderId = vnpay.GetResponseData("vnp_TxnRef");
            var vnp_TransactionId = vnpay.GetResponseData("vnp_TransactionNo");
            var vnp_SecureHash = Request.Query["vnp_SecureHash"].ToString();
            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            var vnp_TransactionStatus = vnpay.GetResponseData("vnp_TransactionStatus");

            Console.WriteLine($"VNPAY RETURN: OrderId={vnp_orderId}, ResponseCode={vnp_ResponseCode}, Status={vnp_TransactionStatus}");

            var vnp_HashSecret = _configuration["Vnpay:HashSecret"];
            if (string.IsNullOrEmpty(vnp_HashSecret)) return BadRequest("Missing Vnpay config");

            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);

            string frontendUrl = _configuration["Vnpay:FrontendRedirectUrl"] ?? "http://localhost:5173";

            if (checkSignature)
            {
                var order = await _context.Orders!
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == vnp_orderId);

                if (order == null) return Redirect($"{frontendUrl}/checkout/failure?error=OrderNotFound");

                if (vnp_ResponseCode == "00" && vnp_TransactionStatus == "00")
                {
                    if (order.PaymentStatus != "Paid")
                    {
                        order.PaymentStatus = "Paid";
                        order.OrderStatus = "Chờ lấy hàng";
                        order.PaidAt = DateTime.Now;
                        await _context.SaveChangesAsync();
                    }
                    return Redirect($"{frontendUrl}/checkout/success?orderId={vnp_orderId}");
                }
                else
                {
                    if (order.PaymentStatus != "Paid")
                    {
                        order.PaymentStatus = "Failed";
                        order.OrderStatus = "Hủy";

                        foreach (var item in order.Items)
                        {
                            var variant = await _context.ProductVariants!
                                .FirstOrDefaultAsync(v => v.Id == item.VariantId);
                            if (variant != null)
                            {
                                variant.StockQuantity += item.Quantity;
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                    return Redirect($"{frontendUrl}/checkout/failure?orderId={vnp_orderId}&code={vnp_ResponseCode}");
                }
            }
            else
            {
                return Redirect($"{frontendUrl}/checkout/failure?error=InvalidSignature");
            }
        }
    }
}
