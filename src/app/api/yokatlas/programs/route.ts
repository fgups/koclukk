import { NextResponse } from "next/server";
import { getProgramGroups } from "@/lib/yokatlas";

export async function GET() {
  try {
    const programs = await getProgramGroups();
    return NextResponse.json(programs);
  } catch {
    return NextResponse.json({ error: "YÖK Atlas verisi alınamadı." }, { status: 502 });
  }
}
