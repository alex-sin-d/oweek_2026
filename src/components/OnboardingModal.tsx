"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { RESIDENCE_TAGS, FACULTY_TAGS } from "@/lib/config";

export default function OnboardingModal() {
  const { profile, setProfile } = useApp();
  const [name, setName] = useState("");
  const [residence, setResidence] = useState<typeof RESIDENCE_TAGS[number] | null>(null);
  const [faculty, setFaculty] = useState<typeof FACULTY_TAGS[number] | null>(null);

  // Already completed onboarding
  if (profile) return null;

  const canSubmit = name.trim().length > 0 && residence !== null && faculty !== null;

  function handleSubmit() {
    if (!canSubmit || !residence || !faculty) return;
    setProfile({
      name: name.trim(),
      residenceTag: residence.tag,
      residencePoiId: residence.poiId,
      residenceLabel: residence.label,
      facultyTag: faculty.tag,
      facultyLabel: faculty.label,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4 sm:hidden" />
          <div className="w-10 h-10 rounded-full bg-[#4F2D7F] flex items-center justify-center mb-3">
            <span className="text-white text-lg font-bold">W</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to OWeek 2026</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Tell us a bit about yourself to get started
          </p>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your first name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F2D7F]/30 focus:border-[#4F2D7F] text-gray-900 text-sm"
            maxLength={40}
          />
        </div>

        {/* Residence */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your residence
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {RESIDENCE_TAGS.map((r) => (
              <button
                key={r.tag}
                onClick={() => setResidence(r)}
                className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                  residence?.tag === r.tag
                    ? "bg-[#4F2D7F] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Faculty */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your faculty
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {FACULTY_TAGS.map((f) => (
              <button
                key={f.tag}
                onClick={() => setFaculty(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                  faculty?.tag === f.tag
                    ? "bg-[#4F2D7F] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            canSubmit
              ? "bg-[#4F2D7F] text-white hover:bg-[#3d2263] shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Let&apos;s Go
        </button>
      </div>
    </div>
  );
}
