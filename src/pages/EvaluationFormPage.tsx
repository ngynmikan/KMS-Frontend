import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { 
  evaluationService, 
  studentService 
} from '@/services';
import { 
  ApiEvaluation, 
  ApiEvaluationCriteria, 
  ApiStudent,
  CreateEvaluationRequest,
  UpdateEvaluationRequest
} from '@/types';
import { extractData } from '@/lib/api-utils';

export function EvaluationFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const studentId = Number(searchParams.get('studentId'));
  const classId = Number(searchParams.get('classId'));
  const periodType = searchParams.get('periodType') || 'monthly';
  const periodStart = searchParams.get('periodStart') || new Date().toISOString().split('T')[0];

  const [student, setStudent] = useState<ApiStudent | null>(null);
  const [criteria, setCriteria] = useState<ApiEvaluationCriteria[]>([]);
  const [evaluation, setEvaluation] = useState<ApiEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    isGoodStudent: true,
    generalComment: '',
    details: {} as Record<number, { score?: number; ratingLabel?: string; comment?: string }>
  });

  useEffect(() => {
    fetchData();
  }, [id, studentId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [criteriaData, studentData] = await Promise.all([
        evaluationService.getAllCriteria(),
        studentService.getStudentById(studentId)
      ]);

      setCriteria(criteriaData);
      setStudent(extractData<ApiStudent>(studentData));

      if (isEditMode) {
        const evalData = await evaluationService.getById(studentId, id!);
        if (evalData) {
          setEvaluation(evalData);
          const detailsMap: Record<number, any> = {};
          evalData.categoryGroups.forEach(group => {
            group.details.forEach(detail => {
              detailsMap[detail.criteriaId] = {
                score: detail.score,
                ratingLabel: detail.ratingLabel,
                comment: detail.comment
              };
            });
          });
          
          setFormData({
            isGoodStudent: evalData.isGoodStudent ?? true,
            generalComment: evalData.generalComment || '',
            details: detailsMap
          });
        }
      } else {
        // Initialize details with default values
        const detailsMap: Record<number, any> = {};
        criteriaData.forEach(c => {
          detailsMap[c.criteriaId] = {
            score: 10,
            ratingLabel: 'Tốt',
            comment: ''
          };
        });
        setFormData(prev => ({ ...prev, details: detailsMap }));
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (criteriaId: number, score: number) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [criteriaId]: { ...prev.details[criteriaId], score }
      }
    }));
  };

  const handleLabelChange = (criteriaId: number, ratingLabel: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [criteriaId]: { ...prev.details[criteriaId], ratingLabel }
      }
    }));
  };

  const handleCommentChange = (criteriaId: number, comment: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [criteriaId]: { ...prev.details[criteriaId], comment }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const detailsArray = Object.entries(formData.details).map(([id, data]) => ({
        criteriaId: Number(id),
        ...data
      }));

      if (isEditMode) {
        const request: UpdateEvaluationRequest = {
          isGoodStudent: formData.isGoodStudent,
          generalComment: formData.generalComment,
          details: detailsArray
        };
        await evaluationService.update(studentId, id!, request);
        toast.success('Cập nhật phiếu đánh giá thành công');
      } else {
        const request: CreateEvaluationRequest = {
          classId,
          periodType,
          periodStart,
          periodEnd: periodStart, 
          isGoodStudent: formData.isGoodStudent,
          generalComment: formData.generalComment,
          details: detailsArray
        };
        await evaluationService.create(studentId, request);
        toast.success('Tạo phiếu đánh giá thành công');
      }
      navigate(-1);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-slate-500 font-medium">Đang chuẩn bị biểu mẫu...</p>
      </div>
    );
  }

  const categories = Array.from(new Set(criteria.map(c => c.category)));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 shadow-lg shadow-orange-200"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isEditMode ? 'Cập nhật' : 'Lưu phiếu'}
        </Button>
      </div>

      <header className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {isEditMode ? 'Chỉnh sửa phiếu đánh giá' : 'Tạo phiếu đánh giá mới'}
        </h1>
        
        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardContent className="p-4 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
              {student?.photo ? (
                <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-200 flex items-center justify-center text-orange-600 text-2xl font-bold">
                  {student?.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{student?.fullName}</h2>
                <Badge variant="secondary" className="bg-white/80">{student?.studentCode}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {periodType === 'weekly' ? 'Tuần' : periodType === 'monthly' ? 'Tháng' : 'Học kỳ'} {periodStart}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> GV: {evaluation?.evaluatedByName || '---'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {categories.map(category => (
            <Card key={category} className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-slate-50/80">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="w-2 h-6 bg-orange-500 rounded-full" />
                  {criteria.find(c => c.category === category)?.categoryLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {criteria.filter(c => c.category === category).map(c => (
                    <div key={c.criteriaId} className="p-6 space-y-4 hover:bg-slate-50/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <Label className="text-base font-semibold text-slate-800">{c.name}</Label>
                          {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          {c.ratingType === 'scale' ? (
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                <button
                                  key={val}
                                  onClick={() => handleScoreChange(c.criteriaId, val)}
                                  className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
                                    formData.details[c.criteriaId]?.score === val
                                      ? 'bg-orange-500 text-white shadow-sm scale-110'
                                      : 'text-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <Select 
                              value={formData.details[c.criteriaId]?.ratingLabel || ''} 
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLabelChange(c.criteriaId, e.target.value)}
                              className="w-40"
                            >
                              <option value="Tốt">Tốt</option>
                              <option value="Khá">Khá</option>
                              <option value="Đạt">Đạt</option>
                              <option value="Cần cố gắng">Cần cố gắng</option>
                            </Select>
                          )}
                        </div>
                      </div>
                      <Input 
                        placeholder="Thêm nhận xét riêng cho tiêu chí này (tùy chọn)..." 
                        value={formData.details[c.criteriaId]?.comment || ''}
                        onChange={(e) => handleCommentChange(c.criteriaId, e.target.value)}
                        className="bg-slate-50 border-none text-sm placeholder:text-slate-400"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-white sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Tổng kết đánh giá</CardTitle>
              <CardDescription>Kết luận chung cho giai đoạn này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Danh hiệu Bé ngoan</Label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setFormData({ ...formData, isGoodStudent: true })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.isGoodStudent 
                        ? 'bg-white text-orange-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${formData.isGoodStudent ? 'text-orange-500' : 'text-slate-300'}`} />
                    Đạt
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, isGoodStudent: false })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      !formData.isGoodStudent 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Không đạt
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Nhận xét chung</Label>
                <Textarea 
                  placeholder="Viết nhận xét tổng quát về quá trình học tập và rèn luyện của bé..." 
                  className="min-h-[150px] bg-slate-50 border-none resize-none"
                  value={formData.generalComment}
                  onChange={(e) => setFormData({ ...formData, generalComment: e.target.value })}
                />
              </div>

              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-700 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <p>Phiếu đánh giá này sẽ được gửi đến phụ huynh sau khi bạn nhấn Lưu.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
