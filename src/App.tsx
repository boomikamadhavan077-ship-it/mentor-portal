import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AddStudent from './components/AddStudent';
import ViewStudents from './components/ViewStudents';
import StudentProfile from './components/StudentProfile';
import EditStudent from './components/EditStudent';
import HODAuth from './components/HODAuth';
import HODDashboard from './components/HODDashboard';

type Page = 'dashboard' | 'add-student' | 'view-students' | 'view-student' | 'edit-student';
type AppMode = 'mentor' | 'hod-login' | 'hod-dashboard';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [appMode, setAppMode] = useState<AppMode>(() => {
    return sessionStorage.getItem('hod_authenticated') === 'true' ? 'hod-dashboard' : 'mentor';
  });

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

  if (appMode === 'hod-login') {
    return (
      <HODAuth
        onLogin={() => setAppMode('hod-dashboard')}
        onBack={() => setAppMode('mentor')}
      />
    );
  }

  if (appMode === 'hod-dashboard') {
    return (
      <HODDashboard
        onLogout={() => {
          sessionStorage.removeItem('hod_authenticated');
          setAppMode('mentor');
        }}
      />
    );
  }

  if (!user) {
    return <Auth onHODLogin={() => setAppMode('hod-login')} />;
  }

  return (
    <>
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'add-student' && <AddStudent onNavigate={handleNavigate} />}
      {currentPage === 'view-students' && <ViewStudents onNavigate={handleNavigate} />}
      {currentPage === 'view-student' && (
        <StudentProfile studentId={selectedStudentId} onNavigate={handleNavigate} />
      )}
      {currentPage === 'edit-student' && (
        <EditStudent studentId={selectedStudentId} onNavigate={handleNavigate} />
      )}
    </>
  );
}

export default App;