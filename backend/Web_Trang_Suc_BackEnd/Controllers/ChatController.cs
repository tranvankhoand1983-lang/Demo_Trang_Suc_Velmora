using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/chat")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private static string GetApiKey()
        {
            try 
            {
                // Ưu tiên 1: Đọc từ file api_key.txt (Chạy ở Local) - File này đã bị ẩn khỏi Git
                string path = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "api_key.txt");
                if (System.IO.File.Exists(path)) {
                    return System.IO.File.ReadAllText(path).Trim();
                }
                // Ưu tiên 2: Đọc từ biến môi trường (Nếu chạy trên mạng Railway)
                var envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
                if (!string.IsNullOrEmpty(envKey)) return envKey.Trim();
                
                return "KEY_NOT_FOUND";
            }
            catch { return ""; }
        }

        // Đã đổi sang model gemini-2.5-flash theo yêu cầu của sếp! Bản này xài thả ga không lo giới hạn.
        private static string GEMINI_URL => $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GetApiKey()}";
        private static string _trainingData = "";

        public ChatController()
        {
            if (string.IsNullOrEmpty(_trainingData))
            {
                try
                {
                    // Lấy dữ liệu từ file data.txt của bạn bè đưa
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "ChatBot", "data.txt");
                    if (System.IO.File.Exists(filePath))
                    {
                        _trainingData = System.IO.File.ReadAllText(filePath);
                    }
                }
                catch { }
            }
        }

        public class ChatRequest
        {
            public string message { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest req)
        {
            try
            {
                var prompt = _trainingData + "\n\n--- CÂU HỎI CỦA KHÁCH HÀNG: ---\n" + req.message + "\n\nHãy trả lời đóng vai nhân viên Velmora như hướng dẫn trên.";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                using var client = new HttpClient();
                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                
                var response = await client.PostAsync(GEMINI_URL, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return Ok(new { reply = "Lỗi API Google: " + responseString });
                }

                using var doc = JsonDocument.Parse(responseString);
                var replyText = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text").GetString();

                return Ok(new { reply = replyText });
            }
            catch (Exception ex)
            {
                return Ok(new { reply = "Lỗi C#: " + ex.Message });
            }
        }
    }
}
