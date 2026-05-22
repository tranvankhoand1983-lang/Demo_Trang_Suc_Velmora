using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Models.Entities;

namespace web_Trang_suc_BE.Controllers
{
    /// <summary>
    /// API quản lý danh sách yêu thích của người dùng
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Wishlist - Quản lý danh sách yêu thích")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách tất cả các mục yêu thích
        /// </summary>
        /// <returns>Danh sách các mục yêu thích</returns>
        /// <response code="200">Trả về danh sách thành công</response>
        /// <response code="401">Chưa xác thực</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<Wishlist>>> GetWishlists()
        {
            var wishlists = await (_context.Wishlists?.Include(w => w.User).Include(w => w.Product).ToListAsync() ?? Task.FromResult(new List<Wishlist>()));
            return Ok(wishlists);
        }

        /// <summary>
        /// Lấy chi tiết một mục yêu thích theo userId và productId
        /// </summary>
        /// <param name="userId">ID người dùng</param>
        /// <param name="productId">ID sản phẩm</param>
        /// <returns>Chi tiết mục yêu thích</returns>
        /// <response code="200">Trả về chi tiết thành công</response>
        /// <response code="404">Không tìm thấy mục yêu thích</response>
        /// <response code="401">Chưa xác thực</response>
        [HttpGet("{userId}/{productId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Wishlist>> GetWishlist(string userId, long productId)
        {
            if (_context.Wishlists == null)
                return NotFound(new { message = "Mục yêu thích không tồn tại" });

            var wishlist = await _context.Wishlists.Include(w => w.User).Include(w => w.Product)
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (wishlist == null)
            {
                return NotFound(new { message = "Mục yêu thích không tồn tại" });
            }

            return Ok(wishlist);
        }

        /// <summary>
        /// Thêm một mục vào danh sách yêu thích
        /// </summary>
        /// <param name="wishlist">Thông tin mục yêu thích cần thêm</param>
        /// <returns>Mục yêu thích vừa được thêm</returns>
        /// <response code="201">Thêm thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="401">Chưa xác thực</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Wishlist>> PostWishlist(Wishlist wishlist)
        {
            _context.Wishlists?.Add(wishlist);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWishlist", new { userId = wishlist.UserId, productId = wishlist.ProductId }, wishlist);
        }

        /// <summary>
        /// Xóa một mục khỏi danh sách yêu thích
        /// </summary>
        /// <param name="userId">ID người dùng</param>
        /// <param name="productId">ID sản phẩm</param>
        /// <returns>Không trả về nội dung</returns>
        /// <response code="204">Xóa thành công</response>
        /// <response code="404">Không tìm thấy mục yêu thích</response>
        /// <response code="401">Chưa xác thực</response>
        [HttpDelete("{userId}/{productId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteWishlist(string userId, long productId)
        {
            if (_context.Wishlists == null)
                return NotFound(new { message = "Mục yêu thích không tồn tại" });

            var wishlist = await _context.Wishlists.FindAsync(userId, productId);
            if (wishlist == null)
            {
                return NotFound(new { message = "Mục yêu thích không tồn tại" });
            }

            _context.Wishlists.Remove(wishlist);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}