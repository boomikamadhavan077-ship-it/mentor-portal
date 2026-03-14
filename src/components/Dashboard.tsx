import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types';
import { Users, AlertCircle, TrendingDown, Award, LogOut, UserPlus, List } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'add-student' | 'view-students') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { mentor, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    studentsWithArrears: 0,
    lowCGPAStudents: 0,
    scholarshipStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: students, error } = await supabase.from('students').select('*');
      if (error) throw error;
      if (students) {
        setStats({
          totalStudents: students.length,
          studentsWithArrears: students.filter(s => s.arrears_details && s.arrears_details.trim() !== '').length,
          lowCGPAStudents: students.filter(s => s.cgpa < 7.0).length,
          scholarshipStudents: students.filter(s => s.scholarship_details && s.scholarship_details.trim() !== '').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Students with Arrears', value: stats.studentsWithArrears, icon: AlertCircle, textColor: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Low CGPA (<7.0)', value: stats.lowCGPAStudents, icon: TrendingDown, textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Scholarship Students', value: stats.scholarshipStudents, icon: Award, textColor: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Mentor Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {mentor?.full_name}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Overview</h2>
          <p className="text-gray-600">Monitor and manage your mentee students</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card) => (
                <div key={card.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <card.icon className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate('add-student')}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-left"
                >
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Add New Student</h4>
                    <p className="text-sm text-gray-600">Register a new mentee</p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('view-students')}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-left"
                >
                  <div className="bg-green-600 p-2 rounded-lg">
                    <List className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">View All Students</h4>
                    <p className="text-sm text-gray-600">Search and manage students</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
