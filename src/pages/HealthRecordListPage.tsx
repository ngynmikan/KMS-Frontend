import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Loader2, 
  Heart, 
  ChevronRight,
  TrendingUp,
  Scale,
  Ruler,
  Calendar
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
import { healthCheckService, studentService } from '@/services';
import { ApiStudent } from '@/types';
import { extractArray } from '@/lib/api-utils';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function HealthRecordListPage() {
  const navigate = useNavigate();
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [checksResp, studentsResp] = await Promise.all([
        healthCheckService.getAll(),
        studentService.getAllStudents()
      ]);
      
      setHealthChecks(extractArray<any>(checksResp));
      setStudents(extractArray<ApiStudent>(studentsResp));
    } catch (error) {
      toast.error('Không thể tải dữ liệu sức khỏe');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentName = (id: number) => {
    const student = students.find(s => s.studentId === id);
    return student ? student.fullName : `HS #${id}`;
  };

  const filteredChecks = healthChecks.filter(check => 
    getStudentName(check.StudentId || check.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (check.CheckedBy || check.checkedBy || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="w-8 h-8 text-orange-500" />
            Hồ sơ sức khỏe
          </h1>
          <p className="text-slate-500 mt-1">Theo dõi sự phát triển thể chất của trẻ</p>
        </div>
        <Button 
          onClick={() => navigate('/health-records/new')}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm hồ sơ mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium uppercase tracking-wider">Tổng số bản ghi</p>
              <p className="text-3xl font-extrabold mt-1">{healthChecks.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Cân nặng trung bình</p>
              <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
                {(healthChecks.reduce((acc, c) => acc + (c.Weight || c.weight || 0), 0) / (healthChecks.length || 1)).toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <Scale className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Chiều cao trung bình</p>
              <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
                {(healthChecks.reduce((acc, c) => acc + (c.Height || c.height || 0), 0) / (healthChecks.length || 1)).toFixed(1)} cm
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Ruler className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm theo tên học sinh, mã số, hoặc người kiểm tra..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead>Học sinh</TableHead>
              <TableHead>Ngày kiểm tra</TableHead>
              <TableHead>Chỉ số (H/W)</TableHead>
              <TableHead>BMI</TableHead>
              <TableHead>Sức khỏe chung</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                  <p className="mt-2 text-slate-500">Đang tải hồ sơ...</p>
                </TableCell>
              </TableRow>
            ) : filteredChecks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                  Không tìm thấy hồ sơ nào
                </TableCell>
              </TableRow>
            ) : (
              filteredChecks.map((check) => {
                const sId = check.studentId || check.StudentId || check.studentID;
                const hId = check.healthCheckId || check.HealthCheckId || check.checkId || check.id || check.HealthCheckID;
                const height = check.Height || check.height;
                const weight = check.Weight || check.weight;
                const bmi = check.Bmi || check.bmi || (weight / ((height/100) * (height/100)));
                const date = check.CheckDate || check.checkDate;

                return (
                  <TableRow key={hId} className="group hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">{getStudentName(sId)}</div>
                      <div className="text-xs text-slate-500">ID: {sId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        {new Date(date).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{height} cm</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{weight} kg</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {bmi.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        (check.GeneralHealth || check.generalHealth) === 'Tốt' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }>
                        {check.GeneralHealth || check.generalHealth || '---'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => navigate(`/health-records/${hId}/edit`)}
                      >
                        Chi tiết
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
