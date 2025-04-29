export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: string;
  updatedAt?: string;
  hashtags: string[];
  likes: string[]; // array of user IDs
  bookmarkedBy?: string[]; // array of user IDs
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: string;
  likes: string[]; 
}