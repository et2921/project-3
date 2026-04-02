"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { generatePresignedUrl, uploadImageToPresignedUrl } from "@/lib/api";

export function CaptionGenerator({ flavorId }: { flavorId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [captions, setCaptions] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setCaptions(null);
    setError("");
  }

  async function handleGenerate() {
    if (!file) return;
    setLoading(true);
    setError("");
    setCaptions(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");
      const token = session.access_token;

      setStatus("Getting upload URL...");
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(token, file.type);

      setStatus("Uploading image...");
      await uploadImageToPresignedUrl(presignedUrl, file);

      setStatus("Generating captions...");
      const res = await fetch("/api/run-flavor-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cdnUrl, flavorId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Failed to generate captions (${res.status})`);
      }

      const result = await res.json();
      setCaptions(result);
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Test Caption Generation</h2>
        <p className="text-sm text-gray-500">Upload an image to run it through this flavor&apos;s prompt chain.</p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="text-gray-400">
            <p className="text-lg mb-1">Click to upload image</p>
            <p className="text-sm">JPEG, PNG, WebP supported</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? "Generating..." : "Generate Captions"}
          </button>
          {status && <span className="text-sm text-gray-500">{status}</span>}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {captions && captions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Generated Captions ({captions.length})</h3>
          <div className="space-y-2">
            {captions.map((caption, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <span className="text-xs text-gray-400 font-medium">#{i + 1}</span>
                <p className="mt-1 text-sm">{typeof caption === "string" ? caption : JSON.stringify(caption)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {captions && captions.length === 0 && (
        <p className="text-gray-500 text-sm">No captions were returned.</p>
      )}
    </div>
  );
}
