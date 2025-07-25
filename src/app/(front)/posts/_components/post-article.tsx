"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Image from "next/image";
import BackButton from "./back-button";
import RenderContent from "./render-content";
import { PublicPostGetBySlugRouterOutputs } from "./types";

export default function PostArticle({
  post,
}: {
  post: PublicPostGetBySlugRouterOutputs;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {/* back link */}
        <BackButton />

        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="relative w-full overflow-hidden rounded-2xl border border-border">
            {post.thumbnailImage?.url && (
              <Image
                src={post.thumbnailImage.url}
                alt={post.title}
                width={1200}
                height={600}
                className="h-72 w-full object-cover sm:h-80 lg:h-96"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
            <h1 className="absolute bottom-6 left-6 right-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </div>

          {/* meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* <span className="flex items-center gap-1">
                            <User size={16} /> {post.author}
                        </span> */}
            <span className="flex items-center gap-1">
              <CalendarDays size={16} /> {post.createdAt.toLocaleDateString()}
            </span>
            {/* {post.tags.map((t: any) => (
                            <span
                                key={t}
                                className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary"
                            >
                                <Tag size={12} /> {t}
                            </span>
                        ))} */}
          </div>
        </motion.div>

        {/* body */}
        <motion.section
          className="prose prose-invert prose-pre:bg-muted prose-a:text-primary prose-code:text-primary mt-12 max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <RenderContent md={post.content || ""} />
        </motion.section>
      </main>
    </div>
  );
}
