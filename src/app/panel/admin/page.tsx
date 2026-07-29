import { redirect } from "next/navigation";
import { CalendarClock, Shield, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { setRole, assignStudent, unassignStudent, setExamDate } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/panel");

  const supabase = await createClient();
  const [{ data: allProfiles }, { data: assignments }, { data: examDateSetting }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("coach_students").select("coach_id, student_id"),
    supabase.from("app_settings").select("value").eq("key", "exam_date").maybeSingle(),
  ]);

  const currentExamDate = (examDateSetting?.value as string | null) ?? "";
  const profiles = (allProfiles ?? []) as Profile[];
  const coaches = profiles.filter((p) => p.role === "coach" || p.role === "admin");
  const students = profiles.filter((p) => p.role === "student");
  const assignedPairs = new Set((assignments ?? []).map((a) => `${a.coach_id}:${a.student_id}`));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Yönetim</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kullanıcı rolleri, koç-öğrenci atamaları ve sınav ayarları.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CalendarClock className="h-5 w-5 text-indigo-600" />
          <div>
            <CardTitle>Sınav Ayarları</CardTitle>
            <CardDescription>YKS tarihi, öğrenci panelindeki geri sayımı besler.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={setExamDate} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">YKS Sınav Tarihi</label>
              <Input name="exam_date" type="date" defaultValue={currentExamDate} className="w-48" required />
            </div>
            <Button type="submit">Kaydet</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Users2 className="h-5 w-5 text-indigo-600" />
          <div>
            <CardTitle>Kullanıcılar</CardTitle>
            <CardDescription>Rol değiştirmek için listeden seç ve kaydet.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Kullanıcı</th>
                  <th className="pb-2 pr-4 font-medium">Rol</th>
                  <th className="pb-2 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profiles.map((p) => {
                  const initials = (p.full_name || "?")
                    .trim()
                    .split(/\s+/)
                    .map((c) => c[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <tr key={p.id}>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2.5">
                          {p.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.avatar_url}
                              alt={p.full_name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                              {initials}
                            </span>
                          )}
                          <span className="font-medium text-slate-900 dark:text-slate-100">{p.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={p.role === "admin" ? "indigo" : p.role === "coach" ? "success" : "neutral"}>
                          {p.role}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <form action={setRole} className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={p.id} />
                          <Select name="role" defaultValue={p.role} className="h-8 w-32 text-xs">
                            <option value="student">student</option>
                            <option value="coach">coach</option>
                            <option value="admin">admin</option>
                          </Select>
                          <Button type="submit" size="sm" variant="outline">
                            Kaydet
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Shield className="h-5 w-5 text-indigo-600" />
          <div>
            <CardTitle>Koç &ndash; Öğrenci Atamaları</CardTitle>
            <CardDescription>Bir koça hangi öğrencilerin bağlı olduğunu yönet.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={assignStudent} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Koç</label>
              <Select name="coach_id" className="w-48" required>
                <option value="" disabled defaultValue="">
                  Koç seç
                </option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.id.slice(0, 8)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Öğrenci</label>
              <Select name="student_id" className="w-48" required>
                <option value="" disabled defaultValue="">
                  Öğrenci seç
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.id.slice(0, 8)}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Ata</Button>
          </form>

          <div className="space-y-3">
            {coaches.map((coach) => {
              const assignedStudents = students.filter((s) =>
                assignedPairs.has(`${coach.id}:${s.id}`),
              );
              if (assignedStudents.length === 0) return null;
              return (
                <div key={coach.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {coach.full_name || coach.id.slice(0, 8)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {assignedStudents.map((s) => (
                      <form key={s.id} action={unassignStudent} className="flex items-center gap-1">
                        <input type="hidden" name="coach_id" value={coach.id} />
                        <input type="hidden" name="student_id" value={s.id} />
                        <Badge variant="neutral">{s.full_name || s.id.slice(0, 8)}</Badge>
                        <button
                          type="submit"
                          className="text-xs text-red-500 hover:underline"
                          aria-label={`${s.full_name} atamasını kaldır`}
                        >
                          kaldır
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
