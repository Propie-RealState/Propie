import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type TouchEvent,
} from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

import "./property-image-gallery.css";

export type PropertyGalleryImage = {
  id: string;
  url: string;
  thumbUrl: string;
  isCover?: boolean;
};

type PropertyImageGalleryProps = {
  images: PropertyGalleryImage[];
  title: string;
};

const MOSAIC_VISIBLE = 5;
const SWIPE_THRESHOLD_PX = 48;
const MAX_DOTS = 12;
const ADJACENT_SLIDE_RANGE = 1;
const RESIZE_DEBOUNCE_MS = 150;

/** Gallery frame aspect ratio — must match CSS on `.property-image-gallery` */
export const PROPERTY_GALLERY_ASPECT_RATIO = "4 / 3" as const;
const GALLERY_IMAGE_RATIO = { width: 4, height: 3 } as const;

function pickThumb(image: PropertyGalleryImage): string {
  return image.thumbUrl || image.url;
}

/** Full resolution near the active slide; thumbs elsewhere to save bandwidth. */
function slideImageSrc(
  image: PropertyGalleryImage,
  slideIndex: number,
  activeIndex: number,
): string {
  if (Math.abs(slideIndex - activeIndex) <= ADJACENT_SLIDE_RANGE) {
    return image.url;
  }
  return pickThumb(image);
}

function slideLoading(
  slideIndex: number,
  activeIndex: number,
): "eager" | "lazy" {
  return slideIndex === activeIndex || slideIndex === 0 ? "eager" : "lazy";
}

type GalleryNavigation = {
  index: number;
  total: number;
  hasMany: boolean;
  trackRef: RefObject<HTMLDivElement | null>;
  thumbsRef: RefObject<HTMLDivElement | null>;
  lightboxOpen: boolean;
  goTo: (nextIndex: number, options?: { smooth?: boolean }) => void;
  next: () => void;
  prev: () => void;
  openLightbox: (startIndex: number) => void;
  closeLightbox: () => void;
  handleTrackScroll: () => void;
  handleLightboxTouchStart: (event: TouchEvent) => void;
  handleLightboxTouchEnd: (event: TouchEvent) => void;
};

function getMosaicLayoutClass(total: number): string {
  if (total === 1) return "property-image-gallery__mosaic--single";
  if (total === 2) return "property-image-gallery__mosaic--pair";
  if (total === 3) return "property-image-gallery__mosaic--trio";
  if (total === 4) return "property-image-gallery__mosaic--quad";
  return "property-image-gallery__mosaic--grid";
}

