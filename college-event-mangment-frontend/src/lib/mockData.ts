import { Event, CompanyVisit, Registration, User } from "./types";

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "AI & Robotics Summit 2025",
    description: "A deep dive into the future of autonomous systems and neural networks. Join us for keynote speeches from industry leaders and hands-on workshops.",
    category: "technical",
    date: "2025-03-15",
    time: "10:00 AM",
    venue: "Main Auditorium",
    eligibility: {
      department: ["CSE", "ECE", "IT"],
      year: ["2", "3", "4"],
    },
    maxCapacity: 200,
    registrationCount: 145,
    status: "active",
    createdBy: "Dr. Sarah Chen",
  },
  {
    id: "2",
    title: "Spring Cultural Fest",
    description: "Annual cultural extravaganza featuring music, dance, and art exhibitions from student talents.",
    category: "cultural",
    date: "2025-04-20",
    time: "05:00 PM",
    venue: "Open Air Theatre",
    eligibility: {
      department: ["CSE", "ECE", "ME", "CE", "EE", "IT", "Other"],
      year: ["1", "2", "3", "4"],
    },
    maxCapacity: 1000,
    registrationCount: 600,
    status: "active",
    createdBy: "Student Council",
  },
  {
    id: "3",
    title: "Inter-Department Cricket Tournament",
    description: "Battle of the branches on the cricket field. Register your team now.",
    category: "sports",
    date: "2025-03-25",
    time: "08:00 AM",
    venue: "University Ground",
    eligibility: {
      department: ["CSE", "ECE", "ME", "CE", "EE", "IT", "Other"],
      year: ["1", "2", "3", "4"],
    },
    maxCapacity: 100,
    registrationCount: 45,
    status: "active",
    createdBy: "Sports Committee",
  },
  {
    id: "4",
    title: "Resume Building Workshop",
    description: "Learn how to craft a perfect resume for upcoming placement drives.",
    category: "placement",
    date: "2025-02-28",
    time: "02:00 PM",
    venue: "Seminar Hall B",
    eligibility: {
      department: ["CSE", "IT", "ECE"],
      year: ["3", "4"],
    },
    maxCapacity: 60,
    registrationCount: 60,
    status: "completed",
    createdBy: "Placement Cell",
  },
];

export const MOCK_COMPANY_VISITS: CompanyVisit[] = [
  {
    id: "1",
    companyName: "TechNova Systems",
    jobRole: "Software Development Engineer",
    description: "Leading innovator in cloud computing solutions looking for fresh talent.",
    eligibility: {
      department: ["CSE", "IT"],
      year: ["4"],
      minCGPA: 8.0,
    },
    visitDate: "2025-05-10",
    visitTime: "09:00 AM",
    venue: "Placement Block",
    package: "12-15 LPA",
    applicationDeadline: "2025-05-01",
    status: "open",
    contactPerson: {
      name: "John Doe",
      email: "hr@technova.com",
      phone: "+1234567890",
    },
  },
  {
    id: "2",
    companyName: "BuildRight Infra",
    jobRole: "Junior Civil Engineer",
    description: "Construction giant working on smart city projects.",
    eligibility: {
      department: ["CE"],
      year: ["4"],
      minCGPA: 7.5,
    },
    visitDate: "2025-05-12",
    visitTime: "10:00 AM",
    venue: "Conference Room 1",
    package: "6-8 LPA",
    applicationDeadline: "2025-05-05",
    status: "open",
    contactPerson: {
      name: "Jane Smith",
      email: "recruitment@buildright.com",
      phone: "+9876543210",
    },
  },
];

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: "r1",
    eventId: "1",
    studentId: "s1",
    status: "registered",
  },
  {
    id: "r2",
    eventId: "4",
    studentId: "s1",
    status: "attended",
    feedback: {
      rating: 5,
      comment: "Very helpful session!",
    },
  },
];

export const MOCK_STUDENT: User = {
  id: "s1",
  name: "Alex Rivera",
  email: "alex.rivera@college.edu",
  role: "student",
  department: "CSE",
  year: "3",
  interests: ["technical", "placement"],
};

export const MOCK_ADMIN: User = {
  id: "a1",
  name: "Dr. Admin",
  email: "admin@college.edu",
  role: "admin",
  organization: "University Placement Cell",
  position: "Head Coordinator",
};
