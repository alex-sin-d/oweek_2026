interface ShuttleNotesCardProps {
  notes: readonly string[];
}

export default function ShuttleNotesCard({ notes }: ShuttleNotesCardProps) {
  return (
    <section className="home-card-shadow rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,240,250,0.96)_100%)] px-4 py-4 ring-1 ring-white/80">
      <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#211931]">
        Important Notes
      </h2>

      <ul className="mt-3 space-y-2.5">
        {notes.map((note) => (
          <li key={note} className="flex items-start gap-3 text-[14px] leading-[1.45] text-[#534568]">
            <span
              aria-hidden="true"
              className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full bg-[#7a49d0]"
            />
            <span className="font-medium">{note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
