import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { AuthHeroHeader } from "../../../components/AuthHeroHeader";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { PublishWizardProgress } from "./PublishWizardProgress";

type PublishWizardLayoutProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export function PublishWizardLayout({
  title,
  subtitle,
  footer,
  children,
}: PublishWizardLayoutProps) {
  const theme = useAppTheme();
  const location = useLocation();
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container) {
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        !target?.matches(
          "input:not([type='hidden']), textarea, select, [contenteditable='true']",
        )
      ) {
        return;
      }

      window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    };

    container.addEventListener("focusin", handleFocusIn);
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, []);

  return (
    <div className="publish-wizard-shell" data-testid="publish-wizard">
      <div
        className="publish-wizard-shell__hero"
        style={{ background: theme.heroGradient }}
      >
        <div
          className="publish-wizard-shell__hero-blob publish-wizard-shell__hero-blob--primary"
          aria-hidden
        />
        <div
          className="publish-wizard-shell__hero-blob publish-wizard-shell__hero-blob--secondary"
          aria-hidden
        />

        <AuthHeroHeader showRegisterProgress={false} />
        <PublishWizardProgress />

        <div className="publish-wizard-shell__hero-heading">
          <h1 className="publish-wizard-shell__title">{title}</h1>
          <p className="publish-wizard-shell__subtitle">{subtitle}</p>
        </div>

        <div className="publish-wizard-shell__wave" aria-hidden>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none">
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      <div
        ref={bodyRef}
        className="publish-wizard-shell__body"
        data-testid="publish-wizard-body"
      >
        <div className="publish-wizard-shell__content">{children}</div>
      </div>

      <footer
        className="publish-wizard-shell__footer"
        data-testid="publish-wizard-footer"
      >
        <div className="publish-wizard-shell__footer-inner">{footer}</div>
      </footer>
    </div>
  );
}
