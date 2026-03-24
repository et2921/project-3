"use client";

import { useState, useRef } from "react";

export function IFeelFunnyMode({ onBack }: { onBack: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setSubmitted(false);
  }

  if (submitted && preview) {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
          ← Back
        </button>
        <div className="max-w-md">
          <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
            <img src={preview} alt="Your photo" className="w-full object-cover max-h-80" />
            {caption && (
              <div className="px-5 py-4 border-t border-gray-700">
                <p className="text-base font-semibold text-center leading-snug">{caption}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setSubmitted(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
            >
              ← Edit
            </button>
            <button
              onClick={() => {
                setPreview(null);
                setCaption("");
                setSubmitted(false);
              }}
              className="flex-1 py-2.5 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-950/20 transition-colors text-sm"
            >
              New photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-1">🍡 I Feel Funny</h2>
      <p className="text-gray-400 text-sm mb-6">Upload a photo and add your own caption — no AI needed</p>

      <div className="max-w-md space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-950/10 transition-all"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-60 mx-auto rounded-xl object-contain" />
          ) : (
            <div className="text-gray-500">
              <div className="text-4xl mb-3">📷</div>
              <p className="font-medium">Click to upload a photo</p>
              <p className="text-sm mt-1 text-gray-600">JPEG, PNG, WebP</p>
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

        {preview && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Your caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Write something funny..."
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
              />
            </div>
            <button
              onClick={() => setSubmitted(true)}
              disabled={!caption.trim()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl font-medium transition-colors text-sm"
            >
              😄 Preview My Caption
            </button>
          </>
        )}
      </div>
    </div>
  );
}
