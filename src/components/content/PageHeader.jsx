export default function PageHeader({ eyebrow, title, lede, children, accent = "text-accent-hi" }) {
  return (
    <header className="max-w-3xl">
      {eyebrow && <p className={`label ${accent}`}>{eyebrow}</p>}
      <h1 className="display-wide mt-3 text-display-lg">{title}</h1>
      {lede && <p className="mt-4 text-body-lg text-ink-2">{lede}</p>}
      {children}
    </header>
  );
}
