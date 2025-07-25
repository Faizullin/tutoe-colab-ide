import { type AppRouter } from "@/server/api/_app";
import { type inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type PublicPostListRouterOutputs = RouterOutputs["post"]["publicList"]["items"][number];
export type PublicPostGetBySlugRouterOutputs = RouterOutputs["post"]["publicGetBySlug"];