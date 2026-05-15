import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import CRMLayout from "./CRMLayoutClient";

export default async function AlphaCRMLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/");
  return <CRMLayout session={session}>{children}</CRMLayout>;
}
