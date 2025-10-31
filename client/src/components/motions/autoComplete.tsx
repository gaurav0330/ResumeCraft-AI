"use client";
import { useEffect, useState } from "react";

const text = "Tailor your resume to any job in seconds";

export function TypingHeading() {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight heading-font">
      {displayed}
      <span className="animate-pulse">|</span>
    </h1>
  );
}
