"use client";

import { useEffect, useState } from "react";

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "section" | "article";
}

export function FadeInSection({
  children,
  className = "",
  delayMs,
  as: Tag = "div",
}: FadeInSectionProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!element || isVisible) return;

    if (typeof IntersectionObserver === "undefined") {
      const frameId = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, isVisible]);

  const visibilityClass = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-4";
  const mergedClassName = [
    "transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
    visibilityClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={setElement}
      className={mergedClassName}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
