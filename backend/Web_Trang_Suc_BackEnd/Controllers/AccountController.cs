using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Models.DTOs;
using web_Trang_suc_BE.Models.Entities;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AccountController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            if (await _context.Users!.AnyAsync(u => u.Email == dto.Email)) return BadRequest("Email already exists");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                DefaultAddress = dto.Address,
                Role = "customer"
            };

            _context.Users!.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Token = CreateToken(user),
                User = new UserDto { Id = user.Id, Name = user.FullName, Email = user.Email, Role = user.Role }
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            try 
            {
                var email = dto.Email?.Trim().ToLower();
                var password = dto.Password; // Don't trim password as it might have intentional spaces
                
               var user = await _context.Users!.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

                if (user == null || string.IsNullOrEmpty(user.Password)) {
                    Console.WriteLine($"LOGIN FAIL: User not found or no password for {email}");
                    return Unauthorized("Email hoặc mật khẩu không chính xác.");
                }
                
                bool isPasswordMatch = false;
                
                // Try BCrypt first if it looks like a hash
                if (user.Password.StartsWith("$2")) {
                    try {
                        isPasswordMatch = BCrypt.Net.BCrypt.Verify(password, user.Password);
                    } catch (Exception ex) {
                        Console.WriteLine($"BCrypt Verify Error: {ex.Message}");
                        isPasswordMatch = (user.Password == password); // Fallback to plain text
                    }
                } else {
                    isPasswordMatch = (user.Password == password);
                }

                if (!isPasswordMatch) {
                    Console.WriteLine($"LOGIN FAIL: Password mismatch for {email}");
                    return Unauthorized("Email hoặc mật khẩu không chính xác.");
                }

                if (!user.IsActive) {
                    return Unauthorized("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
                }

                return Ok(new AuthResponseDto
                {
                    Token = CreateToken(user),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Name = user.FullName,
                        Email = user.Email,
                        Role = user.Role,
                        Avatar = user.Avatar
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("LOGIN EXCEPTION: " + ex.Message);
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            // Get user id from JWT token
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });

            var user = await _context.Users!.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            if (string.IsNullOrEmpty(user.Password))
                return BadRequest(new { message = "Tài khoản đăng nhập qua Google không thể đổi mật khẩu tại đây." });

            // Verify current password - support both plain text and bcrypt
            bool isCurrentPasswordValid = user.Password == dto.CurrentPassword;
            if (!isCurrentPasswordValid && user.Password.StartsWith("$2"))
            {
                isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password);
            }

            if (!isCurrentPasswordValid)
                return BadRequest(new { field = "currentPassword", message = "Mật khẩu hiện tại không đúng." });

            // Hash and save new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mật khẩu đã được thay đổi thành công." });
        }

        [HttpPost("google-login")]
        public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            try
            {
                using var httpClient = new HttpClient();
                using var request = new HttpRequestMessage(new HttpMethod("GET"), "https://www.googleapis.com/oauth2/v3/userinfo");
                request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {dto.Token}"); 

                var response = await httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode) return BadRequest("Invalid Google Token");

                var content = await response.Content.ReadAsStringAsync();
                var payload = System.Text.Json.JsonSerializer.Deserialize<GoogleUserInfoDto>(content);

                if (payload == null || string.IsNullOrEmpty(payload.Email)) return BadRequest("Invalid Google Token Payload");

                var user = await _context.Users!.FirstOrDefaultAsync(u => u.Email == payload.Email);
                if (user == null)
                {
                    // Create new user for google auth
                    user = new User
                    {
                        FullName = payload.Name ?? "Google User",
                        Email = payload.Email,
                        Avatar = payload.Picture,
                        Role = "customer",
                        Provider = "google",
                        IsActive = true
                    };

                    _context.Users!.Add(user);
                    await _context.SaveChangesAsync();
                }

                if (!user.IsActive) {
                    return Unauthorized("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
                }

                return Ok(new AuthResponseDto
                {
                    Token = CreateToken(user),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Name = user.FullName,
                        Email = user.Email,
                        Role = user.Role,
                        Avatar = user.Avatar,
                        Provider = user.Provider
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Email))
                return BadRequest(new { message = "Email không được để trống." });

            var email = dto.Email.Trim().ToLower();
            var user = await _context.Users!.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
                return NotFound(new { message = "Email này không tồn tại trong hệ thống." });

            if (user.Provider == "google")
                return BadRequest(new { message = "Tài khoản này đăng ký qua Google, vui lòng đăng nhập bằng Google." });

            // Generate simple temporary password
            string tempPassword = "Velmora" + new Random().Next(100, 999) + "@";
            
            // Hash and update password
            user.Password = BCrypt.Net.BCrypt.HashPassword(tempPassword);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Khôi phục mật khẩu thành công!", 
                tempPassword = tempPassword,
                hint = $"Mật khẩu mới của bạn là: {tempPassword}. Vui lòng đăng nhập và đổi lại mật khẩu trong trang Cá Nhân."
            });
        }

        public class GoogleUserInfoDto
        {
            [System.Text.Json.Serialization.JsonPropertyName("email")]
            public string? Email { get; set; }
            [System.Text.Json.Serialization.JsonPropertyName("name")]
            public string? Name { get; set; }
            [System.Text.Json.Serialization.JsonPropertyName("picture")]
            public string? Picture { get; set; }
        }

        public class ForgotPasswordDto
        {
            public string Email { get; set; } = string.Empty;
        }


        private string CreateToken(User user)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),  // Explicit claim for easier retrieval
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SecretKeyVeryLongForProject"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
            var tokenDescriptor = new SecurityTokenDescriptor { Subject = new ClaimsIdentity(claims), Expires = DateTime.Now.AddDays(7), SigningCredentials = creds };
            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
    }
}