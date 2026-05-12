# Hệ thống Quản lý Trường Mầm Non

Hệ thống quản lý toàn diện cho trường mầm non, được xây dựng với React, TypeScript, Tailwind CSS và shadcn/ui.

## Tính năng chính

### 🔐 Xác thực
- **Login**: Đăng nhập với phân quyền Admin/Staff
- Form tối giản với toggle hiển thị mật khẩu
- Ghi nhớ đăng nhập

### 📊 Dashboard
- KPI Cards: Tổng học sinh, tỷ lệ thu học phí, cảnh báo dị ứng
- Biểu đồ Line Chart: Xu hướng số lượng học sinh
- Biểu đồ Bar Chart: Doanh thu học phí theo tháng
- Bộ lọc theo thời gian (ngày/tuần/tháng/năm)

### 👶 Quản lý Học sinh
- CRUD đầy đủ (Thêm, Sửa, Xóa, Vô hiệu hóa)
- Tìm kiếm và lọc theo lớp, tên
- Hiển thị thông tin: Tên, ngày sinh, lớp, phụ huynh, địa chỉ, SĐT
- Cảnh báo dị ứng

### 👨‍🏫 Quản lý Nhân sự
- CRUD cho giáo viên, bảo mẫu, y tế, kế toán
- Tìm kiếm và lọc theo chức vụ
- Quản lý trạng thái làm việc

### 🏫 Quản lý Lớp học
- Tạo lớp mới với Transfer List (2 cột)
- Chuyển học sinh từ danh sách chờ vào lớp
- Gán giáo viên chủ nhiệm
- Xem danh sách lớp học với thông tin chi tiết

### 📅 Lịch học tuần (Timetable)
- Giao diện lưới theo ngày và khung giờ
- Drag & Drop hoạt động vào lịch
- Sao chép lịch tuần trước
- Lọc theo từng lớp

### 🍽️ Quản lý Thực đơn
- View theo ngày/tuần/tháng
- Drag & Drop món ăn vào các bữa (Sáng, Trưa, Xế)
- Sao chép thực đơn mẫu
- Danh sách món ăn đa dạng

### 💰 Quản lý Tài chính
- Bảng theo dõi học phí
- Trạng thái: Đã đóng, Chưa đóng, Quá hạn
- Xuất phiếu thu PDF
- Gửi nhắc học phí hàng loạt
- Thống kê doanh thu

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Router** - Routing
- **Recharts** - Data Visualization
- **Lucide React** - Icons

## Cài đặt

```bash
# Clone repository
git clone <your-repo-url>

# Di chuyển vào thư mục project
cd preschool-management

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Cấu trúc thư mục

```
preschool-management/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── MainLayout.tsx
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── StudentsPage.tsx
│   │   ├── StaffPage.tsx
│   │   ├── ClassesPage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── MenuPage.tsx
│   │   └── BillingPage.tsx
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── lib/                # Utilities
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Theme

Hệ thống sử dụng theme màu ấm (orange/amber) kết hợp với xám/trắng:
- Primary: Orange (#F97316)
- Secondary: Warm Gray
- Background: Light cream
- Accent: Amber

## Tính năng nổi bật

### 🎨 UI/UX
- Giao diện hiện đại, thân thiện
- Responsive design
- Drag & Drop tương tác
- Loading states
- Error handling

### 🔒 Bảo mật
- Phân quyền theo role
- Protected routes
- Session management

### 📱 Responsive
- Desktop first
- Tablet support
- Mobile friendly

## Scripts

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## License

MIT

## Tác giả

Phát triển bởi Claude AI
