import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2, 
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  User,
  Baby,
  Activity,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { parentRegistrationService, classService } from '@/services';
import { ApiParentRegistration, RegistrationStatus, ApiClass } from '@/types';
import { extractArray } from '@/lib/api-utils';

export function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<ApiParentRegistration[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | RegistrationStatus>('all');
  
  const [selectedReg, setSelectedReg] = useState<ApiParentRegistration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  
  const [approveData, setApproveData] = useState({
    classId: '',
    notes: ''
  });
  
  const [rejectData, setRejectData] = useState({
    reason: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [regResp, classResp] = await Promise.all([
        parentRegistrationService.getAllRegistrations(),
        classService.getAllClasses()
      ]);
      
      setRegistrations(extractArray<ApiParentRegistration>(regResp));
      setClasses(extractArray<ApiClass>(classResp));
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      toast.error('Không thể tải danh sách đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRegistrations = (registrations || []).filter(reg => {
    if (!reg) return false;
    
    const pName = (reg.parentName || "").toLowerCase();
    const cName = (reg.childName || "").toLowerCase();
    const pPhone = (reg.phoneNumber || "");
    const pEmail = (reg.email || "").toLowerCase();
    const sTerm = (searchTerm || "").toLowerCase();

    const matchesSearch = 
      pName.includes(sTerm) ||
      cName.includes(sTerm) ||
      pPhone.includes(searchTerm) ||
      pEmail.includes(sTerm);
    
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!selectedReg) return;
    try {
      await parentRegistrationService.approveRegistration(selectedReg.registrationId, {
        classId: approveData.classId ? parseInt(approveData.classId) : undefined,
        notes: approveData.notes
      });
      toast.success('Đã duyệt đơn đăng ký');
      setIsApproveOpen(false);
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi duyệt đơn');
    }
  };

  const handleReject = async () => {
    if (!selectedReg || !rejectData.reason) {
      toast.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await parentRegistrationService.rejectRegistration(selectedReg.registrationId, {
        reason: rejectData.reason
      });
      toast.success('Đã từ chối đơn đăng ký');
      setIsRejectOpen(false);
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi từ chối đơn');
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Chờ duyệt</Badge>;
      case 'Approved':
        return <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Đã duyệt</Badge>;
      case 'Rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            Quản lý Tuyển sinh
          </h1>
          <p className="text-slate-500 mt-1 text-sm italic">Tiếp nhận và xử lý hồ sơ đăng ký nhập học từ phụ huynh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest">Tổng hồ sơ</p>
              <p className="text-2xl font-bold text-slate-900">{(registrations || []).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Loader2 className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Chờ xử lý</p>
              <p className="text-2xl font-bold text-slate-900">{(registrations || []).filter(r => r && r.status === 'Pending').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Đã tiếp nhận</p>
              <p className="text-2xl font-bold text-slate-900">{(registrations || []).filter(r => r && r.status === 'Approved').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm phụ huynh, học sinh, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-white border-slate-200 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 mr-1" />
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterStatus === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterStatus('Pending')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterStatus === 'Pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Chờ duyệt
                </button>
                <button
                  onClick={() => setFilterStatus('Approved')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterStatus === 'Approved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Đã duyệt
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Ngày nộp</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Phụ huynh</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Thông tin trẻ</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Dự kiến nhập học</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center">Trạng thái</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right px-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">Đang tải danh sách...</p>
                  </TableCell>
                </TableRow>
              ) : filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500 italic">
                    Không tìm thấy dữ liệu đăng ký nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((reg) => (
                  <TableRow key={reg.registrationId} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 font-medium text-slate-500">
                      {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{reg.parentName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> {reg.phoneNumber || "Không có"}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" /> {reg.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-slate-700">{reg.childName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(reg.childDateOfBirth).toLocaleDateString('vi-VN')} • {reg.childGender}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-semibold text-slate-700">
                          {reg.intendedStartDate ? new Date(reg.intendedStartDate).toLocaleDateString('vi-VN') : '---'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      {getStatusBadge(reg.status)}
                    </TableCell>
                    <TableCell className="py-4 text-right px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-white hover:shadow-md transition-all font-semibold text-primary px-4 border border-transparent hover:border-slate-100"
                        onClick={() => {
                          setSelectedReg(reg);
                          setIsDetailOpen(true);
                        }}
                        aria-label="Chi tiết"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details & Action Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white border-none flex flex-row items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-primary" />
                Đơn đăng ký #{selectedReg?.registrationId}
              </DialogTitle>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em]">Nộp ngày {selectedReg && selectedReg.createdAt ? new Date(selectedReg.createdAt).toLocaleDateString('vi-VN') : '---'}</p>
            </div>
            {selectedReg && getStatusBadge(selectedReg.status)}
          </DialogHeader>

          <div className="p-8 space-y-8 bg-white">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User className="w-3 h-3" /> Thông tin phụ huynh
                  </h3>
                  <div className="space-y-3">
                    <p className="font-bold text-slate-900 text-lg leading-none">{selectedReg?.parentName}</p>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary" /> {selectedReg?.phoneNumber || "Không có"}
                      </p>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary" /> {selectedReg?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Thời gian nhập học
                  </h3>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 italic font-semibold text-slate-700">
                    {selectedReg && selectedReg.intendedStartDate ? new Date(selectedReg.intendedStartDate).toLocaleDateString('vi-VN') : '---'}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Baby className="w-3 h-3" /> Thông tin bé
                  </h3>
                  <div className="space-y-3">
                    <p className="font-bold text-slate-900 text-lg leading-none">{selectedReg?.childName}</p>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> Ngày sinh: {selectedReg && new Date(selectedReg.childDateOfBirth).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        Giới tính: <span className="font-black">{selectedReg?.childGender || '---'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Ghi chú từ phụ huynh
                  </h3>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 italic text-sm text-amber-800 min-h-[80px]">
                    {selectedReg?.notes || "Không có ghi chú thêm."}
                  </div>
                </div>
              </div>
            </div>

            {selectedReg?.status !== 'Pending' && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Thông tin phản hồi của Admin</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-700 font-medium whitespace-pre-line">
                    {selectedReg?.adminNotes || "Không có phản hồi."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedReg?.status === 'Pending' && (
            <div className="p-6 bg-slate-50 border-t flex items-center justify-between gap-4">
              <Button 
                variant="outline" 
                className="flex-1 bg-white border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 rounded-xl border-2"
                onClick={() => setIsRejectOpen(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Từ chối hồ sơ
              </Button>
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-200"
                onClick={() => {
                  setApproveData({ classId: '', notes: '' });
                  setIsApproveOpen(true);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tiếp nhận hồ sơ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md rounded-2xl p-8">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-black text-emerald-700 flex items-center gap-3">
              <CheckCircle className="w-7 h-7" />
              Tiếp nhận hồ sơ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Phân lớp dự kiến (Không bắt buộc)</Label>
              <Select value={approveData.classId} onChange={(e) => setApproveData({...approveData, classId: e.target.value})}>
                <option value="">-- Chưa xếp lớp --</option>
                {classes.map((c, idx) => (
                  <option key={c.classId || idx} value={(c.classId || '').toString()}>{c.className}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Ghi chú cho phụ huynh</Label>
              <textarea 
                className="w-full min-h-[120px] p-4 bg-slate-50 rounded-xl border-slate-200 text-sm focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                placeholder="VD: Nhà trường đã tiếp nhận hồ sơ, vui lòng mang theo các giấy tờ liên quan để hoàn tất thủ tục..."
                value={approveData.notes}
                onChange={(e) => setApproveData({...approveData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="pt-8">
            <Button variant="ghost" onClick={() => setIsApproveOpen(false)} className="font-bold text-slate-500 underline">Đóng</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-emerald-200" onClick={handleApprove}>
              XÁC NHẬN TIẾP NHẬN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md rounded-2xl p-8">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-black text-red-700 flex items-center gap-3">
              <XCircle className="w-7 h-7" />
              Từ chối hồ sơ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Lý do từ chối (Bắt buộc)</Label>
              <textarea 
                className="w-full min-h-[120px] p-4 bg-slate-50 rounded-xl border-slate-200 text-sm focus:ring-4 focus:ring-red-50 transition-all outline-none"
                placeholder="Lý do từ chối (VD: Lớp đã đủ sĩ số...)"
                value={rejectData.reason}
                onChange={(e) => setRejectData({ reason: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter className="pt-8">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="font-bold text-slate-500 underline">Quay lại</Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-red-200 border-none" onClick={handleReject}>
              XÁC NHẬN TỪ CHỐI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
