import React from "react";

type Props = {
  message: string;
  onRetry: () => void;
};

export function MapErrorState({
  message,
  onRetry,
}: Props) {
  return (
    <div className="propie-map-error">
      <strong>{message}</strong>
      <button
        onClick={onRetry}
        type="button"
      >
        Reintentar
      </button>
    </div>
  );
}
