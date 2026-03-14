export interface Mentor {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  mentor_id: string;
  student_name: string;
  register_number: string;
  phone_number: string;
  email: string;
  date_of_birth: string;
  blood_group: string;
  address: string;
  parent_name: string;
  parent_occupation: string;
  parent_phone: string;
  siblings_details: string;
  scholarship_details: string;
  hackathon_details: string;
  arrears_details: string;
  cgpa: number;
  gpa: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  studentsWithArrears: number;
  lowCGPAStudents: number;
  scholarshipStudents: number;
}
