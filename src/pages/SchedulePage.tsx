import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  timetableService, 
  classService, 
  teacherService,
  semesterService 
} from '@/services';
import { 
  ApiTimetable, 
  ApiClass, 
  ApiTeacher, 
  ApiSemester,
  CreateTimetableRequest
} from '@/types';
import { extractArray } from '@/lib/api-utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Calendar, 
  User, 
  MapPin, 
  Trash2, 
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const daysOfWeek = [
  { id: 1, name: 'Thứ 2' },
  { id: 2, name: 'Thứ 3' },
  { id: 3, name: 'Thứ 4' },
  { id: 4, name: 'Thứ 5' },
  { id: 5, name: 'Thứ 6' },
  { id: 6, name: 'Thứ 7' },
  { id: 0, name: 'Chủ nhật' },
];

const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function SchedulePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [semesters, setSemesters] = useState<ApiSemester[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [timetable, setTimetable] = useState<ApiTimetable[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<ApiTimetable> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateTimetableRequest>>({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    subject: '',
    room: '',
    teacherId: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      const [classResp, teacherResp, semesterResp] = await Promise.all([
        classService.getAllClasses(),
        teacherService.getAllTeachers(),
        semesterService.getAllSemesters()
      ]);

      const classData = extractArray<ApiClass>(classResp);
      
      if (classData.length > 0) {
        setClasses(classData);
        setSelectedClass(classData[0].classId);
      } else {
        toast.error('Không tìm thấy dữ liệu lớp học');
      }

      const teacherData = extractArray<ApiTeacher>(teacherResp);
      setTeachers(teacherData);

      const semesterData = extractArray<ApiSemester>(semesterResp);
      setSemesters(semesterData);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Không thể tải dữ liệu ban đầu');
    }
  };

  const fetchTimetable = async (classId: number) => {
    setLoading(true);
    try {
      const resp = await timetableService.getByClass(classId);
      setTimetable(extractArray<ApiTimetable>(resp));
    } catch (error) {
      toast.error('Không thể tải thời khóa biểu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entry?: ApiTimetable, day?: number, time?: string) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        subject: entry.subject,
        room: entry.room,
        teacherId: entry.teacherId
      });
    } else {
      setEditingEntry(null);
      setFormData({
        dayOfWeek: day ?? 1,
        startTime: time ?? '08:00',
        endTime: '09:00',
        subject: '',
        room: '',
        teacherId: teachers[0]?.teacherId || 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      toast.error('Vui lòng chọn lớp học');
      return;
    }

    const payload = {
      ...formData,
      classId: selectedClass,
    } as CreateTimetableRequest;

    try {
      let resp;
      if (editingEntry?.id) {
        resp = await timetableService.update(editingEntry.id, { ...payload, id: editingEntry.id });
      } else {
        resp = await timetableService.create(payload);
      }

      if (resp.success) {
        toast.success(editingEntry ? 'Cập nhật thành công' : 'Thêm mới thành công');
        setIsModalOpen(false);
        fetchTimetable(selectedClass);
      } else {
        toast.error(resp.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      const resp = await timetableService.delete(confirmDeleteId);
      if (resp.success) {
        toast.success('Xóa thành công');
        if (selectedClass) fetchTimetable(selectedClass);
      }
    } catch (error) {
      toast.error('Lỗi khi xóa');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const getEntryForSlot = (dayId: number, time: string) => {
    return timetable.find(t => t.dayOfWeek === dayId && t.startTime.startsWith(time.substring(0, 5)));
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Lịch học tuần</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý thời khóa biểu cho các lớp mầm non</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100 dark:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm tiết học
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1.5 min-w-[250px]">
              <Label htmlFor="class-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chọn lớp học</Label>
              <Select 
                id="class-select"
                value={selectedClass?.toString() || ''} 
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ring-offset-orange-500 focus:ring-orange-500"
              >
                <option value="" disabled>-- Chọn lớp học --</option>
                {classes.map(c => (
                  <option key={c.classId} value={c.classId}>{c.className}</option>
                ))}
              </Select>
            </div>
            
            <div className="flex gap-4 ml-auto">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                <Calendar className="w-4 h-4" />
                <span>
                  {semesters.find(s => s.isActive)?.name || semesters[0]?.name || 'Học kỳ 1'} 
                  ({semesters.find(s => s.isActive)?.academicYear || semesters[0]?.academicYear || '2023-2024'})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="w-24 p-4 text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  Giờ
                </th>
                {daysOfWeek.map((day) => (
                  <th key={day.id} className="p-4 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "text-xs font-medium px-3 py-1 rounded-full",
                        day.id === 0 ? "bg-rose-100 text-rose-600" : "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      )}>
                        {day.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-center border-b border-slate-100 dark:border-slate-800/50">
                    <span className="text-sm font-semibold text-slate-400 tabular-nums">{time}</span>
                  </td>
                  {daysOfWeek.map((day) => {
                    const entry = getEntryForSlot(day.id, time);
                    const teacher = teachers.find(t => t.teacherId === entry?.teacherId);
                    
                    return (
                      <td 
                        key={`${day.id}-${time}`} 
                        className="p-2 border-b border-l border-slate-100 dark:border-slate-800/50 min-h-[100px] relative"
                      >
                        {entry ? (
                          <div 
                            className={cn(
                              "group/item relative p-3 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer",
                              "bg-white dark:bg-slate-800 border-orange-500"
                            )}
                            onClick={() => handleOpenModal(entry)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 
                                className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 hover:text-orange-500 transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/schedule/${entry.id}`); }}
                              >
                                {entry.subject}
                              </h4>
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                  className="p-1 hover:bg-rose-50 rounded text-rose-500"
                                  aria-label="Xóa tiết học"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <User className="w-3 h-3 text-orange-500" />
                                <span className="line-clamp-1">{teacher?.fullName || 'Chưa phân công'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                <MapPin className="w-3 h-3 text-emerald-500" />
                                <span>Phòng: {entry.room || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 dark:bg-slate-700 text-orange-600 dark:text-orange-300 font-bold tabular-nums">
                                {entry.startTime} - {entry.endTime}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="h-full min-h-[80px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group/cell"
                            onClick={() => handleOpenModal(undefined, day.id, time)}
                          >
                            <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 group-hover/cell:scale-110 transition-transform">
                              <Plus className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-500" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingEntry ? 'Sửa tiết học' : 'Thêm tiết học mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day-select" className="text-sm font-semibold">Thứ</Label>
                <Select 
                  id="day-select"
                  value={formData.dayOfWeek?.toString()} 
                  onChange={(e) => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.id} value={day.id}>{day.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-input" className="text-sm font-semibold">Phòng học</Label>
                <Input 
                  id="room-input"
                  placeholder="VD: 101, A2..." 
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-orange-500 placeholder:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-input" className="text-sm font-semibold">Môn học / Hoạt động</Label>
              <Input 
                id="subject-input"
                placeholder="VD: Học vẽ, Âm nhạc, Tiếng Anh..." 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-orange-500 text-lg font-medium placeholder:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-sm font-semibold">Giờ bắt đầu</Label>
                <Input 
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-sm font-semibold">Giờ kết thúc</Label>
                <Input 
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher-select" className="text-sm font-semibold">Giáo viên giảng dạy</Label>
              <Select 
                id="teacher-select"
                value={formData.teacherId?.toString()} 
                onChange={(e) => setFormData({...formData, teacherId: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none"
              >
                <option value="0">-- Chọn giáo viên --</option>
                {teachers.map(t => (
                  <option key={t.teacherId} value={t.teacherId}>{t.fullName}</option>
                ))}
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-slate-200">
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-8"
              disabled={!formData.subject || !formData.teacherId}
            >
              {editingEntry ? 'Cập nhật' : 'Lưu lại'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Xóa tiết học"
        description="Bạn có chắc chắn muốn xóa tiết học này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
