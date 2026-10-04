// Numbered colour marker that ties a friend to their colour everywhere
// (form rows, avatars, playtime bars).
export const playerColor = (i) => `var(--p${(i % 8) + 1})`;

export function PlayerDot({ index, className = "" }) {
  return (
    <span
      aria-hidden
      className={`num grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold text-bg ${className}`}
      style={{ background: playerColor(index) }}
    >
      {index + 1}
    </span>
  );
}

export function Avatar({ src, name, index = 0, size = 32, className = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size, boxShadow: `0 0 0 2px var(--bg), 0 0 0 3.5px ${playerColor(index)}` }}
      />
    );
  }
  const letter = (name || "?").replace(/^Demo · /, "").slice(0, 1).toUpperCase();
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-display font-bold text-bg ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42, background: playerColor(index), boxShadow: "0 0 0 2px var(--bg)" }}
    >
      {letter}
    </span>
  );
}
