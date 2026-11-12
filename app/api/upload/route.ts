import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const maxDuration = 60; // Allow sufficient time for media upload

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "auto"; // "audio" | "image" | "auto"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary treats audio files as resource_type: "video" or "auto"
    const resourceType = type === "audio" ? "video" : type === "image" ? "image" : "auto";
    const folder = type === "audio" ? "trackflow/audio" : "trackflow/images";

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: folder,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      duration: Math.round(uploadResult.duration || 0),
      format: uploadResult.format,
      public_id: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
