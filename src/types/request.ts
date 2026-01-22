export interface JobRequest {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
  };
  workerId: string;
  title: string;
  description: string;
  address: string;
  scheduledDate: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}