export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "job_request" | "job_update" | "system";
  relatedId?: string; // ID of the job or entity
  isRead: boolean;
  createdAt: string;
}