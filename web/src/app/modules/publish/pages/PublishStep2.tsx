import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PublishWizardCTA } from "../components/PublishWizardCTA";
import { PublishWizardLayout } from "../components/PublishWizardLayout";
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
import { updatePropertyImageCover } from "../services/update-property-image-cover";
import { updatePropertyMediaOrder } from "../services/update-property-media-order";
import { deletePropertyImage } from "../services/delete-property-image";
import { deletePropertyVideo } from "../services/delete-property-video";
import type { MediaAsset } from "../../../../lib/media/media-asset";
import { usePropertyMediaAssets } from "../../../../lib/media/use-property-media-assets";
import { useMediaUploadQueue } from "../../../../lib/media/use-media-upload-queue";
import { PublishMediaGridSkeleton } from "../components/PublishMediaGridSkeleton";
import { PublishPendingMediaCard } from "../components/PublishPendingMediaCard";
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
import { useAppTheme, useIsAgent } from "../../../../theme/useAppTheme";
import { getNextPublishWizardPath } from "../publish-wizard-steps";
import { ResponsiveImage } from "../../../../lib/media/ResponsiveImage";

type MediaItem = MediaAsset;

function SortableMediaCard({
  item,
  primaryColor,
  disabled = false,
  onRemove,
  onSetCover,
}: {
  item: MediaItem;
  primaryColor: string;
  disabled?: boolean;
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
  } = useSortable({ id: item.id!, disabled });

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
        <ResponsiveImage
          src={item.url}
          thumbSrc={item.thumbUrl}
          sizes={item.srcSet ? "(max-width: 768px) 50vw, 240px" : undefined}
          alt="Preview"
          loading="lazy"
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
          disabled={disabled}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(0,0,0,0.6)",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
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
            disabled={disabled}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.6)",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
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
          cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
          opacity: disabled ? 0.5 : 1,
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
  const isAgent = useIsAgent();
  const nextPath = getNextPublishWizardPath("fotos-videos", isAgent);
  const { data } = usePropertyPublish();

  const navigate = useNavigate();
  const {
    media: mediaItems,
    setMedia: setMediaItems,
    appendFromUpload,
    isLoading,
  } = usePropertyMediaAssets(data.propertyId);

  const {
    pending: pendingUploads,
    isUploading,
    enqueueFiles,
    retryUpload,
    dismissFailed,
  } = useMediaUploadQueue({
    propertyId: data.propertyId,
    onUploaded: appendFromUpload,
    uploadImages: uploadPropertyImages,
    uploadVideos: uploadPropertyVideos,
  });
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleFileSelect = (
    files: FileList | null,
    type: "image" | "video",
  ) => {
    if (!files || !data.propertyId) {
      return;
    }

    enqueueFiles(Array.from(files), type);

    if (type === "image") {
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    } else if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleRemove = async (id: string) => {
    if (isUploading) {
      return;
    }

    const itemToRemove = mediaItems.find((item) => item.id === id);

    if (!itemToRemove || !data.propertyId) {
      return;
    }

    const previousItems = mediaItems;
    const updatedItems = mediaItems.filter((item) => item.id !== id);

    // Optimistically remove; revert only if the server rejects the delete.
    setMediaItems(updatedItems);

    try {
      if (itemToRemove.type === "image") {
        await deletePropertyImage(data.propertyId, id);
      } else {
        await deletePropertyVideo(data.propertyId, id);
      }

      // Deleting keeps the remaining display_order values (with a harmless gap),
      // so no full re-order request is needed here — only cover reassignment.
      if (itemToRemove.isCover && itemToRemove.type === "image") {
        const nextCover = updatedItems.find((item) => item.type === "image");

        if (nextCover?.id) {
          await updatePropertyImageCover(data.propertyId, nextCover.id);

          setMediaItems((prev) =>
            prev.map((item) => ({
              ...item,
              isCover: item.id === nextCover.id,
            })),
          );
        }
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
    if (nextPath) {
      navigate(nextPath);
    }
  };
  const handleSetCover = async (imageId: string) => {
    if (isUploading || !data.propertyId) {
      return;
    }

    const previousItems = mediaItems;

    setMediaItems((prev) =>
      prev.map((item) => ({
        ...item,
        isCover: item.id === imageId,
      })),
    );

    try {
      await updatePropertyImageCover(data.propertyId, imageId);
    } catch (error) {
      console.error("Update cover failed", error);
      setMediaItems(previousItems);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isUploading) {
      return;
    }

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

  const isFormValid =
    mediaItems.length > 0 &&
    !isUploading &&
    pendingUploads.every((item) => item.status !== "error");

  const uploadsBusy = isUploading || isLoading;

  const continueHint = isUploading
    ? "Esperá a que terminen de subirse los archivos."
    : showValidation && !isFormValid
      ? pendingUploads.some((item) => item.status === "error")
        ? "Resolvé los archivos con error antes de continuar."
        : "Agregá al menos una foto o video para continuar."
      : undefined;

  const handleContinueAttempt = () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    handleContinue();
  };

  return (
    <PublishWizardLayout
      title="Fotos y videos"
      footer={
        <PublishWizardCTA
          label="Continuar"
          onClick={handleContinueAttempt}
          disabled={uploadsBusy}
          hint={continueHint}
        />
      }
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
              className="visually-hidden"
            />
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploadsBusy}
              style={{
                flex: 1,
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 12px",
                cursor: uploadsBusy ? "not-allowed" : "pointer",
                opacity: uploadsBusy ? 0.6 : 1,
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
              className="visually-hidden"
            />
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadsBusy}
              style={{
                flex: 1,
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 12px",
                cursor: uploadsBusy ? "not-allowed" : "pointer",
                opacity: uploadsBusy ? 0.6 : 1,
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
              className="visually-hidden"
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadsBusy}
              style={{
                flex: 1,
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 12px",
                cursor: uploadsBusy ? "not-allowed" : "pointer",
                opacity: uploadsBusy ? 0.6 : 1,
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

          {isUploading && (
            <div
              role="status"
              aria-live="polite"
              style={{
                height: 4,
                borderRadius: 999,
                background: "#ececf0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "40%",
                  borderRadius: 999,
                  background: theme.primary,
                  animation: "propie-upload-progress 1.1s ease-in-out infinite",
                }}
              />
              <style>
                {"@keyframes propie-upload-progress{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}"}
              </style>
            </div>
          )}

          {/* Media grid */}
          {isLoading ? (
            <PublishMediaGridSkeleton />
          ) : mediaItems.length > 0 || pendingUploads.length > 0 ? (
            <div>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                {mediaItems.length + pendingUploads.length}{" "}
                {mediaItems.length + pendingUploads.length === 1
                  ? "archivo"
                  : "archivos"}{" "}
                {isUploading ? "subiendo…" : "subidos"}
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
                        disabled={uploadsBusy}
                        onRemove={handleRemove}
                        onSetCover={handleSetCover}
                      />
                    ))}
                    {pendingUploads.map((item) => (
                      <PublishPendingMediaCard
                        key={item.localId}
                        item={item}
                        onRetry={retryUpload}
                        onDismiss={dismissFailed}
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
          {mediaItems.length > 0 && !isUploading && (
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

    </PublishWizardLayout>
  );
}
