import { type AppRouter } from "@/server/api/_app";
import { type inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AdminPostDetailRouterOutputs = RouterOutputs["post"]["adminDetail"];