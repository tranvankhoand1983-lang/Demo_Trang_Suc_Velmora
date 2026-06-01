# Velmora - Website Bán Trang Sức Cao Cấp
### 🌐 Link Online Đã Deploy
* **Frontend Website:** [https://demo-trang-suc-velmora.pages.dev](https://demo-trang-suc-velmora.pages.dev)
* **Video Demo sản phẩm:** [https://youtu.be/uaEh1d9xPx8?si=rSosjRp4OFBEeNkC](#)

---
## 1. Tên đề tài

Xây dựng Website Bán Trang Sức – Velmora

## 2. Giới thiệu Website / Hệ thống

Velmora là một website thương mại điện tử chuyên về kinh doanh trang sức cao cấp, được xây dựng theo kiến trúc Full-Stack gồm 3 tầng: Frontend (React + TypeScript), Backend (ASP.NET Core 8.0 Web API) và Database (MySQL 8.0).

Hệ thống phục vụ hai nhóm người dùng chính là Khách hàng và Quản trị viên (Admin), đồng thời tích hợp thêm module AI dự báo lạm phát (CPI) hỗ trợ quyết định kinh doanh cho Ban quản trị.

## 3. Danh sách thành viên – Nhóm 14

| STT | Họ và Tên | MSSV |
| :---: | :--- | :---: |
| 1 | Lê Minh Quân | 23810310115 |
| 2 | Trần Minh Nguyệt | 23810310081 |
| 3 | Trần Quỳnh Anh | 23810310147 |



## 4. Phân công nhiệm vụ

| Thành viên | Nhiệm vụ |
| :--- | :--- |
| Lê Minh Quân | Xây dựng toàn bộ Backend ASP.NET Core 8.0 (22 Controllers, JWT Auth, Swagger, CORS). Thiết kế Database MySQL (19 bảng). Tích hợp thanh toán VNPay và PayOS. Xây dựng module AI dự báo CPI (Python FastAPI + Streamlit). |
| Trần Minh Nguyệt | Xây dựng Frontend phía Khách hàng: Trang chủ, Danh sách sản phẩm, Chi tiết sản phẩm, Giỏ hàng (CartDrawer), Trang Checkout, Trang theo dõi đơn hàng, Trang tài khoản cá nhân. Quản lý State toàn cục (AuthContext, CartContext, FavoritesContext). |
| Trần Quỳnh Anh | Xây dựng Frontend Admin Dashboard: Tổng quan, Quản lý sản phẩm, Đơn hàng, Danh mục, Khuyến mãi, Khách hàng, Nội dung. Viết tài liệu SRS. Kiểm thử và hoàn thiện báo cáo. |



## 5. Công nghệ sử dụng

### Frontend
- React 19 + TypeScript – Xây dựng giao diện người dùng
- Vite – Build tool
- Tailwind CSS – Styling, giao diện responsive
- Axios – Gọi HTTP API
- React Router DOM – Điều hướng trang
- Context API – Quản lý trạng thái toàn cục (Auth, Cart, Favorites, Voucher, Notification)

### Backend
- ASP.NET Core 8.0 Web API – Server chính
- Entity Framework Core – ORM truy vấn database
- Pomelo.EntityFrameworkCore.MySql – Driver kết nối MySQL
- JWT (JSON Web Token) – Xác thực và phân quyền
- Swagger / OpenAPI – Tài liệu hóa API tự động
- Dockerfile – Hỗ trợ container hóa

### Database
- MySQL 8.0
- 19 bảng thực thể: `users`, `products`, `categories`, `orders`, `orderItems`, `carts`, `cartItems`, `reviews`, `favorites`, `wishlists`, `promotions`, `userVouchers`, `productVariants`, `productImages`, `materials`, `banners`, `shopSettings`, `suppliers`, `services`

### Module AI (Demo độc lập – `Demo_Hoc_May_CPI/`)
- Python 3.12, NumPy, Pandas, Scikit-learn
- Matplotlib, Seaborn – Trực quan hóa dữ liệu
- FastAPI – Expose API dự báo cho Frontend
- Streamlit – Giao diện Demo trực quan
- Thuật toán: Hồi quy tuyến tính đa biến tự xây dựng (Custom Linear Regression – Normal Equation)



## 6. Chức năng hệ thống

### Phía Khách hàng

| Trang / Chức năng | Mô tả |
| :--- | :--- |
| Trang chủ (HomePage) | Hiển thị banner quảng cáo động (Hero Section), danh sách sản phẩm nổi bật, danh mục và khu vực giới thiệu thương hiệu |
| Danh sách sản phẩm (ProductsPage) | Xem sản phẩm theo danh mục, lọc theo giá / kích thước / chất liệu, tìm kiếm |
| Chi tiết sản phẩm (ProductDetailPage) | Xem ảnh, mô tả, chọn kích thước, thêm vào giỏ hàng / yêu thích, xem đánh giá và bình luận |
| Giỏ hàng (CartDrawer) | Ngăn kéo giỏ hàng trượt từ bên phải, xem / sửa số lượng / xóa sản phẩm, xem tổng tiền |
| Checkout (CheckoutPage) | Nhập thông tin giao hàng, áp dụng mã giảm giá, chọn phương thức thanh toán (VNPay / PayOS / COD), tóm tắt đơn hàng |
| Thanh toán thành công (CheckoutSuccess) | Hiển thị thông báo đặt hàng thành công và mã đơn hàng |
| Đơn hàng của tôi (OrdersPage) | Xem danh sách đơn hàng, theo dõi trạng thái, xem hóa đơn chi tiết (InvoiceModal) |
| Tài khoản cá nhân (AccountPage) | Cập nhật thông tin cá nhân, đổi mật khẩu, xem lịch sử đơn hàng |
| Yêu thích (FavoritesPage) | Xem danh sách sản phẩm đã lưu yêu thích |
| Popup Voucher (VoucherPopup) | Hiển thị các mã giảm giá khả dụng, cho phép lưu voucher về tài khoản |
| Hướng dẫn kích thước (SizeGuideDrawer) | Bảng hướng dẫn đo và chọn kích thước trang sức |
| Trang Giới thiệu (AboutPage) | Thông tin về thương hiệu Velmora |
| Trang Liên hệ (ContactPage) | Form liên hệ và thông tin cửa hàng lấy từ ShopSettings |
| Trang FAQ (FAQPage) | Câu hỏi thường gặp |
| Trang Tin tức / Blog (NewsPage, Blog) | Bài viết tin tức trang sức |
| AI Chatbot | Hỗ trợ khách hàng qua chatbot tích hợp AI (góc dưới màn hình) |
| Đăng ký / Đăng nhập | Xác thực tài khoản qua JWT, duy trì phiên đăng nhập |

### Phía Admin

| Trang | Mô tả |
| :--- | :--- |
| Tổng quan (Dashboard) | Thống kê tổng doanh thu, tổng đơn hàng, tổng sản phẩm, tổng khách hàng và danh sách đơn hàng mới nhất |
| Quản lý sản phẩm (ProductList) | Xem, thêm, sửa, xóa sản phẩm; quản lý biến thể (kích thước, tồn kho), hình ảnh, danh mục, chất liệu, nhà cung cấp |
| Quản lý danh mục (CategoryList) | Thêm, sửa, xóa danh mục sản phẩm |
| Quản lý đơn hàng (OrderList) | Xem danh sách đơn hàng, cập nhật trạng thái (Pending → Confirmed → Shipping → Completed / Cancelled) |
| Quản lý khuyến mãi (PromotionList) | Tạo, sửa, xóa mã giảm giá; cấu hình điều kiện áp dụng, ngày hết hạn, loại giảm giá |
| Quản lý khách hàng (CustomerList) | Xem danh sách khách hàng, thông tin tài khoản và lịch sử mua hàng |
| Quản lý nội dung (ContentManagement) | Cập nhật nội dung Banner trang chủ (tiêu đề, ảnh, mô tả); chỉnh sửa thông tin liên hệ Shop (email, SĐT, địa chỉ, giờ làm việc, Facebook, Instagram) |
| Dự báo CPI – AI Prediction (AIPrediction) | Nhập 9 chỉ số kinh tế vĩ mô (CPI, Giá Vàng, Lãi suất của 3 tháng trước) → Gọi API Python → Nhận kết quả dự báo lạm phát tháng tới kèm lời khuyên kinh doanh |



## 7. Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 18.x trở lên
- .NET SDK 8.0 trở lên
- MySQL 8.0 trở lên
- Python 3.10 trở lên (cho module AI)

### Bước 1 – Clone repository
```bash
git clone https://github.com/<username>/<repo-name>.git
cd web-trang-suc
```

### Bước 2 – Cấu hình Database MySQL

Tạo database:
```sql
CREATE DATABASE web_trang_suc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

Import schema:
```bash
mysql -u root -p web_trang_suc_db < database/web_trang_suc_db.sql
```

Cập nhật connection string trong file `backend/Web_Trang_Suc_BackEnd/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "server=localhost;database=web_trang_suc_db;user=root;password=YOUR_PASSWORD;GuidFormat=None;"
}
```

### Bước 3 – Cài đặt thư viện Python (Module AI)
```bash
cd Demo_Hoc_May_CPI
pip install fastapi uvicorn pandas numpy matplotlib seaborn scikit-learn streamlit
```



## 8. Hướng dẫn chạy project

Mở 3 Terminal riêng biệt và chạy theo thứ tự:

### Terminal 1 – Backend (ASP.NET Core)
```bash
cd backend/Web_Trang_Suc_BackEnd
dotnet restore
dotnet run
```
Backend chạy tại: `http://localhost:5278`
Swagger UI: `http://localhost:5278/swagger/index.html`

### Terminal 2 – Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend chạy tại: `http://localhost:5173`

### Terminal 3 – AI API (FastAPI)
```bash
cd Demo_Hoc_May_CPI
uvicorn api:app --reload --port 8000
```
AI API chạy tại: `http://localhost:8000`

> Muốn xem Demo trực quan module AI (biểu đồ EDA, bảng độ đo):
> ```bash
> cd Demo_Hoc_May_CPI
> streamlit run app_ui.py
> ```



## 9. Tài khoản demo

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| Admin | admin@velmora.com | Admin@123 |
| Khách hàng | user@velmora.com | User@123 |



## 10. Hình ảnh minh họa hệ thống

<h4>1. Giao diện Trang chủ (HomePage)</h4>
<img width="1822" height="838" alt="image" src="https://github.com/user-attachments/assets/53d5edd2-8617-4ce4-87b1-13333d103071" />
<img width="1822" height="838" alt="image" src="https://github.com/user-attachments/assets/c47c0880-a042-4a6f-a2ee-23c939f39927" />
<img width="1822" height="838" alt="image" src="https://github.com/user-attachments/assets/171da3ec-a85c-415e-ad12-d6ede31cfb55" />
<img width="1822" height="838" alt="image" src="https://github.com/user-attachments/assets/79194c64-6e28-4947-b624-d7048bb65595" />

### Giao diện chatbot 
<img width="545" height="750" alt="image" src="https://github.com/user-attachments/assets/f76d85c6-0a1c-4cd9-8be4-9f4116828ee0" />


<h4>2. Chi tiết sản phẩm & Thêm vào giỏ hàng</h4>
<img width="1665" height="855" alt="image" src="https://github.com/user-attachments/assets/6b0e3a84-7e32-4192-a661-39ba27067b4e" />\
<img width="1674" height="840" alt="image" src="https://github.com/user-attachments/assets/f12cc9cc-a8f2-42d7-80a4-57501d1377f9" />

<h4>3. Trang Thanh toán (Checkout)</h4>
<img width="1832" height="842" alt="image" src="https://github.com/user-attachments/assets/39cf1b56-c38e-46f2-844c-ad8ef010f0fa" />
### Thanh toán qr bằng Payos
<img width="1686" height="854" alt="image" src="https://github.com/user-attachments/assets/a577ea0a-be32-4552-819f-37381d053fec" />


<h4>4. Tổng quan hệ thống (Dashboard Statistics)</h4>
<img width="1830" height="846" alt="image" src="https://github.com/user-attachments/assets/bf80841e-327f-4870-ab76-dcf040bfe90c" />

<h4>5. Quản lý sản phẩm , khách hàng, đơn hàng , khuyến mãi</h4>
<img width="1830" height="832" alt="image" src="https://github.com/user-attachments/assets/120799ee-8bde-41fe-a5a5-f3190a3d179f" />
<img width="1830" height="832" alt="image" src="https://github.com/user-attachments/assets/774158c6-5b97-4620-b425-116d13f18eac" />
<img width="1830" height="832" alt="image" src="https://github.com/user-attachments/assets/5e88fffa-281f-4922-b3e7-6e287b407543" />
<img width="1830" height="832" alt="image" src="https://github.com/user-attachments/assets/2543f500-6cce-48be-910f-aa4a52c81e05" />




















