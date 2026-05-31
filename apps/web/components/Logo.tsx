"use client";

import { Allan } from "next/font/google";

const allan = Allan({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function Logo({ fontSize = 60, fillColor = "#000" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="29.12 174.926 170.1615 67.2"
      width="170.161px"
      height="67.2px"
      preserveAspectRatio="none"
    >
      <text
        fill={fillColor}
        style={{
          fontSize: fontSize,
          whiteSpace: "pre",
          fontFamily: allan.style.fontFamily,
        }}
        x="34.72"
        y="230.126"
        id="object-0"
        transform="matrix(1, 0, 0, 1, 1.4210854715202004e-14, 0)"
      >
        getissues
      </text>
    </svg>
  );
}

export default Logo;
