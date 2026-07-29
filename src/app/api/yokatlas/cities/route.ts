import { NextResponse } from "next/server";
import { getCities } from "@/lib/yokatlas";

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json({ error: "YÖK Atlas verisi alınamadı." }, { status: 502 });
  }
}
