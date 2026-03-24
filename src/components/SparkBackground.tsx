"use client";

import { useEffect, useState } from "react";

interface Spark {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function SparkBackground() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const generated: Spark[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
    setSparks(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute rounded-full spark-glow"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            width: `${spark.size}px`,
            height: `${spark.size}px`,
            background: `radial-gradient(circle, #fbbf24, #f97316)`,
            animationDelay: `${spark.delay}s`,
            animationDuration: `${spark.duration}s`,
            boxShadow: `0 0 ${spark.size * 3}px rgba(251,191,36,0.4)`,
          }}
        />
      ))}
    </div>
  );
}
