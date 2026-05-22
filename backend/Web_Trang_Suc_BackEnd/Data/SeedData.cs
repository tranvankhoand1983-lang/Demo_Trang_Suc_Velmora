using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Models.Entities;

namespace web_Trang_suc_BE.Data
{
    public static class SeedData
    {
        public static async Task SeedAdminUser(AppDbContext context)
        {
            try
            {
                var adminUser = context.Users?.FirstOrDefault(u => u.Email == "admin@velmora.com");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        Id = Guid.NewGuid().ToString(),
                        FullName = "Admin",
                        Email = "admin@velmora.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),  
                        Role = "admin",
                        Provider = "email",
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users?.Add(adminUser);
                    await context.SaveChangesAsync();
                    Console.WriteLine("✅ Admin user created successfully: admin@velmora.com / Admin@123");
                }
                else
                {
                    Console.WriteLine("ℹ️ Admin user already exists, skipping seed.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ SeedData warning: {ex.Message}");
            }
        }
    }
}
