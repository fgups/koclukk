import { NextResponse } from "next/server";
import { searchPrograms, getNetHistory } from "@/lib/yokatlas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const universiteId = Number(searchParams.get("universiteId"));
  const birimGrupId = Number(searchParams.get("birimGrupId"));

  if (!universiteId || !birimGrupId) {
    return NextResponse.json({ error: "universiteId ve birimGrupId zorunlu." }, { status: 400 });
  }

  try {
    const { content } = await searchPrograms({ universiteId: [universiteId], birimGrupId: [birimGrupId], size: 1 });
    const current = content[0] ?? null;
    const universiteTuru = current?.universiteTuru === "VAKIF" ? "VAKIF" : "DEVLET";
    const netHistory = await getNetHistory(universiteId, birimGrupId, universiteTuru, current?.birimId);
    return NextResponse.json({ current, netHistory });
  } catch {
    return NextResponse.json({ error: "YÖK Atlas verisi alınamadı." }, { status: 502 });
  }
}
