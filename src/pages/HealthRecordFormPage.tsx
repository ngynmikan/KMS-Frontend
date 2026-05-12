import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Heart,
  Scale,
  Ruler,
  Eye,
  Activity,
  User as UserIcon,
  StickyNote
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { healthCheckService, studentService } from '@/services';
import { ApiStudent } from '@/types';
import { extractArray, extractData } from '@/lib/api-utils';

export function HealthRecordFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    checkDate: new Date().toISOString().split('T')[0],
    height: 100,
    weight: 20,
    eyesight: '10/10',
    dentalStatus: 'Bình thường',
    generalHealth: 'Tốt',
    note: '',
    checkedBy: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const studentsResp = await studentService.getAllStudents();
      setStudents(extractArray<ApiStudent>(studentsResp));

      if (isEditMode) {
        const checkData = await healthCheckService.getById(id!);
        if (checkData) {
          const data = extractData<any>(checkData);
          setFormData({
            studentId: (data.studentId || data.StudentId)?.toString() || '',
            checkDate: (data.checkDate || data.CheckDate)?.split('T')[0] || '',
            height: data.height || data.Height || 100,
            weight: data.weight || data.Weight || 20,
            eyesight: data.eyesight || data.EyeSight || '10/10',
            dentalStatus: data.dentalStatus || data.DentalStatus || 'Bình thường',
            generalHealth: data.generalHealth || data.GeneralHealth || 'Tốt',
            note: data.note || data.Note || '',
            checkedBy: data.checkedBy || data.CheckedBy || ''
          });
        }
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.studentId || !formData.checkedBy) {
      toast.warning('Vui lòng chọn học sinh và nhập người thực hiện');
      return;
    }

    const studentIdInt = parseInt(formData.studentId);
    if (isNaN(studentIdInt)) {
      toast.error('Mã học sinh không hợp lệ');
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        StudentId: studentIdInt,
        CheckDate: formData.checkDate,
        Height: parseFloat(formData.height.toString()) || 0,
        Weight: parseFloat(formData.weight.toString()) || 0,
        EyeSight: formData.eyesight,
        DentalStatus: formData.dentalStatus,
        GeneralHealth: formData.generalHealth,
        Note: formData.note,
        CheckedBy: formData.checkedBy
      };

      if (isEditMode) {
        if (!id || id === 'undefined') {
          toast.error('Không tìm thấy mã hồ sơ để cập nhật');
          return;
        }
        await healthCheckService.update(id, payload);
        toast.success('Cập nhật hồ sơ thành công');
      } else {
        await healthCheckService.create(payload);
        toast.success('Thêm hồ sơ thành công');
      }
      navigate('/health-records');
    } catch (error) {
      toast.error('Lỗi khi lưu dữ liệu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="mt-4 text-slate-500 font-medium">Đang chuẩn bị hồ sơ...</p>
      </div>
    );
  }

  const selectedStudent = students.find(s => s.studentId.toString() === formData.studentId);
  const bmi = (formData.weight / ((formData.height/100) * (formData.height/100))).toFixed(1);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-orange-50 rounded-full text-orange-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 shadow-lg shadow-orange-200"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu hồ sơ
        </Button>
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <Heart className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isEditMode ? 'Chỉnh sửa hồ sơ sức khỏe' : 'Thêm hồ sơ sức khỏe mới'}
            </h1>
            <p className="text-slate-500">Thông tin chi tiết về thể trạng của học sinh</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/80">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-orange-500" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="student">Học sinh <span className="text-red-500">*</span></Label>
                <Select 
                  id="student"
                  value={formData.studentId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, studentId: e.target.value})}
                  disabled={isEditMode}
                  className="w-full"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map(s => (
                    <option key={s.studentId} value={s.studentId}>{s.fullName}</option>
                  ))}
                </Select>
                {selectedStudent && (
                  <p className="text-xs text-slate-500 mt-1">Mã HS: {selectedStudent.studentCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Ngày kiểm tra <span className="text-red-500">*</span></Label>
                <Input 
                  id="date"
                  type="date" 
                  value={formData.checkDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, checkDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkedBy">Người thực hiện <span className="text-red-500">*</span></Label>
                <Input 
                  id="checkedBy"
                  placeholder="Họ tên cán bộ y tế..." 
                  value={formData.checkedBy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, checkedBy: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="generalHealth">Tình trạng chung</Label>
                <Select 
                  id="generalHealth"
                  value={formData.generalHealth}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, generalHealth: e.target.value})}
                >
                  <option value="Tốt">Tốt</option>
                  <option value="Bình thường">Bình thường</option>
                  <option value="Cần theo dõi">Cần theo dõi</option>
                  <option value="Yếu">Yếu</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/80">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Chỉ số chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-slate-400" />
                  Chiều cao (cm)
                </Label>
                <Input 
                  id="height"
                  type="number" 
                  value={formData.height}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, height: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-400" />
                  Cân nặng (kg)
                </Label>
                <Input 
                  id="weight"
                  type="number" 
                  value={formData.weight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eyesight" className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  Thị lực
                </Label>
                <Input 
                  id="eyesight"
                  placeholder="VD: 10/10, Cận nhẹ..." 
                  value={formData.eyesight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, eyesight: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dental">Răng miệng</Label>
                <Input 
                  id="dental"
                  placeholder="VD: Bình thường, Sâu răng..." 
                  value={formData.dentalStatus}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dentalStatus: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/80">
              <CardTitle className="text-lg flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-orange-500" />
                Ghi chú thêm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea 
                placeholder="Nhập các quan sát khác về sức khỏe của trẻ..." 
                className="min-h-[120px] bg-slate-50 border-none resize-none"
                value={formData.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, note: e.target.value})}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white sticky top-6">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
                <span className="text-4xl font-black">{bmi}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Chỉ số BMI</h3>
                <p className="text-slate-400 text-sm mt-1">Dựa trên cân nặng và chiều cao</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    Number(bmi) < 18.5 ? 'bg-blue-400' : Number(bmi) < 25 ? 'bg-emerald-400' : 'bg-orange-400'
                  }`}
                  style={{ width: `${Math.min(Number(bmi) * 3, 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 italic">
                * Chỉ số này chỉ mang tính tham khảo cho trẻ mầm non.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
