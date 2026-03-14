import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AddStudent from './components/AddStudent';
import ViewStudents from './components/ViewStudents';
import StudentProfile from './components/StudentProfile';
import EditStudent from './components/EditStudent';
import Alerts from './components/Alerts';
import Hackathons from './components/Hackathons';
import Scholarship from './components/Scholarship';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

type Page = 'dashboard' | 'add-student' | 'view-students' | 'view-student' | 'edit-student' | 'alerts' | 'hackathons' | 'scholarship';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: Page, studentId?: string) => {
    setCurrentPage(page);
    if (studentId) setSelectedStudentId(studentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <TopBar currentPage={currentPage} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === 'add-student' && <AddStudent onNavigate={handleNavigate} />}
          {currentPage === 'view-students' && <ViewStudents onNavigate={handleNavigate} />}
          {currentPage === 'view-student' && <StudentProfile studentId={selectedStudentId} onNavigate={handleNavigate} />}
          {currentPage === 'edit-student' && <EditStudent studentId={selectedStudentId} onNavigate={handleNavigate} />}
          {currentPage === 'alerts' && <Alerts />}
          {currentPage === 'hackathons' && <Hackathons />}
          {currentPage === 'scholarship' && <Scholarship />}
        </main>
      </div>
    </div>
  );
}

export default App;