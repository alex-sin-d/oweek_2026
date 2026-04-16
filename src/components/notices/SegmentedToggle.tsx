"use client";

interface SegmentedToggleProps {
  value: "all" | "unread";
  onChange: (value: "all" | "unread") => void;
}

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
] as const;

export default function SegmentedToggle({
  value,
  onChange,
}: SegmentedToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Notice filters"
      className="grid grid-cols-2 rounded-full bg-[rgba(228,220,239,0.84)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_30px_rgba(79,45,127,0.08)] ring-1 ring-white/70 backdrop-blur"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-3 text-[16px] font-semibold tracking-[-0.02em] transition-all duration-200 ${
              active
                ? "bg-white text-[#221b34] shadow-[0_10px_20px_rgba(49,27,84,0.12)]"
                : "text-[#5d556d] hover:text-[#342a47]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
