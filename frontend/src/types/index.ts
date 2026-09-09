export type UserRole = 'student' | 'dept_admin' | 'management' | 'superadmin';

export type ComplaintUrgency = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'submitted'
  | 'triaged'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'escalated';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  avatar?: string;
  phone?: string;
  hostelBlock?: string;
  roomNumber?: string;
  createdAt?: string;
}

export interface ComplaintComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  category: string;
  urgency: ComplaintUrgency;
  urgencyScore: number;
  status: ComplaintStatus;
  location: string;
  studentId: string;
  studentName: string;
  departmentId?: string;
  departmentName?: string;
  sentiment?: SentimentLabel;
  sentimentScore?: number;
  upvotes: number;
  upvotedBy?: string[];
  tags?: string[];
  aiSummary?: string;
  aiClassificationConfidence?: number;
  subTickets?: SubTicket[];
  comments?: ComplaintComment[];
  slaBreach?: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubTicket {
  id: string;
  complaintId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  completedAt?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  options: PollOption[];
  status: 'active' | 'closed' | 'expired';
  totalVotes: number;
  expiresAt: string;
  createdBy: string;
  createdByName?: string;
  hasVoted?: boolean;
  userVotedOptionId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'ticket_created'
    | 'status_updated'
    | 'sub_ticket_assigned'
    | 'poll_published'
    | 'sla_breach_warning'
    | 'comment_added'
    | 'upvote_milestone';
  title: string;
  message: string;
  read: boolean;
  complaintId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  headEmail: string;
  activeTicketsCount: number;
  slaResolutionRate: number;
}
