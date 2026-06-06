'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="text-center font-mono font-black text-xl text-gaming-green animate-pulse py-2 uppercase tracking-widest">
        ⚽ MATCH LIVE OR FINISHED ⚽
      </div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center p-3 sm:p-4 bg-[#0d0f14] border border-border-dark rounded-xl min-w-[70px] sm:min-w-[90px] relative overflow-hidden group">
      {/* Glow highlight */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gaming-green opacity-40 group-hover:opacity-100 transition-opacity" />
      <span className="font-mono text-xl sm:text-3xl font-black text-white tracking-widest text-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] sm:text-[10px] font-bold text-gaming-green uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 select-none">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="font-mono text-xl sm:text-2xl font-bold text-border-dark animate-pulse">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="font-mono text-xl sm:text-2xl font-bold text-border-dark animate-pulse">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="font-mono text-xl sm:text-2xl font-bold text-border-dark animate-pulse">:</span>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
