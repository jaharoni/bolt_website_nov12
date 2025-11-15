interface Props {
  tags: string[];
}

export function TagList({ tags }: Props) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          #{tag}
        </li>
      ))}
    </ul>
  );
}
