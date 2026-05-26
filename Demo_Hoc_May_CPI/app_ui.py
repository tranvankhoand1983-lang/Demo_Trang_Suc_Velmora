import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime

class CustomLinearRegression:
    def __init__(self):
        self.weights = None
        
    def fit(self, X, y):
        X_mat = np.c_[np.ones(X.shape[0]), X]
        y_vec = y.values
        self.weights = np.linalg.inv(X_mat.T.dot(X_mat)).dot(X_mat.T).dot(y_vec)
        
    def predict(self, X):
        if isinstance(X, list):
            X = np.array(X)
        X_mat = np.c_[np.ones(X.shape[0]), X]
        return X_mat.dot(self.weights)

st.set_page_config(page_title="AI Market Intelligence", layout="wide", initial_sidebar_state="collapsed")

custom_css = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif !important;
        color: #2c3e50;
    }
    
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {display:none;}
    
    /* Ẩn dòng chữ "Press Enter to apply" gây rối mắt */
    div[data-testid="InputInstructions"] {
        display: none !important;
    }
    
    /* Ẩn icon link (cái móc xích) khi chỉ chuột vào tiêu đề */
    h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {
        display: none !important;
    }
    
    h1 {
        font-weight: 600 !important;
        letter-spacing: -1px;
        color: #1a252f;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 10px;
        margin-bottom: 30px;
    }
    h2, h3 {
        font-weight: 500 !important;
        color: #34495e;
    }
    
    .stButton>button {
        background-color: #1a252f;
        color: #d4af37;
        border: 1px solid #d4af37;
        border-radius: 6px;
        padding: 0.6rem 2rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        width: 100%;
    }
    .stButton>button:hover {
        background-color: #d4af37;
        color: #ffffff;
        border-color: #d4af37;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    
    .stAlert {
        border-radius: 8px !important;
        border: 1px solid rgba(0,0,0,0.05) !important; 
    }
</style>
"""
st.markdown(custom_css, unsafe_allow_html=True)

st.title("HỆ THỐNG PHÂN TÍCH VĨ MÔ")
st.markdown("Hệ thống dự báo quỹ đạo lạm phát, từ đó thiết lập chiến lược phản ứng thị trường cho doanh nghiệp trang sức kim hoàn.")

st.markdown("### THIẾT LẬP THỜI GIAN DỰ BÁO")
now = datetime.datetime.now()

col_m, col_y = st.columns(2)
with col_m:
    target_m = st.selectbox("Chọn tháng phân tích:", range(1, 13), index=now.month-1)
with col_y:
    target_y = st.selectbox("Chọn năm phân tích:", range(2023, 2030), index=now.year-2023)

target_month = f"Tháng {target_m}/{target_y}"

def get_past_month(t_m, t_y, months_ago):
    m = t_m - months_ago
    y = t_y
    while m <= 0:
        m += 12
        y -= 1
    return f"Tháng {m}/{y}"

t1_month = get_past_month(target_m, target_y, 1)
t2_month = get_past_month(target_m, target_y, 2)
t3_month = get_past_month(target_m, target_y, 3)

@st.cache_resource
def train_model():
    df = pd.read_csv('data/cpi_dataset.csv')
    X = df[['CPI_T3', 'Gold_T3', 'Interest_T3', 
            'CPI_T2', 'Gold_T2', 'Interest_T2', 
            'CPI_T1', 'Gold_T1', 'Interest_T1']]
    y = df['CPI_Target']
    
    model = CustomLinearRegression()
    model.fit(X, y)
    
    return model, df

model, df = train_model()

st.markdown("### DỮ LIỆU ĐẦU VÀO (QUÁ KHỨ)")
st.info(f"Yêu cầu: Khai báo các chỉ số kinh tế của 3 kỳ gần nhất so với mốc {target_month}.")

with st.expander(f"Kỳ báo cáo: {t3_month}", expanded=True):
    col1, col2, col3 = st.columns(3)
    with col1: cpi_t3 = st.number_input(f"CPI {t3_month}", min_value=90.0, value=110.3, step=0.1)
    with col2: gold_t3 = st.number_input(f"Giá Vàng {t3_month} (Tr)", min_value=50.0, value=74.5, step=0.5)
    with col3: int_t3 = st.number_input(f"Lãi suất {t3_month} (%)", min_value=1.0, value=4.2, step=0.1)

with st.expander(f"Kỳ báo cáo: {t2_month}", expanded=True):
    col4, col5, col6 = st.columns(3)
    with col4: cpi_t2 = st.number_input(f"CPI {t2_month}", min_value=90.0, value=110.6, step=0.1)
    with col5: gold_t2 = st.number_input(f"Giá Vàng {t2_month} (Tr)", min_value=50.0, value=75.0, step=0.5)
    with col6: int_t2 = st.number_input(f"Lãi suất {t2_month} (%)", min_value=1.0, value=4.0, step=0.1)

with st.expander(f"Kỳ báo cáo: {t1_month}", expanded=True):
    col7, col8, col9 = st.columns(3)
    with col7: cpi_t1 = st.number_input(f"CPI {t1_month}", min_value=90.0, value=111.0, step=0.1)
    with col8: gold_t1 = st.number_input(f"Giá Vàng {t1_month} (Tr)", min_value=50.0, value=76.5, step=0.5)
    with col9: int_t1 = st.number_input(f"Lãi suất {t1_month} (%)", min_value=1.0, value=4.0, step=0.1)

st.write("---")

if st.button(f"THỰC THI DỰ BÁO {target_month.upper()}", type="primary"):
    input_data = [[cpi_t3, gold_t3, int_t3, 
                   cpi_t2, gold_t2, int_t2, 
                   cpi_t1, gold_t1, int_t1]]
    prediction = model.predict(input_data)[0]
    
    st.success(f"### KẾT QUẢ DỰ BÁO CPI THÁNG TỚI: **{prediction:.2f}**")
    diff = prediction - cpi_t1
    st.markdown("### ĐỀ XUẤT CHIẾN LƯỢC ĐIỀU HÀNH:")
    
    if diff > 0.5:
        st.error(f"**BÁO CÁO RỦI RO:** Lạm phát có xu hướng tăng vọt (+{diff:.2f} điểm). Áp lực mất giá đồng tiền cao.")
        colA, colB = st.columns(2)
        with colA:
            st.success(
                "**HÀNH ĐỘNG KHUYẾN NGHỊ:**\n"
                "- **Quản trị vốn:** Dịch chuyển thanh khoản tiền mặt sang vàng 24K, vàng miếng SJC để phòng vệ trượt giá.\n"
                "- **Chính sách giá:** Gia tăng biên độ lợi nhuận gộp (đặc biệt là chi phí gia công) trên các sản phẩm cao cấp.\n"
                "- **Truyền thông:** Khởi động chiến dịch marketing tập trung vào giá trị bảo toàn tài sản của trang sức."
            )
        with colB:
            st.error(
                "**HÀNH ĐỘNG CẦN TRÁNH:**\n"
                "- Tạm ngưng các hoạt động xả kho vàng nguyên liệu quy mô lớn.\n"
                "- Dừng các chương trình chiết khấu, giảm giá sâu để bảo vệ biên lợi nhuận cốt lõi."
            )
            
    elif diff > 0:
        st.warning(f"**LƯU Ý:** Xu hướng lạm phát duy trì đà tăng nhẹ (+{diff:.2f} điểm).")
        colA, colB = st.columns(2)
        with colA:
            st.success(
                "**HÀNH ĐỘNG KHUYẾN NGHỊ:**\n"
                "- **Quản trị kho:** Cân đối tỷ trọng tồn kho Vàng nguyên liệu ở mức 60%. Mở rộng danh mục sản phẩm kim tiền nhỏ lẻ.\n"
                "- **Chính sách giá:** Duy trì nền giá hiện tại, tối ưu hóa các khoản hoa hồng và chi phí trung gian.\n"
                "- **Truyền thông:** Đẩy mạnh các bộ sưu tập mang yếu tố phong thủy."
            )
        with colB:
            st.error(
                "**HÀNH ĐỘNG CẦN TRÁNH:**\n"
                "- Hạn chế nhập khẩu hoặc chế tác các dòng đá quý xa xỉ không có tính thanh khoản cao.\n"
                "- Cắt giảm các chính sách tặng phẩm đắt tiền đi kèm."
            )
            
    elif diff > -0.3:
        st.info(f"**PHÂN TÍCH:** Thị trường ổn định, lạm phát có dấu hiệu hạ nhiệt ({diff:.2f} điểm). Sức mua có triển vọng phục hồi.")
        colA, colB = st.columns(2)
        with colA:
            st.success(
                "**HÀNH ĐỘNG KHUYẾN NGHỊ:**\n"
                "- **Quản trị kho:** Đẩy mạnh phân bổ ngân sách sang các dòng trang sức tiêu dùng (Bạc, Bạch kim, Kim cương tấm).\n"
                "- **Chính sách giá:** Kích cầu bằng các gói tài chính linh hoạt (Trả góp 0% qua thẻ tín dụng).\n"
                "- **Truyền thông:** Tiếp thị nhắm mục tiêu vào phân khúc quà tặng và tiêu dùng cá nhân."
            )
        with colB:
            st.error(
                "**HÀNH ĐỘNG CẦN TRÁNH:**\n"
                "- Dừng việc tích trữ vàng miếng khối lượng lớn, tránh làm suy giảm hệ số quay vòng vốn."
            )
            
    else:
        st.success(f"**CẢNH BÁO:** Rủi ro giảm phát (Lạm phát giảm sâu {diff:.2f} điểm). Người tiêu dùng có xu hướng thắt chặt chi tiêu.")
        colA, colB = st.columns(2)
        with colA:
            st.success(
                "**HÀNH ĐỘNG KHUYẾN NGHỊ:**\n"
                "- **Quản trị kho:** Quyết liệt thanh lý hàng tồn kho chậm luân chuyển. Tăng tỷ lệ tiền mặt dự phòng.\n"
                "- **Chính sách giá:** Thực thi chiến lược Flash-sale (chiết khấu 30-50% chi phí gia công) để thu hồi dòng tiền.\n"
                "- **Định vị:** Chuyển dịch trọng tâm kinh doanh sang phân khúc trang sức bình dân (Bạc, Hợp kim cao cấp)."
            )
        with colB:
            st.error(
                "**HÀNH ĐỘNG CẦN TRÁNH:**\n"
                "- Tuyệt đối không đầu cơ tích trữ vàng nguyên liệu trong chu kỳ giá đi xuống.\n"
                "- Đóng băng ngân sách cho các hoạt động quảng cáo ngoài trời (OOH) chi phí cao."
            )
