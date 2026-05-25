import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../../../components/PropieLogo";
import {
  ArrowLeft,
  Camera,
  Image,
  Video,
  X,
  Star,
  GripVertical,
} from "lucide-react";
import React from "react";
import { usePropertyPublish } from "../context/PropertyPublishContext";
import { uploadPropertyImages } from "../services/upload-property-images";
import { uploadPropertyVideos } from "../services/upload-property-videos";
import { findPropertyById } from "../services/find-property-by-id";
import { updatePropertyImageCover } from "../services/update-property-image-cover";
import { updatePropertyMediaOrder } from "../services/update-property-media-order";
import { deletePropertyImage } from "../services/delete-property-image";
import { deletePropertyVideo } from "../services/delete-property-video";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useAppTheme } from "../../../../theme/useAppTheme";

interface MediaItem {
  id?: string;

  type: "image" | "video";

  url: string;

  file?: File;

  isCover: boolean;

  isExisting?: boolean;
}

const API_BASE =
   "http://localhost:3000";

type PropertyMediaRow = {
  id: string;
  type: "image" | "video";
  image_url?: string;
  video_url?: string;
  is_cover?: boolean;
  display_order?: number;
};

function mapPropertyMediaToItems(
  property: {
    media?: PropertyMediaRow[];
    images?: PropertyMediaRow[];
    videos?: PropertyMediaRow[];
  },
): MediaItem[] {
  const rows: PropertyMediaRow[] =
    property.media?.length
      ? [...property.media].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
        )
      : [
          ...(property.images ?? []).map((image) => ({
            ...image,
            type: "image" as const,
          })),
          ...(property.videos ?? []).map((video) => ({
            ...video,
            type: "video" as const,
          })),
        ].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
        );

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    url: `${API_BASE}${row.type === "image" ? row.image_url : row.video_url}`,
    isCover: row.type === "image" ? Boolean(row.is_cover) : false,
    isExisting: true,
  }));
}

function SortableMediaCard({
  item,
  primaryColor,
  onRemove,
  onSetCover,
}: {
  item: MediaItem;
  primaryColor: string;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id! });

  const style: React.CSSProperties = {
    position: "relative",
    aspectRatio: "1",
    borderRadius: 14,
    overflow: "hidden",
    background: "#e5e5ea",
    border: item.isCover ? `2px solid ${primaryColor}` : "2px solid transparent",
    boxShadow: isDragging
      ? "0 8px 24px rgba(0,0,0,0.2)"
      : "0 2px 8px rgba(0,0,0,0.06)",
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {item.type === "image" ? (
        <img
          src={item.url}
          alt="Preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      ) : (
        <video
          src={item.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      )}

      {item.isCover && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: primaryColor,
            borderRadius: 8,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: `0 2px 8px ${primaryColor}4D`,
          }}
        >
          <Star size={12} color="white" fill="white" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
            Portada
          </span>
        </div>
      )}

      {item.type === "video" && !item.isCover && (
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
            backdropFilter: "blur(8px)",
          }}
        >
          <Video size={12} color="white" />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <button
          onClick={() => onRemove(item.id!)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(0,0,0,0.6)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <X size={16} color="white" />
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          display: "flex",
          gap: 6,
        }}
      >
        {!item.isCover && item.type === "image" && (
          <button
            onClick={() => onSetCover(item.id!)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.6)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              backdropFilter: "blur(8px)",
            }}
          >
            <Star size={12} color="white" />
            <span style={{ fontSize: 10, fontWeight: 600, color: "white" }}>
              Portada
            </span>
          </button>
        )}
      </div>

      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "rgba(0,0,0,0.6)",
          border: "none",
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          touchAction: "none",
        }}
      >
        <GripVertical size={14} color="white" />
      </button>
    </div>
  );
}


