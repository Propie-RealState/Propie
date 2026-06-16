import type { CSSProperties, ReactNode } from "react";

import { pageShellStyle } from "./layout-styles";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  background?: string;
  className?: string;
  style?: CSSProperties;
};

export function AppShell({
  children,
  header,
  footer,
  background = "#f5f5f7",
  className = "app-shell",
  style,
}: AppShellProps) {
  return (
    <div
      className={className}
      style={{ ...pageShellStyle, background, ...style }}
    >
      {header ? <header className="app-shell__header">{header}</header> : null}
      <main className="app-shell__main">{children}</main>
      {footer ? <footer className="app-shell__footer">{footer}</footer> : null}
    </div>
  );
}
