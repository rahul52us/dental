import React from "react";

const WaitingRoomIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      {/* 🕰️ Clock (Top Right) */}
      <circle cx="20" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="20" y1="5" x2="20" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="5" x2="21.2" y2="5.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />

      {/* 🪑 Left Backrest */}
      <path d="M3 10 h3 l-0.5 3.5 h-2 Z" fill="currentColor" opacity="0.4" />

      {/* 🪑 Right Backrest */}
      <path d="M18 10 h3 l-0.5 3.5 h-2 Z" fill="currentColor" opacity="0.4" />

      {/* 👤 Sitting Person (Center) */}
      {/* Head */}
      <circle cx="12" cy="7.5" r="1.8" fill="currentColor" />
      {/* Torso */}
      <path d="M10 10 h4 L13.5 13.5 h-3 Z" fill="currentColor" />
      {/* Legs sitting */}
      <path d="M11 13.5 v3.5 M13 13.5 v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* 🛋️ Seating Bench Horizontal Line */}
      <line x1="2" y1="13.5" x2="22" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* 🦵 Bench Legs */}
      <line x1="4" y1="13.5" x2="4" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="13.5" x2="20" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

export default WaitingRoomIcon;
