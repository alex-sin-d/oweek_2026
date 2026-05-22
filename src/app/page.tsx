import { redirect } from "next/navigation";

// Home tab is at /home to keep the routing clean; / redirects there.
// Preserve ?demo=1 so the guided demo flag survives the redirect.
export default async function Root({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const target = params.demo === "1" ? "/home?demo=1" : "/home";
  redirect(target);
}
