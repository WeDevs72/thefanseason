import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'gold' | 'purple' | 'neon' | 'red';
  sub?: string;
}

const colorMap = {
  green: {
    icon: 'text-gaming-green',
    bg: 'bg-gaming-green/10',
    border: 'border-gaming-green/20',
    value: 'text-gaming-green',
  },
  gold: {
    icon: 'text-gaming-gold',
    bg: 'bg-gaming-gold/10',
    border: 'border-gaming-gold/20',
    value: 'text-gaming-gold',
  },
  purple: {
    icon: 'text-gaming-purple',
    bg: 'bg-gaming-purple/10',
    border: 'border-gaming-purple/20',
    value: 'text-gaming-purple',
  },
  neon: {
    icon: 'text-gaming-neon',
    bg: 'bg-gaming-neon/10',
    border: 'border-gaming-neon/20',
    value: 'text-gaming-neon',
  },
  red: {
    icon: 'text-red-400',
    bg: 'bg-red-950/30',
    border: 'border-red-800/30',
    value: 'text-red-400',
  },
};

export default function StatCard({ label, value, icon: Icon, color = 'green', sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`gaming-panel rounded-xl p-4 border ${c.border} relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</p>
          <p className={`font-mono text-2xl font-black mt-1 ${c.value}`}>{value}</p>
          {sub && <p className="text-[10px] text-text-muted font-bold mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
