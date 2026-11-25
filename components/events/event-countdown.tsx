"use client";

import React, { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

export function EventCountdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculate = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="rounded-md bg-secondary/80 border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Event Concluded
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
      <div className="rounded-md bg-black/60 border border-border p-2 sm:p-3 backdrop-blur">
        <span className="block text-xl sm:text-3xl font-black font-heading text-white">{timeLeft.days}</span>
        <span className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Days</span>
      </div>
      <div className="rounded-md bg-black/60 border border-border p-2 sm:p-3 backdrop-blur">
        <span className="block text-xl sm:text-3xl font-black font-heading text-white">{timeLeft.hours}</span>
        <span className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Hours</span>
      </div>
      <div className="rounded-md bg-black/60 border border-border p-2 sm:p-3 backdrop-blur">
        <span className="block text-xl sm:text-3xl font-black font-heading text-white">{timeLeft.minutes}</span>
        <span className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Mins</span>
      </div>
      <div className="rounded-md bg-black/60 border border-border p-2 sm:p-3 backdrop-blur">
        <span className="block text-xl sm:text-3xl font-black font-heading text-primary">{timeLeft.seconds}</span>
        <span className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Secs</span>
      </div>
    </div>
  );
}
