import { AlertCircle, Image, Loader2, RotateCcw, Video, X } from "lucide-react";

import type { PendingUpload } from "../../../../lib/media/use-media-upload-queue";

type PublishPendingMediaCardProps = {
  item: PendingUpload;
  onRetry: (localId: string) => void;
  onDismiss: (localId: string) => void;
};

export function PublishPendingMediaCard({
  item,
  onRetry,
  onDismiss,
}: PublishPendingMediaCardProps) {
  const isUploading = item.status === "uploading";

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        borderRadius: 14,
        overflow: "hidden",
        background: "#e5e5ea",
        border: "2px solid transparent",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {item.type === "image" ? (
        <img
          src={item.previewUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isUploading ? 0.72 : 0.45,
          }}
        />
      ) : (
        <video
          src={item.previewUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isUploading ? 0.72 : 0.45,
          }}
        />
      )}

      {isUploading ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.35)",
          }}
        >
          <Loader2
            size={28}
            color="#4417E6"
            style={{ animation: "propie-route-spin 0.7s linear infinite" }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 12,
            background: "rgba(0,0,0,0.55)",
            textAlign: "center",
          }}
        >
          <AlertCircle size={22} color="#fecaca" />
          <p
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.4,
              color: "#fff",
              fontWeight: 500,
            }}
          >
            {item.errorMessage}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => onRetry(item.localId)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                background: "#fff",
                color: "#1a1a1a",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={12} />
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => onDismiss(item.localId)}
              aria-label="Descartar"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                border: "none",
                borderRadius: 8,
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.6)",
          borderRadius: 8,
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {item.type === "image" ? (
          <Image size={12} color="white" />
        ) : (
          <Video size={12} color="white" />
        )}
        <span style={{ fontSize: 10, fontWeight: 600, color: "white" }}>
          {isUploading ? "Subiendo…" : "Error"}
        </span>
      </div>
    </div>
  );
}
