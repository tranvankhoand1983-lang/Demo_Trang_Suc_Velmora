from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomLinearRegression:
    def __init__(self):
        self.weights = None
        
    def fit(self, X, y):
        X_mat = np.c_[np.ones(X.shape[0]), X]
        if isinstance(y, pd.Series):
            y_vec = y.values
        else:
            y_vec = y
        self.weights = np.linalg.inv(X_mat.T.dot(X_mat)).dot(X_mat.T).dot(y_vec)
        
    def predict(self, X):
        if isinstance(X, list):
            X = np.array(X)
        X_mat = np.c_[np.ones(X.shape[0]), X]
        return X_mat.dot(self.weights)

import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, 'data', 'cpi_dataset.csv')
    df = pd.read_csv(data_path)
    X = df[['CPI_T3', 'Gold_T3', 'Interest_T3', 
            'CPI_T2', 'Gold_T2', 'Interest_T2', 
            'CPI_T1', 'Gold_T1', 'Interest_T1']]
    y = df['CPI_Target']
    
    model = CustomLinearRegression()
    model.fit(X, y)
    print("[SUCCESS] Da nap va huan luyen thanh cong AI Model!")
except Exception as e:
    print(f"[ERROR] Loi nap mo hinh: {e}")

class PredictionRequest(BaseModel):
    cpi_t3: float
    gold_t3: float
    interest_t3: float
    cpi_t2: float
    gold_t2: float
    interest_t2: float
    cpi_t1: float
    gold_t1: float
    interest_t1: float

