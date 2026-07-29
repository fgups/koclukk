import { NextResponse } from "next/server";
import { getUniversities } from "@/lib/yokatlas";

export async function GET() {
  try {
    const universities = await getUniversities();
    return NextResponse.json(universities);
  } catch {
    return NextResponse.json({ error: "YÖK Atlas verisi alınamadı." }, { status: 502 });
  }
}
