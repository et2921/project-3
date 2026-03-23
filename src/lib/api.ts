const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function generatePresignedUrl(
  token: string,
  contentType: string
): Promise<{ presignedUrl: string; cdnUrl: string }> {
  const res = await fetch(`${API_URL}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) throw new Error("Failed to generate presigned URL");
  return res.json();
}

export async function uploadImageToPresignedUrl(
  presignedUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload image");
}

export async function registerImageUrl(
  token: string,
  imageUrl: string
): Promise<{ imageId: string }> {
  const res = await fetch(`${API_URL}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl, isCommonUse: false }),
  });
  if (!res.ok) throw new Error("Failed to register image URL");
  return res.json();
}

export async function generateCaptions(
  token: string,
  imageId: string,
  humorFlavorId?: number
): Promise<unknown[]> {
  const body: Record<string, unknown> = { imageId };
  if (humorFlavorId !== undefined) body.humorFlavorId = humorFlavorId;

  const res = await fetch(`${API_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to generate captions");
  return res.json();
}
