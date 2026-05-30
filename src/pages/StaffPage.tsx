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
import { Staff, UserRole, Role } from '@/types';
import { userService, roleService } from '@/services';

// Đã chuyển sang dùng API userService

export function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'Giáo viên',
    dob: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
  });

  const fetchRoles = async () => {
    try {
      const rolesData = await roleService.getRoles();
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getActiveUsers();
      const mappedStaff: Staff[] = (data || []).map(user => ({
        id: user.userId.toString(),
        name: user.fullName || user.username,
        role: (user.roles?.[0]?.roleName as UserRole) || 'Giáo viên',
        dob: user.createdAt || new Date().toISOString(), // Fallback for dob
        address: 'Chưa cập nhật',
        phone: user.phone || '',
        email: user.email || '',
        status: user.isActive ? 'active' : 'inactive',
      }));
      setStaff(mappedStaff);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  const filteredStaff = staff.filter((s: Staff) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData(staff);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Giáo viên',
      dob: '',
      address: '',
      phone: '',
      email: '',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingStaff) {
      setStaff(staff.map((s: Staff) => s.id === editingStaff.id ? { ...s, ...formData } : s));
    } else {
      const newStaff: Staff = {
        ...formData,
        id: Date.now().toString(),
      } as Staff;
      setStaff([...staff, newStaff]);
    }
    setIsDialogOpen(false);
  };

  const toggleStatus = async (id: string) => {
    try {
      const staffMember = staff.find((s: Staff) => s.id === id);
      if (!staffMember) return;

      if (staffMember.status === 'active') {
        await userService.deactivateUser(id);
      } else {
        // Here you might want to call another API if there's one for reactivating
        // For now we just call toggle UI or handle it if API exists
      }
      await fetchStaff();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
      'Giáo viên': 'default',
      'Bảo mẫu': 'secondary',
      'Y tế': 'success',
      'Kế toán': 'warning',
    };
    return colors[role] || 'default';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Nhân sự</h1>
          <p className="text-muted-foreground mt-1">Danh sách và thông tin nhân viên</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">Tất cả chức vụ</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleName}>
                  {role.roleName}
                </option>
              ))}
              {/* Fallback roles if API returns empty */}
              {roles.length === 0 && (
                <>
                  <option value="Giáo viên">Giáo viên</option>
                  <option value="Bảo mẫu">Bảo mẫu</option>
                  <option value="Y tế">Y tế</option>
                  <option value="Kế toán">Kế toán</option>
                </>
              )}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên nhân viên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Địa chỉ</TableHead>
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
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy nhân viên nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staffMember: Staff) => (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-medium">{staffMember.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadge(staffMember.role)}>
                        {staffMember.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staffMember.dob ? new Date(staffMember.dob).toLocaleDateString('vi-VN') : 'N/A'}
                    </TableCell>
                    <TableCell>{staffMember.phone}</TableCell>
                    <TableCell>{staffMember.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{staffMember.address}</TableCell>
                    <TableCell>
                      <Badge variant={staffMember.status === 'active' ? 'success' : 'secondary'}>
                        {staffMember.status === 'active' ? 'Đang làm' : 'Nghỉ việc'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(staffMember)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={staffMember.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleStatus(staffMember.id)}
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
        <DialogContent className="sm:max-w-[700px]" onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Tên nhân viên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="role">Chức vụ</Label>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="mt-1"
              >
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleName}>
                    {role.roleName}
                  </option>
                ))}
                {roles.length === 0 && (
                  <>
                    <option value="Giáo viên">Giáo viên</option>
                    <option value="Bảo mẫu">Bảo mẫu</option>
                    <option value="Y tế">Y tế</option>
                    <option value="Kế toán">Kế toán</option>
                  </>
                )}
              </Select>
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
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              {editingStaff ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
