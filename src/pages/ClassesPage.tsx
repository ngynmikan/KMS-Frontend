import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Power, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { classService, userService, studentService, classStudentService, teacherService, classTeacherService } from '@/services';
import { Class as UIClass, Student as UIStudent, ApiTeacher, ApiClass, ApiStudent, ClassTeacher } from '@/types';
import { extractArray, extractData } from '@/lib/api-utils';

export function ClassesPage() {
  const [classes, setClasses] = useState<UIClass[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingClass, setEditingClass] = useState<UIClass | null>(null);
  
  const [availableStudents, setAvailableStudents] = useState<UIStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<UIStudent[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    room: '',
    ageGroup: '',
    maxCapacity: 20,
    year: 2, // Default schoolYearId as seen in screenshot
    teacher: '',
    teacherId: '',
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [classResp, , allStudentsResp, teacherResp] = await Promise.all([
        classService.getAllClasses(),
        userService.getActiveUsers(),
        studentService.getAllStudents(),
        teacherService.getAllTeachers(),
      ]);

      const classesFromServer = extractArray<ApiClass>(classResp);
      const teacherList = extractArray<ApiTeacher>(teacherResp);
      const mappedClasses: UIClass[] = await Promise.all(classesFromServer.map(async (c: ApiClass) => {
        const classTeachers = await classTeacherService.getTeachersByClass(c.classId);
        const main = classTeachers.find((t: ClassTeacher) => t.role === 'Main')?.teacher?.fullName || (teacherList || []).find((t: ApiTeacher) => t.teacherId === c.teacherId)?.fullName || 'Chưa gán';
        const supports = classTeachers.filter((t: ClassTeacher) => t.role === 'Support').map((t: ClassTeacher) => t.teacher?.fullName || 'N/A');

        return {
          id: c.classId.toString(),
          name: c.className,
          code: `CLASS-${c.classId}`,
          year: c.schoolYearId,
          room: c.room,
          ageGroup: c.ageGroup,
          maxCapacity: c.maxCapacity,
          teacher: main,
          teacherId: c.teacherId?.toString() || '',
          mainTeacher: main,
          supportTeachers: supports,
          studentCount: c.currentEnrollment,
          students: [],
          status: c.isActive ? 'active' : 'inactive',
        };
      }));

      setClasses(mappedClasses);
      setTeachers(teacherList);

      const allStudents = extractArray<ApiStudent>(allStudentsResp);
      const mappedStudents: UIStudent[] = allStudents.map((s) => ({
        id: s.studentId.toString(),
        code: s.studentCode || '',
        name: s.fullName,
        dob: s.dateOfBirth,
        gender: s.gender || 'Other',
        currentClass: '',
        parentName: '',
        address: s.address,
        status: 'active' as const
      }));
      setAvailableStudents(mappedStudents);

    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cls: UIClass) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      room: cls.room || '',
      ageGroup: cls.ageGroup || '',
      maxCapacity: cls.maxCapacity || 20,
      year: cls.year,
      teacher: cls.teacher,
      teacherId: cls.teacherId || '',
    });
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setIsCreateMode(true);
    setEditingClass(null);
    setFormData({
      name: '',
      room: '',
      ageGroup: '',
      maxCapacity: 20,
      year: 2,
      teacher: '',
      teacherId: '',
    });
    // Real student data is managed by fetchInitialData
    setSelectedStudents([]);
    setIsDialogOpen(true);
  };

  const handleMoveToClass = () => {
    const studentsToMove = availableStudents.filter(s => selectedAvailable.includes(s.id));
    setSelectedStudents([...selectedStudents, ...studentsToMove]);
    setAvailableStudents(availableStudents.filter(s => !selectedAvailable.includes(s.id)));
    setSelectedAvailable([]);
  };

  const handleMoveToAvailable = () => {
    const studentsToMove = selectedStudents.filter(s => selectedAssigned.includes(s.id));
    setAvailableStudents([...availableStudents, ...studentsToMove]);
    setSelectedStudents(selectedStudents.filter(s => !selectedAssigned.includes(s.id)));
    setSelectedAssigned([]);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.room || !formData.ageGroup || !formData.year || !formData.teacherId) {
        toast.warning('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
        return;
      }

      if (isCreateMode) {
        const classResponse = await classService.createClass({
          className: formData.name,
          room: formData.room,
          ageGroup: formData.ageGroup,
          maxCapacity: formData.maxCapacity,
          schoolYearId: formData.year,
          teacherId: formData.teacherId ? parseInt(formData.teacherId) : undefined,
        });

        if (selectedStudents.length > 0 && classResponse) {
          const classData = extractData<ApiClass>(classResponse);
          const classId = classData?.classId;
          if (classId) {
            await classStudentService.enrollMultipleStudents(classId, selectedStudents.map(s => parseInt(s.id)));
          }
        }
      } else if (editingClass) {
        await classService.updateClass(editingClass.id, {
          className: formData.name,
          room: formData.room,
          ageGroup: formData.ageGroup,
          maxCapacity: formData.maxCapacity,
          schoolYearId: formData.year,
          teacherId: formData.teacherId ? parseInt(formData.teacherId) : undefined,
        });
      }
      
      toast.success(isCreateMode ? 'Tạo lớp học thành công!' : 'Cập nhật lớp học thành công!');
      await fetchInitialData();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save class:', error);
      const errorMsg = error.response?.data?.title || 'Có lỗi xảy ra khi lưu thông tin lớp học.';
      toast.error(errorMsg);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const cls = classes.find(c => c.id === id);
      if (cls) {
        await classService.updateClass(id, {
          className: cls.name,
          room: cls.room,
          ageGroup: cls.ageGroup,
          maxCapacity: cls.maxCapacity,
        });
        toast.success(`Lớp học đã được ${cls.status !== 'active' ? 'kích hoạt' : 'tạm dừng'}`);
        await fetchInitialData();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái.');
      console.error('Failed to toggle status:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Lớp học</h1>
          <p className="text-muted-foreground mt-1">Danh sách và thông tin các lớp học</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo lớp mới
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên lớp hoặc mã lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lớp học ({filteredClasses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Nhóm tuổi</TableHead>
                <TableHead>Năm học</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Sĩ số</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy lớp học nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.room || 'Chưa gán'}</TableCell>
                    <TableCell>{cls.ageGroup || 'Chưa gán'}</TableCell>
                    <TableCell>{cls.year}</TableCell>
                    <TableCell>
                      <div className="font-medium">{cls.mainTeacher}</div>
                      {(cls.supportTeachers?.length || 0) > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5 italic">
                          P: {cls.supportTeachers?.join(', ')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cls.studentCount}/{cls.maxCapacity || 20}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.status === 'active' ? 'success' : 'secondary'}>
                        {cls.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(cls)} aria-label="Edit class">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={cls.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleStatus(cls.id)}
                          aria-label="Toggle status"
                        >
                          <Power className="w-4 h-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)} className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? 'Tạo lớp học mới' : 'Chỉnh sửa lớp học'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tên lớp <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  placeholder="VD: Mầm Chồi Lá A"
                />
              </div>

              <div>
                <Label htmlFor="room">Phòng học <span className="text-red-500">*</span></Label>
                <Input
                  id="room"
                  required
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="mt-1"
                  placeholder="VD: Phòng A1"
                />
              </div>

              <div>
                <Label htmlFor="ageGroup">Nhóm tuổi <span className="text-red-500">*</span></Label>
                <Input
                  id="ageGroup"
                  required
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="mt-1"
                  placeholder="VD: 3-4 tuổi"
                />
              </div>

              <div>
                <Label htmlFor="maxCapacity">Sĩ số tối đa <span className="text-red-500">*</span></Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  required
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="year">ID Năm học <span className="text-red-500">*</span></Label>
                <Input
                  id="year"
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="teacher">Giáo viên chủ nhiệm <span className="text-red-500">*</span></Label>
                <Select
                  id="teacher"
                  required
                  value={formData.teacherId}
                  onChange={(e) => {
                    const selectedTeacher = teachers.find(t => t.teacherId.toString() === e.target.value);
                    setFormData({ 
                      ...formData, 
                      teacherId: e.target.value,
                      teacher: selectedTeacher?.fullName || ''
                    });
                  }}
                  className="mt-1"
                >
                  <option value="">Chọn giáo viên</option>
                  {teachers.map((t) => (
                    <option key={t.teacherId} value={t.teacherId.toString()}>
                      {t.fullName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {isCreateMode && (
              <div>
                <Label>Chọn học sinh vào lớp</Label>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mt-2">
                  {/* Available Students */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Học sinh chờ ({availableStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-64 overflow-y-auto border-t">
                        {availableStudents.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => {
                              if (selectedAvailable.includes(student.id)) {
                                setSelectedAvailable(selectedAvailable.filter(id => id !== student.id));
                              } else {
                                setSelectedAvailable([...selectedAvailable, student.id]);
                              }
                            }}
                            className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                              selectedAvailable.includes(student.id) ? 'bg-accent' : ''
                            }`}
                          >
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(student.dob).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transfer Buttons */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleMoveToClass}
                      disabled={selectedAvailable.length === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleMoveToAvailable}
                      disabled={selectedAssigned.length === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Selected Students */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Học sinh trong lớp ({selectedStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-64 overflow-y-auto border-t">
                        {selectedStudents.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => {
                              if (selectedAssigned.includes(student.id)) {
                                setSelectedAssigned(selectedAssigned.filter(id => id !== student.id));
                              } else {
                                setSelectedAssigned([...selectedAssigned, student.id]);
                              }
                            }}
                            className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                              selectedAssigned.includes(student.id) ? 'bg-accent' : ''
                            }`}
                          >
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(student.dob).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {isCreateMode ? 'Tạo lớp' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
