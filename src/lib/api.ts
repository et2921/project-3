const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function checkResponse(res: Response, label: string) {
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(`${label} (${res.status}${detail ? `: ${detail}` : ""})`);
  }
}

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
  await checkResponse(res, "Failed to generate presigned URL");
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
  await checkResponse(res, "Failed to upload image");
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
  await checkResponse(res, "Failed to register image URL");
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
  await checkResponse(res, "Failed to generate captions");
  return res.json();
}
