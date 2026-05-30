# 🏫 Hệ thống Quản lý Trường Mầm Non (Preschool Management System)

Chào mừng bạn đến với **Preschool Dashboard**, một giải pháp quản lý toàn diện dành cho các trường mầm non hiện đại. Hệ thống được thiết kế để tối ưu hóa quy trình vận hành, quản lý học sinh, nhân sự, tài chính và đặc biệt là theo dõi sức khỏe học đường một cách chuyên nghiệp.

---

## 🌟 Tính năng Nổi bật

### 1. 📊 Dashboard Thông minh (Real-time Analytics)
- **KPI Tổng quan**: Theo dõi thời gian thực số lượng học sinh, đội ngũ nhân sự đang trực, tỷ lệ thu học phí và các sự cố y tế cần xử lý.
- **Biểu đồ Tài chính**: Phân tích doanh thu thực tế so với kế hoạch thu học phí trong 6 tháng gần nhất.
- **Phân bổ Học sinh**: Biểu đồ hình quạt hiển thị tỷ lệ học sinh đang theo học và học sinh đã nghỉ học.
- **Hoạt động Gần đây**: Nhật ký kết hợp các sự kiện quan trọng (hóa đơn mới, sự cố y tế, học sinh mới nhập học).

### 2. 🔐 Hệ thống Xác thực & Phân quyền
- **AuthProvider**: Quản lý trạng thái đăng nhập tập trung trên toàn ứng dụng.
- **Protected Routes**: Tự động chặn các truy cập trái phép và đẩy người dùng về trang Login nếu chưa có Token.
- **Session Management**: Tự động lưu và khôi phục thông tin người dùng từ `localStorage`.

### 3. 🛡️ Quản lý Sức khỏe (Health Management)
- **Kiểm tra Định kỳ**: Theo dõi chiều cao, cân nặng, chỉ số BMI, thị lực và tình trạng răng miệng của từng học sinh.
- **Nhật ký Sự cố Y tế**: Ghi nhận kịp thời các tình huống sức khỏe phát sinh, cách xử lý và người báo cáo.
- **Thống kê Hàng ngày**: Dashboard tự động hiển thị số lượng sự cố y tế cần chú ý trong 24h qua.

### 4. 👶 Quản lý Học sinh & Lớp học
- **Hồ sơ Học sinh**: Quản lý thông tin cá nhân, liên hệ phụ huynh và hồ sơ dị ứng.
- **Lớp học**: Phân chia lớp theo độ tuổi, gán giáo viên chủ nhiệm và theo dõi sĩ số.

### 5. 💰 Quản lý Tài chính (Billing)
- **Hóa đơn Tự động**: Tạo hóa đơn học phí cho học sinh.
- **Theo dõi Thanh toán**: Quản lý trạng thái hóa đơn (Đã đóng, Chưa đóng, Quá hạn).
- **Thanh toán**: Ghi nhận các giao dịch thanh toán thực tế của phụ huynh.

### 6. 🎨 Giao diện & Trải nghiệm (UI/UX)
- **Sidebar Thu gọn (Collapsible)**: Tiết kiệm không gian làm việc với Tooltip thông minh cho từng tính năng.
- **Responsive Design**: Hoạt động mượt mà trên nhiều kích thước màn hình.
- **Theme ấm áp**: Sử dụng tông màu cam/trắng thân thiện với môi trường giáo dục mầm non.

---

## 🛠️ Công nghệ Sử dụng

- **Frontend**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router Dom v6](https://reactrouter.com/)
- **API Handling**: [Axios](https://axios-http.com/)

---

## 📁 Cấu trúc Thư mục

```bash
preschool-dashboard/
├── src/
│   ├── components/      # Các component dùng chung và Layout
│   │   ├── auth/        # ProtectedRoute, Auth logic
│   │   ├── layouts/     # Sidebar, Topbar, MainLayout
│   │   └── ui/          # Các component cơ bản (Button, Input, Card, v.v.)
│   ├── contexts/        # Quản lý Context API (AuthContext)
│   ├── services/        # Lớp API Services (Auth, Student, Health, Billing, v.v.)
│   ├── pages/           # Các trang chính của ứng dụng
│   ├── types/           # Định nghĩa TypeScript Types & Interfaces
│   ├── lib/             # Các hàm tiện ích (utils, v.v.)
│   ├── App.tsx          # Router logic & Provier wrapping
│   └── main.tsx         # Entry point
```

---

## 🚀 Hướng dẫn Cài đặt

### 1. Clone Project
```bash
git clone https://github.com/your-username/preschool-dashboard.git
cd preschool-dashboard
```

### 2. Cài đặt Dependency
```bash
yarn install
# hoặc
npm install
```

### 3. Cấu hình Biến môi trường
Tạo file `.env` ở thư mục gốc:
```env
VITE_API_URL=http://your-api-end-point.com
```

### 4. Chạy Development
```bash
yarn dev
```

### 5. Build Production
```bash
yarn build
```

---

## 📝 Giấy phép

Dự án này được cấp phép theo tiêu chuẩn **MIT License**.

---
*Phát triển bởi Đội ngũ Công nghệ thông tin.*
