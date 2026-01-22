export interface Author {
  _id: string;
  name: string;
  role: "client" | "worker";
  profile?: {
    profilePic?: string;
  };
}

export interface Post {
  _id: string;
  authorId: Author; // Populated by backend
  authorRole: "client" | "worker";
  postType: "job" | "portfolio";
  title?: string;
  content: string; // Backend calls it 'content', not 'description'
  images: string[];
  likes: string[]; // Array of user IDs
  createdAt: string;
  updatedAt: string;
}