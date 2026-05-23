import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# --- 1. CẤU HÌNH API GEMINI & DATA ---
GEMINI_API_KEY = "AIzaSyA4FfS5n4LkhMFrhqgYtQM2qaW2PK9DV54"
genai.configure(api_key=GEMINI_API_KEY)

# Đọc file data.txt
with open("data.txt", "r", encoding="utf-8") as f:
    DU_LIEU_TRAINING = f.read()

model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=DU_LIEU_TRAINING
)

# Tạo một phiên chat duy nhất lưu bộ nhớ ngầm
chat_session = model.start_chat(history=[])

from fastapi.middleware.cors import CORSMiddleware

# --- 2. KHỞI TẠO SERVER FASTAPI ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép Frontend React gọi API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Đường dẫn mặc định: Mở giao diện Web chat
@app.get("/", response_class=HTMLResponse)
async def get_web():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

# Đường dẫn API xử lý tin nhắn và trả về cho hiệu ứng ba chấm
@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        # Gửi tin nhắn của khách vào bộ não Gemini
        response = chat_session.send_message(req.message)
        return {"reply": response.text}
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")
        return {"reply": "Dạ, kết nối với chuyên viên gặp chút gián đoạn. Anh/chị thử lại nhé!"}

# Chạy Server
if __name__ == "__main__":
    import uvicorn
    print("Giao diện Velmora AI đang khởi chạy tại http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)