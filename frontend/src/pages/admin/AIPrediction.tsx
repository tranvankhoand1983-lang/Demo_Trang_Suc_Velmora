import React, { useState } from 'react';
import './AIPrediction.css';
import { TrendingUp, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

const AIPrediction: React.FC = () => {
  const [formData, setFormData] = useState({
    cpi_t3: "", gold_t3: "", interest_t3: "",
    cpi_t2: "", gold_t2: "", interest_t2: "",
    cpi_t1: "", gold_t1: "", interest_t1: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePredict = async () => {
    // Validate empty
    const values = Object.values(formData);
    if (values.some(v => v.trim() === '')) {
      setError('Vui lòng nhập đầy đủ 9 thông số kinh tế để chạy mô hình AI!');
      return;
    }

    const payload = {
      cpi_t3: parseFloat(formData.cpi_t3), gold_t3: parseFloat(formData.gold_t3), interest_t3: parseFloat(formData.interest_t3),
      cpi_t2: parseFloat(formData.cpi_t2), gold_t2: parseFloat(formData.gold_t2), interest_t2: parseFloat(formData.interest_t2),
      cpi_t1: parseFloat(formData.cpi_t1), gold_t1: parseFloat(formData.gold_t1), interest_t1: parseFloat(formData.interest_t1)
    };

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/predict-inflation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ AI (API Python). Hãy chắc chắn bạn đã chạy file api.py bằng uvicorn!');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-prediction-container">
      <div className="ai-header">
        <h1><TrendingUp size={28} /> AI DỰ BÁO VĨ MÔ & CHIẾN LƯỢC</h1>
        <p>Hệ thống tự động phân tích 9 biến số kinh tế vĩ mô để dự báo CPI tháng tiếp theo và xuất lời khuyên kinh doanh chuyên sâu cho chuỗi trang sức.</p>
      </div>

      <div className="ai-inputs-card">
        <h3>Dữ Liệu Đầu Vào (3 Tháng Gần Nhất)</h3>
        <div className="ai-grid">
          {/* T-3 */}
          <div className="input-group">
            <label>Tháng T-3 (Cách đây 3 tháng)</label>
            <div className="input-row">
                <span>CPI:</span>
                <input type="number" step="0.1" name="cpi_t3" value={formData.cpi_t3} onChange={handleChange} />
            </div>
            <div className="input-row">
                <span>Vàng (Tr):</span>
                <input type="number" step="0.1" name="gold_t3" value={formData.gold_t3} onChange={handleChange} />
            </div>
            <div className="input-row">
                <span>Lãi suất (%):</span>
                <input type="number" step="0.1" name="interest_t3" value={formData.interest_t3} onChange={handleChange} />
            </div>
          </div>
          {/* T-2 */}
          <div className="input-group">
            <label>Tháng T-2 (Cách đây 2 tháng)</label>
            <div className="input-row">
                <span>CPI:</span>
                <input type="number" step="0.1" name="cpi_t2" value={formData.cpi_t2} onChange={handleChange} />
            </div>
            <div className="input-row">
                <span>Vàng (Tr):</span>
                <input type="number" step="0.1" name="gold_t2" value={formData.gold_t2} onChange={handleChange} />
            </div>
            <div className="input-row">
                <span>Lãi suất (%):</span>
                <input type="number" step="0.1" name="interest_t2" value={formData.interest_t2} onChange={handleChange} />
            </div>
          </div>
          {/* T-1 */}
          <div className="input-group">
            <label>Tháng T-1 (Tháng vừa qua)</label>
            <div className="input-row">
                <span>CPI:</span>
                <input type="number" step="0.1" name="cpi_t1" value={formData.cpi_t1} onChange={handleChange} />
            </div>
            <div className="input-row">
                <span>Vàng (Tr):</span>
                <input type="number" step="0.1" name="gold_t1" value={formData.gold_t1} onChange={handleChange} />
            </div>
            <div className="input-row">
                <span>Lãi suất (%):</span>
                <input type="number" step="0.1" name="interest_t1" value={formData.interest_t1} onChange={handleChange} />
            </div>
          </div>
        </div>

        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? 'ĐANG XỬ LÝ MA TRẬN...' : 'PHÂN TÍCH VÀ DỰ BÁO NGAY'}
        </button>
        {error && <div className="error-msg">{error}</div>}
      </div>

      {result && (
        <div className="ai-result-card">
          <div className={`risk-level-banner risk-${result.risk_level}`}>
            <h2>Kết quả dự báo Lạm phát (CPI): {result.prediction} điểm</h2>
            <p>{result.message}</p>
          </div>
          
          <div className="advice-grid">
            <div className="advice-box recommend">
              <h4><CheckCircle size={20} /> Hành Động Khuyến Nghị (Nên làm)</h4>
              <ul>
                {result.action_recommend.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="advice-box avoid">
              <h4><ShieldAlert size={20} /> Cảnh Báo Rủi Ro (Cần tránh)</h4>
              <ul>
                {result.action_avoid.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPrediction;
