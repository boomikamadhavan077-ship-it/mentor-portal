import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Bell, Trophy, Award, LogOut, X, GraduationCap } from 'lucide-react';

type Page = 'dashboard' | 'add-student' | 'view-students' | 'view-student' | 'edit-student' | 'alerts' | 'hackathons' | 'scholarship';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'view-students' as Page, label: 'My Students', icon: Users },
  { id: 'alerts' as Page, label: 'Alerts', icon: Bell },
  { id: 'hackathons' as Page, label: 'Hackathons', icon: Trophy },
  { id: 'scholarship' as Page, label: 'Scholarship', icon: Award },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, setIsOpen }: SidebarProps) {
  const { mentor, signOut } = useAuth();
  const activePage = ['view-student', 'edit-student', 'add-student'].includes(currentPage) ? 'view-students' : currentPage;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><GraduationCap className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-gray-900 text-lg">Mentor Portal</span>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">{mentor?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{mentor?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{mentor?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button key={id} onClick={() => { onNavigate(id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </div>
      </aside>
    </>
  );
}