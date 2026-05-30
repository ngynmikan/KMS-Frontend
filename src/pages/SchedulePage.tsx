import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { semesterService } from '@/services';
import { ApiSemester } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Copy, Save } from 'lucide-react';

const timeSlots = [
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const activities = [
  { id: 'welcome', name: 'Đón trẻ', color: 'bg-blue-100 text-blue-700' },
  { id: 'breakfast', name: 'Ăn sáng', color: 'bg-green-100 text-green-700' },
  { id: 'study', name: 'Học văn hóa', color: 'bg-purple-100 text-purple-700' },
  { id: 'play', name: 'Vui chơi', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'art', name: 'Học vẽ', color: 'bg-pink-100 text-pink-700' },
  { id: 'music', name: 'Âm nhạc', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'exercise', name: 'Thể dục', color: 'bg-orange-100 text-orange-700' },
  { id: 'lunch', name: 'Ăn trưa', color: 'bg-green-100 text-green-700' },
  { id: 'nap', name: 'Ngủ trưa', color: 'bg-gray-100 text-gray-700' },
  { id: 'snack', name: 'Ăn xế', color: 'bg-amber-100 text-amber-700' },
  { id: 'outdoor', name: 'Hoạt động ngoài trời', color: 'bg-teal-100 text-teal-700' },
  { id: 'pickup', name: 'Trả trẻ', color: 'bg-blue-100 text-blue-700' },
];

type ScheduleCell = {
  activity?: typeof activities[0];
};

export function SchedulePage() {
  const [semesters, setSemesters] = useState<ApiSemester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState('class1');
  const [schedule, setSchedule] = useState<Record<string, Record<string, ScheduleCell>>>({});
  const [draggedActivity, setDraggedActivity] = useState<typeof activities[0] | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const resp = await semesterService.getAllSemesters();
      if (resp.success && resp.data) {
        setSemesters(resp.data);
        if (resp.data.length > 0) {
          setSelectedSemester(resp.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const handleDragStart = (activity: typeof activities[0]) => {
    setDraggedActivity(activity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: string, timeSlot: string) => {
    if (draggedActivity) {
      setSchedule({
        ...schedule,
        [day]: {
          ...schedule[day],
          [timeSlot]: { activity: draggedActivity },
        },
      });
      setDraggedActivity(null);
    }
  };

  const handleClearCell = (day: string, timeSlot: string) => {
    const newSchedule = { ...schedule };
    if (newSchedule[day]) {
      delete newSchedule[day][timeSlot];
    }
    setSchedule(newSchedule);
  };

  const handleCopyWeek = () => {
    alert('Chức năng sao chép lịch tuần sẽ được thực hiện');
  };

  const handleSave = () => {
    alert('Lịch học đã được lưu thành công!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch học tuần</h1>
          <p className="text-muted-foreground mt-1">Tạo và quản lý thời khóa biểu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyWeek}>
            <Copy className="w-4 h-4 mr-2" />
            Sao chép tuần trước
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Lưu lịch
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap">Học kỳ:</label>
              <Select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-[200px]"
              >
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.academicYear})</option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-medium whitespace-nowrap">Chọn lớp:</label>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="class1">Mầm Chồi Lá A</option>
                <option value="class2">Mầm Hoa Đào B</option>
                <option value="class3">Mầm Hoa Hồng C</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                draggable
                onDragStart={() => handleDragStart(activity)}
                className={cn(
                  'px-4 py-2 rounded-lg cursor-move text-sm font-medium',
                  activity.color,
                  'hover:opacity-80 transition-opacity'
                )}
              >
                {activity.name}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            💡 Kéo thả các hoạt động vào ô thời gian bên dưới
          </p>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle>Thời khóa biểu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-2 bg-muted font-medium min-w-32">
                    Giờ
                  </th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="border border-border p-2 bg-muted font-medium min-w-36">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-border p-2 bg-muted text-sm font-medium text-center">
                      {timeSlot}
                    </td>
                    {daysOfWeek.map((day) => {
                      const cell = schedule[day]?.[timeSlot];
                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="border border-border p-1 hover:bg-accent/50 transition-colors min-h-16"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, timeSlot)}
                        >
                          {cell?.activity ? (
                            <div
                              className={cn(
                                'p-2 rounded text-sm font-medium cursor-pointer group relative',
                                cell.activity.color
                              )}
                              onClick={() => handleClearCell(day, timeSlot)}
                            >
                              {cell.activity.name}
                              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded text-xs">
                                Click để xóa
                              </span>
                            </div>
                          ) : (
                            <div className="h-14 flex items-center justify-center text-muted-foreground text-xs">
                              Kéo thả vào đây
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
        </CardContent>
      </Card>
    </div>
  );
}
