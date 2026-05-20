using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Models.Entities;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CustomersController(AppDbContext context) { _context = context; }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            var users = await _context.Users!
                .Select(u => new {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    role = u.Role,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt,
                    totalOrders = _context.Orders!.Count(o => o.UserId == u.Id),
                    totalSpent = _context.Orders!.Where(o => o.UserId == u.Id && (o.OrderStatus.ToLower() == "hoàn tất" || o.PaymentStatus.ToLower() == "paid")).Sum(o => o.TotalAmount)
                })
                .OrderByDescending(u => u.createdAt)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<object>> GetUser(string id)
        {
            var user = await _context.Users!
                .Where(u => u.Id == id)
                .Select(u => new {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    role = u.Role,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, UpdateUserDto updateDto)
        {
            var user = await _context.Users!.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(updateDto.Email) && updateDto.Email.ToLower() != user.Email.ToLower())
            {
                var existingUser = await _context.Users!
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == updateDto.Email.ToLower() && u.Id != id);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email đã tồn tại" });
                }
            }

            if (!string.IsNullOrEmpty(updateDto.FullName))
                user.FullName = updateDto.FullName;

            if (!string.IsNullOrEmpty(updateDto.Email))
                user.Email = updateDto.Email;

            if (!string.IsNullOrEmpty(updateDto.Phone))
                user.Phone = updateDto.Phone;

            if (!string.IsNullOrEmpty(updateDto.Role))
                user.Role = updateDto.Role;

            if (updateDto.IsActive.HasValue)
                user.IsActive = updateDto.IsActive.Value;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", details = ex.Message });
            }
        }

        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(string id)
        {
            var user = await _context.Users!.FindAsync(id);
            if (user == null) return NotFound();

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { isActive = user.IsActive });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users!.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Check if user has orders
            var hasOrders = await _context.Orders!
                .AnyAsync(o => o.UserId == id);
            
            if (hasOrders)
            {
                return BadRequest(new { message = "Không thể xóa khách hàng đã có đơn hàng" });
            }

            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", details = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchUsers([FromQuery] string query = "")
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await GetAllUsers();
            }

            var users = await _context.Users!
                .Where(u => 
                    u.FullName.ToLower().Contains(query.ToLower()) ||
                    u.Email.ToLower().Contains(query.ToLower()) ||
                    (u.Phone != null && u.Phone.Contains(query)))
                .Select(u => new {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    role = u.Role,
                    isActive = true, // Default to true since User entity doesn't have IsActive
                    createdAt = u.CreatedAt,
                    totalOrders = _context.Orders!.Count(o => o.UserId == u.Id),
                    totalSpent = _context.Orders!.Where(o => o.UserId == u.Id && (o.OrderStatus.ToLower() == "hoàn tất" || o.PaymentStatus.ToLower() == "paid")).Sum(o => o.TotalAmount)
                })
                .OrderByDescending(u => u.createdAt)
                .Take(50) // Limit search results
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetCustomerStats()
        {
            var totalCustomers = await _context.Users!.CountAsync();
            var adminUsers = await _context.Users!.CountAsync(u => u.Role == "admin");
            var activeCustomers = await _context.Users!.CountAsync(u => u.IsActive);
            var inactiveCustomers = totalCustomers - activeCustomers;

            var newCustomersThisMonth = await _context.Users!
                .CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));

            return Ok(new {
                totalCustomers = totalCustomers,
                activeCustomers = activeCustomers,
                inactiveCustomers = inactiveCustomers,
                adminUsers = adminUsers,
                customerUsers = totalCustomers - adminUsers,
                newCustomersThisMonth = newCustomersThisMonth
            });
        }
    }

    public class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}
