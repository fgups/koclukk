// YÖK Atlas'ın resmi JSON API'sine ince bir istemci katmanı.
// Kimlik doğrulama gerektirmiyor; tüm veriler canlı ve resmi kaynaktan.
const BASE_URL = "https://yokatlas.yok.gov.tr";
const HEADERS = { Accept: "application/json", "Content-Type": "application/json" };

const LISANS = 46;

export interface University {
  id: number;
  name: string;
}

export interface ProgramGroup {
  id: number;
  name: string;
  puanTuru: string;
}

export interface ProgramResult {
  kilavuzKodu: number;
  yil: number;
  universiteId: number;
  universiteAdi: string;
  birimId: number;
  birimAdi: string;
  birimGrupId: number;
  birimGrupAdi: string;
  fakulteAdi: string | null;
  ilAdi: string;
  puanTuru: string;
  kontenjan: number;
  minPuan: number | null;
  basariSirasi: number | null;
  universiteTuru: string;
}

export interface NetHistoryRow {
  yil: number;
  birimId: number;
  tabanPuan: number;
  puanTuru: string;
  tytTrkNet: number | null;
  tytSosNet: number | null;
  tytMatNet: number | null;
  tytFenNet: number | null;
  aytMatNet: number | null;
  aytFizNet: number | null;
  aytKimNet: number | null;
  aytBioNet: number | null;
  aytTdeNet: number | null;
  aytTrh1Net: number | null;
  aytCog1Net: number | null;
  aytTrh2Net: number | null;
  aytCog2Net: number | null;
  aytFelNet: number | null;
  aytDinNet: number | null;
  ydtYdilNet: number | null;
}

async function getJson(path: string, revalidate: number): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`YÖK Atlas API hatası (${res.status}): ${path}`);
  return res.json();
}

async function postJson(path: string, body: unknown, revalidate: number): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`YÖK Atlas API hatası (${res.status}): ${path}`);
  return res.json();
}

/** Tüm üniversitelerin listesi (~230 kayıt). Nadiren değiştiği için uzun süre cache'lenir. */
export async function getUniversities(): Promise<University[]> {
  const data = (await getJson("/api/tercih-kilavuz/universiteler", 60 * 60 * 24)) as {
    universiteId: number;
    universiteAdi: string;
  }[];
  return data.map((u) => ({ id: u.universiteId, name: u.universiteAdi }));
}

/** Tüm bölüm/program gruplarının listesi (birim grubu, ör. "Bilgisayar Mühendisliği"). */
export async function getProgramGroups(): Promise<ProgramGroup[]> {
  const data = (await getJson("/api/tercih-kilavuz/universite-programlar", 60 * 60 * 24)) as {
    birimGrupId: number;
    birimGrupAdi: string;
    puanTuru: string;
  }[];
  return data.map((p) => ({ id: p.birimGrupId, name: p.birimGrupAdi, puanTuru: p.puanTuru }));
}

/** Belirli üniversite(ler)/bölüm(ler) için canlı taban puan, kontenjan ve başarı sırası. */
export async function searchPrograms(filters: {
  universiteId?: number[];
  birimGrupId?: number[];
  ilKodu?: number[];
  puanTuru?: string;
  universiteTuru?: "DEVLET" | "VAKIF";
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}): Promise<{ content: ProgramResult[]; totalElements: number; totalPages: number }> {
  const {
    page = 0,
    size = 20,
    sortBy = "basariSirasi",
    direction = "ASC",
    ...rest
  } = filters;
  const body = {
    filters: { birimTuruId: LISANS, ...rest },
    page,
    size,
    sortBy,
    direction,
  };
  const data = (await postJson("/api/tercih-kilavuz/search", body, 60 * 60 * 6)) as {
    content: Record<string, unknown>[];
    totalElements: number;
    totalPages: number;
  };
  const content = data.content.map((p) => ({
    kilavuzKodu: p.kilavuzKodu as number,
    yil: p.yil as number,
    universiteId: p.universiteId as number,
    universiteAdi: p.universiteAdi as string,
    birimId: p.birimId as number,
    birimAdi: p.birimAdi as string,
    birimGrupId: p.birimGrupId as number,
    birimGrupAdi: p.birimGrupAdi as string,
    fakulteAdi: (p.fymkAdi as string) ?? null,
    ilAdi: p.ilAdi as string,
    puanTuru: p.puanTuru as string,
    kontenjan: p.kontenjan as number,
    minPuan: (p.minPuan as number) ?? null,
    basariSirasi: (p.basariSirasi as number) ?? null,
    universiteTuru: p.universiteTuru as string,
  }));
  return { content, totalElements: data.totalElements, totalPages: data.totalPages };
}

