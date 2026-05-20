import React, { useState } from 'react';
import './NewsPage.css';

const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Xu hướng', 'Cẩm nang', 'Sự kiện', 'Bộ sưu tập', 'Phong cách'];

  const newsItems = [
    {
      id: 1,
      title: 'Xu Hướng Trang Sức Ngọc Trai 2026',
      excerpt: 'Ngọc trai đang trở lại mạnh mẽ với những thiết kế phá cách, kết hợp cùng vàng trắng và kim cương nhân tạo...',
      date: '20/04/2026',
      category: 'Xu hướng',
      image: 'https://i.etsystatic.com/60149912/r/il/52e609/7052391107/il_1080xN.7052391107_11wg.jpg'
    },
    {
      id: 2,
      title: 'Bí Quyết Bảo Quản Trang Sức Luôn Sáng Bóng',
      excerpt: 'Làm thế nào để bộ trang sức yêu thích của bạn luôn giữ được vẻ lấp lánh như ngày đầu tiên? Hãy cùng Velmora tìm hiểu...',
      date: '15/04/2026',
      category: 'Cẩm nang',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: 'Khai Trương Showroom Mới Tại Nam Từ Liêm',
      excerpt: 'Velmora chính thức ra mắt không gian trải nghiệm đẳng cấp tại Crescent Mall với hàng ngàn ưu đãi hấp dẫn...',
      date: '10/04/2026',
      category: 'Sự kiện',
      image: 'https://i.pinimg.com/originals/71/ef/af/71efaff6849cd243aa45940576653eb9.jpg'
    },
    {
      id: 4,
      title: 'Bộ Sưu Tập "L’Amour" - Ngôn Ngữ Của Tình Yêu',
      excerpt: 'Lấy cảm hứng từ những đóa hồng Pháp, bộ sưu tập mang đến vẻ đẹp lãng mạn và tinh tế cho mọi quý cô...',
      date: '05/04/2026',
      category: 'Bộ sưu tập',
      image: 'https://down-id.img.susercontent.com/file/id-11134207-7r98w-lsnpgbdyoq8p6f'
    },
    {
      id: 5,
      title: 'Cách Phối Trang Sức Cùng Trang Phục Công Sở',
      excerpt: 'Lựa chọn trang sức phù hợp sẽ giúp bạn trở nên chuyên nghiệp và cuốn hút hơn trong môi trường làm việc...',
      date: '01/04/2026',
      category: 'Phong cách',
      image: 'https://daphongthuytunhien.com.vn/wp-content/uploads/2023/10/chon-day-chuyen-nu-theo-khuon-mat.jpg'
    },
    {
      id: 6,
      title: 'Tìm Hiểu Về Kim Cương Lab-Grown',
      excerpt: 'Tại sao kim cương nhân tạo đang trở thành lựa chọn ưu tiên của thế hệ Z hiện đại? Cùng giải đáp mọi thắc mắc...',
      date: '28/03/2026',
      category: 'Kiến thức',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const filteredNews = activeCategory === 'Tất cả'
    ? newsItems
    : newsItems.filter(item => item.category === activeCategory);

  return (
    <div className="news-page">
      <div className="news-hero">
        <div className="container">
          <span className="news-label">Velmora Magazine</span>
          <h1 className="news-title">Tin Tức & Sự Kiện</h1>
          <p className="news-subtitle">Nơi chia sẻ cảm hứng và kiến thức về thế giới trang sức cao cấp.</p>
        </div>
      </div>

      <div className="container">
        <div className="news-nav">
          {categories.map(cat => (
            <button
              key={cat}
              className={`news-nav-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="news-grid">
          {filteredNews.map(item => (
            <div key={item.id} className="news-item">
              <div className="news-item-img">
                <img src={item.image} alt={item.title} />
                <span className="news-item-tag">{item.category}</span>
              </div>
              <div className="news-item-body">
                <span className="news-item-date">{item.date}</span>
                <h3 className="news-item-title">{item.title}</h3>
                <p className="news-item-desc">{item.excerpt}</p>
                <button className="news-item-link">Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>

        <div className="news-more">
          <button className="btn-outline">Tải thêm bài viết</button>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
