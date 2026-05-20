using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using web_Trang_suc_BE.Models;

namespace web_Trang_suc_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public StatisticsController(AppDbContext context) { _context = context; }

        [HttpGet("dashboard")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            var totalOrders = await _context.Orders!.CountAsync();
            var totalRevenue = await _context.Orders!
                .Where(o => o.OrderStatus.ToLower() == "completed" || o.PaymentStatus.ToLower() == "paid")
                .SumAsync(o => o.TotalAmount);
            var newUsers = await _context.Users!.CountAsync();
            var productCount = await _context.Products!.CountAsync();
            
            var recentOrders = await _context.Orders!
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new {
                    id = o.Id,
                    customerName = o.FirstName + " " + o.LastName,
                    totalPrice = o.TotalAmount,
                    status = o.OrderStatus,
                    createdAt = o.CreatedAt
                })
                .ToListAsync();

            return Ok(new {
                totalRevenue = totalRevenue,
                totalOrders = totalOrders,
                totalCustomers = newUsers,
                totalProducts = productCount,
                recentOrders = recentOrders
            });
        }

        [HttpGet("revenue")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetRevenueStats([FromQuery] string period = "month")
        {
            DateTime startDate;
            DateTime endDate = DateTime.UtcNow;

            switch (period.ToLower())
            {
                case "week":
                    startDate = endDate.AddDays(-7);
                    break;
                case "month":
                    startDate = endDate.AddDays(-30);
                    break;
                case "quarter":
                    startDate = endDate.AddDays(-90);
                    break;
                case "year":
                    startDate = endDate.AddDays(-365);
                    break;
                default:
                    startDate = endDate.AddDays(-30);
                    break;
            }

            var revenueDataQuery = _context.Orders!
                .Where(o => (o.OrderStatus.ToLower() == "completed" || o.PaymentStatus.ToLower() == "paid") && o.CreatedAt >= startDate && o.CreatedAt <= endDate);

            if (period.ToLower() == "week")
            {
                var weeklyData = await revenueDataQuery
                    .GroupBy(o => EF.Functions.DateDiffDay(startDate, o.CreatedAt) / 7)
                    .Select(g => new {
                        date = startDate.AddDays(g.Key * 7).Date,
                        revenue = g.Sum(o => o.TotalAmount),
                        orders = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();
                
                var totalRevenue = weeklyData.Sum(x => x.revenue);
                var totalOrders = weeklyData.Sum(x => x.orders);

                return Ok(new {
                    period = period,
                    startDate = startDate,
                    endDate = endDate,
                    totalRevenue = totalRevenue,
                    totalOrders = totalOrders,
                    data = weeklyData
                });
            }

            if (period.ToLower() == "month")
            {
                var monthlyData = await revenueDataQuery
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new {
                        date = g.Key,
                        revenue = g.Sum(o => o.TotalAmount),
                        orders = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();
                
                var totalRevenue = monthlyData.Sum(x => x.revenue);
                var totalOrders = monthlyData.Sum(x => x.orders);

                return Ok(new {
                    period = period,
                    startDate = startDate,
                    endDate = endDate,
                    totalRevenue = totalRevenue,
                    totalOrders = totalOrders,
                    data = monthlyData
                });
            }

            if (period.ToLower() == "quarter")
            {
                var quarterlyData = await revenueDataQuery
                    .GroupBy(o => EF.Functions.DateDiffDay(startDate, o.CreatedAt) / 30)
                    .Select(g => new {
                        date = startDate.AddDays(g.Key * 30).Date,
                        revenue = g.Sum(o => o.TotalAmount),
                        orders = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();
                
                var totalRevenue = quarterlyData.Sum(x => x.revenue);
                var totalOrders = quarterlyData.Sum(x => x.orders);

                return Ok(new {
                    period = period,
                    startDate = startDate,
                    endDate = endDate,
                    totalRevenue = totalRevenue,
                    totalOrders = totalOrders,
                    data = quarterlyData
                });
            }

            if (period.ToLower() == "year")
            {
                var yearlyData = await revenueDataQuery
                    .GroupBy(o => new DateTime(o.CreatedAt.Year, o.CreatedAt.Month, 1))
                    .Select(g => new {
                        date = g.Key,
                        revenue = g.Sum(o => o.TotalAmount),
                        orders = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();
                
                var totalRevenue = yearlyData.Sum(x => x.revenue);
                var totalOrders = yearlyData.Sum(x => x.orders);

                return Ok(new {
                    period = period,
                    startDate = startDate,
                    endDate = endDate,
                    totalRevenue = totalRevenue,
                    totalOrders = totalOrders,
                    data = yearlyData
                });
            }

            // Default to daily
            var dailyData = await revenueDataQuery
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new {
                    date = g.Key,
                    revenue = g.Sum(o => o.TotalAmount),
                    orders = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();
            
            var totalRevenueDaily = dailyData.Sum(x => x.revenue);
            var totalOrdersDaily = dailyData.Sum(x => x.orders);

            return Ok(new {
                period = period,
                startDate = startDate,
                endDate = endDate,
                totalRevenue = totalRevenueDaily,
                totalOrders = totalOrdersDaily,
                data = dailyData
            });
        }

        [HttpGet("orders")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetOrderStats([FromQuery] string period = "month")
        {
            DateTime startDate;
            DateTime endDate = DateTime.UtcNow;

            switch (period.ToLower())
            {
                case "week":
                    startDate = endDate.AddDays(-7);
                    break;
                case "month":
                    startDate = endDate.AddDays(-30);
                    break;
                case "quarter":
                    startDate = endDate.AddDays(-90);
                    break;
                case "year":
                    startDate = endDate.AddDays(-365);
                    break;
                default:
                    startDate = endDate.AddDays(-30);
                    break;
            }

            var orderStatusData = await _context.Orders!
                .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                .GroupBy(o => o.OrderStatus)
                .Select(g => new {
                    status = g.Key,
                    count = g.Count(),
                    revenue = g.Sum(o => o.TotalAmount)
                })
                .ToListAsync();

            return Ok(new {
                period = period,
                startDate = startDate,
                endDate = endDate,
                data = orderStatusData
            });
        }

        [HttpGet("products")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetProductStats()
        {
            var topProducts = await _context.OrderItems!
                .GroupBy(oi => oi.ProductId)
                .Select(g => new {
                    productId = g.Key,
                    totalSold = g.Sum(oi => oi.Quantity),
                    revenue = g.Sum(oi => oi.PriceAtPurchase * oi.Quantity)
                })
                .OrderByDescending(x => x.totalSold)
                .Take(10)
                .Join(_context.Products!, 
                    pi => pi.productId, 
                    p => p.Id, 
                    (pi, p) => new {
                        productId = pi.productId,
                        productName = p.Name,
                        totalSold = pi.totalSold,
                        revenue = pi.revenue
                    })
                .ToListAsync();

            var lowStockProducts = await _context.Products!
                .Where(p => p.StockQuantity <= 10)
                .Select(p => new {
                    productId = p.Id,
                    productName = p.Name,
                    stockQuantity = p.StockQuantity,
                    inStock = p.StockQuantity > 0
                })
                .OrderBy(p => p.stockQuantity)
                .Take(10)
                .ToListAsync();

            return Ok(new {
                topProducts = topProducts,
                lowStockProducts = lowStockProducts
            });
        }

        [HttpGet("customers")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetCustomerStats([FromQuery] string period = "month")
        {
            DateTime startDate;
            DateTime endDate = DateTime.UtcNow;

            switch (period.ToLower())
            {
                case "week":
                    startDate = endDate.AddDays(-7);
                    break;
                case "month":
                    startDate = endDate.AddDays(-30);
                    break;
                case "quarter":
                    startDate = endDate.AddDays(-90);
                    break;
                case "year":
                    startDate = endDate.AddDays(-365);
                    break;
                default:
                    startDate = endDate.AddDays(-30);
                    break;
            }

            var newCustomers = await _context.Users!
                .Where(u => u.CreatedAt >= startDate && u.CreatedAt <= endDate)
                .CountAsync();

            var totalCustomers = await _context.Users!.CountAsync();

            var topCustomers = await _context.Orders!
                .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                .GroupBy(o => o.UserId)
                .Select(g => new {
                    userId = g.Key,
                    totalOrders = g.Count(),
                    totalSpent = g.Sum(o => o.TotalAmount)
                })
                .OrderByDescending(x => x.totalSpent)
                .Take(10)
                .Join(_context.Users!, 
                    oc => oc.userId, 
                    u => u.Id, 
                    (oc, u) => new {
                        userId = oc.userId,
                        customerName = u.FullName,
                        email = u.Email,
                        totalOrders = oc.totalOrders,
                        totalSpent = oc.totalSpent
                    })
                .ToListAsync();

            return Ok(new {
                period = period,
                startDate = startDate,
                endDate = endDate,
                newCustomers = newCustomers,
                totalCustomers = totalCustomers,
                topCustomers = topCustomers
            });
        }
    }
}