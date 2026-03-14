import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { ArrowLeft, Edit, Download, Mail, Phone, Calendar, Droplet, MapPin, Users, Award, Code, AlertCircle } from 'lucide-react';

interface StudentProfileProps {
  studentId: string;
  onNavigate: (page: 'view-students' | 'edit-student', studentId?: string) => void;
}

export default function StudentProfile({ studentId, onNavigate }: StudentProfileProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStudent(); }, [studentId]);

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadProfile = () => {
    if (!student) return;
    const content = `
STUDENT PROFILE
${'='.repeat(50)}

PERSONAL INFORMATION
Name: ${student.student_name}
Register Number: ${student.register_number}
Email: ${student.email}
Phone: ${student.phone_number}
Date of Birth: ${new Date(student.date_of_birth).toLocaleDateString()}
Blood Group: ${student.blood_group}
Address: ${student.address}

PARENT INFORMATION
Parent Name: ${student.parent_name}
Parent Occupation: ${student.parent_occupation}
Parent Phone: ${student.parent_phone}

ACADEMIC INFORMATION
CGPA: ${student.cgpa}
GPA: ${student.gpa}
Arrears: ${student.arrears_details || 'None'}

ADDITIONAL INFORMATION
Siblings: ${student.siblings_details || 'None'}
Scholarships: ${student.scholarship_details || 'None'}
Hackathons: ${student.hackathon_details || 'None'}

${'='.repeat(50)}
Generated on: ${new Date().toLocaleString()}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.register_number}_profile.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Student not found</p>
          <button onClick={() => onNavigate('view-students')} className="text-blue-600 hover:text-blue-800">Back to Students List</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => onNavigate('view-students')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Students
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.student_name}</h1>
              <p className="text-gray-600">{student.register_number}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onNavigate('edit-student', student.id)} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                <Edit className="w-5 h-5" />
                Edit
              </button>
              <button onClick={downloadProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Email</p><p className="font-medium text-gray-900">{student.email}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Phone</p><p className="font-medium text-gray-900">{student.phone_number}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Date of Birth</p><p className="font-medium text-gray-900">{new Date(student.date_of_birth).toLocaleDateString()}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Blood Group</p><p className="font-medium text-gray-900">{student.blood_group}</p></div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Address</p><p className="font-medium text-gray-900">{student.address}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Parent Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Parent Name</p><p className="font-medium text-gray-900">{student.parent_name}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-400 mt-0.5 flex items-center justify-center"><span className="text-xs">💼</span></div>
                  <div><p className="text-sm text-gray-600">Occupation</p><p className="font-medium text-gray-900">{student.parent_occupation}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm text-gray-600">Parent Phone</p><p className="font-medium text-gray-900">{student.parent_phone}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-gray-400" /><p className="text-sm font-medium text-gray-600">Siblings</p></div>
                  <p className="text-gray-900 pl-7">{student.siblings_details || 'No information provided'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><Award className="w-5 h-5 text-gray-400" /><p className="text-sm font-medium text-gray-600">Scholarship</p></div>
                  <p className="text-gray-900 pl-7">{student.scholarship_details || 'No scholarship information'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><Code className="w-5 h-5 text-gray-400" /><p className="text-sm font-medium text-gray-600">Hackathons</p></div>
                  <p className="text-gray-900 pl-7">{student.hackathon_details || 'No hackathon participation'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">CGPA</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${student.cgpa >= 7.5 ? 'text-green-600' : student.cgpa >= 6.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {student.cgpa.toFixed(2)}
                    </p>
                    <p className="text-gray-500 mb-1">/ 10.00</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">GPA (Current Semester)</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${student.gpa >= 7.5 ? 'text-green-600' : student.gpa >= 6.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {student.gpa.toFixed(2)}
                    </p>
                    <p className="text-gray-500 mb-1">/ 10.00</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5 text-gray-400" /><p className="text-sm font-medium text-gray-600">Arrears</p></div>
                  {student.arrears_details && student.arrears_details.trim() !== '' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{student.arrears_details}</p></div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm font-medium">No Arrears</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
