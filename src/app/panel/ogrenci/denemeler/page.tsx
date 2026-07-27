import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { MockExamForm } from "./mock-exam-form";
import { NetTrendChart } from "@/components/charts/net-trend-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MockExam, Subject } from "@/lib/types";

export default async function DenemelerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: subjects }, { data: exams }] = await Promise.all([
    supabase.from("subjects").select("id, name, exam_type").order("exam_type").order("name"),
    supabase
      .from("mock_exams")
      .select("*")
      .eq("student_id", profile.id)
      .order("exam_date"),
  ]);

  const mockExams = (exams ?? []) as MockExam[];
  const chartData = mockExams.map((e) => ({
    label: new Date(e.exam_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
    net: e.total_net,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Target className="h-6 w-6 text-indigo-600" />
          Denemelerim
        </h1>
        <p className="mt-1 text-sm text-slate-500">Deneme sınavı net sonuçlarını kaydet, gelişimini izle.</p>
      </div>

      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Deneme kaydedildi.</p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Deneme Ekle</CardTitle>
            <CardDescription>Sınav türünü seçince ilgili dersler otomatik listelenir.</CardDescription>
          </CardHeader>
          <CardContent>
            <MockExamForm subjects={(subjects ?? []) as Subject[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Gelişimi</CardTitle>
            <CardDescription>Zaman içindeki toplam net değişimin.</CardDescription>
          </CardHeader>
          <CardContent>
            <NetTrendChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geçmiş Denemeler</CardTitle>
        </CardHeader>
        <CardContent>
          {mockExams.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz deneme eklemedin.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...mockExams].reverse().map((exam) => (
                <li key={exam.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{exam.exam_name}</p>
                    <p className="text-slate-500">
                      {exam.exam_type} · {new Date(exam.exam_date).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Badge variant="indigo">{exam.total_net} net</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
