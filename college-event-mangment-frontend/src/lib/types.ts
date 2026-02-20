export type Department = "CSE" | "ECE" | "ME" | "CE" | "EE" | "IT" | "Other";
export type Year = "1" | "2" | "3" | "4";
export type EventCategory = "technical" | "cultural" | "sports" | "placement";
export type UserRole = "student" | "admin";

export interface Student {
  id: string;
  name: string;
  email: string;
  role: "student";
  department: Department;
  year: Year;
  interests: string[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin";
  organization: string;
  position: string;
}

export type User = Student | Admin;

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  eligibility: {
    department: Department[];
    year: Year[];
  };
  maxCapacity: number;
  registrationCount: number;
  status: "active" | "cancelled" | "completed";
  createdBy: string; // name
}

export interface CompanyVisit {
  id: string;
  companyName: string;
  jobRole: string;
  description: string;
  eligibility: {
    department: Department[];
    year: Year[];
    minCGPA: number;
  };
  visitDate: string;
  visitTime: string;
  venue: string;
  package: string;
  applicationDeadline: string;
  status: "open" | "closed";
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  status: "registered" | "attended" | "cancelled";
  feedback?: {
    rating: number;
    comment: string;
  };
}
