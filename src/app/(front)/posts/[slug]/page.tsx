import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { trpcCaller } from "@/server/api/caller";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostArticle from "../_components/post-article";
import type { PublicPostGetBySlugRouterOutputs } from "../_components/types";

async function getPost(
  slug: string
): Promise<PublicPostGetBySlugRouterOutputs | null> {
  const post = await trpcCaller.post.publicGetBySlug(slug);
  if (!post) {
    notFound();
  }
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    // Optionally add description, openGraph, etc.
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getPost((await params).slug);

  if (!post) notFound();

  // const router = useRouter();

  return (
    <>
      <Header />
      <main>
        <PostArticle post={post} />
      </main>
      <Footer />
    </>
  );
}
