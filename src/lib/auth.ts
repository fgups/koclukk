import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Wrapped in React's cache() so the panel layout and the page it renders
// (both of which call requireProfile()) share one query per request instead
// of hitting Supabase twice for the same profile row.
export const requireProfile = cache(async (): Promise<Profile> => {
  const supabase = await createClient();
  // getSession() avoids an extra network round-trip to Supabase Auth on every
  // page render (middleware already gated the route); RLS re-checks the JWT
  // server-side for every actual data query regardless.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/giris");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/giris");
  }

  return profile as Profile;
});
