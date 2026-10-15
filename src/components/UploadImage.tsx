"use client";
import React, { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-toastify";
import { FiImage, FiLink, FiUploadCloud } from "react-icons/fi";

interface Props {
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  image?: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "bh2002d18q";

const btn =
  "inline-flex items-center gap-2 text-lg px-4 text-white bg-blue-700 hover:bg-blue-900 p-2 rounded-lg font-bold transition disabled:bg-gray-400 disabled:cursor-not-allowed";

const UploadImage = ({ setFormData, image }: Props) => {
  const [url, setUrl] = useState("");
  const [slow, setSlow] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [image]);

  const setImage = (value: string) => setFormData((prev: any) => ({ ...prev, image: value }));

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const applyUrl = () => {
    const v = url.trim();
    if (!/^https?:\/\/\S+$/i.test(v)) return toast.error("Paste a full image link (https://…)");
    setImage(v);
    setUrl("");
  };

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="w-20 h-20 shrink-0 rounded-lg border-2 border-white bg-white/60 shadow grid place-items-center overflow-hidden">
        {image && !broken ? (
          <img key={image} src={image} alt="Product preview" onError={() => setBroken(true)} className="w-full h-full object-cover fade-up" />
        ) : (
          <FiImage className={`text-3xl ${broken ? "text-red-400" : "text-purple-400"}`} title={broken ? "This image link doesn’t load" : undefined} />
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {CLOUD_NAME ? (
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            config={{ cloud: { cloudName: CLOUD_NAME } }}
            options={{ sources: ["local", "url"], multiple: false, maxFiles: 1, resourceType: "image" }}
            onSuccess={(result) => {
              const info = result?.info as { secure_url?: string } | undefined;
              if (info?.secure_url) {
                setImage(info.secure_url);
                toast.success("Image uploaded");
              }
            }}
            onError={(error) => {
              const msg = typeof error === "string" ? error : (error as { statusText?: string })?.statusText;
              toast.error(`Upload failed${msg ? `: ${msg}` : ""}. Check your Cloudinary upload preset.`);
            }}
            onQueuesEnd={(_, { widget }) => widget.close()}
          >
            {({ open, isLoading }) => (
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={btn} disabled={isLoading} onClick={() => open()}>
                  <FiUploadCloud /> {isLoading ? "Loading uploader…" : image ? "Change image" : "Upload image"}
                </button>
                {isLoading && slow && <span className="text-sm text-gray-700">Uploader is blocked or offline — paste a link below.</span>}
              </div>
            )}
          </CldUploadWidget>
        ) : (
          <p className="text-sm text-gray-700">
            Uploads are off — add <code className="bg-white px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> to <code>.env</code>. You can paste an image link meanwhile.
          </p>
        )}

        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 bg-white rounded border px-2 focus-within:border-blue-600">
            <FiLink className="text-gray-400" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
              placeholder="…or paste an image URL"
              className="flex-1 py-2 outline-none bg-transparent"
            />
          </label>
          <button type="button" onClick={applyUrl} className="px-3 rounded border-2 border-blue-700 text-blue-700 font-bold hover:bg-blue-700 hover:text-white transition">
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