/**
 * Belirli bir üniversite+bölüm için son yıllara ait yerleşen öğrencinin net dökümü.
 * Aynı birimGrupId altında farklı kontenjan/burs türleri (ör. "Burslu", "%50 İndirimli")
 * ayrı birimId'ler olarak var olabiliyor ve API bunları filtreleyemiyor; bu yüzden
 * belirli bir programı hedeflerken birimId ile sonradan (client-side) filtreliyoruz.
 */
export async function getNetHistory(
  universiteId: number,
  birimGrupId: number,
  universiteTuru: "DEVLET" | "VAKIF" = "DEVLET",
  birimId?: number,
): Promise<NetHistoryRow[]> {
  const body = {
    filters: { universiteId, birimGrupId, birimTuruId: LISANS, universiteTuru },
    page: 0,
    size: 20,
  };
  const data = (await postJson("/api/netler/search", body, 60 * 60 * 24)) as {
    content: Record<string, unknown>[];
  };
  const rows = birimId ? data.content.filter((r) => r.birimId === birimId) : data.content;
  return rows
    .map((r) => ({
      yil: r.yil as number,
      birimId: r.birimId as number,
      tabanPuan: r.tabanPuan as number,
      puanTuru: r.puanTuru as string,
      tytTrkNet: (r.tytTrkNet as number) ?? null,
      tytSosNet: (r.tytSosNet as number) ?? null,
      tytMatNet: (r.tytMatNet as number) ?? null,
      tytFenNet: (r.tytFenNet as number) ?? null,
      aytMatNet: (r.aytMatNet as number) ?? null,
      aytFizNet: (r.aytFizNet as number) ?? null,
      aytKimNet: (r.aytKimNet as number) ?? null,
      aytBioNet: (r.aytBioNet as number) ?? null,
      aytTdeNet: (r.aytTdeNet as number) ?? null,
      aytTrh1Net: (r.aytTrh1Net as number) ?? null,
      aytCog1Net: (r.aytCog1Net as number) ?? null,
      aytTrh2Net: (r.aytTrh2Net as number) ?? null,
      aytCog2Net: (r.aytCog2Net as number) ?? null,
      aytFelNet: (r.aytFelNet as number) ?? null,
      aytDinNet: (r.aytDinNet as number) ?? null,
      ydtYdilNet: (r.ydtYdilNet as number) ?? null,
    }))
    .sort((a, b) => b.yil - a.yil);
}

/** Bir net satırındaki dolu TYT/AYT alanlarının toplamı — yaklaşık toplam net. */
export function sumNet(row: NetHistoryRow, fields: (keyof NetHistoryRow)[]): number | null {
  const values = fields.map((f) => row[f]).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) * 100) / 100;
}

export const TYT_NET_FIELDS: (keyof NetHistoryRow)[] = ["tytTrkNet", "tytSosNet", "tytMatNet", "tytFenNet"];

// Puan türüne göre hangi AYT/YDT alanları doluyor değişir (SAY/SÖZ/EA/DİL); sumNet zaten
// null olmayanları topladığı için hepsini birden verip ilgili olanların otomatik seçilmesini sağlıyoruz.
export const AYT_NET_FIELDS: (keyof NetHistoryRow)[] = [
  "aytMatNet",
  "aytFizNet",
  "aytKimNet",
  "aytBioNet",
  "aytTdeNet",
  "aytTrh1Net",
  "aytCog1Net",
  "aytTrh2Net",
  "aytCog2Net",
  "aytFelNet",
  "aytDinNet",
  "ydtYdilNet",
];
