import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Loader2, 
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  classService, 
  evaluationService 
} from '@/services';
import { 
  ApiClass, 
  ClassEvaluationSummary
} from '@/types';
import { extractArray } from '@/lib/api-utils';
import { useNavigate } from 'react-router-dom';

export function EvaluationListPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [periodType, setPeriodType] = useState<string>('monthly');
  const [periodStart, setPeriodStart] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 7) + '-01');
  const [summary, setSummary] = useState<ClassEvaluationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSummary();
    }
  }, [selectedClass, periodType, periodStart]);

  const fetchClasses = async () => {
    try {
      const resp = await classService.getAllClasses();
      const data = extractArray<ApiClass>(resp);
      setClasses(data);
    } catch (error) {
      toast.error('Không thể tải danh sách lớp học');
    }
  };

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      if (selectedClass === 'all') {
        if (classes.length === 0) {
          // If classes are not loaded yet, we can't fetch summaries
          // This might happen on first load if fetchSummary is called before fetchClasses finishes
          // But useEffect dependency on classes would handle it if we added it
          const resp = await classService.getAllClasses();
          const data = extractArray<ApiClass>(resp);
          if (data.length === 0) {
             setSummary(null);
             return;
          }
          const results = await Promise.all(
            data.map(c => evaluationService.getClassSummary(c.classId, periodType, periodStart))
          );
          
          const combined: ClassEvaluationSummary = {
            classId: 0,
            className: 'Tất cả các lớp',
            periodType,
            periodStart,
            periodEnd: periodStart,
            totalStudents: results.reduce((acc, r) => acc + (r?.totalStudents || 0), 0),
            evaluatedCount: results.reduce((acc, r) => acc + (r?.evaluatedCount || 0), 0),
            notEvaluatedCount: results.reduce((acc, r) => acc + (r?.notEvaluatedCount || 0), 0),
            goodStudentCount: results.reduce((acc, r) => acc + (r?.goodStudentCount || 0), 0),
            students: results.flatMap((r, idx) => 
              (r?.students || []).map(s => ({ ...s, classId: data[idx].classId, className: data[idx].className }))
            )
          };
          setSummary(combined);
        } else {
          const results = await Promise.all(
            classes.map(c => evaluationService.getClassSummary(c.classId, periodType, periodStart))
          );
          
          const combined: ClassEvaluationSummary = {
            classId: 0,
            className: 'Tất cả các lớp',
            periodType,
            periodStart,
            periodEnd: periodStart,
            totalStudents: results.reduce((acc, r) => acc + (r?.totalStudents || 0), 0),
            evaluatedCount: results.reduce((acc, r) => acc + (r?.evaluatedCount || 0), 0),
            notEvaluatedCount: results.reduce((acc, r) => acc + (r?.notEvaluatedCount || 0), 0),
            goodStudentCount: results.reduce((acc, r) => acc + (r?.goodStudentCount || 0), 0),
            students: results.flatMap((r, idx) => 
              (r?.students || []).map(s => ({ ...s, classId: classes[idx].classId, className: classes[idx].className }))
            )
          };
          setSummary(combined);
        }
      } else {
        const data = await evaluationService.getClassSummary(selectedClass, periodType, periodStart);
        setSummary(data);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu đánh giá');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = summary?.students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateEvaluation = (studentId: number, classIdOverride?: number) => {
    const finalClassId = classIdOverride || selectedClass;
    navigate(`/evaluations/new?studentId=${studentId}&classId=${finalClassId}&periodType=${periodType}&periodStart=${periodStart}`);
  };

  const handleEditEvaluation = (studentId: number, evaluationId: number) => {
    navigate(`/evaluations/${evaluationId}/edit?studentId=${studentId}`);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đánh giá học sinh</h1>
          <p className="text-slate-500 mt-1">Quản lý phiếu đánh giá và danh hiệu Bé ngoan</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lớp học</label>
              <Select 
                value={selectedClass.toString()} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value;
                  setSelectedClass(val === 'all' ? 'all' : Number(val));
                }}
                className="w-full"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map(c => (
                  <option key={c.classId} value={c.classId}>{c.className}</option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loại đánh giá</label>
              <Select 
                value={periodType} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPeriodType(e.target.value)}
                className="w-full"
              >
                <option value="weekly">Tuần</option>
                <option value="monthly">Tháng</option>
                <option value="semester">Học kỳ</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian</label>
              <Input 
                type="date" 
                value={periodStart} 
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Tên học sinh..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500 text-white">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tổng số trẻ</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.totalStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Đã đánh giá</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{summary.evaluatedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Chưa đánh giá</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{summary.notEvaluatedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-rose-500 text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Bé ngoan</p>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{summary.goodStudentCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden border-none shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Học sinh</TableHead>
              {selectedClass === 'all' && <TableHead>Lớp</TableHead>}
              <TableHead>Trạng thái</TableHead>
              <TableHead>Điểm TB</TableHead>
              <TableHead>Bé ngoan</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={selectedClass === 'all' ? 7 : 6} className="h-40 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="mt-2 text-slate-500">Đang tải danh sách...</p>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectedClass === 'all' ? 7 : 6} className="h-40 text-center text-slate-500">
                  Không tìm thấy học sinh nào
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.studentId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                      {student.photo ? (
                        <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                          {student.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div>
                    <div className="text-xs text-slate-500">ID: {student.studentId}</div>
                  </TableCell>
                  {selectedClass === 'all' && (
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {(student as any).className || '---'}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    {student.isEvaluated ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        Đã đánh giá
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-200">
                        Chưa đánh giá
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.averageScore !== null ? (
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {student.averageScore?.toFixed(1)}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {student.isEvaluated ? (
                      student.isGoodStudent ? (
                        <div className="flex items-center gap-1 text-rose-500 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đạt</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <XCircle className="w-4 h-4" />
                          <span>Không đạt</span>
                        </div>
                      )
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {student.isEvaluated ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          const s = student as any;
                          handleEditEvaluation(s.studentId || s.StudentId, s.evaluationId || s.EvaluationId);
                        }}
                      >
                        Sửa phiếu
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleCreateEvaluation(student.studentId, (student as any).classId)}
                      >
                        Tạo phiếu
                        <Plus className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
