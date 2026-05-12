import { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Search, 
  Activity, 
  AlertCircle, 
  Loader2, 
  Edit, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  healthCheckService, 
  medicalIncidentService, 
  studentService,
  HealthCheck,
  MedicalIncident
} from '@/services';
import { extractArray } from '@/lib/api-utils';
import { ApiStudent } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type TabType = 'checks' | 'incidents';

export function HealthPage() {
  const [activeTab, setActiveTab] = useState<TabType>('checks');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [incidents, setIncidents] = useState<MedicalIncident[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<any>(null);
  
  // Form states
  const [checkFormData, setCheckFormData] = useState({
    studentId: '',
    checkDate: new Date().toISOString().split('T')[0],
    height: 100,
    weight: 20,
    eyesight: 'Bình thường',
    dental: 'Bình thường',
    generalHealth: 'Tốt',
    notes: '',
    checkedBy: ''
  });

  const [incidentFormData, setIncidentFormData] = useState({
    studentId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    actionTaken: '',
    reportedBy: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [checksData, incidentsData, studentsData] = await Promise.all([
        healthCheckService.getAll(),
        medicalIncidentService.getAll(),
        studentService.getAllStudents()
      ]);
      
      setHealthChecks(extractArray<HealthCheck>(checksData));
      setIncidents(extractArray<MedicalIncident>(incidentsData));
      setStudents(extractArray<ApiStudent>(studentsData));
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStudentName = (id: number) => {
    const student = students.find(s => s.studentId === id);
    return student ? student.fullName : `HS #${id}`;
  };

  const handleOpenDialog = (type: TabType, data?: any) => {
    setIsEditMode(!!data);
    setCurrentId(activeTab === 'checks' ? (data?.HealthCheckId || data?.id || null) : (data?.id || null));
    
    if (type === 'checks') {
      setCheckFormData(data ? {
        studentId: (data.StudentId || data.studentId)?.toString(),
        checkDate: (data.CheckDate || data.checkDate)?.split('T')[0],
        height: data.Height || data.height,
        weight: data.Weight || data.weight,
        eyesight: data.EyeSight || data.eyesight,
        dental: data.DentalStatus || data.dental,
        generalHealth: data.GeneralHealth || data.generalHealth,
        notes: data.Note || data.notes,
        checkedBy: data.CheckedBy || data.checkedBy
      } : {
        studentId: '',
        checkDate: new Date().toISOString().split('T')[0],
        height: 100,
        weight: 20,
        eyesight: 'Bình thường',
        dental: 'Bình thường',
        generalHealth: 'Tốt',
        notes: '',
        checkedBy: ''
      });
    } else {
      setIncidentFormData(data ? {
        studentId: data.studentId.toString(),
        incidentDate: data.incidentDate.split('T')[0],
        description: data.description,
        actionTaken: data.actionTaken,
        reportedBy: data.reportedBy
      } : {
        studentId: '',
        incidentDate: new Date().toISOString().split('T')[0],
        description: '',
        actionTaken: '',
        reportedBy: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'checks') {
        if (!checkFormData.studentId || !checkFormData.checkedBy || !checkFormData.notes || !checkFormData.eyesight || !checkFormData.dental) {
          toast.warning('Vui lòng điền đầy đủ các trường bắt buộc (*)');
          return;
        }

        const payload: any = {
          StudentId: parseInt(checkFormData.studentId),
          CheckDate: checkFormData.checkDate,
          Height: parseFloat(checkFormData.height.toString()),
          Weight: parseFloat(checkFormData.weight.toString()),
          EyeSight: checkFormData.eyesight,
          DentalStatus: checkFormData.dental,
          GeneralHealth: checkFormData.generalHealth,
          Note: checkFormData.notes,
          CheckedBy: checkFormData.checkedBy
        };
        
        if (isEditMode && currentId) {
          await healthCheckService.update(currentId, payload);
          toast.success('Cập nhật phiếu sức khỏe thành công');
        } else {
          await healthCheckService.create(payload as any);
          toast.success('Thêm phiếu sức khỏe thành công');
        }
      } else {
        if (!incidentFormData.studentId || !incidentFormData.description || !incidentFormData.actionTaken || !incidentFormData.reportedBy) {
          toast.warning('Vui lòng điền đầy đủ các trường bắt buộc (*)');
          return;
        }

        const payload = {
          studentId: parseInt(incidentFormData.studentId),
          incidentDate: incidentFormData.incidentDate,
          description: incidentFormData.description,
          actionTaken: incidentFormData.actionTaken,
          reportedBy: incidentFormData.reportedBy
        };
        
        if (isEditMode && currentId) {
          await medicalIncidentService.update(currentId, payload);
          toast.success('Cập nhật bản ghi sự cố thành công');
        } else {
          await medicalIncidentService.create(payload as any);
          toast.success('Thêm bản ghi sự cố thành công');
        }
      }
      
      await fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save data:', error);
      const errorMsg = error.response?.data?.title || 'Đã có lỗi xảy ra khi lưu dữ liệu';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (item: any) => {
    setConfirmDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    try {
      const id = activeTab === 'checks'
        ? (confirmDeleteItem.HealthCheckId || confirmDeleteItem.id)
        : confirmDeleteItem.id;
      if (activeTab === 'checks') {
        await healthCheckService.delete(id);
      } else {
        await medicalIncidentService.delete(id);
      }
      await fetchData();
      toast.success('Xóa thành công');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Lỗi khi xóa dữ liệu');
    } finally {
      setConfirmDeleteItem(null);
    }
  };

  const filteredChecks = healthChecks.filter(check => {
    const sId = check.StudentId || (check as any).studentId;
    const cBy = check.CheckedBy || (check as any).checkedBy || '';
    return getStudentName(sId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    cBy.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredIncidents = incidents.filter(incident => 
    getStudentName(incident.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Quản lý Sức khỏe
          </h1>
          <p className="text-muted-foreground mt-1">Theo dõi sức khỏe và sự cố y tế của học sinh</p>
        </div>
        <Button onClick={() => handleOpenDialog(activeTab)}>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'checks' ? 'Lên lịch kiểm tra' : 'Ghi nhận sự cố'}
        </Button>
      </div>

      <div className="flex gap-4 border-b pb-1">
        <button 
          onClick={() => setActiveTab('checks')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'checks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Kiểm tra định kỳ
        </button>
        <button 
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'incidents' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Sự cố y tế
        </button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Tìm kiếm theo tên học sinh hoặc người thực hiện...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === 'checks' ? <Activity className="w-5 h-5 text-blue-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
            {activeTab === 'checks' ? 'Lịch sử Kiểm tra Sức khỏe' : 'Nhật ký Sự cố Y tế'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {activeTab === 'checks' ? (
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Ngày kiểm tra</TableHead>
                  <TableHead>Chiều cao/Cân nặng</TableHead>
                  {/* <TableHead>Sức khỏe chung</TableHead> */}
                  {/* <TableHead>Người kiểm tra</TableHead> */}
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              ) : (
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Ngày xảy ra</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Xử lý</TableHead>
                  <TableHead>Người báo cáo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (activeTab === 'checks' ? filteredChecks : filteredIncidents).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không có dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                (activeTab === 'checks' ? filteredChecks : filteredIncidents).map((item) => (
                  <TableRow key={(item as any).HealthCheckId || (item as any).id}>
                    <TableCell className="font-medium text-blue-600">
                      {getStudentName((item as any).StudentId || (item as any).studentId)}
                    </TableCell>
                    <TableCell>
                      {new Date(activeTab === 'checks' ? ((item as any).CheckDate || (item as any).checkDate) : (item as MedicalIncident).incidentDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    {activeTab === 'checks' ? (
                      <>
                        <TableCell>
                          {(item as any).Height || (item as any).height}cm / {(item as any).Weight || (item as any).weight}kg
                          <div className="text-xs text-muted-foreground">BMI: {((item as any).Bmi || (item as any).bmi)?.toFixed(1)}</div>
                        </TableCell>
                        {/* <TableCell>
                          <Badge variant={(item as HealthCheck).generalHealth === 'Tốt' ? 'success' : 'warning'}>
                            {(item as HealthCheck).generalHealth}
                          </Badge>
                        </TableCell> */}
                        {/* <TableCell>{(item as HealthCheck).checkedBy}</TableCell> */}
                      </>
                    ) : (
                      <>
                        <TableCell className="max-w-[200px] truncate" title={(item as MedicalIncident).description}>
                          {(item as MedicalIncident).description}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={(item as MedicalIncident).actionTaken}>
                          {(item as MedicalIncident).actionTaken}
                        </TableCell>
                        {/* <TableCell>{(item as MedicalIncident).reportedBy}</TableCell> */}
                      </>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(activeTab, item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Forms */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Cập nhật' : 'Thêm mới'} {activeTab === 'checks' ? 'Phiếu kiểm tra sức khỏe' : 'Bản ghi sự cố y tế'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="health-studentId">Học sinh <span className="text-red-500">*</span></Label>
              <Select 
                id="health-studentId"
                required
                value={activeTab === 'checks' ? checkFormData.studentId : incidentFormData.studentId}
                onChange={(e) => {
                  if (activeTab === 'checks') setCheckFormData({...checkFormData, studentId: e.target.value});
                  else setIncidentFormData({...incidentFormData, studentId: e.target.value});
                }}
              >
                <option value="">Chọn học sinh...</option>
                {students.map(s => (
                  <option key={s.studentId} value={s.studentId}>{s.fullName}</option>
                ))}
              </Select>
            </div>

            {activeTab === 'checks' ? (
              <>
                <div>
                  <Label>Ngày kiểm tra <span className="text-red-500">*</span></Label>
                  <Input required type="date" value={checkFormData.checkDate} onChange={e => setCheckFormData({...checkFormData, checkDate: e.target.value})} />
                </div>
                <div>
                  <Label>Người thực hiện <span className="text-red-500">*</span></Label>
                  <Input required value={checkFormData.checkedBy} onChange={e => setCheckFormData({...checkFormData, checkedBy: e.target.value})} placeholder="Tên cán bộ y tế" />
                </div>
                <div>
                  <Label>Chiều cao (cm) <span className="text-red-500">*</span></Label>
                  <Input required type="number" value={checkFormData.height} onChange={e => setCheckFormData({...checkFormData, height: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label>Cân nặng (kg) <span className="text-red-500">*</span></Label>
                  <Input required type="number" value={checkFormData.weight} onChange={e => setCheckFormData({...checkFormData, weight: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label>Thị lực <span className="text-red-500">*</span></Label>
                  <Input required value={checkFormData.eyesight} onChange={e => setCheckFormData({...checkFormData, eyesight: e.target.value})} placeholder="VD: 10/10" />
                </div>
                <div>
                  <Label>Răng miệng <span className="text-red-500">*</span></Label>
                  <Input required value={checkFormData.dental} onChange={e => setCheckFormData({...checkFormData, dental: e.target.value})} placeholder="VD: Bình thường" />
                </div>
                <div>
                  <Label>Tình trạng chung <span className="text-red-500">*</span></Label>
                  <Select required value={checkFormData.generalHealth} onChange={e => setCheckFormData({...checkFormData, generalHealth: e.target.value})}>
                    <option value="Tốt">Tốt</option>
                    <option value="Bình thường">Bình thường</option>
                    <option value="Cần theo dõi">Cần theo dõi</option>
                    <option value="Yếu">Yếu</option>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Ghi chú <span className="text-red-500">*</span></Label>
                  <Input required value={checkFormData.notes} onChange={e => setCheckFormData({...checkFormData, notes: e.target.value})} placeholder="Ghi chú thêm về sức khỏe" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Ngày xảy ra <span className="text-red-500">*</span></Label>
                  <Input required type="date" value={incidentFormData.incidentDate} onChange={e => setIncidentFormData({...incidentFormData, incidentDate: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="incident-reportedBy">Người báo cáo <span className="text-red-500">*</span></Label>
                  <Input id="incident-reportedBy" required value={incidentFormData.reportedBy} onChange={e => setIncidentFormData({...incidentFormData, reportedBy: e.target.value})} placeholder="Tên giáo viên/phụ huynh" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="incident-description">Mô tả sự cố <span className="text-red-500">*</span></Label>
                  <Input id="incident-description" required value={incidentFormData.description} onChange={e => setIncidentFormData({...incidentFormData, description: e.target.value})} placeholder="Mô tả ngắn gọn sự việc" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="incident-actionTaken">Cách xử lý <span className="text-red-500">*</span></Label>
                  <Input id="incident-actionTaken" required value={incidentFormData.actionTaken} onChange={e => setIncidentFormData({...incidentFormData, actionTaken: e.target.value})} placeholder="Sơ cứu, gọi phụ huynh, chuyển viện..." />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu thông tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteItem !== null}
        title={activeTab === 'checks' ? 'Xóa phiếu kiểm tra' : 'Xóa bản ghi sự cố'}
        description="Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteItem(null)}
      />
    </div>
  );
}