@app.post("/api/predict-inflation")
def predict_inflation(request: PredictionRequest):
    input_data = [[
        request.cpi_t3, request.gold_t3, request.interest_t3,
        request.cpi_t2, request.gold_t2, request.interest_t2,
        request.cpi_t1, request.gold_t1, request.interest_t1
    ]]
    
    prediction = model.predict(input_data)[0]
    diff = prediction - request.cpi_t1
    
    risk_level = 0
    message = ""
    action_recommend = []
    action_avoid = []
    
    if diff > 0.5:
        risk_level = 4
        message = f"Lạm phát tăng vọt (+{diff:.2f} điểm). Áp lực mất giá đồng tiền cực kỳ cao."
        action_recommend = [
            "Gom dự trữ nguyên liệu Vàng và Kim Cương. Tập trung sản xuất các bộ sưu tập Nhẫn và Dây chuyền cưới cao cấp.",
            "Điều chỉnh tăng nhẹ giá bán lẻ. Khai thác tệp khách VIP qua tính năng Danh sách yêu thích (Favorites).",
            "Chạy chiến dịch truyền thông: 'Trang sức cao cấp Velmora - Tài sản bảo chứng vượt thời gian'.",
            "Ưu tiên ngân sách nhập các loại đá quý có giá trị thanh khoản toàn cầu (VD: Kim Cương chuẩn GIA).",
            "Gửi Email Marketing bí mật cho tệp khách sỉ, mời gọi chốt đơn trước khi có đợt điều chỉnh giá mới."
        ]
        action_avoid = [
            "Tuyệt đối không xả kho nguyên liệu. Khóa tính năng tạo mới các Voucher giảm giá sâu trên trang Admin.",
            "Tạm dừng phát triển các mẫu Bạc hoặc Lắc chân có biên lợi nhuận thấp.",
            "Không chiết khấu thêm cho phương thức nhận hàng thanh toán sau (COD) để tránh rủi ro tỷ giá.",
            "Tránh ôm quá nhiều trang sức hợp kim thời trang (trượt giá nhanh, không có khả năng bảo toàn vốn)."
        ]
    elif diff > 0:
        risk_level = 3
        message = f"Xu hướng lạm phát duy trì đà tăng nhẹ (+{diff:.2f} điểm). Thị trường biến động."
        action_recommend = [
            "Duy trì tỷ trọng tồn kho Vàng 60%. Ra mắt thêm Bông tai, Lắc tay phân khúc trung bình khá.",
            "Giữ vững nền giá hiện tại. Nổi bật cổng 'Thanh toán VNPay' trên trang Checkout để chốt sale nhanh gọn.",
            "Gắn tag thịnh hành cho các bộ sưu tập trang sức phong thủy (thu hút tài lộc) lên ngay trang chủ.",
            "Triển khai các gói Combo (VD: Mua dây chuyền tặng hộp nhung cao cấp) để tăng giá trị tổng đơn hàng.",
            "Thúc đẩy nhân viên gọi điện chăm sóc tệp khách hàng từng mua Nhẫn cưới chuẩn bị kỷ niệm ngày cưới."
        ]
        action_avoid = [
            "Hạn chế nhập thêm các lô đá quý xa xỉ, hiếm (Sapphire, Ruby) kén người mua.",
            "Cắt giảm các quà tặng kèm đắt tiền trong giỏ hàng (Cart) để bảo vệ lợi nhuận.",
            "Không vội vàng mở rộng thêm các chi nhánh mới tốn kém chi phí mặt bằng lúc này.",
            "Hạn chế thuê mướn các KOC/KOL quảng cáo thù lao quá cao mà không cam kết tỷ lệ chốt đơn."
        ]
    elif diff > -0.3:
        risk_level = 2
        message = f"Thị trường ổn định, lạm phát hạ nhiệt ({diff:.2f} điểm). Sức mua có triển vọng phục hồi tốt."
        action_recommend = [
            "Nhập mạnh dòng trang sức Bạc, Bạch kim và Nhẫn đôi phục vụ nhu cầu làm đẹp, quà tặng mùa lễ hội.",
            "Phát hành thêm các Voucher giảm giá 5-10% (Promo Codes) để kích cầu tệp khách hàng trẻ.",
            "Kích thích khách hàng để lại Đánh giá (Reviews) sau khi mua để tăng độ uy tín cho thương hiệu.",
            "Giới thiệu dòng sản phẩm Nhẫn đính hôn (Engagement Rings) tích hợp tính năng trả góp 0%.",
            "Tổ chức Minigame trên Fanpage tặng Vòng tay Bạc để thu thập data khách hàng tiềm năng về web."
        ]
        action_avoid = [
            "Tránh đầu cơ găm giữ Vàng nguyên khối làm đọng vốn. Chuyển nguồn vốn sang mở rộng đa dạng danh mục.",
            "Không để tình trạng 'Hết hàng' (Out of stock) diễn ra ở các mặt hàng Dây chuyền bán chạy.",
            "Không bỏ lơ khâu chăm sóc sau bán (After-sales), dễ làm giảm tỷ lệ khách hàng quay lại mua sắm.",
            "Tránh việc cố đẩy giá bán lẻ lên quá cao gây tâm lý dội ngược từ khách hàng phổ thông."
        ]
    else:
        risk_level = 1
        message = f"Cảnh báo rủi ro Giảm phát (Lạm phát giảm sâu {diff:.2f} điểm). Sức mua toàn thị trường thắt chặt."
        action_recommend = [
            "Khởi động ngay chiến dịch Flash-sale xả hàng. Đẩy mạnh các dòng Nhẫn bạc, Dây chuyền giá rẻ lên Banner.",
            "Tối ưu hiển thị, đẩy các mặt hàng dưới 2 triệu đồng lên vị trí top đầu trong Danh sách sản phẩm.",
            "Thêm khuyến mãi ưu đãi: 'Freeship khi thanh toán qua VNPay' để thu hồi dòng tiền mặt về nhanh nhất.",
            "Theo dõi sát tính năng Giỏ hàng (Cart), gửi email nhắc nhở khách hàng quên thanh toán (Abandoned Cart).",
            "Phân tích Báo cáo doanh thu trên Admin, cắt bỏ ngay 30% danh mục có tốc độ quay vòng vốn chậm nhất."
        ]
        action_avoid = [
            "Tuyệt đối không nhập khẩu Kim cương kích thước lớn hoặc Trang sức mạ Vàng đắt tiền trong chu kỳ này.",
            "Đóng băng toàn bộ ngân sách Marketing cho các bộ sưu tập Xa xỉ phẩm.",
            "Không tuyển dụng thêm nhân sự cố định, tối ưu hóa đội ngũ tư vấn viên trực tuyến hiện tại.",
            "Ngừng gia công các sản phẩm có thiết kế quá phức tạp làm đội chi phí chế tác và thời gian chờ đợi."
        ]
        
    return {
        "prediction": round(prediction, 2),
        "diff": round(diff, 2),
        "risk_level": risk_level,
        "message": message,
        "action_recommend": action_recommend,
        "action_avoid": action_avoid
    }
