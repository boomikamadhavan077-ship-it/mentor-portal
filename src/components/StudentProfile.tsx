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
  const [downloading, setDownloading] = useState(false);

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

  const downloadPDF = async () => {
    if (!student) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = 0;

      const addPage = () => { doc.addPage(); y = margin; };
      const checkPageBreak = (needed = 10) => { if (y + needed > pageHeight - margin) addPage(); };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(14);
        doc.setFillColor(30, 64, 175);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 4, y + 5.5);
        doc.setTextColor(0, 0, 0);
        y += 12;
      };

      const addRow = (label: string, value: string, col2Label?: string, col2Value?: string) => {
        checkPageBreak(12);
        const colWidth = col2Label ? contentWidth / 2 - 2 : contentWidth;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(label, margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        const lines = doc.splitTextToSize(value || '—', colWidth - 4);
        doc.text(lines, margin + 2, y + 4.5);
        if (col2Label && col2Value !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(80, 80, 80);
          doc.text(col2Label, margin + contentWidth / 2 + 4, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(20, 20, 20);
          const lines2 = doc.splitTextToSize(col2Value || '—', colWidth - 4);
          doc.text(lines2, margin + contentWidth / 2 + 4, y + 4.5);
        }
        y += Math.max(lines.length, 1) * 4.5 + 5;
      };

      // HEADER
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 32, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('STUDENT PROFILE REPORT', pageWidth / 2, 13, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(200, 220, 255);
      doc.text('ACT College of Engineering — Mentor Portal', pageWidth / 2, 21, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 27, { align: 'center' });
      y = 40;

      // STUDENT NAME BANNER
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');
      doc.setDrawColor(147, 197, 253);
      doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(30, 64, 175);
      doc.text(student.student_name, margin + 6, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`Reg No: ${student.register_number}`, margin + 6, y + 13);
      y += 24;

      // ACADEMIC SUMMARY BOXES
      const boxW = (contentWidth - 8) / 3;
      const boxes = [
        { label: 'CGPA', value: student.cgpa.toFixed(2), sub: 'Cumulative GPA', color: student.cgpa >= 7.5 ? [22, 163, 74] : student.cgpa >= 6 ? [202, 138, 4] : [220, 38, 38] },
        { label: 'GPA (SEM)', value: student.gpa.toFixed(2), sub: 'Current Semester', color: student.gpa >= 7.5 ? [22, 163, 74] : student.gpa >= 6 ? [202, 138, 4] : [220, 38, 38] },
        { label: 'ARREARS', value: student.arrears_details?.trim() ? 'Active' : 'Clear', sub: student.arrears_details?.trim() ? student.arrears_details.substring(0, 20) : 'No arrears', color: student.arrears_details?.trim() ? [220, 38, 38] : [22, 163, 74] },
      ];
      boxes.forEach((box, i) => {
        const bx = margin + i * (boxW + 4);
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(bx, y, boxW, 22, 2, 2, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(bx, y, boxW, 22, 2, 2, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text(box.label, bx + boxW / 2, y + 5.5, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(box.color[0] as number, box.color[1] as number, box.color[2] as number);
        doc.text(box.value, bx + boxW / 2, y + 14, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text(box.sub, bx + boxW / 2, y + 19, { align: 'center' });
      });
      y += 28;

      // SECTIONS
      drawSectionHeader('PERSONAL INFORMATION');
      addRow('Date of Birth', new Date(student.date_of_birth).toLocaleDateString('en-IN'), 'Blood Group', student.blood_group);
      addRow('Email Address', student.email, 'Phone Number', student.phone_number);
      addRow('Address', student.address);
      y += 2;

      drawSectionHeader('PARENT / GUARDIAN');
      addRow('Parent Name', student.parent_name, 'Occupation', student.parent_occupation);
      addRow('Contact Number', student.parent_phone);
      y += 2;

      drawSectionHeader('ACADEMIC DETAILS');
      addRow('Scholarship', student.scholarship_details || 'None', 'Hackathons', student.hackathon_details || 'None');
      addRow('Siblings', student.siblings_details || 'Not provided');

      if (student.arrears_details?.trim()) {
        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text('Arrear Subjects', margin + 2, y);
        y += 4.5;
        doc.setFillColor(254, 242, 242);
        const arrearLines = doc.splitTextToSize(student.arrears_details, contentWidth - 8);
        doc.rect(margin, y, contentWidth, arrearLines.length * 4.5 + 4, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(185, 28, 28);
        doc.text(arrearLines, margin + 4, y + 4);
        y += arrearLines.length * 4.5 + 8;
      }

      // FOOTER on every page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text('ACT College — Mentor Portal | Confidential', margin, pageHeight - 7);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
      }

      doc.save(`${student.register_number}_${student.student_name.replace(/\s+/g, '_')}_Profile.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
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
              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Generating PDF...' : 'Download PDF'}
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