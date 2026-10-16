"use client";

import { useState, useRef, ChangeEvent } from "react";

const FORMATS = ["png", "jpg", "jpeg", "webp", "bmp", "gif", "tiff", "avif","ico"] as const;
type Format = (typeof FORMATS)[number];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<Format>("png");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }
    setError(null);
    setResultUrl(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target_format", targetFormat);

 
      const res = await fetch("http://localhost:8000/convert", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error(`转换失败 (${res.status})`);

      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err:any) {
      setError(err.message || "转换出错");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadName = file
    ? file.name.replace(/\.[^.]+$/, "") + "." + targetFormat
    : "converted";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Format Factory
          </h1>
          <p className="mt-3 text-slate-500">
            上传图片，选择目标格式，一键转换
          </p>
        </div>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8">
          {/* 上传区域 */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
              }`}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-700">
                点击或拖拽图片到此处
              </p>
              <p className="mt-2 text-sm text-slate-400">
                支持 PNG / JPG / WebP / BMP / GIF / TIFF 等
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* 预览 + 信息 */}
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="预览"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <p className="font-medium text-slate-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={reset}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    重新选择
                  </button>
                </div>
              </div>

              {/* 格式选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  目标格式
                </label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium uppercase transition-colors ${
                        targetFormat === fmt
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 转换按钮 */}
              <button
                onClick={convert}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    转换中...
                  </>
                ) : (
                  "开始转换"
                )}
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 结果 */}
          {resultUrl && (
            <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-6">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                转换完成
              </div>
              <a
                href={resultUrl}
                download={downloadName}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                下载 {downloadName}
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          图片仅在转换过程中处理，不会长期存储
        </p>
      </div>
    </main>
  );
}