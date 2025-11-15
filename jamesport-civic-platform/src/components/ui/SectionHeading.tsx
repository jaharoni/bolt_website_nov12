interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="mb-6 max-w-3xl">
      {eyebrow && <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-2 text-lg text-slate-600">{description}</p>}
    </header>
  );
}
