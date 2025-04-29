export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  location?: string;
  website?: string;
  followers?: string[]; // array of user IDs
  following?: string[]; // array of user IDs
  createdAt: string;
}