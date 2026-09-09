import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model.js';
import { Department } from '../models/Department.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { SubTicket } from '../models/SubTicket.model.js';
import { Poll } from '../models/Poll.model.js';
import { PollResponse } from '../models/PollResponse.model.js';
import { Notification } from '../models/Notification.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { UserRole } from '../constants/roles.js';
import {
  ComplaintStatus,
  ComplaintUrgency,
  SentimentLabel,
  SubTicketStatus,
  PollStatus,
  NotificationType,
} from '../constants/complaint.js';
import { generateTrackingCode } from '../utils/codeGenerator.js';
import { ENV } from '../config/env.js';

dotenv.config();

async function seed() {
  console.log('Connecting to database for seeding...');
  await mongoose.connect(ENV.MONGO_URI);
  console.log('Connected to MongoDB.');

  // Clear existing collections
  console.log('Clearing old collections...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
    SubTicket.deleteMany({}),
    Poll.deleteMany({}),
    PollResponse.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('Seeding Departments...');
  const departments = await Department.create([
    {
      name: 'Hostel & Residential Life',
      code: 'HOSTEL',
      description: 'Hostel rooms, residential water, plumbing, geyser, and warden operations.',
      categories: ['Hostel & Residential Life', 'Sanitation & Environment'],
      slaHoursDefault: 24,
      contactEmail: 'hostel-care@campus.edu',
      buildingLocation: 'Central Student Welfare Centre, Room 102',
    },
    {
      name: 'IT Infrastructure & Wi-Fi',
      code: 'IT_INFRA',
      description: 'Campus-wide Wi-Fi networks, lab workstations, faculty portal, and server infrastructure.',
      categories: ['IT Infrastructure & Wi-Fi', 'Classroom & Academic Labs'],
      slaHoursDefault: 12,
      contactEmail: 'network-helpdesk@campus.edu',
      buildingLocation: 'Computing Centre, Ground Floor',
    },
    {
      name: 'Cafeteria & Food Services',
      code: 'FOOD_SERVICES',
      description: 'Student dining halls, hygiene compliance, food quality, and mess committees.',
      categories: ['Cafeteria & Food Services'],
      slaHoursDefault: 24,
      contactEmail: 'canteen-audit@campus.edu',
      buildingLocation: 'Student Activity Centre (SAC)',
    },
    {
      name: 'Campus Estate & Electrical',
      code: 'ESTATE',
      description: 'Civil maintenance, electrical backup generators, roads, streetlights, and landscaping.',
      categories: ['Sanitation & Environment', 'Transport & Parking'],
      slaHoursDefault: 48,
      contactEmail: 'estate-office@campus.edu',
      buildingLocation: 'Administrative Block North',
    },
  ]);

  const hostelDept = departments[0];
  const itDept = departments[1];
  const foodDept = departments[2];
  const estateDept = departments[3];

  console.log('Seeding Users with RBAC roles...');
  const password = 'Password123!';

  // 1. Super Admin
  const superAdmin = await User.create({
    name: 'Campus Director (SuperAdmin)',
    email: 'superadmin@campus.edu',
    password,
    role: UserRole.SUPER_ADMIN,
    phoneNumber: '+1-555-0199',
  });

  // 2. Management Admin
  const managementAdmin = await User.create({
    name: 'Dean of Student Affairs',
    email: 'management@campus.edu',
    password,
    role: UserRole.MANAGEMENT,
    phoneNumber: '+1-555-0198',
  });

  // 3. Department Admins
  const hostelAdmin = await User.create({
    name: 'Chief Warden (Hostel Admin)',
    email: 'hostel.admin@campus.edu',
    password,
    role: UserRole.DEPT_ADMIN,
    departmentId: hostelDept._id,
    phoneNumber: '+1-555-0101',
  });

  const itAdmin = await User.create({
    name: 'Systems Manager (IT Admin)',
    email: 'it.admin@campus.edu',
    password,
    role: UserRole.DEPT_ADMIN,
    departmentId: itDept._id,
    phoneNumber: '+1-555-0102',
  });

  const foodAdmin = await User.create({
    name: 'Food Inspector (Canteen Admin)',
    email: 'food.admin@campus.edu',
    password,
    role: UserRole.DEPT_ADMIN,
    departmentId: foodDept._id,
    phoneNumber: '+1-555-0103',
  });

  // Link department heads
  await Department.findByIdAndUpdate(hostelDept._id, { headOfDepartment: hostelAdmin._id });
  await Department.findByIdAndUpdate(itDept._id, { headOfDepartment: itAdmin._id });
  await Department.findByIdAndUpdate(foodDept._id, { headOfDepartment: foodAdmin._id });

  // 4. Students
  const student1 = await User.create({
    name: 'Dhanya Shree',
    email: 'dhanyashree@campus.edu',
    password,
    role: UserRole.STUDENT,
    studentId: 'CS2023-049',
    phoneNumber: '+1-555-0211',
  });

  const student2 = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul.sharma@campus.edu',
    password,
    role: UserRole.STUDENT,
    studentId: 'EE2023-112',
    phoneNumber: '+1-555-0212',
  });

  const student3 = await User.create({
    name: 'Ananya Verma',
    email: 'ananya.verma@campus.edu',
    password,
    role: UserRole.STUDENT,
    studentId: 'ME2024-008',
    phoneNumber: '+1-555-0213',
  });

  console.log('Seeding Complaints across categories & statuses...');

  const c1 = await Complaint.create({
    trackingCode: generateTrackingCode('CP'),
    title: 'No water supply on 3rd floor washrooms in Hostel 4',
    description: 'Since yesterday evening the overhead tank pump seems to have failed. There is zero running water on floor 3.',
    createdBy: student1._id,
    isAnonymous: false,
    departmentId: hostelDept._id,
    category: 'Hostel & Residential Life',
    mlClassificationConfidence: 0.94,
    urgency: ComplaintUrgency.HIGH,
    urgencyScore: 0.85,
    sentiment: {
      label: SentimentLabel.NEGATIVE,
      score: -0.76,
      aspects: ['water supply', 'pump failure', 'hostel 4'],
    },
    location: {
      campusBlock: 'Hostel Block 4',
      roomOrArea: '3rd Floor East Wing',
      landmark: 'Near Staircase B',
    },
    status: ComplaintStatus.IN_PROGRESS,
    assignedResolver: hostelAdmin._id,
    upvotes: [student2._id, student3._id],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
    comments: [
      {
        authorId: hostelAdmin._id,
        authorName: 'Chief Warden',
        authorRole: 'dept_admin',
        text: 'Plumbing contractor notified and electric pump relay replacement is dispatched.',
        isOfficialUpdate: true,
        createdAt: new Date(),
      },
    ],
  });

  const c2 = await Complaint.create({
    trackingCode: generateTrackingCode('CP'),
    title: 'High latency and frequent Wi-Fi disconnects in Central Library',
    description: 'Access Point AP-LIB-02 keeps rejecting device connections during evening peak study hours.',
    createdBy: student2._id,
    isAnonymous: false,
    departmentId: itDept._id,
    category: 'IT Infrastructure & Wi-Fi',
    mlClassificationConfidence: 0.91,
    urgency: ComplaintUrgency.MEDIUM,
    urgencyScore: 0.62,
    sentiment: {
      label: SentimentLabel.NEGATIVE,
      score: -0.45,
      aspects: ['wifi disconnects', 'high latency', 'library'],
    },
    location: {
      campusBlock: 'Central Library',
      roomOrArea: '1st Floor Silent Reading Hall',
      landmark: 'Opposite Digital Reference Desk',
    },
    status: ComplaintStatus.SUBMITTED,
    upvotes: [student1._id, student3._id],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
  });

  const c3 = await Complaint.create({
    trackingCode: generateTrackingCode('CP'),
    title: 'Undercooked food and unhygienic tray cleaning at North Canteen',
    description: 'Multiple students noticed unclean cutlery and undercooked lentils served during lunch today.',
    createdBy: student3._id,
    isAnonymous: true,
    departmentId: foodDept._id,
    category: 'Cafeteria & Food Services',
    mlClassificationConfidence: 0.96,
    urgency: ComplaintUrgency.HIGH,
    urgencyScore: 0.82,
    sentiment: {
      label: SentimentLabel.NEGATIVE,
      score: -0.88,
      aspects: ['undercooked food', 'cutlery hygiene', 'north canteen'],
    },
    location: {
      campusBlock: 'North Dining Complex',
      roomOrArea: 'Main Serving Counter',
    },
    status: ComplaintStatus.TRIAGED,
    assignedResolver: foodAdmin._id,
    upvotes: [student1._id, student2._id],
    upvoteCount: 2,
    slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
  });

  const c4 = await Complaint.create({
    trackingCode: generateTrackingCode('CP'),
    title: 'Streetlight pole #14 cable sparking near sports pavilion',
    description: 'High voltage spark noticed when rain started. Exposed insulation on underground junction box.',
    createdBy: student1._id,
    isAnonymous: false,
    departmentId: estateDept._id,
    category: 'Campus Security & Safety',
    mlClassificationConfidence: 0.98,
    urgency: ComplaintUrgency.CRITICAL,
    urgencyScore: 0.96,
    sentiment: {
      label: SentimentLabel.NEGATIVE,
      score: -0.92,
      aspects: ['exposed cable', 'sparking', 'danger'],
    },
    location: {
      campusBlock: 'Athletic Track & Pavilion',
      landmark: 'Light Pole 14',
    },
    status: ComplaintStatus.RESOLVED,
    resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    resolutionSummary: 'Emergency maintenance crew isolated breaker line and replaced waterproof junction enclosure.',
    upvotes: [student2._id],
    upvoteCount: 1,
  });

  console.log('Seeding Sub-Tickets for multi-department resolution...');
  await SubTicket.create({
    parentComplaintId: c1._id,
    title: 'Replace motor starter capacitor on pump line B',
    description: 'Mechanical pump is stalling due to degraded starter capacitor.',
    assignedDepartmentId: estateDept._id,
    createdBy: hostelAdmin._id,
    status: SubTicketStatus.IN_PROGRESS,
    priority: 'high',
  });

  console.log('Seeding Campus Opinion Mining Polls...');
  const poll1 = await Poll.create({
    title: 'Should campus night canteen timings be extended until 2:00 AM?',
    description: 'Exam preparation periods have increased student demand for late night food options and tea stalls.',
    category: 'Cafeteria & Food Services',
    departmentId: foodDept._id,
    createdBy: managementAdmin._id,
    status: PollStatus.ACTIVE,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalVotes: 3,
    options: [
      { text: 'Yes, extend until 2:00 AM daily', voteCount: 2 },
      { text: 'Yes, but only on weekends and during exam weeks', voteCount: 1 },
      { text: 'No, current 11:30 PM closing is sufficient', voteCount: 0 },
    ],
    sentimentSummary: {
      positivePercentage: 80,
      neutralPercentage: 20,
      negativePercentage: 0,
    },
  });

  // Seed Poll Responses
  await PollResponse.create([
    {
      pollId: poll1._id,
      userId: student1._id,
      selectedOptionId: poll1.options[0]._id,
      userRole: 'student',
      feedbackText: 'Having coffee available late night during midterms would be a huge help.',
      sentimentScore: 0.65,
    },
    {
      pollId: poll1._id,
      userId: student2._id,
      selectedOptionId: poll1.options[0]._id,
      userRole: 'student',
      feedbackText: 'Great initiative, highly needed for library study groups.',
      sentimentScore: 0.78,
    },
    {
      pollId: poll1._id,
      userId: student3._id,
      selectedOptionId: poll1.options[1]._id,
      userRole: 'student',
      feedbackText: 'Exam weeks extension makes sense to balance canteen workers shifts.',
      sentimentScore: 0.25,
    },
  ]);

  console.log('Seeding Notifications & Audit logs...');
  await Notification.create({
    recipientId: student1._id,
    title: `Ticket In Progress: ${c1.trackingCode}`,
    message: 'Chief Warden updated status to IN_PROGRESS. Plumbers have been dispatched.',
    type: NotificationType.STATUS_UPDATED,
    referenceId: c1._id,
  });

  await AuditLog.create({
    entityType: 'complaint',
    entityId: c1._id,
    performedBy: hostelAdmin._id,
    performedByName: 'Chief Warden',
    performedByRole: UserRole.DEPT_ADMIN,
    action: 'STATUS_TRANSITION',
    previousState: { status: 'submitted' },
    newState: { status: 'in_progress' },
    metadata: { trackingCode: c1.trackingCode },
  });

  console.log('===========================================================');
  console.log(' CampusPulse Database Seeding Finished Successfully!');
  console.log(' Default User Credentials:');
  console.log(' - Super Admin:       superadmin@campus.edu     / Password123!');
  console.log(' - Management Admin:  management@campus.edu     / Password123!');
  console.log(' - Hostel Admin:      hostel.admin@campus.edu   / Password123!');
  console.log(' - IT Admin:          it.admin@campus.edu       / Password123!');
  console.log(' - Food Admin:        food.admin@campus.edu     / Password123!');
  console.log(' - Student:           dhanyashree@campus.edu    / Password123!');
  console.log(' - Student:           rahul.sharma@campus.edu   / Password123!');
  console.log('===========================================================');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
