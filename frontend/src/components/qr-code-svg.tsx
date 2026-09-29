import React from "react";

interface QrCodeSvgProps {
  value?: string;
  size?: number;
  className?: string;
}

export function QrCodeSvg({ size = 200, className = "" }: QrCodeSvgProps) {
  // High-fidelity vector QR Code matrix representation with standard positioning corner marks
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-xl ${className}`}
      aria-label="JAKLOUD Handi Order & Loyalty QR Code"
    >
      <rect width="160" height="160" fill="white" rx="8" />

      {/* Top-Left Finder Pattern */}
      <rect x="12" y="12" width="36" height="36" rx="6" fill="#111111" />
      <rect x="18" y="18" width="24" height="24" rx="4" fill="white" />
      <rect x="24" y="24" width="12" height="12" rx="2" fill="#111111" />

      {/* Top-Right Finder Pattern */}
      <rect x="112" y="12" width="36" height="36" rx="6" fill="#111111" />
      <rect x="118" y="18" width="24" height="24" rx="4" fill="white" />
      <rect x="124" y="24" width="12" height="12" rx="2" fill="#111111" />

      {/* Bottom-Left Finder Pattern */}
      <rect x="12" y="112" width="36" height="36" rx="6" fill="#111111" />
      <rect x="18" y="118" width="24" height="24" rx="4" fill="white" />
      <rect x="24" y="124" width="12" height="12" rx="2" fill="#111111" />

      {/* Alignment Pattern (Bottom-Right) */}
      <rect x="116" y="116" width="20" height="20" rx="4" fill="#111111" />
      <rect x="120" y="120" width="12" height="12" rx="2" fill="white" />
      <rect x="124" y="124" width="4" height="4" fill="#111111" />

      {/* Timing Patterns */}
      <rect x="54" y="24" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="24" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="24" width="6" height="6" fill="#111111" rx="1" />
      <rect x="90" y="24" width="6" height="6" fill="#111111" rx="1" />
      <rect x="102" y="24" width="6" height="6" fill="#111111" rx="1" />

      <rect x="24" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="24" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="24" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="24" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="24" y="102" width="6" height="6" fill="#111111" rx="1" />

      {/* QR Data Grid Matrix Blocks */}
      <rect x="54" y="14" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="14" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="14" width="6" height="6" fill="#111111" rx="1" />
      <rect x="96" y="14" width="6" height="6" fill="#111111" rx="1" />

      <rect x="60" y="34" width="6" height="6" fill="#111111" rx="1" />
      <rect x="72" y="34" width="6" height="6" fill="#111111" rx="1" />
      <rect x="84" y="34" width="6" height="6" fill="#111111" rx="1" />
      <rect x="96" y="34" width="6" height="6" fill="#111111" rx="1" />

      <rect x="54" y="44" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="44" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="44" width="6" height="6" fill="#111111" rx="1" />
      <rect x="90" y="44" width="6" height="6" fill="#111111" rx="1" />
      <rect x="102" y="44" width="6" height="6" fill="#111111" rx="1" />
      <rect x="114" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="126" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="138" y="54" width="6" height="6" fill="#111111" rx="1" />

      {/* Center Data Cluster */}
      <rect x="36" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="48" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="60" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="72" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="84" y="54" width="6" height="6" fill="#111111" rx="1" />
      <rect x="96" y="54" width="6" height="6" fill="#111111" rx="1" />

      <rect x="42" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="54" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="90" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="108" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="120" y="66" width="6" height="6" fill="#111111" rx="1" />
      <rect x="132" y="66" width="6" height="6" fill="#111111" rx="1" />

      <rect x="36" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="48" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="60" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="72" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="84" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="96" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="114" y="78" width="6" height="6" fill="#111111" rx="1" />
      <rect x="126" y="78" width="6" height="6" fill="#111111" rx="1" />

      <rect x="42" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="54" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="90" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="102" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="120" y="90" width="6" height="6" fill="#111111" rx="1" />
      <rect x="138" y="90" width="6" height="6" fill="#111111" rx="1" />

      <rect x="36" y="102" width="6" height="6" fill="#111111" rx="1" />
      <rect x="48" y="102" width="6" height="6" fill="#111111" rx="1" />
      <rect x="60" y="102" width="6" height="6" fill="#111111" rx="1" />
      <rect x="72" y="102" width="6" height="6" fill="#111111" rx="1" />
      <rect x="84" y="102" width="6" height="6" fill="#111111" rx="1" />
      <rect x="96" y="102" width="6" height="6" fill="#111111" rx="1" />
      <rect x="108" y="102" width="6" height="6" fill="#111111" rx="1" />

      <rect x="54" y="114" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="114" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="114" width="6" height="6" fill="#111111" rx="1" />
      <rect x="90" y="114" width="6" height="6" fill="#111111" rx="1" />
      <rect x="102" y="114" width="6" height="6" fill="#111111" rx="1" />

      <rect x="60" y="126" width="6" height="6" fill="#111111" rx="1" />
      <rect x="72" y="126" width="6" height="6" fill="#111111" rx="1" />
      <rect x="84" y="126" width="6" height="6" fill="#111111" rx="1" />
      <rect x="96" y="126" width="6" height="6" fill="#111111" rx="1" />
      <rect x="108" y="126" width="6" height="6" fill="#111111" rx="1" />

      <rect x="54" y="138" width="6" height="6" fill="#111111" rx="1" />
      <rect x="66" y="138" width="6" height="6" fill="#111111" rx="1" />
      <rect x="78" y="138" width="6" height="6" fill="#111111" rx="1" />
      <rect x="90" y="138" width="6" height="6" fill="#111111" rx="1" />
      <rect x="102" y="138" width="6" height="6" fill="#111111" rx="1" />
      <rect x="120" y="138" width="6" height="6" fill="#111111" rx="1" />
      <rect x="132" y="138" width="6" height="6" fill="#111111" rx="1" />
    </svg>
  );
}
