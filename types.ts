export enum Status {
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  REJECTED = 'Rejected'
}

export interface Application {
  id: string;
  company: string;
  position: string;
  appliedDate: string;
  source: string;
  jobLink: string;
  status: Status;
  notes: string;
  reminderDate?: string;
  reminderNote?: string;
}

export interface Filter {
  search: string;
  status: Status | 'All';
  startDate: string;
  endDate: string;
}

export type Page = 'dashboard' | 'kanban' | 'settings' | 'jobfinder';
