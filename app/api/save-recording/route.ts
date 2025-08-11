import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Save to recordings folder
  const recordingsDir = path.join(process.cwd(), "recordings");
  const filename = `recording-${Date.now()}.webm`;
  const filePath = path.join(recordingsDir, filename);

  await writeFile(filePath, uint8Array); // ✅ type-safe

  return NextResponse.json({ message: "Recording saved", filePath });
}

