import React from "react";

/**
 * Country flag rendered as an image from flagcdn.com.
 * Falls back to the emoji flag if the image fails to load.
 *
 * Sizes (Tailwind):
 *   xs = w-5 h-3.5 (20x14)
 *   sm = w-6 h-4   (24x16)
 *   md = w-8 h-6   (32x24)
 *   lg = w-12 h-8  (48x32)
 *   xl = w-16 h-12 (64x48)
 */
const SIZE = {
  xs: { cls: "w-5 h-3.5", w: 40 },
  sm: { cls: "w-6 h-4", w: 60 },
  md: { cls: "w-8 h-6", w: 80 },
  lg: { cls: "w-12 h-8", w: 120 },
  xl: { cls: "w-16 h-12", w: 160 },
};

export default function Flag({
  code,
  emoji,
  size = "sm",
  rounded = true,
  className = "",
  alt,
}) {
  const { cls, w } = SIZE[size] || SIZE.sm;
  const [errored, setErrored] = React.useState(false);
  if (!code || errored) {
    return (
      <span
        className={`${cls} ${className} inline-flex items-center justify-center text-base leading-none`}
        aria-label={alt}
      >
        {emoji || "🏳"}
      </span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w${w}/${code}.png`}
      srcSet={`https://flagcdn.com/w${w * 2}/${code}.png 2x`}
      width={w}
      height={Math.round(w * 0.66)}
      alt={alt || `${code} flag`}
      onError={() => setErrored(true)}
      className={`${cls} ${className} object-cover ${
        rounded ? "rounded-sm" : ""
      } ring-1 ring-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}
      loading="lazy"
      draggable={false}
    />
  );
}
