export interface Post {
  id: string;
  title: string;
  description: string;
  vibes: string[];

  imageUrls: string[];

  createdAt: string;

  user: {
    id: string;
    name: string;
  };

  _count: {
    likes: number;
    comments: number;
  };
}