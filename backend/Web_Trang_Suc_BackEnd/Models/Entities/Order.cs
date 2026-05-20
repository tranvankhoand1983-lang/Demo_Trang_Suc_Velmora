using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace web_Trang_suc_BE.Models.Entities
{
    [Table("orders")]
    public class Order
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Column("userId")]
        public string? UserId { get; set; }

        [Column("firstName")]
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Column("lastName")]
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Column("email")]
        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Column("phone")]
        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Column("company")]
        [MaxLength(255)]
        public string? Company { get; set; }

        [Column("address")]
        [Required]
        public string Address { get; set; } = string.Empty;

        [Column("apartment")]
        [MaxLength(255)]
        public string? Apartment { get; set; }

        [Column("city")]
        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Column("country")]
        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Column("postalCode")]
        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [Column("shippingMethod")]
        [Required]
        [MaxLength(50)]
        public string ShippingMethod { get; set; } = string.Empty;

        [Column("shippingFee")]
        public decimal ShippingFee { get; set; } = 0;

        [Column("paymentMethod")]
        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Column("paymentStatus")]
        [MaxLength(50)]
        public string PaymentStatus { get; set; } = "unpaid";

        [Column("orderStatus")]
        [MaxLength(50)]
        public string OrderStatus { get; set; } = "Chờ xác nhận";

        [Column("discountCode")]
        [MaxLength(50)]
        public string? DiscountCode { get; set; }

        [Column("discountAmount")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column("totalAmount")]
        public decimal TotalAmount { get; set; }

        [Column("estimatedDelivery")]
        public DateTime? EstimatedDelivery { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("paidAt")]
        public DateTime? PaidAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}