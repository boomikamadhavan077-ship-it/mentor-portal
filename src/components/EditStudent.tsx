import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';

interface EditStudentProps {
  studentId: string;
  onNavigate: (page: 'view-students' | 'view-student', studentId?: string) => void;
}

export default function EditStudent({ studentId, onNavigate }: EditStudentProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    student_name: '',
    register_number: '',
    phone_number: '',
    email: '',
    date_of_birth: '',
    blood_group: '',
    address: '',
    parent_name: '',
    parent_occupation: '',
    parent_phone: '',
    siblings_details: '',
    scholarship_details: '',
    hackathon_details: '',
    arrears_details: '',
    cgpa: '',
    gpa: '',
  });

  useEffect(() => { fetchStudent(); }, [studentId]);

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
      if (error) throw error;
      if (data) {
        setFormData({
          student_name: data.student_name,
          register_number: data.register_number,
          phone_number: data.phone_number,
          email: data.email,
          date_of_birth: data.date_of_birth,
          blood_group: data.blood_group,
          address: data.address,
          parent_name: data.parent_name,
          parent_occupation: data.parent_occupation,
          parent_phone: data.parent_phone,
          siblings_details: data.siblings_details || '',
          scholarship_details: data.scholarship_details || '',
          hackathon_details: data.hackathon_details || '',
          arrears_details: data.arrears_details || '',
          cgpa: data.cgpa.toString(),
          gpa: data.gpa.toString(),
        });
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('students')
        .update({ ...formData, cgpa: parseFloat(formData.cgpa) || 0, gpa: parseFloat(formData.gpa) || 0 })
        .eq('id', studentId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => { onNavigate('view-student', studentId); }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => onNavigate('view-student', studentId)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Student Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">Student updated successfully! Redirecting...</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                  <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Register Number *</label>
                  <input type="text" name="register_number" value={formData.register_number} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
                  <select name="blood_group" value={formData.blood_group} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name *</label>
                  <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Occupation *</label>
                  <input type="text" name="parent_occupation" value={formData.parent_occupation} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                  <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CGPA *</label>
                  <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} required min="0" max="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GPA *</label>
                  <input type="number" step="0.01" name="gpa" value={formData.gpa} onChange={handleChange} required min="0" max="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arrears Details</label>
                  <textarea name="arrears_details" value={formData.arrears_details} onChange={handleChange} rows={2} placeholder="Enter subject codes if any arrears (e.g., CS101, MA102)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Siblings Details</label>
                  <textarea name="siblings_details" value={formData.siblings_details} onChange={handleChange} rows={2} placeholder="Number and details of siblings" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Details</label>
                  <textarea name="scholarship_details" value={formData.scholarship_details} onChange={handleChange} rows={2} placeholder="Scholarship name and amount if applicable" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hackathon Details</label>
                  <textarea name="hackathon_details" value={formData.hackathon_details} onChange={handleChange} rows={2} placeholder="Hackathons participated and achievements" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => onNavigate('view-student', studentId)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
