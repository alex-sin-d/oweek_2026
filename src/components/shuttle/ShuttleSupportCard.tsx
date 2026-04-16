interface ShuttleSupportCardProps {
  email: string;
}

export default function ShuttleSupportCard({ email }: ShuttleSupportCardProps) {
  return (
    <section className="rounded-[24px] bg-white/78 px-4 py-4 ring-1 ring-white/75 shadow-[0_14px_28px_rgba(79,45,127,0.06)] backdrop-blur">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#85789a]">
        Support
      </p>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efe4fb] text-[#6f44ab]">
          <MailIcon />
        </div>

        <p className="text-[15px] font-medium text-[#433654]">
          Questions?{" "}
          <a
            href={`mailto:${email}`}
            className="font-semibold text-[#5d3196] underline decoration-[#ceb6ec] underline-offset-4"
          >
            {email}
          </a>
        </p>
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5.5 8.5 6.5 5 6.5-5" />
    </svg>
  );
}
