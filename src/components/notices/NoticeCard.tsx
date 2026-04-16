"use client";

import type { NoticeIconKey, NoticeItem } from "@/data/notices";

interface NoticeCardProps {
  notice: NoticeItem;
  onPress?: () => void;
}

export default function NoticeCard({ notice, onPress }: NoticeCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="group relative block w-full rounded-[28px] bg-[rgba(255,255,255,0.94)] px-5 py-4 text-left shadow-[0_18px_36px_rgba(79,45,127,0.08)] ring-1 ring-white/80 backdrop-blur transition-[transform,box-shadow,background-color] duration-200 hover:bg-white active:scale-[0.988] active:shadow-[0_14px_30px_rgba(79,45,127,0.1)]"
    >
      {notice.unread && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f4eef9] bg-[#7d47d3] shadow-[0_8px_18px_rgba(79,45,127,0.24)]"
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <p className="text-[14px] font-medium tracking-[-0.01em] text-[#5d566d]">
          {notice.source}
        </p>
        <p className="shrink-0 text-[14px] font-medium tracking-[-0.01em] text-[#43385a]">
          {notice.timestamp}
        </p>
      </div>

      <div className="mt-3 pr-12">
        <h3 className="text-[18px] font-semibold leading-[1.14] tracking-[-0.04em] text-[#1f1830]">
          <span className="font-[750]">{`[${notice.category}] `}</span>
          <span>{notice.title}</span>
        </h3>
        <p className="mt-2 text-[15px] leading-[1.4] tracking-[-0.015em] text-[#514865]">
          {notice.subtitle}
        </p>
      </div>

      {notice.icon && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7a5ea6] opacity-[0.88] transition-transform duration-200 group-active:scale-[0.96]">
          <NoticeIcon icon={notice.icon} />
        </div>
      )}
    </button>
  );
}

function NoticeIcon({ icon }: { icon: Exclude<NoticeIconKey, null> }) {
  if (icon === "palette") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.65}
        className="h-11 w-11"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3a9 9 0 100 18h1.1a2.65 2.65 0 001.86-4.52l-.08-.08a1.72 1.72 0 011.2-2.93H18a3 3 0 003-3 8.99 8.99 0 00-9-7.47Z"
        />
        <circle cx="7.5" cy="11" r="1" />
        <circle cx="10" cy="7.5" r="1" />
        <circle cx="14.5" cy="7.8" r="1" />
        <circle cx="16.6" cy="11.6" r="1" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.5 14.8 5 5M14 15.3l1.4 1.4"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className="h-11 w-11"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.7 4.7 4.6 4.6a2.4 2.4 0 010 3.4l-6.4 6.4-5.6 1.1 1.1-5.6 6.4-6.4a2.4 2.4 0 013.4 0Z"
      />
      <path strokeLinecap="round" d="m13.5 5.9 4.6 4.6" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.4 19.6c1.8-.3 3.2.2 4.2 1.6"
      />
    </svg>
  );
}
