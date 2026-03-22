const AppointmentIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* 📅 Calendar Board Outline (with bottom-right gap for clock) */}
      <path d="M 3 7 C 3 5.9 3.9 5 5 5 H 19 C 20.1 5 21 5.9 21 7 V 13 M 13 20 H 5 C 3.9 20 3 19.1 3 18 V 7" />

      {/* 🧾 Header Splitter */}
      <line x1="3" y1="10" x2="21" y2="10" />

      {/* 🖇️ Binder Rings */}
      <line x1="7" y1="3.5" x2="7" y2="6.5" />
      <line x1="12" y1="3.5" x2="12" y2="6.5" />
      <line x1="17" y1="3.5" x2="17" y2="6.5" />

      {/* 🗓️ Calendar Grid Dots */}
      <circle cx="6" cy="13" r="0.5" fill="currentColor" />
      <circle cx="10" cy="13" r="0.5" fill="currentColor" />
      <circle cx="14" cy="13" r="0.5" fill="currentColor" />

      <circle cx="6" cy="16" r="0.5" fill="currentColor" />
      <circle cx="10" cy="16" r="0.5" fill="currentColor" />

      {/* 🕰️ Clock Overlay (Bottom Right) */}
      <g transform="translate(14, 13)">
        <circle cx="4" cy="4" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Clock Hands */}
        <line x1="4" y1="4" x2="4" y2="1.5" strokeWidth="1.2" />
        <line x1="4" y1="4" x2="6.5" y2="4" strokeWidth="1.2" />
      </g>
    </svg>
  );
};

export default AppointmentIcon;
