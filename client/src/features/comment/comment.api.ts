import { api } from "@/src/services/api";

type Reply = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};


export const getComments = async (postId: string) => {
  const res = await api.get(`/comments/${postId}`);
  return res.data;
};

export const addComment = async (payload: {
  postId: string;
  content: string;
  parentId?: string;
}) => {
  const res = await api.post("/comments", payload);
  return res.data;
};

export const editComment = async (data: any) => {
  return api.put("/comments", data);
};

export const deleteComment = async (commentId: string) => {
  return api.delete("/comments", { data: { commentId } });
};

export const getReplies = async (
  commentId: string,
  page = 1
): Promise<Paginated<Reply>> => {

  const res = await api.get<Paginated<Reply>>(
    `/comments/${commentId}/replies`,
    { params: { page } }
  );
  return res.data;
};