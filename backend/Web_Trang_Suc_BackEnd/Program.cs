using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using web_Trang_suc_BE.Models;
using web_Trang_suc_BE.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Configure CORS
builder.Services.AddCors(options =>
{
    var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000", frontendUrl) // Added dynamic origin support
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (connectionString != null)
    {
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }
});

// Configure JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "Velmora_Secret_Key_2026_Project_Longer_Key_For_Security";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Configure PayOS
builder.Services.AddSingleton<PayOS.PayOSClient>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var clientId = config["PayOS:ClientId"] ?? throw new InvalidOperationException("PayOS ClientId is missing");
    var apiKey = config["PayOS:ApiKey"] ?? throw new InvalidOperationException("PayOS ApiKey is missing");
    var checksumKey = config["PayOS:ChecksumKey"] ?? throw new InvalidOperationException("PayOS ChecksumKey is missing");
    return new PayOS.PayOSClient(clientId, apiKey, checksumKey);
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Cấu hình thông tin Swagger
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "VELMORA API - Jewelry E-Commerce Platform",
        Version = "v1.0",
        Description = "API documentation cho hệ thống bán trang sức VELMORA. Bao gồm các endpoint quản lý sản phẩm, người dùng, đơn hàng và thanh toán.",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "VELMORA Development Team",
            Email = "support@velmora.com",
            Url = new Uri("https://velmora.com")
        },
        License = new Microsoft.OpenApi.Models.OpenApiLicense
        {
            Name = "MIT",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    // Hỗ trợ XML Comments từ các file .xml
    var xmlFile = System.IO.Path.Combine(System.AppContext.BaseDirectory, "web_Trang_suc_BE.xml");
    if (System.IO.File.Exists(xmlFile))
    {
        options.IncludeXmlComments(xmlFile);
    }

    // Chia thành các groups theo chức năng
    options.TagActionsBy(api =>
    {
        if (api.GroupName != null)
            return new[] { api.GroupName };

        var controllerActionDescriptor = api.ActionDescriptor as Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor;
        if (controllerActionDescriptor != null)
        {
            return new[] { controllerActionDescriptor.ControllerName };
        }

        return new[] { "Default" };
    });

    options.DocInclusionPredicate((name, api) => true);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Seed admin user and update schema
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Auto-update schema for users table
    try {
        await context.Database.ExecuteSqlRawAsync("ALTER TABLE users ADD COLUMN IF NOT EXISTS isActive TINYINT(1) DEFAULT 1;");
        // Fallback for some MySQL versions that don't support ADD COLUMN IF NOT EXISTS
    } catch {
        try {
            await context.Database.ExecuteSqlRawAsync("ALTER TABLE users ADD isActive TINYINT(1) DEFAULT 1;");
        } catch { /* Already exists */ }
    }

    await SeedData.SeedAdminUser(context);
}

app.MapControllers();

app.Run();