function usePrefersMosaicLayout(): boolean {
  const [prefersMosaic, setPrefersMosaic] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setPrefersMosaic(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return prefersMosaic;
}

function useGalleryNavigation(total: number): GalleryNavigation {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const programmaticScrollRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const indexRef = useRef(0);

  const hasMany = total > 1;
  indexRef.current = index;

  const scrollTrackToIndex = useCallback((targetIndex: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track?.clientWidth) return;

    programmaticScrollRef.current = true;
    track.scrollTo({
      left: targetIndex * track.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });

    window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, smooth ? 320 : 0);
  }, []);

  const goTo = useCallback(
    (nextIndex: number, options?: { smooth?: boolean }) => {
      if (!total) return;
      const normalized = ((nextIndex % total) + total) % total;
      setIndex(normalized);
      scrollTrackToIndex(normalized, options?.smooth ?? true);
    },
    [scrollTrackToIndex, total],
  );

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  const openLightbox = useCallback(
    (startIndex: number) => {
      setIndex(startIndex);
      scrollTrackToIndex(startIndex, false);
      setLightboxOpen(true);
    },
    [scrollTrackToIndex],
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleTrackScroll = useCallback(() => {
    if (programmaticScrollRef.current) return;
    if (scrollRafRef.current !== null) return;

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (programmaticScrollRef.current) return;

      const track = trackRef.current;
      if (!track?.clientWidth) return;

      const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
      if (nextIndex !== indexRef.current) {
        setIndex(nextIndex);
      }
    });
  }, []);

  const handleLightboxTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleLightboxTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      else if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
    };

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeLightbox, lightboxOpen, next, prev]);

  useEffect(() => {
    if (!lightboxOpen || !hasMany) return;

    thumbsRef.current
      ?.querySelector(`[data-thumb-index="${index}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [hasMany, index, lightboxOpen]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let timeoutId = 0;
    const onResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        scrollTrackToIndex(indexRef.current, false);
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [scrollTrackToIndex]);

  return {
    index,
    total,
    hasMany,
    trackRef,
    thumbsRef,
    lightboxOpen,
    goTo,
    next,
    prev,
    openLightbox,
    closeLightbox,
    handleTrackScroll,
    handleLightboxTouchStart,
    handleLightboxTouchEnd,
  };
}

function GalleryFrame({
  testId,
  stage,
  overlay,
}: {
  testId: string;
  stage: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div
      className="property-image-gallery"
      data-testid={testId}
      data-gallery-layout="scroll"
    >
      <div className="property-image-gallery__stage">{stage}</div>
      {overlay}
    </div>
  );
}

function GalleryCounter({
  index,
  total,
  className,
}: {
  index: number;
  total: number;
  className: string;
}) {
  return (
    <span className={className}>
      {index + 1} / {total}
    </span>
  );
}

function GalleryNavButtons({
  onPrev,
  onNext,
  testIdPrefix,
}: {
  onPrev: () => void;
  onNext: () => void;
  testIdPrefix?: string;
}) {
  return (
    <>
      <button
        type="button"
        className="property-image-gallery__nav property-image-gallery__nav--prev"
        aria-label="Foto anterior"
        data-testid={testIdPrefix ? `${testIdPrefix}-prev` : undefined}
        onClick={onPrev}
      >
        <ChevronLeft size={24} color="white" />
      </button>
      <button
        type="button"
        className="property-image-gallery__nav property-image-gallery__nav--next"
        aria-label="Foto siguiente"
        data-testid={testIdPrefix ? `${testIdPrefix}-next` : undefined}
        onClick={onNext}
      >
        <ChevronRight size={24} color="white" />
      </button>
    </>
  );
}

function GalleryCarousel({
  title,
  images,
  navigation,
  deferFullResolution,
}: {
  title: string;
  images: PropertyGalleryImage[];
  navigation: GalleryNavigation;
  deferFullResolution: boolean;
}) {
  const { index, total, hasMany, trackRef, goTo, next, prev, openLightbox, handleTrackScroll } =
    navigation;

  return (
    <div
      className="property-image-gallery__carousel"
      data-testid="property-gallery-carousel"
    >
      <div
        ref={trackRef}
        className="property-image-gallery__track"
        data-testid="property-gallery-track"
        onScroll={handleTrackScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Fotos de ${title}`}
      >
        {images.map((image, slideIndex) => (
          <div
            key={image.id}
            className="property-image-gallery__slide"
            aria-hidden={slideIndex !== index}
          >
            <button
              type="button"
              className="property-image-gallery__carousel-slide"
              aria-label={`Ver foto ${slideIndex + 1} de ${total}`}
              onClick={() => openLightbox(slideIndex)}
            >
              <img
                className="property-image-gallery__media"
                src={
                  deferFullResolution
                    ? pickThumb(image)
                    : slideImageSrc(image, slideIndex, index)
                }
                alt={`${title} — foto ${slideIndex + 1}`}
                width={GALLERY_IMAGE_RATIO.width}
                height={GALLERY_IMAGE_RATIO.height}
                loading={deferFullResolution ? "lazy" : slideLoading(slideIndex, index)}
                fetchPriority={
                  !deferFullResolution && slideIndex === 0 ? "high" : "auto"
                }
                decoding="async"
                draggable={false}
              />
            </button>
          </div>
        ))}
      </div>

      {hasMany && (
        <>
          <GalleryNavButtons
            onPrev={prev}
            onNext={next}
            testIdPrefix="property-gallery"
          />
          <div
            className="property-image-gallery__dots"
            aria-hidden={total > MAX_DOTS}
          >
            {images.slice(0, MAX_DOTS).map((image, dotIndex) => (
              <button
                key={image.id}
                type="button"
                className={`property-image-gallery__dot${
                  dotIndex === index ? " property-image-gallery__dot--active" : ""
                }`}
                aria-label={`Ir a foto ${dotIndex + 1}`}
                onClick={() => goTo(dotIndex)}
              />
            ))}
          </div>
          <GalleryCounter
            index={index}
            total={total}
            className="property-image-gallery__counter"
          />
        </>
      )}
    </div>
  );
}

function MosaicCell({
  photoIndex,
  total,
  title,
  src,
  loading,
  overlay,
  onOpen,
}: {
  photoIndex: number;
  total: number;
  title: string;
  src: string;
  loading: "eager" | "lazy";
  overlay?: ReactNode;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="property-image-gallery__cell"
      aria-label={`Ver foto ${photoIndex + 1} de ${total}`}
      onClick={onOpen}
    >
      <img
        src={src}
        alt={`${title} — foto ${photoIndex + 1}`}
        width={GALLERY_IMAGE_RATIO.width}
        height={GALLERY_IMAGE_RATIO.height}
        loading={loading}
        decoding="async"
        draggable={false}
      />
      {overlay}
    </button>
  );
}

