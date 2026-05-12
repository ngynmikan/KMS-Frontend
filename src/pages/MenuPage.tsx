import { useState, useEffect } from 'react';
import { Copy, Save, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { menuService, classService } from '@/services';
import { ApiClass, MenuItem, ApiMenu } from '@/types';
import { extractArray } from '@/lib/api-utils';

const foodItems = {
  breakfast: [
    { id: 'b1', name: 'Phở bò', type: 'Món chính' },
    { id: 'b2', name: 'Bánh mì thịt', type: 'Món chính' },
    { id: 'b3', name: 'Cháo gà', type: 'Món chính' },
    { id: 'b4', name: 'Xôi gà', type: 'Món chính' },
    { id: 'b5', name: 'Sữa tươi', type: 'Đồ uống' },
    { id: 'b6', name: 'Nước ép trái cây', type: 'Đồ uống' },
  ],
  lunch: [
    { id: 'l1', name: 'Cơm gà luộc', type: 'Món chính' },
    { id: 'l2', name: 'Cơm cá kho', type: 'Món chính' },
    { id: 'l3', name: 'Canh cải', type: 'Canh' },
    { id: 'l4', name: 'Canh chua', type: 'Canh' },
    { id: 'l5', name: 'Rau luộc', type: 'Rau' },
    { id: 'l6', name: 'Trái cây', type: 'Tráng miệng' },
  ],
  snack: [
    { id: 's1', name: 'Bánh bông lan', type: 'Bánh' },
    { id: 's2', name: 'Sữa chua', type: 'Tráng miệng' },
    { id: 's3', name: 'Bánh quy', type: 'Bánh' },
    { id: 's4', name: 'Hoa quả', type: 'Tráng miệng' },
    { id: 's5', name: 'Sữa đậu nành', type: 'Đồ uống' },
  ],
};

type MenuCell = {
  items: MenuItem[];
  menuId?: number;
};

const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const meals = [
  { id: 'breakfast', name: 'Sáng', color: 'bg-orange-50' },
  { id: 'lunch', name: 'Trưa', color: 'bg-green-50' },
  { id: 'snack', name: 'Xế', color: 'bg-blue-50' },
];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function MenuPage() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [menu, setMenu] = useState<Record<string, Record<string, MenuCell>>>({});
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const resp = await classService.getAllClasses();
        const classList = extractArray<ApiClass>(resp);
        
        if (classList.length > 0) {
          setClasses(classList);
          if (!selectedClassId) {
            const firstId = classList[0].classId;
            setSelectedClassId(firstId.toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      console.log('Fetching menus for classId:', selectedClassId);
      fetchMenus(selectedClassId);
    }
  }, [selectedClassId, selectedWeek]);

  const getWeekDates = (selectedWeekKey: string) => {
    const today = new Date();
    // For demo/simplicity, we calculate based on the current week
    // In a real app, 'week1', 'week2' would be mapped to actual date ranges
    const monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    
    // Adjust based on week selection (rough logic for demo)
    if (selectedWeekKey === 'week2') monday.setDate(monday.getDate() + 7);
    if (selectedWeekKey === 'week3') monday.setDate(monday.getDate() + 14);
    if (selectedWeekKey === 'week4') monday.setDate(monday.getDate() + 21);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const fetchMenus = async (classId: string) => {
    try {
      setIsLoading(true);
      const resp = await menuService.getMenusByClass(classId);
      const data = extractArray<ApiMenu>(resp);
      
      const weekDates = getWeekDates(selectedWeek);
      const weekDateStrings = weekDates.map(d => formatDate(d));
      
      if (Array.isArray(data)) {
        const newMenuState: Record<string, Record<string, MenuCell>> = {};

        // Initialize empty state for the specific dates of the week
        daysOfWeek.forEach((dayLabel) => {
          newMenuState[dayLabel] = {
            breakfast: { items: [] },
            lunch: { items: [] },
            snack: { items: [] }
          };
        });

        data.forEach((item: any) => {
          console.log('item', item);
          const dateStr = (item.menuDate || item.date || '').split('T')[0];
          if (!dateStr) return;

          // Check if this item belongs to the selected week
          const weekDayIndex = weekDateStrings.indexOf(dateStr);
          if (weekDayIndex === -1) return;

          const dayLabel = daysOfWeek[weekDayIndex];
          
          // Map meal types from API to UI keys
          let uiMealType: string | null = null;
          const apiMealType = item.mealType?.toLowerCase() || '';
          console.log('apiMealType', apiMealType);
          
          if (apiMealType === 'breakfast' || apiMealType === 'sáng') uiMealType = 'breakfast';
          else if (apiMealType === 'lunch' || apiMealType === 'trưa') uiMealType = 'lunch';
          else if (apiMealType === 'snack' || apiMealType === 'xế') uiMealType = 'snack';
          
          if (uiMealType && newMenuState[dayLabel]) {
            const content = item.menuContent || '';
            const newItems = content.split(',').map((name: string) => ({
              id: Math.random().toString(), 
              name: name.trim(),
              type: 'Backend'
            })).filter((i: any) => i.name);
            
            // Merge items if multiple records exist for the same slot
            const existingItems = newMenuState[dayLabel][uiMealType].items;
            const uniqueItems = [...existingItems];
            
            newItems.forEach((newItem: MenuItem) => {
              if (!uniqueItems.some(u => u.name === newItem.name)) {
                uniqueItems.push(newItem);
              }
            });

            newMenuState[dayLabel][uiMealType] = { 
              items: uniqueItems,
              menuId: item.menuId // Keep the latest menuId for updates
            };
          }
        });

        setMenu(newMenuState);
      } else {
        setMenu({});
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      setMenu({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (item: any) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: string, meal: string) => {
    if (draggedItem) {
      const currentItems = menu[day]?.[meal]?.items || [];
      setMenu({
        ...menu,
        [day]: {
          ...menu[day],
          [meal]: {
            items: [...currentItems, draggedItem],
          },
        },
      });
      setDraggedItem(null);
    }
  };

  const handleRemoveItem = (day: string, meal: string, itemId: string) => {
    const newMenu = { ...menu };
    if (newMenu[day]?.[meal]) {
      newMenu[day][meal].items = newMenu[day][meal].items.filter(item => item.id !== itemId);
    }
    setMenu(newMenu);
  };

  const handleCopyTemplate = () => {
    toast.info('Chức năng sao chép thực đơn mẫu đang được phát triển');
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    
    try {
      setIsLoading(true);
      const weekDates = getWeekDates(selectedWeek);
      const promises: Promise<any>[] = [];

      Object.entries(menu).forEach(([dayName, meals]) => {
        const dayIndex = daysOfWeek.indexOf(dayName);
        if (dayIndex === -1) return;

        const dateISO = formatDate(weekDates[dayIndex]);

        Object.entries(meals).forEach(([mealType, cell]) => {
          if (cell.items.length === 0) return;

          const mealName = mealType === 'breakfast' ? 'Breakfast' : 
                          mealType === 'lunch' ? 'Lunch' : 'Snack';

          const payload = {
            classId: parseInt(selectedClassId),
            menuDate: dateISO,
            mealType: mealName,
            menuContent: cell.items.map(i => i.name).join(', '),
            calories: 450,
            source: 'In-House',
            allergens: '', // Chuỗi rỗng thay vì 'None'
            supplierName: '', // Chuỗi rỗng thay vì 'Internal'
            preparedBy: null // Phải là số (ID) hoặc null, không được truyền chuỗi
          };

          if (cell.menuId) {
            promises.push(menuService.updateMenu(cell.menuId, payload));
          } else {
            promises.push(menuService.createMenu(payload));
          }
        });
      });

      if (promises.length === 0) {
        toast.warning('Vui lòng thêm món ăn vào thực đơn trước khi lưu.');
        return;
      }

      await Promise.all(promises);
      toast.success('Thực đơn đã được lưu thành công trên hệ thống!');
      fetchMenus(selectedClassId);
    } catch (error) {
      console.error('Failed to save menu:', error);
      toast.error('Đã có lỗi xảy ra khi lưu thực đơn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thực đơn</h1>
          <p className="text-muted-foreground mt-1">Lập thực đơn cho các bữa ăn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyTemplate}>
            <Copy className="w-4 h-4 mr-2" />
            Sao chép mẫu
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu thực đơn
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-center">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 whitespace-nowrap min-w-[70px]">Lớp học:</label>
              <Select 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-10 border-slate-200 bg-white"
              >
                <option value="">Chọn lớp học</option>
                {classes.map(cls => (
                  <option key={cls.classId} value={cls.classId}>{cls.className}</option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 whitespace-nowrap min-w-[100px]">Chế độ xem:</label>
              <Select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as 'week' | 'month')}
                className="w-full h-10 border-slate-200 bg-white"
              >
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </Select>
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <Select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full max-w-[300px] h-10 border-slate-200 bg-white"
              >
                <option value="week1">Tuần 1 - Tháng 3/2026</option>
                <option value="week2">Tuần 2 - Tháng 3/2026</option>
                <option value="week3">Tuần 3 - Tháng 3/2026</option>
                <option value="week4">Tuần 4 - Tháng 3/2026</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Items Palette */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Món ăn sáng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foodItems.breakfast.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="px-3 py-2 bg-orange-50 text-orange-700 rounded-md cursor-move text-sm hover:bg-orange-100 transition-colors"
              >
                {item.name}
                <span className="text-xs ml-2 text-orange-500">({item.type})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Món ăn trưa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foodItems.lunch.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="px-3 py-2 bg-green-50 text-green-700 rounded-md cursor-move text-sm hover:bg-green-100 transition-colors"
              >
                {item.name}
                <span className="text-xs ml-2 text-green-500">({item.type})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Món ăn xế</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foodItems.snack.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md cursor-move text-sm hover:bg-blue-100 transition-colors"
              >
                {item.name}
                <span className="text-xs ml-2 text-blue-500">({item.type})</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Menu Table */}
      <Card>
        <CardHeader>
          <CardTitle>Thực đơn tuần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-2 bg-muted font-medium min-w-24">
                    Bữa ăn
                  </th>
                  {daysOfWeek.map((day, idx) => {
                    const weekDates = getWeekDates(selectedWeek);
                    const date = weekDates[idx];
                    return (
                      <th key={day} className="border border-border p-2 bg-muted font-medium min-w-48">
                        <div>{day}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {date.toLocaleDateString('vi-VN')}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="border border-border p-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang tải thực đơn...
                      </div>
                    </td>
                  </tr>
                ) : meals.map((meal) => (
                  <tr key={meal.id}>
                    <td className={cn('border border-border p-3 font-medium text-center', meal.color)}>
                      {meal.name}
                    </td>
                    {daysOfWeek.map((day) => {
                      const cell = menu[day]?.[meal.id];
                      return (
                        <td
                          key={`${day}-${meal.id}`}
                          className="border border-border p-2 hover:bg-accent/50 transition-colors align-top"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, meal.id)}
                        >
                          {cell?.items && cell.items.length > 0 ? (
                            <div className="space-y-1 min-h-24">
                              {cell.items.map((item, idx) => (
                                <div
                                  key={`${item.id}-${idx}`}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                                  onClick={() => handleRemoveItem(day, meal.id, item.id)}
                                >
                                  • {item.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="min-h-24 flex items-center justify-center text-muted-foreground text-xs">
                              Kéo thả món ăn vào đây
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
          <p className="text-sm text-muted-foreground mt-4">
            💡 Kéo thả các món ăn từ danh sách vào ô tương ứng. Click vào món ăn để xóa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
