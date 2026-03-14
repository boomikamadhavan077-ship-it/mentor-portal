import { Menu } from 'lucide-react';
const titles: Record<string, string> = { dashboard: 'Dashboard', 'view-students': 'My Students', 'add-student': 'Add Student', 'view-student': 'Student Profile', 'edit-student': 'Edit Student', alerts: 'Alerts', hackathons: 'Hackathons', scholarship: 'Scholarship' };
export default function TopBar({ currentPage, onMenuClick }: { currentPage: string; onMenuClick: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10">
      <button className="lg:hidden text-gray-500 mr-4" onClick={onMenuClick}><Menu className="w-6 h-6" /></button>
      <h1 className="text-lg font-semibold text-gray-800">{titles[currentPage] || 'Mentor Portal'}</h1>
    </header>
  );
}