"use client";

import { useEffect } from "react";

interface Props {
  name: string;
  onDismiss: () => void;
}

export default function StampToast({ name, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-[#4F2D7F] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 whitespace-nowrap">
        <span className="text-lg">📍</span>
        <div>
          <p className="text-xs font-semibold tracking-wide opacity-80">Stamp Collected!</p>
          <p className="text-sm font-bold">{name}</p>
        </div>
      </div>
    </div>
  );
}
