SET FOREIGN_KEY_CHECKS = 0;
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 21, 2026 lúc 06:10 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `web_trang_suc_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `imageUrl` text NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `banners`
--

INSERT INTO `banners` (`id`, `imageUrl`, `subtitle`, `title`, `description`, `isActive`) VALUES
(1, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80', 'Bộ sưu tập mới 2026', 'Tinh Hoa Trang Sức Việt', 'Nơi hội tụ những kiệt tác từ bàn tay nghệ nhân lành nghề —\nSang trọng, tinh tế, vĩnh cửu\n', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) NOT NULL,
  `userId` char(36) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `userId`, `createdAt`) VALUES
(4, 'admin-uuid-001', '2026-04-18 15:49:46'),
(5, 'd7662f9f-f41b-4ec0-8cbc-21018e5018fa', '2026-04-20 08:41:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) NOT NULL,
  `cartId` bigint(20) NOT NULL,
  `productId` bigint(20) NOT NULL,
  `variantId` bigint(20) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `size` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `cartId`, `productId`, `variantId`, `quantity`, `size`) VALUES
(28, 5, 4, 401, 1, NULL),
(29, 4, 1, 601, 1, NULL),
(32, 4, 20, 13, 1, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `imageUrl` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `slug`, `name`, `imageUrl`, `description`, `createdAt`) VALUES
(1, 'necklace', 'Dây Chuyền', 'https://th.bing.com/th/id/R.43c8732d49a631675fcd2e81a1071c9f?rik=Psk4WKL%2f7d2Kjw&riu=http%3a%2f%2fimg.ltwebstatic.com%2fimages3_spmp%2f2023%2f08%2f19%2fd5%2f16924187712a18d0c0f978cbffe30bc40384a5de43_thumbnail_600x.jpg&ehk=j%2fPbcUHmWyuy%2f01nuwtsmc5sLuUTzTKE2bk8dwP5%2fSs%3d&risl=&pid=ImgRaw&r=0', 'Những mẫu dây chuyền tinh tế, tôn vinh vẻ đẹp vùng cổ.', '2026-04-16 19:05:28'),
(2, 'ring', 'Nhẫn', 'https://i.etsystatic.com/5306257/r/il/fc30e9/1449851507/il_1080xN.1449851507_cx2t.jpg', 'Biểu tượng của tình yêu và sự cam kết vĩnh cửu.', '2026-04-16 19:05:28'),
(3, 'bracelet', 'Lắc Tay', 'https://i.pinimg.com/736x/4c/5d/3d/4c5d3d16528b170ea79e97e402dcdf9e.jpg', 'Điểm nhấn sang trọng cho đôi tay phái đẹp.', '2026-04-16 19:05:28'),
(4, 'earring', 'Bông Tai', 'https://dygtyjqp7pi0m.cloudfront.net/i/70710/55563408_1.jpg?v=8DD43253DF277F0', 'Lấp lánh và rạng rỡ, làm nổi bật khuôn mặt.', '2026-04-16 19:05:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorites`
--

CREATE TABLE `favorites` (
  `userId` char(36) NOT NULL,
  `productId` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `materials`
--

INSERT INTO `materials` (`id`, `slug`, `name`) VALUES
(1, 'gold', 'Vàng'),
(2, 'silver', 'Bạc'),
(3, 'platinum', 'Vàng giả'),
(4, 'diamond', 'Kim Cương');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` varchar(50) NOT NULL COMMENT 'Mã đơn dạng ORD-XXXX',
  `userId` char(36) DEFAULT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `apartment` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `postalCode` varchar(20) DEFAULT NULL,
  `shippingMethod` varchar(50) NOT NULL,
  `shippingFee` decimal(15,2) DEFAULT 0.00,
  `paymentMethod` varchar(50) NOT NULL,
  `paymentStatus` varchar(50) DEFAULT 'unpaid',
  `orderStatus` varchar(50) DEFAULT 'pending',
  `discountCode` varchar(50) DEFAULT NULL,
  `discountAmount` decimal(15,2) DEFAULT 0.00,
  `totalAmount` decimal(15,2) NOT NULL,
  `estimatedDelivery` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `paidAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `userId`, `firstName`, `lastName`, `email`, `phone`, `company`, `address`, `apartment`, `city`, `country`, `postalCode`, `shippingMethod`, `shippingFee`, `paymentMethod`, `paymentStatus`, `orderStatus`, `discountCode`, `discountAmount`, `totalAmount`, `estimatedDelivery`, `createdAt`, `paidAt`) VALUES
