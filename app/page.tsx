import { redirect } from "next/navigation";

// Root "/" → redirect to dashboard (middleware handles auth)
export default function Home() {
  redirect("/dashboard");
}
