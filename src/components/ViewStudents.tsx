import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { ArrowLeft, Search, Eye, Edit, Trash2, Download } from 'lucide-react';

interface ViewStudentsProps {
  onNavigate: (page: 'dashboard' | 'add-student' | 'view-student' | 'edit-student', studentId?: string) => void;
}

export default function ViewStudents({ onNavigate }: ViewStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { filterStudents(); }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) { setFilteredStudents(students); return; }
    const filtered = students.filter(
      (student) =>
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.register_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setDeleteLoading(id);
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setStudents(students.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    } finally {
      setDeleteLoading(null);
    }
  };

  const downloadCSV = () => {
    const headers = ['Student Name','Register Number','Phone','Email','DOB','Blood Group','Address','Parent Name','Parent Occupation','Parent Phone','CGPA','GPA','Arrears','Scholarship','Hackathons','Siblings'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map((student) =>
        [`"${student.student_name}"`,student.register_number,student.phone_number,student.email,student.date_of_birth,student.blood_group,`"${student.address}"`,`"${student.parent_name}"`,`"${student.parent_occupation}"`,student.parent_phone,student.cgpa,student.gpa,`"${student.arrears_details || 'None'}"`,`"${student.scholarship_details || 'None'}"`,`"${student.hackathon_details || 'None'}"`,`"${student.siblings_details || 'None'}"`].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
            <button onClick={downloadCSV} disabled={filteredStudents.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or register number..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <p className="text-gray-600">{searchTerm ? 'No students found matching your search.' : 'No students added yet.'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrears</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.register_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => onNavigate('view-student', student.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">{student.student_name}</button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${student.cgpa >= 7.5 ? 'text-green-600' : student.cgpa >= 6.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {student.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {student.arrears_details && student.arrears_details.trim() !== '' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Yes</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex gap-2">
                          <button onClick={() => onNavigate('view-student', student.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="View Details"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => onNavigate('edit-student', student.id)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition" title="Edit"><Edit className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(student.id, student.student_name)} disabled={deleteLoading === student.id} className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50" title="Delete"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
