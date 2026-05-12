import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Power, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { studentService, classService } from '@/services';
import { Student as UIStudent, ApiClass, ApiStudent } from '@/types';
import { extractArray } from '@/lib/api-utils';

export function StudentsPage() {
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UIStudent | null>(null);

  const [formData, setFormData] = useState<Partial<UIStudent>>({
    name: '',
    code: '',
    dob: '',
    gender: 'Other',
    currentClass: '',
    parentName: '',
    address: '',
    status: 'active',
    bloodType: '',
    allergies: '',
    medicalNotes: '',
    photo: '',
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [studentsResp, classesResp] = await Promise.all([
        studentService.getAllStudents(),
        classService.getAllClasses()
      ]);

      const studentsData = extractArray<ApiStudent>(studentsResp);
      const classesData = extractArray<ApiClass>(classesResp);

      const mappedStudents: UIStudent[] = (studentsData || []).map(s => {
        const primaryParent = s.parents?.[0];
        return {
          id: s.studentId.toString(),
          code: s.studentCode || '',
          name: s.fullName,
          dob: s.dateOfBirth,
          gender: s.gender || 'Other',
          currentClass: s.className || 'Chưa xếp lớp',
          parentName: primaryParent?.fullName || 'Chưa cập nhật',
          address: s.address,
          status: s.isActive ? 'active' : 'inactive',
          allergies: s.allergies || '',
          bloodType: s.bloodType || '',
          medicalNotes: s.medicalNotes || '',
          photo: s.photo || '',
        };
      });
      setStudents(mappedStudents);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.currentClass === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleEdit = (student: UIStudent) => {
    setEditingStudent(student);
    setFormData(student);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      code: '',
      dob: '',
      gender: 'Other',
      currentClass: '',
      parentName: '',
      address: '',
      status: 'active',
      bloodType: '',
      allergies: '',
      medicalNotes: '',
      photo: '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.dob || !formData.currentClass) {
        toast.warning('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
        return;
      }
      
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, {
          fullName: formData.name,
          dateOfBirth: formData.dob,
          address: formData.address,
          gender: formData.gender,
          isActive: formData.status === 'active',
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          medicalNotes: formData.medicalNotes,
          photo: formData.photo,
        });
      } else {
        await studentService.createStudent({
          fullName: formData.name || '',
          dateOfBirth: formData.dob || '',
          address: formData.address || '',
          gender: formData.gender || 'Other', 
          isActive: true,
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          medicalNotes: formData.medicalNotes,
          photo: formData.photo,
        });
      }
      toast.success(editingStudent ? 'Cập nhật thông tin học sinh thành công!' : 'Thêm học sinh mới thành công!');
      await fetchInitialData();
      setIsDialogOpen(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.title || 'Có lỗi xảy ra khi lưu thông tin học sinh.';
      toast.error(errorMsg);
      console.error('Failed to save student:', error);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      if (student) {
        const newStatus = student.status !== 'active';
        await studentService.updateStudent(id, {
          isActive: newStatus
        });
        toast.success(`Học sinh đã được ${newStatus ? 'kích hoạt' : 'tạm dừng'}`);
        await fetchInitialData();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái.');
      console.error('Failed to toggle status:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Học sinh</h1>
          <p className="text-muted-foreground mt-1">Danh sách và thông tin học sinh</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm học sinh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên học sinh hoặc phụ huynh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="all">Tất cả lớp</option>
              {classes.map(c => (
                <option key={c.classId} value={c.className}>{c.className}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học sinh ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HS</TableHead>
                <TableHead>Tên học sinh</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>Phụ huynh</TableHead>
                <TableHead>Dị ứng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Không có học sinh nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-primary">{student.code}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{new Date(student.dob).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{student.currentClass}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>
                      {student.allergies ? (
                        <Badge variant="warning" className="text-xs">
                          {student.allergies}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Không</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                        {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(student)} aria-label="Edit student">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={student.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleStatus(student.id)}
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

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]" onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Tên học sinh <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dob">Ngày sinh <span className="text-red-500">*</span></Label>
              <Input
                id="dob"
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gender">Giới tính <span className="text-red-500">*</span></Label>
              <Select
                id="gender"
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1"
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="class">Lớp <span className="text-red-500">*</span></Label>
              <Select
                id="class"
                required
                value={formData.currentClass}
                onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                className="mt-1"
              >
                <option value="">Chọn lớp</option>
                {classes.map(c => (
                  <option key={c.classId} value={c.className}>{c.className}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bloodType">Nhóm máu</Label>
              <Input
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                placeholder="VD: O, A, B, AB"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="allergies">Dị ứng</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Các loại thực phẩm, thuốc..."
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="medicalNotes">Ghi chú y tế</Label>
              <Input
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="Thông tin tình trạng sức khỏe đặc biệt"
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="parentName">Tên phụ huynh</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="photo">Link ảnh</Label>
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="URL hình ảnh"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
