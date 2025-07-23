import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Post } from "@/generated/prisma";
import { trpcCaller } from "@/server/api/caller";
import { notFound } from "next/navigation";
import PostArticle from "../_components/post-article";

// Add metadata export for dynamic title
import type { Metadata } from "next";

async function getPost(slug: string): Promise<Post | null> {
  const post = await trpcCaller.post.publicGetBySlug(slug);
  if (!post) {
    notFound();
  }
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
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
