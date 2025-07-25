"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { trpc } from "@/utils/trpc";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { PublicPostListRouterOutputs } from "./types";
import Link from "next/link";
import { useMemo } from "react";

/* ------------------------------------------------------------------ */
/* 2.  Individual card                                                */
/* ------------------------------------------------------------------ */

function PostCard({ post }: { post: PublicPostListRouterOutputs }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block p-0 m-0">
      <Card className="group hover:shadow-md transition-shadow pt-0" >
        {/* Thumbnail Image */}
        {post.thumbnailImage && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={post.thumbnailImage.url || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 mb-2">
                {post.title}
              </CardTitle>
              {post.excerpt && <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {/* {post.owner && (
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src="/placeholder.svg?height=20&width=20" />
                  <AvatarFallback className="text-xs">
                    {post.owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{post.owner.name}</span>
              </div>
            )} */}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">
              Published
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


export function PostListView() {
  const loadPostsQuery = trpc.post.publicList.useQuery()
  const posts = useMemo(() => {
    return (loadPostsQuery.data?.items || []).sort((a, b) => {
      if(b.index === null && a.index === null) return 0;
      if(b.index === null) return 1;
      if(a.index === null) return -1;
      return a.index - b.index;
    });
  }, [loadPostsQuery.data]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <Header />

      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground mt-2">Manage your blog posts and articles</p>
          </div>

          {/* Posts Content */}
          {loadPostsQuery.isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No posts found.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
