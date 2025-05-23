export type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: Author;
};

type Author = {
  id: string;
  email: string;
  name: string;
};
