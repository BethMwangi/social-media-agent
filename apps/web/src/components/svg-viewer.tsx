import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type SvgViewerProps = {
  src: string;
  title?: string;
  className?: string;
};

export function SvgViewer({ src, title, className }: SvgViewerProps) {
  const [markup, setMarkup] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setMarkup(null);
    setHasError(false);

    async function loadSvg() {
      try {
        const response = await fetch(src);

        if (!response.ok) {
          throw new Error("Failed to load SVG");
        }

        const text = await response.text();
        const document = new DOMParser().parseFromString(
          text,
          "image/svg+xml",
        );

        if (document.querySelector("parsererror")) {
          throw new Error("Invalid SVG markup");
        }

        const svg = document.documentElement;

        svg.setAttribute("role", "img");

        if (title) {
          svg.setAttribute("aria-label", title);
        }

        if (!isCancelled) {
          setMarkup(svg.outerHTML);
        }
      } catch {
        if (!isCancelled) {
          setHasError(true);
        }
      }
    }

    void loadSvg();

    return () => {
      isCancelled = true;
    };
  }, [src, title]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted/40 px-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Unable to preview this SVG yet.
      </div>
    );
  }

  if (!markup) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted/40 px-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Loading SVG preview...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:object-contain",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}