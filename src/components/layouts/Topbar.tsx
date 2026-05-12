import { useState } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services';

export function Topbar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : {
    fullName: 'Admin User',
    role: 'Admin',
    email: 'admin@example.com',
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Branch Selector */}
      <div className="relative">
        {/* <button
          onClick={() => setShowBranchMenu(!showBranchMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{selectedBranch.name}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {showBranchMenu && (
          <div className="absolute top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setSelectedBranch(branch);
                  setShowBranchMenu(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-accent transition-colors",
                  selectedBranch.id === branch.id && "bg-accent"
                )}
              >
                {branch.name}
              </button>
            ))}
          </div>
        )} */}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left hidden md:block">
              <p className="font-medium text-sm">{user.fullName || user.username || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="font-medium">{user.fullName || user.username || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
