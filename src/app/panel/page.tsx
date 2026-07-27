import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function PanelIndexPage() {
  const profile = await requireProfile();

  if (profile.role === "student") redirect("/panel/ogrenci");
  redirect("/panel/kocluk");
}
