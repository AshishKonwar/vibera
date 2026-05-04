// filepath: server/src/types/post.types.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
}