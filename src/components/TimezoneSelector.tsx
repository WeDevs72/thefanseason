'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { getUserTimezone } from '@/lib/utils';

interface TimezoneSelectorProps {
  onTimezoneChange: (timezone: string) => void;
}

const COMMON_TIMEZONES = [
  { label: 'Auto (Local)', value: '' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'New York (EDT)', value: 'America/New_York' },
  { label: 'Los Angeles (PDT)', value: 'America/Los_Angeles' },
  { label: 'Mexico City (CST)', value: 'America/Mexico_City' },
  { label: 'Toronto (EDT)', value: 'America/Toronto' },
  { label: 'New Delhi (IST)', value: 'Asia/Kolkata' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
  { label: 'UTC', value: 'UTC' }
];

export default function TimezoneSelector({ onTimezoneChange }: TimezoneSelectorProps) {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('user-timezone') || '';
    setSelected(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected(value);
    if (value === '') {
      localStorage.removeItem('user-timezone');
      onTimezoneChange(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } else {
      localStorage.setItem('user-timezone', value);
      onTimezoneChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-dark text-xs font-bold text-text-muted hover:border-gaming-green/30 transition-colors">
      <Globe className="w-4 h-4 text-gaming-green" />
      <span className="uppercase tracking-wider text-[10px] hidden sm:inline">Timezone:</span>
      <select
        value={selected}
        onChange={handleChange}
        className="bg-transparent text-white font-sans font-bold focus:outline-none cursor-pointer pr-1"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.label} value={tz.value} className="bg-surface text-white">
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}
