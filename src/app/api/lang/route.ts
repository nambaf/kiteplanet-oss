import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { lang?: string } = {};
  try {
    body = (await req.json()) as { lang?: string };
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const lang = body.lang === "en" ? "en" : "it";
  const res = NextResponse.json({ ok: true, lang });
  res.cookies.set("lang", lang, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
