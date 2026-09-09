export enum ComplaintStatus {
  SUBMITTED = 'submitted',
  TRIAGED = 'triaged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

export enum ComplaintUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SentimentLabel {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

export enum SubTicketStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum PollStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CLOSED = 'closed',
}

export enum NotificationType {
  TICKET_CREATED = 'ticket_created',
  STATUS_UPDATED = 'status_updated',
  SUB_TICKET_ASSIGNED = 'sub_ticket_assigned',
  POLL_PUBLISHED = 'poll_published',
  SLA_BREACH_WARNING = 'sla_breach_warning',
  COMMENT_ADDED = 'comment_added',
  UPVOTE_MILESTONE = 'upvote_milestone',
}

export const DEFAULT_CATEGORIES = [
  'Hostel & Residential Life',
  'Cafeteria & Food Services',
  'IT Infrastructure & Wi-Fi',
  'Classroom & Academic Labs',
  'Library Services',
  'Campus Security & Safety',
  'Transport & Parking',
  'Sanitation & Environment',
  'Sports & Gymnasium',
  'Administration & Fees',
];
