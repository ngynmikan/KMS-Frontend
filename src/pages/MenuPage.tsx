import { useState, useEffect } from 'react';
import { Copy, Save, Calendar, Loader2, Trash2, RefreshCw, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { menuService, classService } from '@/services';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/api.constants';
import { ApiClass } from '@/types';

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
  items: typeof foodItems.breakfast;
};

const viDayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const meals = [
  { id: 'breakfast', name: 'Sáng', color: 'bg-orange-50' },
  { id: 'lunch', name: 'Trưa', color: 'bg-green-50' },
  { id: 'snack', name: 'Xế', color: 'bg-blue-50' },
];

export function MenuPage() {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0,10);
  });
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [menu, setMenu] = useState<Record<string, Record<string, MenuCell>>>({});
  const [menuIds, setMenuIds] = useState<Record<string, number | undefined>>({});
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const resp = await classService.getAllClasses();
        // classService returns APIResponse or array depending on implementation.
        let classList: ApiClass[] = [];
        if (Array.isArray(resp)) classList = resp as any;
        else if (Array.isArray((resp as any).data)) classList = (resp as any).data;
        else if (Array.isArray((resp as any).data?.data)) classList = (resp as any).data.data;

        // Normalize shape to ensure classId and className exist
        const normalized = classList.map((c: any) => ({
          classId: c.classId ?? c.id ?? c.ClassId ?? c.classID,
          className: c.className ?? c.name ?? c.class_name ?? c.title ?? 'Lớp'
        }));

        if (normalized.length > 0) {
          setClasses(normalized as any);
          if (!selectedClassId) {
            const firstId = (normalized[0] as any).classId;
            setSelectedClassId(String(firstId));
          }
        } else {
          // Fallback: try direct API call if classService wrapper returned unexpected shape
          try {
            const r = await api.get(API_ENDPOINTS.CLASSES.BASE);
            const payload = r?.data?.data ?? r?.data ?? [];
            const fallbackList = Array.isArray(payload) ? payload : [];
            const norm2 = fallbackList.map((c: any) => ({
              classId: c.classId ?? c.id ?? c.ClassId ?? c.classID,
              className: c.className ?? c.name ?? c.class_name ?? c.title ?? 'Lớp'
            }));
            if (norm2.length > 0) {
              setClasses(norm2 as any);
              if (!selectedClassId) setSelectedClassId(String((norm2[0] as any).classId));
            }
          } catch (err) {
            console.warn('Fallback class fetch failed', err);
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
  }, [selectedClassId, selectedDate]);

  const getWeekDates = (dateStr: string) => {
    const date = new Date(dateStr);
    // compute Monday of the week (treat Monday as start)
    const day = date.getDay(); // 0 Sun .. 6 Sat
    const diffToMonday = ((day + 6) % 7); // 0->Mon if day=1
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMonday);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const fetchMenus = async (classId: string) => {
    try {
      setIsLoading(true);
      const data = await menuService.getMenusByClass(classId);
      
      if (Array.isArray(data)) {
        const newMenuState: Record<string, Record<string, MenuCell>> = {};
        data.forEach((dailyMenu: any) => {
          const dateStr = dailyMenu.menuDate || dailyMenu.date;
          if (!dateStr) return;

          const date = new Date(dateStr);
          const iso = date.toISOString().slice(0,10);
          
          if (!newMenuState[iso]) {
            newMenuState[iso] = {};
          }

          const parseItems = (items: any) => {
            if (Array.isArray(items)) return items.map((it: any) => ({ id: it.id || Math.random().toString(), name: it.name || it, type: it.type || 'N/A' }));
            if (typeof items === 'string' && items.trim()) {
              return [{ id: Math.random().toString(), name: items, type: 'Backend' }];
            }
            return [];
          };

          // store menu id per date so we can update/delete later
          setMenuIds(prev => ({ ...prev, [iso]: dailyMenu.id }));

          newMenuState[iso]['breakfast'] = { items: parseItems(dailyMenu.breakfast) };
          newMenuState[iso]['lunch'] = { items: parseItems(dailyMenu.lunch) };
          newMenuState[iso]['snack'] = { items: parseItems(dailyMenu.snack) };
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

  const handleEditItem = (day: string, meal: string, itemId: string) => {
    const item = menu[day]?.[meal]?.items.find((it: any) => it.id === itemId);
    if (!item) return;
    const newName = prompt('Chỉnh sửa tên món ăn', item.name);
    if (newName && newName.trim()) {
      setMenu(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [meal]: {
            items: prev[day][meal].items.map((it: any) => it.id === itemId ? { ...it, name: newName } : it)
          }
        }
      }));
    }
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

  const handleRefresh = async () => {
    if (!selectedClassId) return;
    await fetchMenus(selectedClassId);
  };

  const handleDeleteDay = async (day: string) => {
    const id = menuIds[day];
    if (!id) {
      // just clear local
      const newMenu = { ...menu };
      delete newMenu[day];
      setMenu(newMenu);
      return;
    }

    if (!confirm(`Xóa thực đơn ngày ${day}?`)) return;

    try {
      setIsLoading(true);
      await menuService.deleteMenu(id);
      const newMenu = { ...menu };
      delete newMenu[day];
      setMenu(newMenu);
      setMenuIds(prev => {
        const n = { ...prev };
        delete n[day];
        return n;
      });
    } catch (error) {
      console.error('Failed to delete menu:', error);
      alert('Xóa thực đơn thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTemplate = () => {
    alert('Chức năng sao chép thực đơn mẫu sẽ được thực hiện');
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    
    try {
      setIsLoading(true);
      // Transform and call API per-day (create or update) based on selected week dates
      const ops: Promise<any>[] = [];
      weekDates.forEach((d) => {
        const iso = d.toISOString().slice(0,10);
        const mealsObj = menu[iso];
        // only save if there's data or there is an existing menu id
        if (!mealsObj && !menuIds[iso]) return;

        const payload: any = {
          classId: parseInt(selectedClassId),
          date: new Date(iso).toISOString(),
          breakfast: mealsObj?.breakfast?.items.map((it: any) => ({ name: it.name, type: it.type })) || [],
          lunch: mealsObj?.lunch?.items.map((it: any) => ({ name: it.name, type: it.type })) || [],
          snack: mealsObj?.snack?.items.map((it: any) => ({ name: it.name, type: it.type })) || []
        };

        const id = menuIds[iso];
        if (id) {
          ops.push(menuService.updateMenu(id, payload));
        } else {
          ops.push(menuService.createMenu(payload));
        }
      });

      await Promise.all(ops);
      await fetchMenus(selectedClassId);
      alert('Thực đơn đã được lưu thành công trên hệ thống!');
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('Đã có lỗi xảy ra khi lưu thực đơn.');
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
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu thực đơn
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium">Lớp học:</label>
              <Select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                <option value="">Chọn lớp</option>
                {classes.map(cls => (
                  <option key={String((cls as any).classId)} value={String((cls as any).classId)}>{(cls as any).className}</option>
                ))}
              </Select>
            </div>
            {/* view mode removed - using date picker to pick week */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 7);
                        setSelectedDate(d.toISOString().slice(0,10));
                      }}
                      className="p-2 border border-border rounded bg-white hover:bg-muted/5 flex items-center justify-center"
                      aria-label="Tuần trước"
                      title="Tuần trước"
                    >
                      <ChevronLeft className="w-4 h-4 text-sky-600" />
                    </button>

                    <div className="flex items-center gap-2">
                      {/* <span className="text-sm font-medium">Tuần</span> */}
                      <div className="text-sm px-3 py-1 border border-border rounded bg-white">
                        {(() => {
                          const start = weekDates[0];
                          const end = weekDates[6];
                          const fmt = (x: Date) => `${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}`;
                          return `${fmt(start)} - ${fmt(end)}`;
                        })()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 7);
                        setSelectedDate(d.toISOString().slice(0,10));
                      }}
                      className="p-2 border border-border rounded bg-white hover:bg-muted/5 flex items-center justify-center"
                      aria-label="Tuần sau"
                      title="Tuần sau"
                    >
                      <ChevronRight className="w-4 h-4 text-sky-600" />
                    </button>
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="hidden"
                  />
                </div>
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
                  {weekDates.map((d) => {
                    const iso = d.toISOString().slice(0,10);
                    const dayLabel = viDayNames[d.getDay()];
                    const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
                    return (
                      <th key={iso} className="border border-border p-2 bg-muted font-medium min-w-48">
                        <div className="flex items-center justify-between">
                          <span>{dayLabel} - {formatted}</span>
                          <div className="flex items-center gap-1">
                            <button title="Xóa ngày" onClick={() => handleDeleteDay(iso)} className="text-destructive p-1 hover:bg-muted rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                    {weekDates.map((d) => {
                      const iso = d.toISOString().slice(0,10);
                      const cell = menu[iso]?.[meal.id];
                      return (
                        <td
                          key={`${iso}-${meal.id}`}
                          className="border border-border p-2 hover:bg-accent/50 transition-colors align-top"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(iso, meal.id)}
                        >
                          {cell?.items && cell.items.length > 0 ? (
                            <div className="space-y-1 min-h-24">
                              {cell.items.map((item, idx) => (
                                <div
                                  key={`${item.id}-${idx}`}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs cursor-pointer hover:bg-primary/20 transition-colors flex items-center justify-between"
                                  onClick={() => handleRemoveItem(iso, meal.id, item.id)}
                                  onDoubleClick={() => handleEditItem(iso, meal.id, item.id)}
                                  title="Click để xóa, double-click để chỉnh sửa"
                                >
                                  <span>• {item.name}</span>
                                  <Edit3 className="w-3 h-3 opacity-60 ml-2" />
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
