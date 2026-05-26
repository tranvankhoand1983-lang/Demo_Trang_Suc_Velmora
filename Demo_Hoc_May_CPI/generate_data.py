import pandas as pd
import numpy as np

np.random.seed(42)
months = []
years = []
cpi = []
gold = []
interest = []

current_cpi = 90.0
current_gold = 35.0
current_interest = 6.0

for year in range(2015, 2024):
    for month in range(1, 13):
        months.append(month)
        years.append(year)
        
        current_cpi += np.random.normal(0.2, 0.5)
        current_gold += np.random.normal(0.3, 1.2)
        current_interest += np.random.normal(-0.02, 0.3)
        
        current_interest = max(2.0, min(15.0, current_interest))
        current_gold = max(30.0, current_gold)
        
        cpi.append(round(current_cpi, 2))
        gold.append(round(current_gold, 2))
        interest.append(round(current_interest, 2))

df = pd.DataFrame({
    'Month': months,
    'Year': years,
    'CPI_Target': cpi,
    'Gold_Target': gold,
    'Interest_Target': interest
})

for i in range(1, 4):
    df[f'CPI_T{i}'] = df['CPI_Target'].shift(i)
    df[f'Gold_T{i}'] = df['Gold_Target'].shift(i)
    df[f'Interest_T{i}'] = df['Interest_Target'].shift(i)

df = df.dropna()
df = df[['Month', 'Year', 'CPI_T3', 'Gold_T3', 'Interest_T3', 
         'CPI_T2', 'Gold_T2', 'Interest_T2', 
         'CPI_T1', 'Gold_T1', 'Interest_T1', 'CPI_Target']]

df['Month'] = df['Month'].astype(int)
df['Year'] = df['Year'].astype(int)

df.to_csv('c:/Web_Trang_suc_tich_hop/Demo_Hoc_May_CPI/data/cpi_dataset.csv', index=False)
print(f"Đã tạo thành công {len(df)} dòng dữ liệu từ năm 2015 đến 2023.")
