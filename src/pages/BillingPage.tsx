import { useState, useEffect } from 'react';
import { Search, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { paymentService, invoiceService } from '@/services';
import { ApiPayment, ApiInvoice, RevenueSummary } from '@/types';
import { extractArray, extractData } from '@/lib/api-utils';
import { Plus, History, FileText, AlertCircle, ShoppingCart, User, CalendarDays, Wallet } from 'lucide-react';

export function BillingPage() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [selectedInvoice, setSelectedInvoice] = useState<ApiInvoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsResp, invoicesResp, summaryResp] = await Promise.all([
        paymentService.getAllPayments(),
        invoiceService.getAllInvoices(),
        paymentService.getRevenueSummary()
      ]);
      
      setPayments(extractArray<ApiPayment>(paymentsResp));
      setInvoices(extractArray<ApiInvoice>(invoicesResp));
      setRevenueSummary(extractData<RevenueSummary>(summaryResp));
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = (payments || []).filter((payment: ApiPayment) => {
    const studentName = payment.studentName || `Học sinh #${payment.invoiceId}`;
    return studentName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredInvoices = (invoices || []).filter((invoice: ApiInvoice) => {
    const studentName = invoice.studentName || `Học sinh #${invoice.studentId}`;
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTransactions: revenueSummary?.totalTransactions || payments.length,
    totalRevenue: revenueSummary?.totalRevenue || 0,
    paidAmount: payments.reduce((sum: number, p: ApiPayment) => sum + p.paidAmount, 0),
  };


  const handleInvoiceAction = (invoice: ApiInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handleSendReminder = () => {
    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
    alert(`Gửi thông báo nhắc học phí đến ${overdueCount} phụ huynh có hóa đơn quá hạn`);
  };

  const handleMarkOverdue = async () => {
    try {
      const resp = await invoiceService.markOverdue();
      if (resp.success) {
        alert('Đã cập nhật trạng thái quá hạn cho các hóa đơn trễ hạn');
        fetchData();
      }
    } catch (error) {
      console.error('Error marking overdue:', error);
    }
  };

  const getInvoiceStatusBadge = (status: ApiInvoice['status']) => {
    const statusMap: Record<ApiInvoice['status'], { label: string; className: string }> = {
      Draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
      Sent: { label: 'Đã gửi', className: 'bg-blue-100 text-blue-600' },
      Paid: { label: 'Đã đóng', className: 'bg-green-100 text-green-600' },
      Partial: { label: 'Đóng một phần', className: 'bg-orange-100 text-orange-600' },
      Overdue: { label: 'Quá hạn', className: 'bg-red-100 text-red-600' },
      Cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-400' },
    };
    const config = statusMap[status] || statusMap.Draft;
    return <Badge className={`${config.className} border-none font-normal`}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
          <p className="text-muted-foreground mt-1">Theo dõi học phí và thanh toán</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkOverdue}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Quét quá hạn
          </Button>
          <Button onClick={handleSendReminder}>
            <Send className="w-4 h-4 mr-2" />
            Nhắc học phí
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo hóa đơn
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Tổng doanh thu</div>
            <div className="text-3xl font-bold text-primary">{stats.totalRevenue.toLocaleString('vi-VN')} đ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Tổng giao dịch</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        {revenueSummary?.byMethod.map((method) => (
          <Card key={method.paymentMethod}>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                Qua {method.paymentMethod}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {method.totalAmount.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {method.count} giao dịch
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Range Info */}
      <div className="flex justify-end gap-2 text-sm text-muted-foreground italic">
        {revenueSummary && (
          <span>Dữ liệu từ {new Date(revenueSummary.fromDate).toLocaleDateString('vi-VN')} đến {new Date(revenueSummary.toDate).toLocaleDateString('vi-VN')}</span>
        )}
      </div>

      {/* Tabs switching */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'payments' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4 mr-2" />
          Lịch sử Thanh toán
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'invoices' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Quản lý Hóa đơn
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Tìm kiếm theo tên học sinh trong ${activeTab === 'payments' ? 'thanh toán' : 'hóa đơn'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'invoices' && (
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="Draft">Bản nháp</option>
                <option value="Sent">Đã gửi</option>
                <option value="Paid">Đã đóng</option>
                <option value="Partial">Đóng một phần</option>
                <option value="Overdue">Quá hạn</option>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeTab === 'payments' 
                ? `Danh sách thanh toán (${filteredPayments.length})` 
                : `Danh sách hóa đơn (${filteredInvoices.length})`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : activeTab === 'payments' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số Phiếu</TableHead>
                  <TableHead>Học Sinh</TableHead>
                  <TableHead>Số Hóa Đơn</TableHead>
                  <TableHead>Phương Thức</TableHead>
                  <TableHead>Số Tiền</TableHead>
                  <TableHead>Ngày Đóng</TableHead>
                  <TableHead>Người Thu</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment: ApiPayment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.paymentNumber}
                    </TableCell>
                    <TableCell className="font-semibold">{payment.studentName}</TableCell>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {payment.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {payment.paidAmount.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.receivedByName}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* PDF Download Disabled */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số Hóa Đơn</TableHead>
                  <TableHead>Học Sinh</TableHead>
                  <TableHead>Hạn Đóng</TableHead>
                  <TableHead>Tổng Tiền</TableHead>
                  <TableHead>Đã Đóng</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice: ApiInvoice) => (
                  <TableRow key={invoice.invoiceId}>
                    <TableCell className="font-semibold">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.studentName}</TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="font-bold">
                      {invoice.totalAmount.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell className="text-green-600">
                      {invoice.paidAmount.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell>
                      {getInvoiceStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvoiceAction(invoice)}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Chi tiết Hóa đơn: {selectedInvoice?.invoiceNumber}
              </span>
              {selectedInvoice && getInvoiceStatusBadge(selectedInvoice.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6 py-4">
              {/* Top Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-8 items-start">
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Học sinh</p>
                      <p className="font-semibold text-slate-900">{selectedInvoice.studentName}</p>
                      <p className="text-xs text-slate-500">Mã HS: STU{selectedInvoice.studentId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Hạn thanh toán</p>
                      <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl px-6 py-5 space-y-3 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-medium text-slate-500">Tổng cộng</span>
                    <span className="font-semibold text-slate-900">{selectedInvoice.totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-medium text-slate-500">Đã thanh toán</span>
                    <span className="font-semibold text-green-600">{selectedInvoice.paidAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between items-center text-primary pt-1">
                    <span className="text-xs font-semibold uppercase">Còn lại</span>
                    <span className="text-lg font-semibold">
                      {(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-slate-400" />
                  Danh mục khoản thu
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium italic">{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.unitPrice.toLocaleString('vi-VN')} đ</TableCell>
                            <TableCell className="text-right font-semibold text-slate-900">{item.totalAmount.toLocaleString('vi-VN')} đ</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-4 italic">
                            Chưa có danh mục chi tiết
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Payment History Section (if needed) */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="space-y-3 pb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    Lịch sử thanh toán
                  </h3>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-50/50 border border-green-100 rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="success" className="text-[10px] px-1.5 h-4">SUCCESS</Badge>
                          <span className="font-medium text-green-800">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('vi-VN') : '-'}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-600">{p.paymentMethod}</span>
                        </div>
                        <span className="font-bold text-green-700">+{p.paidAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Ghi chú</p>
                  <p className="text-sm text-amber-800 italic">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4 flex justify-end gap-3 mt-4">
            <Button variant="outline" className="px-8" onClick={() => setIsDetailOpen(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
