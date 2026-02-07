import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client"; // <-- use batch link (recommended)
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    throw new Error(
      "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
    );
  }
  return url;
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});




