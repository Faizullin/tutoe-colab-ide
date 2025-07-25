import { PostListView } from "./_components/post-list-view";

export const metadata = {
  title: "Tutor Colab IDE - Posts",
  description: "Explore posts in the Tutor Colab IDE",
};

export default async function Page() {
  return <PostListView />;
}
