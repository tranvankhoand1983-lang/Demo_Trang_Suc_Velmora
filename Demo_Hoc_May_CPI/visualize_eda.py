import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

print("Đang đọc dữ liệu và huấn luyện mô hình...")
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, 'data', 'cpi_dataset.csv')
    df = pd.read_csv(csv_path)
    X = df[['CPI_T3', 'Gold_T3', 'Interest_T3', 'CPI_T2', 'Gold_T2', 'Interest_T2', 'CPI_T1', 'Gold_T1', 'Interest_T1']]
    y = df['CPI_Target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    test_model = CustomLinearRegression()
    test_model.fit(X_train, y_train)
    y_pred = test_model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    r2 = r2_score(y_test, y_pred)
    
    print("\n" + "="*60)
    print("KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH (5 CHỈ SỐ QUYỀN LỰC NHẤT):")
    print("="*60)
    print(f"1. MAE  (Sai số tuyệt đối trung bình)      : {mae:.4f}")
    print(f"2. MSE  (Sai số toàn phương trung bình)    : {mse:.4f}")
    print(f"3. RMSE (Căn bậc hai sai số toàn phương)   : {rmse:.4f}")
    print(f"4. MAPE (Phần trăm sai số tuyệt đối trung bình): {mape:.2f}%")
    print(f"5. R²   (Hệ số xác định - Độ chính xác)    : {r2:.4f}")
    print("="*60 + "\n")
    
    final_model = CustomLinearRegression()
    final_model.fit(X, y)
    df['CPI_Predicted'] = final_model.predict(X)
    df['Time'] = df['Month'].astype(str) + '/' + df['Year'].astype(str)
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    
    corr_cols = ['CPI_Target', 'CPI_T1', 'Gold_T1', 'Interest_T1']
    
    corr_matrix = df[corr_cols].rename(columns={
        'CPI_Target': 'Lạm Phát', 
        'CPI_T1': 'Lịch sử CPI', 
        'Gold_T1': 'Giá Vàng', 
        'Interest_T1': 'Lãi suất'
    }).corr()
    
    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    
    sns.heatmap(corr_matrix, mask=mask, annot=True, cmap='coolwarm', fmt=".2f", linewidths=.5, ax=ax1, annot_kws={"size": 12})
    ax1.set_title('1. MA TRẬN TƯƠNG QUAN', fontsize=14, pad=15)
    
    ax2.plot(df['Time'], df['CPI_Target'], marker='o', linestyle='-', color='blue', label='Thực Tế', linewidth=2)
    ax2.plot(df['Time'], df['CPI_Predicted'], marker='x', linestyle='--', color='red', label='AI Dự Đoán', linewidth=2)
    ax2.set_title('2. SO SÁNH ĐƯỜNG QUỸ ĐẠO LẠM PHÁT (Thực tế vs AI)', fontsize=14, pad=15)
    ax2.set_ylabel("Chỉ số Lạm phát")
    ax2.set_xlabel("Thời gian (Tháng/Năm)")
    
    tick_spacing = 12 
    ax2.set_xticks(np.arange(0, len(df['Time']), tick_spacing))
    
    ax2.tick_params(axis='x', rotation=45)
    ax2.legend()
    ax2.grid(True, linestyle=':', alpha=0.6)
    
    plt.tight_layout()
    print("Đang hiển thị biểu đồ. Hãy đóng cửa sổ đồ họa để kết thúc chương trình.")
    plt.show()
    
except Exception as e:
    print(f"Lỗi: {e}")
