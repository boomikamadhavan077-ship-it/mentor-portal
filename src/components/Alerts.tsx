import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { AlertCircle, TrendingDown, Bell } from 'lucide-react';

export default function Alerts() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('students').select('*').then(({ data }) => { if (data) setStudents(data); setLoading(false); }); }, []);
  const arrears = students.filter(s => s.arrears_details?.trim());
  const lowCGPA = students.filter(s => s.cgpa < 7.0);
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6"><Bell className="w-5 h-5 text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Alerts</h2></div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4 text-red-600" /><h3 className="font-semibold text-gray-800">Students with Arrears</h3><span className="ml-auto bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">{arrears.length}</span></div>
        {arrears.length === 0 ? <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm border border-dashed">No students with arrears 🎉</div> :
          <div className="space-y-3">{arrears.map(s => <div key={s.id} className="bg-white border border-red-100 rounded-xl p-4 flex items-start gap-4 shadow-sm"><div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0"><span className="text-red-700 font-semibold text-sm">{s.student_name.charAt(0)}</span></div><div className="flex-1"><p className="font-semibold text-gray-900">{s.student_name}</p><p className="text-xs text-gray-500">{s.register_number}</p><p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mt-1">{s.arrears_details}</p></div></div>)}</div>}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3"><TrendingDown className="w-4 h-4 text-orange-600" /><h3 className="font-semibold text-gray-800">Low CGPA (&lt;7.0)</h3><span className="ml-auto bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">{lowCGPA.length}</span></div>
        {lowCGPA.length === 0 ? <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm border border-dashed">All students have CGPA ≥ 7.0 🎉</div> :
          <div className="space-y-3">{lowCGPA.map(s => <div key={s.id} className="bg-white border border-orange-100 rounded-xl p-4 flex items-center gap-4 shadow-sm"><div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><span className="text-orange-700 font-semibold text-sm">{s.student_name.charAt(0)}</span></div><div className="flex-1"><p className="font-semibold text-gray-900">{s.student_name}</p><p className="text-xs text-gray-500">{s.register_number}</p></div><p className="text-lg font-bold text-orange-600">{s.cgpa}</p></div>)}</div>}
      </div>
    </div>
  );
}