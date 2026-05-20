namespace web_Trang_suc_BE.Models.DTOs
{
    public class CheckoutItemDto
    {
        public long ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }

    public class CheckoutDto
    {
        public string RecipientName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Address { get; set; } = string.Empty;
        public string? Company { get; set; }
        public string? Apartment { get; set; }
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string? PostalCode { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string ShippingMethod { get; set; } = string.Empty;
        public string? DiscountCode { get; set; }
        public List<CheckoutItemDto> Items { get; set; } = new();
    }
}
