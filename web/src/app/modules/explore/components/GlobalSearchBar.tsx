import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Search, UserRound } from "lucide-react";

import { resolveMediaUrl } from "../../../../lib/api-base";
import type {
  GlobalSearchResponse,
  GlobalSearchSelection,
} from "../types/global-search.types";

type GlobalSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (selection: GlobalSearchSelection) => void;
  results: GlobalSearchResponse;
  loading: boolean;
  error: string | null;
  isActive: boolean;
};

function SectionTitle({
  children,
}: {
  children: string;
}) {
  return (
    <div
      style={{
        padding: "8px 14px 4px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#9a9aa0",
      }}
    >
      {children}
    </div>
  );
}

function ResultButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        border: "none",
        background: "white",
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(event) => {
        (event.currentTarget as HTMLButtonElement).style.background =
          "#f5f5f7";
      }}
      onMouseLeave={(event) => {
        (event.currentTarget as HTMLButtonElement).style.background =
          "white";
      }}
    >
      {children}
    </button>
  );
}

function Avatar({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const resolved = resolveMediaUrl(url);

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={name}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#ececec",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <UserRound size={18} color="#9a9aa0" />
    </div>
  );
}

export default function GlobalSearchBar({
  value,
  onChange,
  onSelect,
  results,
  loading,
  error,
  isActive,
}: GlobalSearchBarProps) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const hasResults =
    results.properties.length > 0 ||
    results.locations.length > 0 ||
    results.agents.length > 0 ||
    results.owners.length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, []);

  const showPanel =
    isOpen &&
    isActive &&
    (loading || !!error || hasResults);

  const handleSelection = (
    selection: GlobalSearchSelection,
  ) => {
    onChange(selection.label);
    setIsOpen(false);
    onSelect?.(selection);

    if (selection.kind === "property") {
      navigate(`/propiedad/${selection.id}`);
      return;
    }

    if (selection.kind === "agent") {
      navigate(`/agentes/${selection.id}`);
      return;
    }

    if (selection.kind === "owner") {
      navigate(`/perfil/${selection.id}`);
    }
  };

  return (
    <div
      ref={rootRef}
      style={{ position: "relative" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f5f5f7",
          borderRadius: 16,
          padding: "0 14px",
          height: 48,
          border: isOpen
            ? "1.5px solid #4417E6"
            : "1.5px solid #ececec",
        }}
      >
        <Search size={18} color="#9a9aa0" strokeWidth={2} />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar propiedades, ubicaciones, agentes..."
          aria-label="Búsqueda global"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "#1a1a1a",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {loading ? (
          <Loader2
            size={16}
            color="#9a9aa0"
            style={{ animation: "spin 1s linear infinite" }}
          />
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            aria-label="Limpiar búsqueda"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9a9aa0",
              fontSize: 20,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        ) : null}
      </div>

      {showPanel ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "white",
            borderRadius: 16,
            border: "1px solid #ececec",
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            maxHeight: 360,
            overflowY: "auto",
            zIndex: 50,
          }}
        >
          {error ? (
            <div
              style={{
                padding: "14px 16px",
                fontSize: 13,
                color: "#6e6e73",
              }}
            >
              {error}
            </div>
          ) : null}

          {!error && !loading && !hasResults ? (
            <div
              style={{
                padding: "14px 16px",
                fontSize: 13,
                color: "#6e6e73",
              }}
            >
              No encontramos resultados para tu búsqueda.
            </div>
          ) : null}

          {results.properties.length > 0 ? (
            <div>
              <SectionTitle>Propiedades</SectionTitle>
              {results.properties.map((property) => (
                <ResultButton
                  key={property.id}
                  onClick={() =>
                    handleSelection({
                      kind: "property",
                      id: property.id,
                      label: property.title,
                    })
                  }
                >
                  {property.coverImage ? (
                    <img
                      src={resolveMediaUrl(property.coverImage) ?? ""}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "#f0f0f0",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {property.title}
                    </div>
                    {property.subtitle ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6e6e73",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {property.subtitle}
                      </div>
                    ) : null}
                  </div>
                </ResultButton>
              ))}
            </div>
          ) : null}

          {results.locations.length > 0 ? (
            <div>
              <SectionTitle>Ubicaciones</SectionTitle>
              {results.locations.map((location) => (
                <ResultButton
                  key={location.id}
                  onClick={() =>
                    handleSelection({
                      kind: "location",
                      id: location.id,
                      label: location.label,
                    })
                  }
                >
                  <MapPin size={18} color="#4417E6" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {location.label}
                    </div>
                    {location.subtitle ? (
                      <div style={{ fontSize: 12, color: "#6e6e73" }}>
                        {location.subtitle}
                      </div>
                    ) : null}
                  </div>
                </ResultButton>
              ))}
            </div>
          ) : null}

          {results.agents.length > 0 ? (
            <div>
              <SectionTitle>Agentes</SectionTitle>
              {results.agents.map((agent) => (
                <ResultButton
                  key={agent.id}
                  onClick={() =>
                    handleSelection({
                      kind: "agent",
                      id: agent.id,
                      label: agent.fullName,
                    })
                  }
                >
                  <Avatar url={agent.avatarUrl} name={agent.fullName} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {agent.fullName}
                      {agent.rating > 0 ? (
                        <span style={{ color: "#f5a623", marginLeft: 6 }}>
                          ★{agent.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>
                      {agent.username}
                      {agent.managedProperties > 0
                        ? ` · ${agent.managedProperties} propiedades`
                        : ""}
                    </div>
                  </div>
                </ResultButton>
              ))}
            </div>
          ) : null}

          {results.owners.length > 0 ? (
            <div>
              <SectionTitle>Propietarios</SectionTitle>
              {results.owners.map((owner) => (
                <ResultButton
                  key={owner.id}
                  onClick={() =>
                    handleSelection({
                      kind: "owner",
                      id: owner.id,
                      label: owner.fullName,
                    })
                  }
                >
                  <Avatar url={owner.avatarUrl} name={owner.fullName} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {owner.fullName}
                    </div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>
                      {owner.username}
                    </div>
                  </div>
                </ResultButton>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