function GalleryMosaic({
  title,
  images,
  navigation,
}: {
  title: string;
  images: PropertyGalleryImage[];
  navigation: GalleryNavigation;
}) {
  const { total, openLightbox } = navigation;
  const mosaicLayout = getMosaicLayoutClass(total);
  const mosaicImages = images.slice(0, MOSAIC_VISIBLE);
  const hiddenCount = Math.max(0, total - MOSAIC_VISIBLE);
  const isGrid = mosaicLayout === "property-image-gallery__mosaic--grid";

  return (
    <div className={`property-image-gallery__mosaic ${mosaicLayout}`}>
      {isGrid ? (
        <>
          <button
            type="button"
            className="property-image-gallery__cell property-image-gallery__main"
            aria-label={`Ver foto 1 de ${total}`}
            onClick={() => openLightbox(0)}
          >
            <img
              src={pickThumb(mosaicImages[0]!)}
              alt={`${title} — foto principal`}
              width={GALLERY_IMAGE_RATIO.width}
              height={GALLERY_IMAGE_RATIO.height}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </button>
          <div className="property-image-gallery__side">
            {mosaicImages.slice(1).map((image, cellIndex) => {
              const photoIndex = cellIndex + 1;
              const isLastVisible =
                photoIndex === MOSAIC_VISIBLE - 1 && hiddenCount > 0;

              return (
                <MosaicCell
                  key={image.id}
                  photoIndex={photoIndex}
                  total={total}
                  title={title}
                  src={pickThumb(image)}
                  loading="lazy"
                  onOpen={() => openLightbox(photoIndex)}
                  overlay={
                    isLastVisible ? (
                      <span className="property-image-gallery__more">
                        +{hiddenCount} fotos
                      </span>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        </>
      ) : (
        mosaicImages.map((image, cellIndex) => (
          <MosaicCell
            key={image.id}
            photoIndex={cellIndex}
            total={total}
            title={title}
            src={cellIndex === 0 ? image.url : pickThumb(image)}
            loading={cellIndex === 0 ? "eager" : "lazy"}
            onOpen={() => openLightbox(cellIndex)}
          />
        ))
      )}

      {total > 1 && (
        <button
          type="button"
          className="property-image-gallery__show-all"
          data-testid="property-gallery-show-all"
          onClick={() => openLightbox(0)}
        >
          Ver las {total} fotos
        </button>
      )}
    </div>
  );
}

function GalleryLightbox({
  title,
  images,
  navigation,
}: {
  title: string;
  images: PropertyGalleryImage[];
  navigation: GalleryNavigation;
}) {
  const {
    index,
    total,
    hasMany,
    thumbsRef,
    next,
    prev,
    goTo,
    closeLightbox,
    handleLightboxTouchStart,
    handleLightboxTouchEnd,
  } = navigation;

  return (
    <div
      className="property-image-gallery__lightbox"
      data-testid="property-gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${title}`}
      onTouchStart={handleLightboxTouchStart}
      onTouchEnd={handleLightboxTouchEnd}
    >
      <div className="property-image-gallery__lightbox-toolbar">
        <GalleryCounter
          index={index}
          total={total}
          className="property-image-gallery__lightbox-counter"
        />
        <button
          type="button"
          className="property-image-gallery__lightbox-close"
          aria-label="Cerrar galería"
          data-testid="property-gallery-lightbox-close"
          onClick={closeLightbox}
        >
          <X size={22} />
        </button>
      </div>

      <div className="property-image-gallery__lightbox-stage">
        {hasMany && <GalleryNavButtons onPrev={prev} onNext={next} />}
        <div className="property-image-gallery__lightbox-frame">
          <img
            src={images[index]?.url}
            alt={`${title} — foto ${index + 1}`}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>

      {hasMany && (
        <div ref={thumbsRef} className="property-image-gallery__lightbox-thumbs">
          {images.map((image, thumbIndex) => (
            <button
              key={image.id}
              type="button"
              data-thumb-index={thumbIndex}
              className={`property-image-gallery__lightbox-thumb${
                thumbIndex === index
                  ? " property-image-gallery__lightbox-thumb--active"
                  : ""
              }`}
              aria-label={`Ir a foto ${thumbIndex + 1}`}
              onClick={() => goTo(thumbIndex)}
            >
              <img
                src={pickThumb(image)}
                alt=""
                width={GALLERY_IMAGE_RATIO.width}
                height={GALLERY_IMAGE_RATIO.height}
                loading={thumbIndex === index ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyGallerySkeleton() {
  return (
    <div
      className="property-image-gallery"
      data-testid="property-gallery-skeleton"
      aria-hidden
    >
      <div className="property-image-gallery__stage property-image-gallery__stage--skeleton" />
    </div>
  );
}

export function PropertyImageGallery({
  images,
  title,
}: PropertyImageGalleryProps) {
  const prefersMosaic = usePrefersMosaicLayout();
  const navigation = useGalleryNavigation(images.length);

  if (!images.length) {
    return (
      <GalleryFrame
        testId="property-gallery"
        stage={
          <div className="property-image-gallery__empty-content">
            <ImageIcon size={28} strokeWidth={1.5} />
            <span>Sin fotos</span>
          </div>
        }
      />
    );
  }

  return (
    <GalleryFrame
      testId="property-gallery"
      stage={
        <>
          <GalleryCarousel
            title={title}
            images={images}
            navigation={navigation}
            deferFullResolution={prefersMosaic}
          />
          <GalleryMosaic title={title} images={images} navigation={navigation} />
        </>
      }
      overlay={
        navigation.lightboxOpen ? (
          <GalleryLightbox title={title} images={images} navigation={navigation} />
        ) : null
      }
    />
  );
}
