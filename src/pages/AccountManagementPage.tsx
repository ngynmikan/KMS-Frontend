import { useState, useEffect } from 'react';
import { Search, Power, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { userService } from '@/services';
import { ManagedUser } from '@/types';

interface AppUser extends ManagedUser {
  _displayStatus: 'pending' | 'active' | 'inactive';
}

export function AccountManagementPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Fetch from all 3 endpoints as requested
      const [pending, active, inactive] = await Promise.all([
        userService.getPendingUsers(),
        userService.getActiveUsers(),
        userService.getInactiveUsers(),
      ]);

      // Add a status property to each for UI tracking if needed
      const allUsers = [
        ...pending.map(u => ({ ...u, _displayStatus: 'pending' as const })),
        ...active.map(u => ({ ...u, _displayStatus: 'active' as const })),
        ...inactive.map(u => ({ ...u, _displayStatus: 'inactive' as const })),
      ];

      setUsers(allUsers as AppUser[]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: AppUser) => {
    try {
      if (user._displayStatus === 'pending') {
        // For pending users, we might want to approve them first
        await userService.approveUser(user.userId);
      } else if (user.isActive) {
        await userService.deactivateUser(user.userId);
      } else {
        await userService.activateUser(user.userId);
      }
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      u._displayStatus === filterStatus;
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tài khoản</h1>
          <p className="text-muted-foreground mt-1">Quản lý trạng thái hoạt động của người dùng hệ thống</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm user theo tên, username hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-[200px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Bị vô hiệu hóa</option>
                <option value="pending">Chờ phê duyệt</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">STT</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
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
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((r) => (
                            <Badge key={r.roleId} variant="outline" className="text-[10px] px-1">
                              {r.roleName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa gán</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user._displayStatus === 'pending' ? 'warning' :
                        user.isActive ? 'success' : 'destructive'
                      }>
                        {user._displayStatus === 'pending' ? 'Chờ duyệt' : 
                         user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={user._displayStatus === 'pending' ? 'default' : (user.isActive ? 'destructive' : 'default')}
                        onClick={() => handleToggleStatus(user)}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {user._displayStatus === 'pending' ? 'Phê duyệt' : 
                         user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
