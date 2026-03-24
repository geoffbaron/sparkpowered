"use client";

import { useEffect, useState } from "react";

interface Spark {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const sparkColors = [
  { bg: "#f59e0b", shadow: "rgba(245,158,11,0.35)" },
  { bg: "#ea580c", shadow: "rgba(234,88,12,0.3)" },
  { bg: "#fbbf24", shadow: "rgba(251,191,36,0.35)" },
  { bg: "#2563eb", shadow: "rgba(37,99,235,0.25)" },
  { bg: "#16a34a", shadow: "rgba(22,163,74,0.25)" },
];

export default function SparkBackground() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const generated: Spark[] = Array.from({ length: 28 }, (_, i) => {
      const colorEntry = sparkColors[i % sparkColors.length];
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        color: JSON.stringify(colorEntry),
      };
    });
    setSparks(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparks.map((spark) => {
        const colorEntry = JSON.parse(spark.color) as { bg: string; shadow: string };
        return (
          <div
            key={spark.id}
            className="absolute rounded-full spark-glow"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              background: colorEntry.bg,
              animationDelay: `${spark.delay}s`,
              animationDuration: `${spark.duration}s`,
              boxShadow: `0 0 ${spark.size * 4}px ${colorEntry.shadow}`,
            }}
          />
        );
      })}
    </div>
  );
}