export default function PublishStep2() {
  const theme = useAppTheme();
  const { data } = usePropertyPublish();

  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProperty() {
      if (!data.propertyId) {
        return;
      }

      try {
        const property = await findPropertyById(data.propertyId);

        setMediaItems(mapPropertyMediaToItems(property));
      } catch (error) {
        console.error("Load property failed", error);
      }
    }

    loadProperty();
  }, [data.propertyId]);

  const handleFileSelect = async (
    files: FileList | null,
    type: "image" | "video",
  ) => {
    if (!files) return;

    if (!data.propertyId) {
      return;
    }

    try {
      // ============================================
      // IMAGES
      // ============================================

      if (type === "image") {
        const uploaded = await uploadPropertyImages(
          data.propertyId,
          Array.from(files),
        );

        const newItems: MediaItem[] = uploaded.images.map(
          (image: any, index: number) => ({
            id: image.id,

            type: "image",

            url: `${API_BASE}${image.image_url}`,

            isCover: image.is_cover,

            isExisting: true,
          }),
        );

        setMediaItems((prev) => [...prev, ...newItems]);
        return;
      }

      if (type === "video") {
        const uploaded = await uploadPropertyVideos(
          data.propertyId,
          Array.from(files),
        );

        const newItems: MediaItem[] = uploaded.videos.map(
          (video: { id: string; video_url: string }) => ({
            id: video.id,
            type: "video",
            url: `${API_BASE}${video.video_url}`,
            isCover: false,
            isExisting: true,
          }),
        );

        setMediaItems((prev) => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleRemove = async (id: string) => {
    const itemToRemove = mediaItems.find((item) => item.id === id);

    if (!itemToRemove || !data.propertyId) {
      return;
    }

    const previousItems = mediaItems;

    try {
      if (itemToRemove.isExisting) {
        if (itemToRemove.type === "image") {
          await deletePropertyImage(data.propertyId, id);
        } else {
          await deletePropertyVideo(data.propertyId, id);
        }
      }

      let updatedItems = mediaItems.filter((item) => item.id !== id);

      if (itemToRemove.isCover && itemToRemove.type === "image") {
        const nextCover = updatedItems.find((item) => item.type === "image");

        if (nextCover?.id) {
          await updatePropertyImageCover(data.propertyId, nextCover.id);

          updatedItems = updatedItems.map((item) => ({
            ...item,
            isCover: item.id === nextCover.id,
          }));
        }
      }

      setMediaItems(updatedItems);

      const persistedMedia = updatedItems
        .filter((item) => item.id)
        .map((item) => ({
          id: item.id!,
          type: item.type,
        }));

      if (persistedMedia.length > 0) {
        await updatePropertyMediaOrder(
          data.propertyId,
          persistedMedia,
        );
      }
    } catch (error) {
      console.error("Remove media failed", error);
      setMediaItems(previousItems);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleContinue = () => {
    // TODO: Implementar navegación a siguiente paso
    console.log("Fotos y videos:", mediaItems);
    navigate("/publicar/informacion");
  };
  const handleSetCover = async (imageId: string) => {
    if (!data.propertyId) {
      return;
    }

    try {
      await updatePropertyImageCover(data.propertyId, imageId);

      setMediaItems((prev) =>
        prev.map((item) => ({
          ...item,

          isCover: item.id === imageId,
        })),
      );
    } catch (error) {
      console.error("Update cover failed", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = mediaItems.findIndex((item) => item.id === active.id);
    const newIndex = mediaItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(mediaItems, oldIndex, newIndex);
    const previousItems = mediaItems;

    setMediaItems(reordered);

    if (!data.propertyId) {
      return;
    }

    try {

      await updatePropertyMediaOrder(
        data.propertyId,
        reordered
          .filter((item) => item.id)
          .map((item) => ({
            id: item.id!,
            type: item.type,
          })),
      );
    
    } catch (error) {
    
      console.error(
        "Update media order failed",
        error,
      );
    
      setMediaItems(previousItems);
    }
  };

  const isFormValid = mediaItems.length > 0;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── HERO ── */}
      <div
        style={{
          position: "relative",
          background:
            theme.heroGradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
            top: -80,
            right: -60,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
            bottom: 40,
            left: -40,
            pointerEvents: "none",
          }}
        />

        {/* Nav row */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "white",
              padding: "8px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={15} color="white" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Volver</span>
          </button>

          <PropieLogo size={38} />

          {/* spacer */}
          <div style={{ width: 80 }} />
        </div>

        {/* Heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "32px 28px 12px",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              lineHeight: 1.15,
              fontFamily: "'Sora', sans-serif",
              margin: 0,
            }}
          >
            Fotos y videos
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 14,
              marginTop: 10,
              lineHeight: 1.6,
              maxWidth: 300,
            }}
          >
            Agregá imágenes y videos de tu propiedad
          </p>
        </div>

        {/* Wave */}
        <div
          style={{
            width: "100%",
            height: 44,
            position: "relative",
            marginTop: 8,
          }}
        >
          <svg
            viewBox="0 0 390 44"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 44,
            }}
          >
            <path
              d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z"
              fill="#f5f5f7"
            />
          </svg>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Upload buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {/* Camera */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, "image")}
              style={{ display: "none" }}
            />
            <button
              onClick={() => cameraInputRef.current?.click()}
              style={{
                flex: 1,
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  theme.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 12px rgba(197,46,62,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <Camera size={24} color={theme.primary} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Cámara
              </span>
            </button>

            {/* Gallery */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, "image")}
              style={{ display: "none" }}
            />
            <button
              onClick={() => galleryInputRef.current?.click()}
              style={{
                flex: 1,
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  theme.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 12px rgba(197,46,62,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <Image size={24} color={theme.primary} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Galería
              </span>
            </button>

            {/* Videos */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, "video")}
              style={{ display: "none" }}
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              style={{
                flex: 1,
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  theme.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 12px rgba(197,46,62,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <Video size={24} color={theme.primary} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Videos
              </span>
            </button>
          </div>

          {/* Media grid */}
          {mediaItems.length > 0 ? (
            <div>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                {mediaItems.length}{" "}
                {mediaItems.length === 1 ? "archivo" : "archivos"} subidos
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={mediaItems.map((item) => item.id!)}
                  strategy={rectSortingStrategy}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 12,
                    }}
                  >
                    {mediaItems.map((item) => (
                      <SortableMediaCard
                        key={item.id}
                        item={item}
                        primaryColor={theme.primary}
                        onRemove={handleRemove}
                        onSetCover={handleSetCover}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div
              style={{
                padding: "40px 20px",
                borderRadius: 16,
                border: "2px dashed #e5e5ea",
                textAlign: "center",
                background: "white",
              }}
            >
              <Image
                size={48}
                color="#d0d0d0"
                style={{ margin: "0 auto 12px" }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#6e6e73",
                  lineHeight: 1.6,
                }}
              >
                Aún no agregaste fotos ni videos
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9a9aa0" }}>
                Usá los botones de arriba para comenzar
              </p>
            </div>
          )}

          {/* Info */}
          {mediaItems.length > 0 && (
            <div
              style={{
                background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: theme.primary,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                💡 Arrastrá las fotos para reordenarlas y marcá la portada
              </p>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!isFormValid}
            style={{
              width: "100%",
              background: isFormValid ? theme.primary : "#e5e5ea",
              border: "none",
              borderRadius: 16,
              padding: "16px 18px",
              cursor: isFormValid ? "pointer" : "not-allowed",
              fontSize: 16,
              fontWeight: 700,
              color: isFormValid ? "white" : "#9a9aa0",
              transition: "all 0.18s ease",
              marginTop: 8,
              boxShadow: isFormValid
                ? "0 4px 16px rgba(197,46,62,0.24)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  theme.primaryDark;
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 6px 20px rgba(197,46,62,0.32)";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  theme.primary;
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 16px rgba(197,46,62,0.24)";
              }
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
