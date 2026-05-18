import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import HoleritesPage from "@/components/holerites/HoleritesPage";

export const dynamic = "force-dynamic";

export default async function HolertiesRoute() {
  const session = await auth();
  if (!session) redirect("/login");
  return <HoleritesPage />;
}
