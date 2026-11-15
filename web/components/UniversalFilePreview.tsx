import React from "react";
import { FileText, Image as ImageIcon, Download } from "lucide-react";

export interface AttachmentMetadata {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export function buildAttachmentsMetadata(files: File[], urls: string[]): AttachmentMetadata[] {
  return files.map((file, idx) => ({
    name: file.name,
    url: urls[idx] || "",
    type: file.type,
    size: file.size,
  }));
}

export function MessageAttachments({
  attachments,
}: {
  attachments?: AttachmentMetadata[] | string[];
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((item, i) => {
        const isObj = typeof item === "object" && item !== null;
        const url = isObj ? item.url : String(item);
        const name = isObj ? item.name : `File ${i + 1}`;
        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);

        if (isImage) {
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block rounded-lg overflow-hidden border border-border max-w-[180px] max-h-[140px] hover:opacity-90"
            >
              <img src={url} alt={name} className="object-cover w-full h-full" />
            </a>
          );
        }

        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-accent text-accent-foreground text-xs hover:underline border border-border"
          >
            <FileText size={16} />
            <span className="truncate max-w-[120px]">{name}</span>
            <Download size={14} className="opacity-70" />
          </a>
        );
      })}
    </div>
  );
}
