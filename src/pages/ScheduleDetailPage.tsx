import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  BookOpen,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timetableService, teacherService, classService } from '@/services';
import { ApiTimetable, ApiTeacher, ApiClass } from '@/types';
import { extractData } from '@/lib/api-utils';
import { Badge } from '@/components/ui/badge';

export function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<ApiTimetable | null>(null);
  const [teacher, setTeacher] = useState<ApiTeacher | null>(null);
  const [classInfo, setClassInfo] = useState<ApiClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Note: Backend might not have getById for timetable yet, checking service
      // If not, we might need to fetch by class and find it, but let's assume it exists or use what we have.
      const resp = await timetableService.getById(id!);
      const data = extractData<ApiTimetable>(resp);
      setEntry(data);

      if (data) {
        const [teacherResp, classResp] = await Promise.all([
          data.teacherId ? teacherService.getTeacherById(data.teacherId) : Promise.resolve(null),
          classService.getClassById(data.classId)
        ]);

        if (teacherResp) setTeacher(extractData<ApiTeacher>(teacherResp));
        if (classResp) setClassInfo(extractData<ApiClass>(classResp));
      }
    } catch (error) {
      console.error('Failed to fetch detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải chi tiết bài học...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6 text-center">
        <p>Không tìm thấy thông tin tiết học.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  // Split subject and content if stored as "Subject - Content"
  const [subjectTitle, ...contentParts] = entry.subject.split(' - ');
  const lessonContent = contentParts.join(' - ') || 'Chưa có nội dung chi tiết cho tiết học này.';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-orange-50 rounded-full text-orange-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>
      </div>

      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-100 rounded-2xl">
            <BookOpen className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{subjectTitle}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {classInfo?.className || 'Lớp học'}
              </Badge>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {entry.startTime} - {entry.endTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Nội dung bài học
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <p className="text-lg leading-relaxed text-slate-700 font-medium">
                  {lessonContent}
                </p>
                {/* Additional placeholders for a rich detail page */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Mục tiêu bài học</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    <li>Giúp trẻ làm quen với các khái niệm cơ bản về chủ đề.</li>
                    <li>Phát triển kỹ năng vận động và tư duy sáng tạo qua các hoạt động.</li>
                    <li>Rèn luyện tính kiên nhẫn và tinh thần làm việc nhóm.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-white overflow-hidden sticky top-6">
            <CardHeader className="bg-orange-500 text-white">
              <CardTitle className="text-base font-bold">Thông tin giảng dạy</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-orange-200">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Giáo viên</p>
                  <p className="font-bold text-slate-900">{teacher?.fullName || 'Chưa phân công'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-emerald-200">
                  <MapPin className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Phòng học</p>
                  <p className="font-bold text-slate-900">{entry.room || 'N/A'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>Ngày: Thứ {entry.dayOfWeek === 0 ? 'Chủ nhật' : entry.dayOfWeek + 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
