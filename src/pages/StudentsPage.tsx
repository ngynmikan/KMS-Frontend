import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Power, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { studentService } from '@/services';
import { Student as UIStudent } from '@/types';

export function StudentsPage() {
  const [students, setStudents] = useState<UIStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UIStudent | null>(null);

  const [formData, setFormData] = useState<Partial<UIStudent>>({
    name: '',
    dob: '',
    class: '',
    parentName: '',
    address: '',
    phone: '',
    status: 'active',
  });

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getAllStudents();
      const mappedStudents: UIStudent[] = (data || []).map(s => ({
        id: s.studentId.toString(),
        name: s.fullName,
        dob: s.dateOfBirth,
        class: 'Mầm Chồi Lá', // Placeholder if class not in API
        parentName: 'Chưa cập nhật', // Placeholder for link
        address: s.address,
        phone: 'Chưa cập nhật',
        status: s.isActive ? 'active' : 'inactive',
      }));
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class === filterClass;
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
      dob: '',
      class: '',
      parentName: '',
      address: '',
      phone: '',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, {
          fullName: formData.name,
          dateOfBirth: formData.dob,
          address: formData.address,
          isActive: formData.status === 'active',
        });
      } else {
        await studentService.createStudent({
          fullName: formData.name,
          dateOfBirth: formData.dob,
          address: formData.address,
        });
      }
      await fetchStudents();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      if (student) {
        await studentService.updateStudent(id, {
          isActive: student.status !== 'active'
        });
        await fetchStudents();
      }
    } catch (error) {
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
              <option value="Mầm Chồi Lá">Mầm Chồi Lá</option>
              <option value="Mầm Hoa Đào">Mầm Hoa Đào</option>
              <option value="Mầm Hoa Hồng">Mầm Hoa Hồng</option>
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
                <TableHead>Tên học sinh</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>Phụ huynh</TableHead>
                <TableHead>Số điện thoại</TableHead>
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
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{new Date(student.dob).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      {student.allergies && student.allergies.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {student.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="warning" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
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
                        <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
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
              <Label htmlFor="name">Tên học sinh</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="class">Lớp</Label>
              <Select
                id="class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="mt-1"
              >
                <option value="">Chọn lớp</option>
                <option value="Mầm Chồi Lá">Mầm Chồi Lá</option>
                <option value="Mầm Hoa Đào">Mầm Hoa Đào</option>
                <option value="Mầm Hoa Hồng">Mầm Hoa Hồng</option>
              </Select>
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
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