('ORD-2605106564', 'admin-uuid-001', 'Admin', 'Velmora', 'admin@velmora.com', '0329387676', '', 'minh tân', '', 'Ninh Bình', 'Vietnam', '', 'free', 30000.00, 'vietqr', 'unpaid', 'pending', '', 0.00, 448000.00, NULL, '2026-05-09 18:35:05', NULL),
('ORD-5423', 'd7662f9f-f41b-4ec0-8cbc-21018e5018fa', '', '', 'tranvankhoand1983@gmail.com', '', NULL, '', NULL, '', '', NULL, 'free', 0.00, '', 'unpaid', 'pending', NULL, 0.00, 0.00, NULL, '2026-04-20 08:44:16', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `orderId` varchar(50) NOT NULL,
  `productId` bigint(20) NOT NULL,
  `variantId` bigint(20) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `priceAtPurchase` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `productId`, `variantId`, `quantity`, `size`, `priceAtPurchase`) VALUES
(1, 'ORD-2605106564', 1, 1, 1, '5 (49mm)', 149000.00),
(2, 'ORD-2605106564', 15, 27, 1, 'M (16cm)', 269000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `materialId` int(11) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `originalPrice` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `originStory` text DEFAULT NULL,
  `stockQuantity` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `reviewCount` int(11) DEFAULT 0,
  `isNew` tinyint(1) DEFAULT 0,
  `isSale` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `sku`, `name`, `categoryId`, `materialId`, `price`, `originalPrice`, `description`, `originStory`, `stockQuantity`, `rating`, `reviewCount`, `isNew`, `isSale`, `createdAt`) VALUES
