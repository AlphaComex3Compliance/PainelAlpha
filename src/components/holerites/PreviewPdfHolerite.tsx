"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

// Worker versão deve bater exatamente com a API interna do react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PreviewPdfHoleriteProps {
  holeriteId: number;
}

export default function PreviewPdfHolerite({ holeriteId }: PreviewPdfHoleriteProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  // Download via nosso endpoint (nunca URL direta do Blob)
  const pdfUrl = `/api/holerites/${holeriteId}/download`;

  return (
    <div className="flex flex-col items-center gap-4">
      {loading && !erro && (
        <div className="flex items-center gap-2 text-slate-500 py-8">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-xs font-black uppercase">Carregando PDF...</span>
        </div>
      )}

      {erro && (
        <div className="flex flex-col items-center gap-2 py-8 text-red-400">
          <AlertCircle size={32} />
          <span className="text-xs font-black uppercase">Erro ao carregar o PDF</span>
        </div>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages: n }) => { setNumPages(n); setLoading(false); }}
        onLoadError={() => { setErro(true); setLoading(false); }}
        className={loading || erro ? "hidden" : ""}
      >
        <Page
          pageNumber={pageNumber}
          width={Math.min(typeof window !== "undefined" ? window.innerWidth - 80 : 600, 720)}
          className="rounded-xl overflow-hidden shadow-2xl border border-white/5"
        />
      </Document>

      {!loading && !erro && numPages > 1 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black uppercase text-slate-500">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
