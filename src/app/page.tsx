import { redirect } from "next/navigation";

// Home tab is at /home to keep the routing clean; / redirects there
export default function Root() {
  redirect("/home");
}
