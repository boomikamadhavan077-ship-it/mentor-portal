import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Mentor } from '../types';
import {
  Search, LogOut, Shield, Users, AlertCircle, TrendingDown, Award,
  FileText, Eye, Download, X, Mail, Phone, Calendar, Droplet,
  MapPin, BookOpen, Code, ChevronDown, ChevronUp
} from 'lucide-react';

interface HODDashboardProps {
  onLogout: () => void;
}

interface StudentWithMentor extends Student {
  mentor?: Mentor;
}

export default function HODDashboard({ onLogout }: HODDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<StudentWithMentor[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithMentor | null>(null);
  const [stats, setStats] = useState({ total: 0, arrears: 0, lowCGPA: 0, scholarship: 0 });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(allStudents);
    } else {
      const q = searchTerm.toLowerCase();
      setFilteredStudents(
        allStudents.filter(
          (s) =>
            s.student_name.toLowerCase().includes(q) ||
            s.register_number.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        )
      );
    }
  }, [searchTerm, allStudents]);

  const fetchData = async () => {
    try {
      const { data: mentors, error: mErr } = await supabase.from('mentors').select('*');
      if (mErr) throw mErr;

      const mMap: Record<string, Mentor> = {};
      (mentors || []).forEach((m) => { mMap[m.id] = m; });

      const { data: students, error: sErr } = await supabase
        .from('students')
        .select('*')
        .order('student_name', { ascending: true });
      if (sErr) throw sErr;

      const enriched: StudentWithMentor[] = (students || []).map((s) => ({
        ...s,
        mentor: mMap[s.mentor_id],
      }));

      setAllStudents(enriched);
      setFilteredStudents(enriched);
      setStats({
        total: enriched.length,
        arrears: enriched.filter((s) => s.arrears_details?.trim()).length,
        lowCGPA: enriched.filter((s) => s.cgpa < 7.0).length,
        scholarship: enriched.filter((s) => s.scholarship_details?.trim()).length,
      });
    } catch (err) {
      console.error('HOD fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hod_authenticated');
    onLogout();
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateStudentPDF = (student: StudentWithMentor) => {
    const mentorName = student.mentor?.full_name || 'Not Assigned';
    const mentorEmail = student.mentor?.email || '—';
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const cgpaColor = student.cgpa >= 7.5 ? '#16a34a' : student.cgpa >= 6.0 ? '#d97706' : '#dc2626';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Student Profile — ${student.student_name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; }
  .page { width: 794px; min-height: 1123px; margin: 0 auto; background: white; padding: 40px 48px; }
  .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 16px; padding: 28px 32px; color: white; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header-left h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .header-left p { font-size: 13px; opacity: 0.85; }
  .header-right { text-align: right; font-size: 12px; opacity: 0.85; line-height: 1.8; }
  .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 999px; padding: 4px 14px; font-size: 11px; font-weight: 600; margin-top: 8px; }
  .gpa-strip { display: flex; gap: 12px; margin-bottom: 24px; }
  .gpa-box { flex: 1; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; }
  .gpa-box .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; }
  .gpa-box .val { font-size: 28px; font-weight: 800; }
  .gpa-box .sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .section { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 18px; overflow: hidden; }
  .section-title { background: #f1f5f9; padding: 12px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #475569; border-bottom: 1px solid #e2e8f0; }
  .section-body { padding: 18px 20px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .field label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; display: block; margin-bottom: 3px; }
  .field span { font-size: 13px; color: #1e293b; font-weight: 500; }
  .full-width { grid-column: 1 / -1; }
  .mentor-box { background: linear-gradient(135deg, #ede9fe, #e0e7ff); border: 1px solid #c4b5fd; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .mentor-box .name { font-size: 15px; font-weight: 700; color: #4f46e5; }
  .mentor-box .email { font-size: 12px; color: #6d28d9; margin-top: 2px; }
  .mentor-badge { background: #4f46e5; color: white; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; }
  .footer strong { color: #475569; }
  @media print { body { background: white; } .page { padding: 24px 32px; box-shadow: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <h1>${student.student_name}</h1>
      <p>Register Number: <strong>${student.register_number}</strong></p>
      <span class="badge">HOD — Official Record</span>
    </div>
    <div class="header-right">
      <div>📅 Generated: ${today}</div>
      <div>📧 ${student.email}</div>
      <div>📞 ${student.phone_number}</div>
    </div>
  </div>
  <div class="gpa-strip">
    <div class="gpa-box" style="background:#f0fdf4; border-color:#86efac;">
      <div class="label">CGPA</div>
      <div class="val" style="color:${cgpaColor}">${Number(student.cgpa).toFixed(2)}</div>
      <div class="sub">Cumulative Grade Point Average</div>
    </div>
    <div class="gpa-box" style="background:#eff6ff; border-color:#93c5fd;">
      <div class="label">GPA (Current Sem)</div>
      <div class="val" style="color:#2563eb">${Number(student.gpa).toFixed(2)}</div>
      <div class="sub">Grade Point Average</div>
    </div>
    <div class="gpa-box" style="background:${student.arrears_details?.trim() ? '#fef2f2' : '#f0fdf4'}; border-color:${student.arrears_details?.trim() ? '#fca5a5' : '#86efac'};">
      <div class="label">Arrear Status</div>
      <div class="val" style="font-size:16px; color:${student.arrears_details?.trim() ? '#dc2626' : '#16a34a'}; margin-top:4px;">
        ${student.arrears_details?.trim() ? '⚠ Has Arrears' : '✓ No Arrears'}
      </div>
      <div class="sub">${student.arrears_details?.trim() ? student.arrears_details : 'Clear academic record'}</div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Personal Information</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><label>Date of Birth</label><span>${new Date(student.date_of_birth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
        <div class="field"><label>Blood Group</label><span>${student.blood_group}</span></div>
        <div class="field full-width"><label>Address</label><span>${student.address}</span></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Parent / Guardian Information</div>
    <div class="section-body">
      <div class="grid3">
        <div class="field"><label>Parent Name</label><span>${student.parent_name}</span></div>
        <div class="field"><label>Occupation</label><span>${student.parent_occupation}</span></div>
        <div class="field"><label>Contact Number</label><span>${student.parent_phone}</span></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Additional Academic Details</div>
    <div class="section-body">
      <div class="grid2" style="margin-bottom:14px;">
        <div class="field"><label>Scholarship Details</label><span>${student.scholarship_details?.trim() || 'No scholarship'}</span></div>
        <div class="field"><label>Hackathon Participation</label><span>${student.hackathon_details?.trim() || 'None'}</span></div>
      </div>
      <div class="field"><label>Siblings Details</label><span>${student.siblings_details?.trim() || 'Not provided'}</span></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Assigned Mentor</div>
    <div class="section-body">
      <div class="mentor-box">
        <div>
          <div class="name">${mentorName}</div>
          <div class="email">${mentorEmail}</div>
        </div>
        <span class="mentor-badge">MENTOR</span>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>📄 Student Profile Report · Mentor Management System</span>
    <span>Generated by <strong>HOD Portal</strong> · ${today}</span>
  </div>
</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Please allow popups for PDF generation.'); return; }
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  };

  const statCards = [
    { label: 'Total Students', value: stats.total, icon: Users, color: 'blue' },
    { label: 'Students with Arrears', value: stats.arrears, icon: AlertCircle, color: 'red' },
    { label: 'Low CGPA (< 7.0)', value: stats.lowCGPA, icon: TrendingDown, color: 'orange' },
    { label: 'Scholarship Students', value: stats.scholarship, icon: Award, color: 'green' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">HOD Portal</h1>
                <p className="text-purple-200 text-xs">Head of Department Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[c.color]}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" />
            Search Students
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, register number, or email…"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No students found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try a different search term' : 'No student records available'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isExpanded = expandedRows.has(student.id);
              const cgpaColor = student.cgpa >= 7.5 ? 'text-green-600' : student.cgpa >= 6.0 ? 'text-yellow-600' : 'text-red-600';
              return (
                <div key={student.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {student.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{student.student_name}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{student.register_number}</span>
                          {student.arrears_details?.trim() && (
                            <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Arrears</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{student.email}</p>
                        <p className="text-xs text-purple-700 font-medium mt-1 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Mentor: {student.mentor?.full_name || 'Not Assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400">CGPA</p>
                        <p className={`font-bold text-lg ${cgpaColor}`}>{Number(student.cgpa).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => generateStudentPDF(student)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition border border-indigo-200"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => toggleRow(student.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div><p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">Phone</p><p className="text-gray-700">{student.phone_number}</p></div>
                        <div><p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">Blood Group</p><p className="text-gray-700">{student.blood_group}</p></div>
                        <div><p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">GPA (Current)</p><p className="text-gray-700 font-semibold">{Number(student.gpa).toFixed(2)}</p></div>
                        <div><p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">Parent Contact</p><p className="text-gray-700">{student.parent_phone}</p></div>
                        <div className="col-span-2"><p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">Mentor Email</p><p className="text-gray-700">{student.mentor?.email || '—'}</p></div>
                        <div className="col-span-2"><p className="text-gray-400 uppercase tracking-wide mb-1 font-medium">Scholarship</p><p className="text-gray-700">{student.scholarship_details?.trim() || 'None'}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-t-2xl px-6 py-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedStudent.student_name}</h2>
                <p className="text-purple-200 text-sm mt-0.5">{selectedStudent.register_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateStudentPDF(selectedStudent)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Generate PDF
                </button>
                <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'CGPA', val: Number(selectedStudent.cgpa).toFixed(2), col: selectedStudent.cgpa >= 7.5 ? 'text-green-600' : selectedStudent.cgpa >= 6.0 ? 'text-yellow-600' : 'text-red-600' },
                  { label: 'GPA (Sem)', val: Number(selectedStudent.gpa).toFixed(2), col: 'text-blue-600' },
                  { label: 'Arrears', val: selectedStudent.arrears_details?.trim() ? 'Yes' : 'None', col: selectedStudent.arrears_details?.trim() ? 'text-red-600' : 'text-green-600' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.col}`}>{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">Personal Information</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" val={selectedStudent.email} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" val={selectedStudent.phone_number} />
                  <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" val={new Date(selectedStudent.date_of_birth).toLocaleDateString('en-IN')} />
                  <InfoRow icon={<Droplet className="w-4 h-4" />} label="Blood Group" val={selectedStudent.blood_group} />
                  <div className="col-span-2"><InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" val={selectedStudent.address} /></div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">Parent / Guardian</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <InfoRow icon={<Users className="w-4 h-4" />} label="Parent Name" val={selectedStudent.parent_name} />
                  <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Occupation" val={selectedStudent.parent_occupation} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Parent Phone" val={selectedStudent.parent_phone} />
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">Academic & Extra-curricular</div>
                <div className="p-4 space-y-3 text-sm">
                  {selectedStudent.arrears_details?.trim() && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Arrears Detail</p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">{selectedStudent.arrears_details}</div>
                    </div>
                  )}
                  <InfoRow icon={<Award className="w-4 h-4" />} label="Scholarship" val={selectedStudent.scholarship_details?.trim() || 'None'} />
                  <InfoRow icon={<Code className="w-4 h-4" />} label="Hackathons" val={selectedStudent.hackathon_details?.trim() || 'None'} />
                  <InfoRow icon={<Users className="w-4 h-4" />} label="Siblings" val={selectedStudent.siblings_details?.trim() || 'Not provided'} />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Assigned Mentor
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-purple-800 text-base">{selectedStudent.mentor?.full_name || 'Not Assigned'}</p>
                    <p className="text-purple-600 text-sm">{selectedStudent.mentor?.email || '—'}</p>
                  </div>
                  <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">MENTOR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-gray-800 font-medium text-sm">{val}</p>
      </div>
    </div>
  );
}