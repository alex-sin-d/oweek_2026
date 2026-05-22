import Link from "next/link";
import type { PassportPreviewItem } from "@/data/passport";
import PassportStampTile from "@/components/passport/PassportStampTile";

interface HomePassportCardProps {
  collectedCount: number;
  totalCount: number;
  completionPercent: number;
  previewItems: PassportPreviewItem[];
  href: string;
  title?: string;
  supportingText?: string;
}

export default function HomePassportCard({
  collectedCount,
  totalCount,
  completionPercent,
  previewItems,
  href,
  title = "My Passport",
  supportingText = "Keep exploring to fill your passport",
}: HomePassportCardProps) {
  return (
    <section data-demo-target="passport-card" className="home-card-shadow relative mb-5 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(225,210,248,0.72),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.92),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,244,252,0.98)_100%)] px-5 py-5 ring-1 ring-white/85">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_72%)]" />
      <div className="pointer-events-none absolute -right-7 top-8 h-28 w-28 rounded-full bg-[#e7daf8]/60 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-3 h-24 w-24 rounded-full bg-[#f3ecfb] blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[34px] font-semibold leading-[0.96] tracking-[-0.055em] text-[#241736]">
            {title}
          </h2>

          <Link
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,rgba(241,231,252,0.98)_0%,rgba(230,214,249,0.98)_100%)] px-4 py-2.5 text-[15px] font-semibold tracking-[-0.03em] text-[#4f2d7f] shadow-[0_12px_28px_rgba(91,59,136,0.1)] ring-1 ring-white/85 transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
          >
            <span>View</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4">
          <p className="text-[24px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#2b1c3f]">
            {collectedCount} of {totalCount} locations collected
          </p>
          <p className="mt-1 text-[19px] font-medium tracking-[-0.03em] text-[#77688f]">
            {completionPercent}% complete
          </p>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-2.5">
          {previewItems.map((item) => (
            <PassportStampTile
              key={item.poiId}
              definition={item}
              state={item.state}
              variant="preview"
            />
          ))}
        </div>

        <p className="mt-5 text-[15px] font-medium tracking-[-0.02em] text-[#4d3d66]">
          {supportingText}
        </p>
      </div>
    </section>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}
