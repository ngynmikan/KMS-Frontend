import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Image as ImageIcon, 
  Edit, 
  Trash2, 
  Loader2,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { classActivityService, classService } from '@/services';
import { ApiClassActivity, ApiClass } from '@/types';
import { cn } from '@/lib/utils';
import { extractArray } from '@/lib/api-utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ActivitiesPage() {
  const [activities, setActivities] = useState<ApiClassActivity[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ApiClassActivity | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    content: '',
    activityDate: new Date().toISOString().split('T')[0],
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [activityResponse, classResponse] = await Promise.all([
        classActivityService.getAllActivities(),
        classService.getAllClasses(),
      ]);
      
      const activityData = extractArray<ApiClassActivity>(activityResponse);
      const classData = extractArray<ApiClass>(classResponse);
      
      setActivities(activityData);
      setClasses(classData);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Lỗi khi tải dữ liệu hoạt động.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          act.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassId === 'all' || act.classId.toString() === selectedClassId;
    return matchesSearch && matchesClass;
  });

  const handleCreate = () => {
    setEditingActivity(null);
    setFormData({
      classId: selectedClassId !== 'all' ? selectedClassId : '',
      title: '',
      content: '',
      activityDate: new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (act: ApiClassActivity) => {
    setEditingActivity(act);
    setFormData({
      classId: act.classId.toString(),
      title: act.title,
      content: act.content,
      activityDate: act.activityDate.split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete === null) return;
    try {
      await classActivityService.deleteActivity(confirmDelete);
      toast.success('Đã xóa hoạt động.');
      fetchInitialData();
    } catch (error) {
      toast.error('Lỗi khi xóa hoạt động.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.classId || !formData.title) {
        toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc.');
        return;
      }

      const payload = {
        classId: parseInt(formData.classId),
        title: formData.title,
        content: formData.content,
        activityDate: formData.activityDate,
      };

      if (editingActivity) {
        await classActivityService.updateActivity(editingActivity.activityId, payload);
        toast.success('Cập nhật hoạt động thành công!');
      } else {
        await classActivityService.createActivity(payload);
        toast.success('Thêm hoạt động mới thành công!');
      }
      setIsDialogOpen(false);
      fetchInitialData();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.title || 'Lỗi khi lưu hoạt động.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hoạt động lớp học</h1>
          <p className="text-muted-foreground mt-1">Quản lý và cập nhật hình ảnh các hoạt động của trẻ</p>
        </div>
        <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Thêm hoạt động
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <Card className="border-none shadow-sm h-full">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sự kiện, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-4">
          <Card className="border-none shadow-sm h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select 
                  value={selectedClassId} 
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-slate-50 border-none"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map(cls => (
                    <option key={cls.classId} value={cls.classId}>{cls.className}</option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Đang tải các hoạt động...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có hoạt động nào</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Hãy thêm hoạt động đầu tiên để phụ huynh có thể theo dõi hành trình của con tại trường.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleCreate}>
              Thêm hoạt động ngay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <Card key={activity.activityId} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-200 hover:ring-primary/20">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {activity.photos && activity.photos.length > 0 ? (
                  <img 
                    src={activity.photos[0].photoUrl} 
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                    <span className="text-xs font-medium uppercase tracking-wider opacity-60">Chưa có ảnh</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                   <Badge className="bg-white/90 text-slate-900 pointer-events-none backdrop-blur-sm border-none shadow-sm">
                    {classes.find(c => c.classId === activity.classId)?.className || 'Lớp'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center text-[10px] font-bold text-primary uppercase tracking-widest gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(activity.activityDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(activity)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(activity.activityId)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{activity.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2 min-h-[40px] leading-relaxed">
                  {activity.content}
                </p>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                     {/* <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">A</div>
                     <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">+5</div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingActivity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classId" className="font-semibold text-xs uppercase tracking-wider text-slate-500">Lớp học <span className="text-red-500">*</span></Label>
                <Select 
                  id="classId" 
                  required
                  value={formData.classId} 
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="h-11 border-slate-200"
                >
                  <option value="">Chọn lớp học</option>
                  {classes.map(cls => (
                    <option key={cls.classId} value={cls.classId}>{cls.className}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityDate" className="font-semibold text-xs uppercase tracking-wider text-slate-500">Ngày hoạt động <span className="text-red-500">*</span></Label>
                <Input 
                  id="activityDate" 
                  type="date" 
                  required
                  value={formData.activityDate} 
                  onChange={(e) => setFormData({...formData, activityDate: e.target.value})}
                  className="h-11 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-xs uppercase tracking-wider text-slate-500">Tiêu đề hoạt động <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                required
                placeholder="VD: Tham quan bảo tàng, Bé tập vẽ..." 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-11 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="font-semibold text-xs uppercase tracking-wider text-slate-500">Nội dung chi tiết</Label>
              <textarea 
                id="content" 
                rows={4}
                placeholder="Mô tả các hoạt động của trẻ..." 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11 px-6">Hủy</Button>
            <Button onClick={handleSave} className="h-11 px-8 shadow-lg shadow-primary/20">
              {editingActivity ? 'Lưu thay đổi' : 'Tạo hoạt động'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Xóa hoạt động"
        description="Bạn có chắc chắn muốn xóa hoạt động này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      className
    )}>
      {children}
    </span>
  );
}
