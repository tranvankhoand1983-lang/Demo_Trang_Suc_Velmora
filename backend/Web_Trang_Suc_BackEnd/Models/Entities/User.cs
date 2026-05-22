using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace web_Trang_suc_BE.Models.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
[Column("id", TypeName = "char(36)")] // Ép kiểu rõ ràng là char(36)
public string Id { get; set; } = Guid.NewGuid().ToString();
        [Column("fullName")]
        [Required]
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Column("email")]
        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Column("password")]
        [MaxLength(255)]
        public string? Password { get; set; }

        [Column("avatar")]
        public string? Avatar { get; set; }

        [Column("role")]
        [MaxLength(50)]
        public string Role { get; set; } = "customer";

        [Column("provider")]
        [MaxLength(50)]
        public string Provider { get; set; } = "email";

        [Column("phone")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("defaultAddress")]
        public string? DefaultAddress { get; set; }

        [Column("newsletterOptin")]
        public bool NewsletterOptin { get; set; } = false;

        [Column("isActive")]
        public bool IsActive { get; set; } = true;
        
        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}