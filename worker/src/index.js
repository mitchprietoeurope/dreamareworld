// Dream Archive / Record 047 — Cloudflare Worker
// NO recovered text or real recovery key belongs in this public repository.
// Configure RECOVERY_KEY_047 and RECORD_047_PART_1 / RECORD_047_PART_2 as Cloudflare Worker secrets.
const ALLOWED_ORIGIN = "https://mitchprietoeurope.github.io";

function corsHeaders(origin) {
  const h = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin"
  });
  if (origin === ALLOWED_ORIGIN) {
    h.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    h.set("Access-Control-Allow-Headers", "Content-Type");
    h.set("Access-Control-Max-Age", "600");
  }
  return h;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status, headers: corsHeaders(origin)
  });
}

async function matchingKey(supplied, expected) {
  const encoder = new TextEncoder();
  const hash = async s => new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(s)));
  const [a, b] = await Promise.all([hash(supplied), hash(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (origin !== ALLOWED_ORIGIN) {
      return json({error:"Origin not allowed."},403,origin);
    }
    if (request.method === "OPTIONS") {
      if (url.pathname !== "/recover") return json({error:"Not found."},404,origin);
      return new Response(null,{status:204,headers:corsHeaders(origin)});
    }
    if (url.pathname !== "/recover" || request.method !== "POST") {
      return json({error:"Not found."},404,origin);
    }
    if (!env.RECOVERY_KEY_047 || !env.RECORD_047_PART_1 || !env.RECORD_047_PART_2 ||
        !env.PER_IP_LIMIT || !env.GLOBAL_LIMIT) {
      return json({error:"Archive is not configured."},503,origin);
    }
    // Lightweight perimeter defense for a four-digit key. Limiters are
    // per Cloudflare location and approximate; they are not brute-force-proof.
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const [local, global] = await Promise.all([
      env.PER_IP_LIMIT.limit({key:"archive047:"+ip}),
      env.GLOBAL_LIMIT.limit({key:"archive047:all"})
    ]);
    if (!local.success || !global.success) {
      return json({error:"Too many attempts. Please return later."},429,origin);
    }
    const size = Number(request.headers.get("Content-Length") || "0");
    if (size > 1024) return json({error:"Invalid request."},400,origin);
    let payload;
    try {
      const raw = await request.text();
      if (raw.length > 1024) return json({error:"Invalid request."},400,origin);
      payload = JSON.parse(raw);
    } catch {
      return json({error:"Invalid request."},400,origin);
    }
    if (!payload || payload.record !== "047" ||
        typeof payload.key !== "string" || !/^\d{4}$/.test(payload.key)) {
      return json({error:"Invalid request."},400,origin);
    }
    if (!(await matchingKey(payload.key, env.RECOVERY_KEY_047))) {
      return json({error:"Recovery key not recognized."},401,origin);
    }
    let record;
    try {
      const part1 = JSON.parse(env.RECORD_047_PART_1);
      const part2 = JSON.parse(env.RECORD_047_PART_2);
      if (!Array.isArray(part1.paragraphs) || !Array.isArray(part2.paragraphs)) throw Error("Incomplete story");
      record = {title:part1.title, paragraphs:[...part1.paragraphs,...part2.paragraphs], archivistNote:part2.archivistNote};
      if (!record || !Array.isArray(record.paragraphs) ||
          !record.paragraphs.every(s=>typeof s === "string") ||
          !Array.isArray(record.archivistNote) ||
          !record.archivistNote.every(s=>typeof s === "string")) throw Error("Invalid record");
    } catch {
      return json({error:"Archive record unavailable."},503,origin);
    }
    return json({
      title: typeof record.title === "string" ? record.title : "A Caixa e a Senha",
      paragraphs: record.paragraphs,
      archivistNote: record.archivistNote
    },200,origin);
  }
};
