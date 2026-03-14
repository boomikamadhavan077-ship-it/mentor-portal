import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { Trophy } from 'lucide-react';
export default function Hackathons() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('students').select('*').then(({ data }) => { if (data) setStudents(data); setLoading(false); }); }, []);
  const list = students.filter(s => s.hackathon_details?.trim());
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6"><Trophy className="w-5 h-5 text-yellow-500" /><h2 className="text-xl font-bold text-gray-900">Hackathon Participants ({list.length})</h2></div>
      {list.length === 0 ? <div className="bg-gray-50 rounded-xl p-10 text-center border border-dashed"><Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No hackathon participants yet</p></div> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{list.map(s => <div key={s.id} className="bg-white border border-yellow-100 rounded-xl p-5 shadow-sm"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><span className="text-yellow-700 font-bold">{s.student_name.charAt(0)}</span></div><div><p className="font-semibold text-gray-900">{s.student_name}</p><p className="text-xs text-gray-500">{s.register_number}</p></div></div><div className="bg-yellow-50 rounded-lg px-3 py-2"><p className="text-sm text-gray-700">{s.hackathon_details}</p></div></div>)}</div>}
    </div>
  );
}