(1, 'VEL-T1-RING', 'Velmora T1 Narrow Ring', 2, 2, 149000.00, 189000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Rhodium\",\"stone\":\"Cubic Zirconia AAA\",\"weight\":\"2.1 chỉ\",\"style\":\"Hiện đại\",\"description\":\"Biểu tượng chữ V huyền thoại đại diện cho sức mạnh và sự tự tin cá nhân.\"}', '', 0, 4.90, 12, 0, 1, '2026-04-16 19:05:29'),
(2, 'VEL-KNOT-RING', 'Velmora Knot Ring', 2, 2, 169000.00, 219000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Platinum\",\"stone\":\"Không đá\",\"weight\":\"1.8 chỉ\",\"style\":\"Thanh lịch\",\"description\":\"Thiết kế nút thắt đặc trưng của dòng Velmora Knot tượng trưng cho sự gắn kết.\"}', '', 40, 4.80, 8, 1, 1, '2026-04-16 19:05:29'),
(3, 'VEL-FORGE-WIDE', 'Velmora Forge Wide Ring', 2, 2, 219000.00, 259000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 Antique\",\"stone\":\"Kim cương Lab\",\"weight\":\"2.5 chỉ\",\"style\":\"Cá tính\",\"description\":\"Mẫu nhẫn mắt xích bản rộng mang phong cách Industrial độc đáo.\"}', '', 30, 4.70, 5, 1, 0, '2026-04-16 19:05:29'),
(4, 'VEL-VIC-RING', 'Velmora Victoria Ring', 2, 4, 199000.00, 249000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Platin\",\"stone\":\"Marquise cut Lab Diamond\",\"weight\":\"2.0 chỉ\",\"style\":\"Lộng lẫy\",\"description\":\"Cụm hoa Victoria lấp lánh như những vì sao đêm rực rỡ.\"}', '', 25, 4.90, 14, 1, 1, '2026-04-16 19:05:29'),
(5, 'VEL-SMILE-NK', 'Velmora Smile Necklace', 1, 2, 269000.00, 299000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Vàng trắng\",\"stone\":\"Zirconia tấm\",\"weight\":\"1.4 chỉ\",\"style\":\"Trẻ trung\",\"description\":\"Mặt dây chuyền nụ cười huyền thoại mang lại vẻ rạng rỡ và lạc quan.\"}', '', 60, 4.90, 42, 0, 1, '2026-04-16 19:05:29'),
(6, 'VEL-HARD-NK', 'Velmora HardWear Pendant', 1, 2, 289000.00, 329000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925\",\"stone\":\"None\",\"weight\":\"3.0 chỉ\",\"style\":\"Phố thị\",\"description\":\"Sự kết hợp giữa mắt xích công nghiệp và nét nữ tính sang trọng.\"}', '', 20, 4.80, 9, 1, 0, '2026-04-16 19:05:29'),
(7, 'VEL-SOL-EAR', 'Velmora Solitaire Studs', 4, 4, 159000.00, 199000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Bạch kim\",\"stone\":\"Kim cương Lab 0.1ct\",\"weight\":\"0.5 chỉ\",\"style\":\"Cổ điển\",\"description\":\"Bông tai một viên đá tối giản, tối ưu hoá sự phản chiếu ánh sáng.\"}', '', 15, 5.00, 61, 1, 1, '2026-04-16 19:05:29'),
(8, 'VEL-KNOT-BAN', 'Velmora Knot Wire Bangle', 3, 2, 295000.00, 359000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Vàng hồng\",\"stone\":\"Zirconia tinh khiết\",\"weight\":\"4.2 chỉ\",\"style\":\"Sang trọng\",\"description\":\"Vòng tay Wire Bangle với điểm nhấn nút thắt quấn đôi cực kỳ tinh xảo.\"}', '', 10, 4.90, 22, 1, 1, '2026-04-16 19:05:29'),
(9, 'VEL-LOCK-RING', 'Velmora Lock Ring', 2, 2, 189000.00, 219000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Rhodium\",\"stone\":\"None\",\"weight\":\"1.6 chỉ\",\"style\":\"Bình đẳng\",\"description\":\"Mẫu nhẫn lấy cảm hứng từ ổ khoá, mang thông điệp đoàn kết và bảo vệ.\"}', '', 35, 4.70, 7, 1, 1, '2026-04-16 19:05:29'),
(10, 'VEL-SMILE-RG', 'Velmora Smile Wire Ring', 2, 2, 139000.00, 169000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925\",\"stone\":\"Kim cương Lab nhỏ\",\"weight\":\"1.1 chỉ\",\"style\":\"Năng động\",\"description\":\"Nụ cười trên ngón tay bạn - thiết kế thanh mảnh, dễ phối đồ.\"}', '', 45, 4.80, 19, 0, 1, '2026-04-16 19:05:29'),
(11, 'VEL-KEY-PDT', 'Velmora Victoria Key Pendant', 1, 4, 289000.00, 339000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Platin\",\"stone\":\"Lab Diamond Marquise\",\"weight\":\"2.3 chỉ\",\"style\":\"Quyền quý\",\"description\":\"Chìa khoá mở ra những cơ hội mới. Biểu tượng của sự độc lập và lộng lẫy.\"}', '', 20, 4.90, 15, 1, 1, '2026-04-16 19:05:29'),
(12, 'VEL-ATLAS-BAN', 'Velmora Atlas X Bangle', 3, 2, 300000.00, 0.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Vàng 18K\",\"stone\":\"None\",\"weight\":\"4.5 chỉ\",\"style\":\"Cổ điển\",\"description\":\"Ký tự La Mã tượng trưng cho thời gian vĩnh cửu. Thiết kế bản rộng đầy quyền năng.\"}', '', 0, 4.80, 26, 1, 0, '2026-04-16 19:05:29'),
(13, 'VEL-RTT-NK', 'Return to VELMORA Heart', 1, 2, 179000.00, 219000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925\",\"stone\":\"Enamel Blue\",\"weight\":\"1.6 chỉ\",\"style\":\"Biểu tượng\",\"description\":\"Thiết kế kinh điển với tag trái tim mang phong cách riêng của Velmora.\"}', '', 55, 5.00, 142, 0, 1, '2026-04-16 19:05:29'),
(14, 'VEL-PAPER-EAR', 'Velmora Paper Flowers Earrings', 4, 4, 259000.00, 299000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925\",\"stone\":\"Fire Opal Lab\",\"weight\":\"0.9 chỉ\",\"style\":\"Nghệ thuật\",\"description\":\"Sự chuyển động của những cánh hoa giấy trong gió, đính đá sang trọng.\"}', '', 0, 4.70, 11, 1, 1, '2026-04-16 19:05:29'),
(15, 'VEL-HARD-BR', 'Velmora HardWear Link Bangle', 3, 2, 269000.00, 319000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Rhodium\",\"stone\":\"None\",\"weight\":\"3.8 chỉ\",\"style\":\"Phá cách\",\"description\":\"Những mắt xích táo bạo mang hơi thở của thời đại mới.\"}', '', 25, 4.80, 33, 1, 1, '2026-04-16 19:05:29'),
(17, 'VEL-SIGN-ER', 'Velmora Signature Studs', 4, 2, 129000.00, 159000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 bóng\",\"stone\":\"None\",\"weight\":\"0.4 chỉ\",\"style\":\"Tối giản\",\"description\":\"Dành cho những người yêu thích sự đơn giản nhưng tinh tế đến từng chi tiết.\"}', '', 0, 4.60, 54, 0, 1, '2026-04-16 19:05:29'),
(18, 'VEL-OLIVE-RG', 'Olive Leaf Velmora Edition', 2, 2, 199000.00, 239000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925\",\"stone\":\"Amethyst Lab\",\"weight\":\"1.7 chỉ\",\"style\":\"Thiên nhiên\",\"description\":\"Nhành ô liu tượng trưng cho hoà bình và sự phục hồi. Thiết kế đầy chất thơ.\"}', '', 30, 4.85, 21, 1, 1, '2026-04-16 19:05:29'),
(19, 'VEL-VIC-NK', 'Velmora Victoria Mixed Cluster', 1, 4, 299000.00, 389000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Platin\",\"stone\":\"Diamond Lab Mixed Cut\",\"weight\":\"3.1 chỉ\",\"style\":\"Đẳng cấp\",\"description\":\"Sự kết hợp của nhiều kiểu cắt đá tạo nên độ bắt sáng đa chiều rực rỡ.\"}', '', 8, 5.00, 17, 1, 0, '2026-04-16 19:05:29'),
(20, 'VEL-HAR-RING', 'Velmora Harmony Ring Band', 2, 2, 149000.00, 179000.00, '{\"brand\":\"VELMORA Luxury\",\"material\":\"Bạc S925 mạ Rhodium\",\"stone\":\"Zirconia tấm\",\"weight\":\"1.2 chỉ\",\"style\":\"Lãng mạn\",\"description\":\"Nhẫn Harmony với đường cong ôm trọn viên đá, tượng trưng cho sự hoà quyện tình yêu.\"}', '', 50, 4.90, 65, 1, 1, '2026-04-16 19:05:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) NOT NULL,
  `productId` bigint(20) NOT NULL,
  `url` text NOT NULL,
  `isMain` tinyint(1) DEFAULT 0,
  `displayOrder` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_images`
--

INSERT INTO `product_images` (`id`, `productId`, `url`, `isMain`, `displayOrder`) VALUES
(5, 2, 'https://media.tiffany.com/is/image/tco/70153238_RG_ALT3X1?hei=615&wid=615&fmt=webp', 1, 1),
(6, 2, 'https://media.tiffany.com/is/image/tco/70153238_RG_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(7, 3, 'https://media.tiffany.com/is/image/tco/73903920_RG_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(8, 3, 'https://media.tiffany.com/is/image/tco/73903920_RG_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(9, 3, 'https://media.tiffany.com/is/image/tco/73903920_RG_SIO2X2?hei=615&wid=615&fmt=webp', 0, 3),
(10, 3, 'https://media.tiffany.com/is/image/tco/73903920_RG_ALT3X1?hei=615&wid=615&fmt=webp', 0, 4),
(11, 4, 'https://media.tiffany.com/is/image/tco/60004097_RG_MAIN1X1?hei=2000&wid=2000&fmt=webp', 1, 1),
(12, 4, 'https://media.tiffany.com/is/image/tco/60004097_RG_SIO2X1?hei=2000&wid=2000&fmt=webp', 0, 2),
(13, 5, 'https://media.tiffany.com/is/image/tco/67544412_RG_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(14, 5, 'https://media.tiffany.com/is/image/tco/67544412_RG_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(15, 5, 'https://media.tiffany.com/is/image/tco/67544412_RG_ALT3X1?hei=615&wid=615&fmt=webp', 0, 3),
(16, 5, 'https://media.tiffany.com/is/image/tco/67544412_RG_ALT3X2?hei=615&wid=615&fmt=webp', 0, 4),
(17, 6, 'https://media.tiffany.com/is/image/tco/60022674_PDT_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(18, 6, 'https://media.tiffany.com/is/image/tco/60022674_PDT_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(19, 6, 'https://media.tiffany.com/is/image/tco/60022674_PDT_ALT3X1?hei=615&wid=615&fmt=webp', 0, 3),
(20, 6, 'https://media.tiffany.com/is/image/tco/60022674_PDT_ALT3X2?hei=615&wid=615&fmt=webp', 0, 4),
(21, 7, 'https://media.tiffany.com/is/image/tco/60090615_ER_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(22, 7, 'https://media.tiffany.com/is/image/tco/60090615_ER_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(23, 8, 'https://media.tiffany.com/is/image/tco/69526012_BLT_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(24, 8, 'https://media.tiffany.com/is/image/tco/69526012_BLT_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(25, 8, 'https://media.tiffany.com/is/image/tco/69526012_BLT_SIO2X2?hei=615&wid=615&fmt=webp', 0, 3),
(26, 8, 'https://media.tiffany.com/is/image/tco/69526012_BLT_ALT3X1?hei=615&wid=615&fmt=webp', 0, 4),
(27, 8, 'https://media.tiffany.com/is/image/tco/69526012_BLT_ALT3X3?hei=1300&wid=1300&fmt=webp', 0, 5),
(28, 9, 'https://media.tiffany.com/is/image/tco/72149513_RG_ALT3X1?hei=615&wid=615&fmt=webp', 1, 1),
(29, 9, 'https://media.tiffany.com/is/image/tco/72149513_RG_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(30, 11, 'https://media.tiffany.com/is/image/tco/74627234_PDT_MAIN1X1?hei=2000&wid=2000&fmt=webp', 1, 1),
(31, 11, 'https://media.tiffany.com/is/image/tco/74627234_PDT_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(32, 11, 'https://media.tiffany.com/is/image/tco/74627234_PDT_ALT3X1?hei=615&wid=615&fmt=webp', 0, 3),
(33, 11, 'https://media.tiffany.com/is/image/tco/74627234_PDT_ALT3X3?hei=1300&wid=1300&fmt=webp', 0, 4),
(34, 13, 'https://media.tiffany.com/is/image/tco/60018402_PDT_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(35, 13, 'https://media.tiffany.com/is/image/tco/60018402_PDT_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(36, 20, 'https://media.tiffany.com/is/image/tco/72149513_RG_ALT3X1?hei=615&wid=615&fmt=webp', 1, 1),
(37, 20, 'https://media.tiffany.com/is/image/tco/72149513_RG_SIO2X1?hei=2000&wid=2000&fmt=webp', 0, 2),
(38, 20, 'https://media.tiffany.com/is/image/tco/60147091_RG_MAIN1X1?hei=282&wid=282&fmt=webp', 0, 3),
(39, 20, 'https://media.tiffany.com/is/image/tco/72149513_RG_ALT3X2?hei=615&wid=615&fmt=webp', 0, 4),
(40, 10, 'https://media.tiffany.com/is/image/tco/72149513_RG_ALT3X2?hei=615&wid=615&fmt=webp', 1, 1),
(41, 10, 'https://media.tiffany.com/is/image/tco/72149513_RG_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(46, 15, 'https://media.tiffany.com/is/image/tco/60153083_BLT_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(47, 15, 'https://media.tiffany.com/is/image/tco/60153083_BLT_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(50, 18, 'https://media.tiffany.com/is/image/tco/60132211_ER_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(51, 18, 'https://media.tiffany.com/is/image/tco/60132211_ER_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(52, 19, 'https://media.tiffany.com/is/image/tco/60022674_PDT_MAIN1X1?hei=628&wid=628&fmt=webp', 1, 1),
(53, 19, 'https://media.tiffany.com/is/image/tco/60022674_PDT_SIO2X1?hei=1300&wid=1300&fmt=webp', 0, 2),
(56, 17, 'https://media.tiffany.com/is/image/tco/40304914_ER_MAIN1X1?hei=628&wid=628&fmt=webp', 0, 0),
(59, 14, 'https://media.tiffany.com/is/image/tco/66912167_ER_MAIN1X1?hei=628&wid=628&fmt=webp', 0, 0),
(61, 12, 'https://media.tiffany.com/is/image/tco/60149788_BLT_MAIN1X1?hei=628&wid=628&fmt=webp', 0, 0),
(62, 1, 'https://media.tiffany.com/is/image/tco/72149513_RG_ALT3X1?hei=615&wid=615&fmt=webp', 0, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) NOT NULL,
  `productId` bigint(20) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `size` varchar(50) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `originalPrice` decimal(15,2) DEFAULT NULL,
  `stockQuantity` int(11) DEFAULT 0,
  `isSale` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`id`, `productId`, `sku`, `size`, `price`, `originalPrice`, `stockQuantity`, `isSale`, `createdAt`) VALUES
(1, 1, 'VEL-T1-RING-5', '5 (49mm)', 149000.00, 189000.00, 98, 1, '2026-04-22 14:27:57'),
(2, 1, 'VEL-T1-RING-6', '6 (51mm)', 149000.00, 189000.00, 100, 1, '2026-04-22 14:27:57'),
(3, 1, 'VEL-T1-RING-7', '7 (53mm)', 149000.00, 189000.00, 100, 1, '2026-04-22 14:27:57'),
(4, 2, 'VEL-KNOT-RG-5', '5 (49mm)', 169000.00, 219000.00, 100, 1, '2026-04-22 14:27:57'),
(5, 2, 'VEL-KNOT-RG-6', '6 (51mm)', 169000.00, 219000.00, 100, 1, '2026-04-22 14:27:57'),
(6, 3, 'VEL-FORGE-W-6', '6 (51mm)', 219000.00, 259000.00, 100, 1, '2026-04-22 14:27:57'),
(7, 3, 'VEL-FORGE-W-7', '7 (53mm)', 219000.00, 259000.00, 100, 1, '2026-04-22 14:27:57'),
(8, 4, 'VEL-VIC-RG-5', '5 (49mm)', 199000.00, 249000.00, 100, 1, '2026-04-22 14:27:57'),
(9, 4, 'VEL-VIC-RG-6', '6 (51mm)', 199000.00, 249000.00, 100, 1, '2026-04-22 14:27:57'),
(10, 9, 'VEL-LOCK-R-6', '6 (51mm)', 189000.00, 219000.00, 100, 1, '2026-04-22 14:27:57'),
(11, 10, 'VEL-SMILE-R-5', '5 (49mm)', 149000.00, 179000.00, 100, 1, '2026-04-22 14:27:57'),
(12, 18, 'VEL-OLIVE-R-6', '6 (51mm)', 199000.00, 239000.00, 100, 1, '2026-04-22 14:27:57'),
(13, 20, 'VEL-HAR-R-5', '5 (49mm)', 149000.00, 179000.00, 100, 1, '2026-04-22 14:27:57'),
(14, 5, 'VEL-SMILE-40', '40cm', 269000.00, 299000.00, 100, 1, '2026-04-22 14:27:57'),
(15, 5, 'VEL-SMILE-45', '45cm', 269000.00, 299000.00, 100, 1, '2026-04-22 14:27:57'),
(16, 6, 'VEL-HARD-45', '45cm', 289000.00, 329000.00, 100, 1, '2026-04-22 14:27:57'),
(17, 11, 'VEL-KEY-45', '45cm', 289000.00, 339000.00, 100, 1, '2026-04-22 14:27:57'),
(18, 13, 'VEL-RTT-40', '40cm', 179000.00, 219000.00, 100, 1, '2026-04-22 14:27:57'),
(19, 13, 'VEL-RTT-45', '45cm', 189000.00, 229000.00, 100, 1, '2026-04-22 14:27:57'),
(20, 19, 'VEL-VIC-NK-42', '42cm', 299000.00, 389000.00, 100, 0, '2026-04-22 14:27:57'),
(21, 7, 'VEL-SOL-OS', 'Freesize', 159000.00, 199000.00, 100, 1, '2026-04-22 14:27:57'),
(22, 14, 'VEL-PAPER-OS', 'Freesize', 259000.00, 299000.00, 0, 1, '2026-04-22 14:27:57'),
(23, 17, 'VEL-SIGN-OS', 'Freesize', 129000.00, 159000.00, 100, 1, '2026-04-22 14:27:57'),
(24, 8, 'VEL-KNOT-BAN-S', 'S (15cm)', 295000.00, 359000.00, 100, 1, '2026-04-22 14:27:57'),
(25, 8, 'VEL-KNOT-BAN-M', 'M (16cm)', 295000.00, 359000.00, 100, 1, '2026-04-22 14:27:57'),
(27, 15, 'VEL-HARD-BR-M', 'M (16cm)', 269000.00, 319000.00, 99, 1, '2026-04-22 14:27:57'),
(603, 12, 'VEL-ATLAS-BAN-115', '1.15', 300000.00, 0.00, 100, 0, '2026-04-22 08:32:36');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount` int(11) NOT NULL,
  `startDate` timestamp NULL DEFAULT NULL,
  `endDate` timestamp NULL DEFAULT NULL,
  `usageLimit` int(11) DEFAULT NULL,
  `usedCount` int(11) DEFAULT 0,
  `minOrderAmount` decimal(15,2) DEFAULT 0.00,
  `maxDiscountAmount` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` text DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `isVisible` tinyint(1) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `promotions`
--

INSERT INTO `promotions` (`id`, `name`, `code`, `discount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `minOrderAmount`, `maxDiscountAmount`, `description`, `imageUrl`, `isActive`, `isVisible`, `createdAt`) VALUES
(1, 'NEW', 'MA1NEW', 10, '2026-04-20 17:00:00', '2026-04-21 17:00:00', -4, 0, 5000.00, 1000.00, '', '', 1, 1, '2026-04-20 14:55:20'),
(2, 'HELLO', 'MA2HELLO', 50, '2026-04-20 17:00:00', '2026-04-29 17:00:00', 100, 0, 1000000.00, 500000.00, '', '', 1, 1, '2026-04-20 15:04:27'),
(3, 'Hub Test', 'MA3HUBTEST', 10, '2026-04-20 17:00:00', '2026-04-29 17:00:00', 102, 0, 100000.00, 50000.00, '', '', 1, 1, '2026-04-20 15:17:45'),
(4, 'HUBREADY', 'MA4HUBREADY', 15, '2026-04-19 17:00:00', '2026-04-27 17:00:00', 100, 0, 500000.00, 100000.00, '', '', 1, 1, '2026-04-20 15:20:13'),
(5, 'HIGHMIN', 'MA5HIGHMIN', 10, '2026-05-20 17:00:00', '2026-05-29 17:00:00', 100, 0, 600000000.00, 1000000.00, '', '', 1, 1, '2026-04-20 15:21:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` char(36) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shop_settings`
--

CREATE TABLE `shop_settings` (
  `id` int(11) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `workingHours` varchar(255) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `facebookUrl` varchar(255) DEFAULT NULL,
  `instagramUrl` varchar(255) DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shop_settings`
--

INSERT INTO `shop_settings` (`id`, `phone`, `email`, `workingHours`, `address`, `facebookUrl`, `instagramUrl`, `updatedAt`) VALUES
(1, '1900 520 131m', 'luxelum@gmail.comm', 'T2-CN: 8:00 - 23:000', '235 Hoàng Quốc Việt - Bắc Từ Liêmm', NULL, NULL, '2026-04-23 12:07:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL COMMENT 'UUID (char 36)',
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar` text DEFAULT NULL,
  `role` varchar(50) DEFAULT 'customer',
  `provider` varchar(50) DEFAULT 'email' COMMENT 'email / google',
  `phone` varchar(20) DEFAULT NULL,
  `defaultAddress` text DEFAULT NULL,
  `newsletterOptin` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `fullName`, `email`, `password`, `avatar`, `role`, `provider`, `phone`, `defaultAddress`, `newsletterOptin`, `createdAt`, `isActive`) VALUES
('admin-uuid-001', 'Admin Velmora', 'admin@velmora.com', 'Admin@123', NULL, 'admin', 'email', '0901234567', NULL, 0, '2026-04-16 19:31:48', 1),
('d7662f9f-f41b-4ec0-8cbc-21018e5018fa', 'Trần Minh Nguyệt (TMN)', 'tranvankhoand1983@gmail.com', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJFchnczOLMGSIB1_cyVTXi140FRHs3aIJiTg3A9aQyOpkA7UkI=s96-c', 'customer', 'google', NULL, NULL, 0, '2026-04-20 08:39:28', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_vouchers`
--

CREATE TABLE `user_vouchers` (
  `id` bigint(20) NOT NULL,
  `userId` char(36) NOT NULL,
  `promotionId` int(11) NOT NULL,
  `savedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `isUsed` tinyint(1) DEFAULT 0,
  `usedAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_vouchers`
--

INSERT INTO `user_vouchers` (`id`, `userId`, `promotionId`, `savedAt`, `isUsed`, `usedAt`) VALUES
(1, 'admin-uuid-001', 4, '2026-04-20 15:20:35', 0, NULL),
(2, 'admin-uuid-001', 5, '2026-04-20 15:22:21', 0, NULL),
(3, 'admin-uuid-001', 3, '2026-04-20 22:33:24', 0, NULL),
(4, 'admin-uuid-001', 2, '2026-04-20 22:41:03', 0, NULL),
(5, 'd7662f9f-f41b-4ec0-8cbc-21018e5018fa', 5, '2026-04-22 14:31:09', 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlist`
--

CREATE TABLE `wishlist` (
  `userId` char(36) NOT NULL,
  `productId` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_carts_user` (`userId`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cartitems_cart` (`cartId`),
  ADD KEY `fk_cartitems_product` (`productId`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug_unique` (`slug`);

--
-- Chỉ mục cho bảng `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`userId`,`productId`),
  ADD KEY `fk_favorites_product` (`productId`);

--
-- Chỉ mục cho bảng `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug_unique` (`slug`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_user` (`userId`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_items_order` (`orderId`),
  ADD KEY `fk_items_product` (`productId`),
  ADD KEY `fk_items_variant` (`variantId`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_unique` (`sku`),
  ADD KEY `fk_products_category` (`categoryId`),
  ADD KEY `fk_products_material` (`materialId`);

--
-- Chỉ mục cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_images_product` (`productId`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_unique` (`sku`),
  ADD KEY `fk_variants_product` (`productId`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reviews_user` (`user_id`),
  ADD KEY `fk_reviews_product` (`product_id`);

--
-- Chỉ mục cho bảng `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `shop_settings`
--
ALTER TABLE `shop_settings`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- Chỉ mục cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_uservouchers_user` (`userId`),
  ADD KEY `fk_uservouchers_promotion` (`promotionId`);

--
-- Chỉ mục cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`userId`,`productId`),
  ADD KEY `fk_wishlist_product` (`productId`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=604;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `shop_settings`
--
ALTER TABLE `shop_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cartitems_cart` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cartitems_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_favorites_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favorites_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_items_order` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_items_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_items_variant` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_material` FOREIGN KEY (`materialId`) REFERENCES `materials` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_images_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_variants_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD CONSTRAINT `fk_uservouchers_promotion` FOREIGN KEY (`promotionId`) REFERENCES `promotions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_uservouchers_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
