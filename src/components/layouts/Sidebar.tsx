import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  School, 
  Calendar, 
  UtensilsCrossed, 
  DollarSign,
  GraduationCap,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight
  
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Học sinh', path: '/students' },
  { icon: UserCog, label: 'Nhân sự', path: '/staff' },
  { icon: Shield, label: 'Tài Khoản', path: '/accounts' },
  { icon: School, label: 'Lớp học', path: '/classes' },
  { icon: Calendar, label: 'Lịch học', path: '/schedule' },
  { icon: UtensilsCrossed, label: 'Thực đơn', path: '/menu' },
  { icon: Heart, label: 'Sức khỏe', path: '/health' },
  { icon: DollarSign, label: 'Tài chính', path: '/billing' },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header Section with Toggle */}
      <div className={cn(
        "p-4 border-b border-border flex flex-col transition-all",
        isCollapsed ? "items-center" : "items-stretch"
      )}>
        <div className="flex items-center justify-between mb-4 h-10">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
               <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="truncate">
                <h1 className="font-bold text-base leading-tight">Mầm Non</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hoa Mai</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-all duration-300",
              isCollapsed && "mt-0 bg-primary/5 text-primary hover:bg-primary/20"
            )}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {isCollapsed && (
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Menu Subtitle (Only if expanded) */}
      {/* {!isCollapsed && (
        <div className="px-6 pt-6 pb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danh mục chính</p>
        </div>
      )} */}

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 relative group/item",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-slate-100/80 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 transition-transform", !isCollapsed && "group-hover/item:scale-110")} />
              
              {!isCollapsed ? (
                <span className="font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              ) : (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 translate-x-3 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-800">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info (Only if expanded) */}
      {/* {!isCollapsed && (
        <div className="p-6 border-t border-border bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600">AD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">v1.0.0</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
