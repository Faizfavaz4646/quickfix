export interface Comment {
  _id: string;
  postId: string;
  userId: {
    _id: string;
    name: string;
    role: string;
    profilePic?: string; // Root level picture
    profile?: {          // Nested level picture
      profilePic?: string;
    };
  };
  text: string;
  createdAt: string;
}
