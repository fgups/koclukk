import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GRADE_LEVEL_LABELS } from "@/lib/types";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const initials = (profile.full_name || "?")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
            <UserCircle className="h-5 w-5" />
          </span>
          Profilim
        </h1>
        <p className="mt-1 text-sm text-slate-500">Bilgilerini güncel tut.</p>
      </div>

      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Profilin güncellendi.
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Kişisel Bilgiler</CardTitle>
          <CardDescription>Fotoğrafın ve bilgilerin koçun/öğrencilerinle paylaşılır.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-5">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                  {initials}
                </span>
              )}
              <div>
                <Label htmlFor="avatar">Profil Fotoğrafı</Label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>
            </div>

            <div>
              <Label>E-posta</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Ad Soyad</Label>
                <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone ?? ""}
                  placeholder="05xx xxx xx xx"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Doğum Tarihi</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  defaultValue={profile.birth_date ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="school">Lise / Okul</Label>
                <Input id="school" name="school" defaultValue={profile.school ?? ""} />
              </div>
            </div>

            {profile.role === "student" && (
              <div>
                <Label htmlFor="grade_level">Kaçıncı Sınıf</Label>
                <Select id="grade_level" name="grade_level" defaultValue={profile.grade_level ?? ""}>
                  <option value="">Seçilmedi</option>
                  {Object.entries(GRADE_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="bio">Kısa Açıklama</Label>
              <Textarea
                id="bio"
                name="bio"
                maxLength={500}
                defaultValue={profile.bio ?? ""}
                placeholder="Kendinden kısaca bahset..."
              />
            </div>

            <Button type="submit">Kaydet</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
