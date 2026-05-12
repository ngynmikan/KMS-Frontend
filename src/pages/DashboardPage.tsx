import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  studentService, 
  userService, 
  invoiceService, 
  paymentService, 
  medicalIncidentService 
} from '@/services';
import { ApiStudent, ManagedUser, ApiInvoice, ApiPayment } from '@/types';
import { MedicalIncident } from '@/services/health/medical-incident.service';
import { extractArray } from '@/lib/api-utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [incidents, setIncidents] = useState<MedicalIncident[]>([]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [
        studentsData, 
        usersData, 
        invoicesData, 
        paymentsData, 
        incidentsData
      ] = await Promise.all([
        studentService.getAllStudents(),
        userService.getActiveUsers(),
        invoiceService.getAllInvoices(),
        paymentService.getAllPayments(),
        medicalIncidentService.getAll()
      ]);

      setStudents(extractArray<ApiStudent>(studentsData));
      setUsers(extractArray<ManagedUser>(usersData));
      setInvoices(extractArray<ApiInvoice>(invoicesData));
      setPayments(extractArray<ApiPayment>(paymentsData));
      setIncidents(extractArray<MedicalIncident>(incidentsData));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aggregated Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStaff = users.length;
    
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
    const paymentRate = invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0;
    
    // Incidents today
    const todayStr = new Date().toISOString().split('T')[0];
    const incidentsToday = incidents.filter(inc => inc.incidentDate.split('T')[0] === todayStr).length;

    return {
      totalStudents,
      activeStaff,
      paymentRate: paymentRate.toFixed(1),
      incidentsToday
    };
  }, [students, users, invoices, incidents]);

  // Chart Data: Monthly Revenue (Last 6 Months)
  const revenueTrendData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months: any[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const index = (currentMonthIndex - i + 12) % 12;
      last6Months.push({
        month: months[index],
        monthNum: index + 1,
        year: new Date().getFullYear() - (currentMonthIndex - i < 0 ? 1 : 0),
        revenue: 0,
        invoiced: 0
      });
    }

    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      
      const bucket = last6Months.find(b => b.monthNum === m && b.year === y);
      if (bucket) {
        bucket.revenue += payment.paidAmount;
      }
    });

    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      
      const bucket = last6Months.find(b => b.monthNum === m && b.year === y);
      if (bucket) {
        bucket.invoiced += invoice.totalAmount;
      }
    });

    return last6Months;
  }, [payments, invoices]);

  // Chart Data: Student Distribution by Status or Class (Mocking trend but keeping totals real)
  const studentDistribution = useMemo(() => {
    const active = students.filter(s => s.isActive).length;
    const inactive = students.length - active;
    return [
      { name: 'Hoạt động', value: active },
      { name: 'Nghỉ học', value: inactive }
    ];
  }, [students]);

  // Combined Recent Activities
  const recentActivities = useMemo(() => {
    const all = [
      ...invoices.map(inv => ({
        type: 'invoice',
        time: new Date(inv.createdAt || inv.issueDate),
        title: `Hóa đơn mới: ${inv.invoiceNumber}`,
        desc: `Học sinh: ${inv.studentName || 'N/A'} - ${inv.totalAmount.toLocaleString('vi-VN')} VNĐ`,
        status: inv.status
      })),
      ...incidents.map(inc => ({
        type: 'incident',
        time: new Date(inc.createdAt || inc.incidentDate),
        title: `Sự cố y tế: ${inc.reportedBy}`,
        desc: inc.description,
        status: 'Incident'
      }))
    ];

    return all
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5);
  }, [invoices, incidents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Tổng quan Hệ thống</h1>
          <p className="text-slate-500 mt-1">Xin chào! Dưới đây là tình hình hoạt động của trường hôm nay.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-[180px]">
            <option value="month">Tháng hiện tại</option>
            <option value="quarter">Quý hiện tại</option>
            <option value="year">Năm học này</option>
          </Select> */}
          <button 
            onClick={fetchDashboardData}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem 
          title="Tổng học sinh" 
          value={stats.totalStudents} 
          icon={Users} 
          trend="+2" 
          up={true} 
          color="bg-blue-500" 
          label="vào lớp mới"
        />
        <KPIItem 
          title="Doanh thu/Kế hoạch" 
          value={`${stats.paymentRate}%`} 
          icon={DollarSign} 
          trend="+5.4%" 
          up={true} 
          color="bg-emerald-500" 
          label="so với tháng trước"
        />
        <KPIItem 
          title="Sự cố y tế (Hôm nay)" 
          value={stats.incidentsToday} 
          icon={AlertTriangle} 
          trend={stats.incidentsToday > 0 ? "Cần xử lý" : "An toàn"} 
          up={stats.incidentsToday > 0} 
          color="bg-amber-500" 
          label="trong 24h qua"
        />
        <KPIItem 
          title="Đội ngũ nhân sự" 
          value={stats.activeStaff} 
          icon={Heart} 
          trend="0" 
          up={true} 
          color="bg-rose-500" 
          label="nhân viên đang trực"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between font-outfit">
            <div>
              <CardTitle className="text-lg">Phân tích Tài chính</CardTitle>
              <CardDescription>So sánh doanh thu thực tế và kế hoạch thu</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val: any) => [`${val.toLocaleString('vi-VN')} đ`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={3}
                    name="Đã thu"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invoiced" 
                    stroke="#94a3b8" 
                    strokeDasharray="5 5"
                    fill="transparent" 
                    strokeWidth={1}
                    name="Kế hoạch"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Pie Chart */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Tình trạng học sinh</CardTitle>
            <CardDescription>Tỷ lệ học sinh hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {studentDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {studentDistribution.map((item, index) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                    <span className="text-xs text-slate-500">{item.name}</span>
                  </div>
                  <span className="text-xl font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            <Badge variant="outline">Mới nhất</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    activity.type === 'invoice' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {activity.type === 'invoice' ? <DollarSign className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(activity.time)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{activity.desc}</p>
                    {activity.status && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1 mt-1">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-400">Chưa có hoạt động nào được ghi nhận.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links / Tasks */}
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Lối tắt nhanh</CardTitle>
            <CardDescription className="text-slate-500">Các thao tác thường dùng</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 relative z-10">
            <QuickActionButton to="/students" icon={Users} title="QL Học sinh" />
            <QuickActionButton to="/health" icon={Heart} title="QL Sức khỏe" />
            <QuickActionButton to="/menu" icon={Calendar} title="Lên thực đơn" />
            <QuickActionButton to="/billing" icon={DollarSign} title="QL Thu phí" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPIItem({ title, value, icon: Icon, trend, up, color, label }: any) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl text-white ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 font-outfit">{value}</h3>
            <div className={`flex items-center text-xs font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
              {up ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {trend}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-semibold">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, title, to }: any) {
  return (
    <Link 
      to={to}
      className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all group text-center"
    >
      <div className="p-3 bg-white rounded-xl mb-2 group-hover:scale-110 transition-transform shadow-sm">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xs font-semibold text-slate-700">{title}</span>
    </Link>
  );
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}p trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h trước`;
  return `${Math.floor(hours / 24)}n trước`;
}
