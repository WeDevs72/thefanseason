'use client';

import React, { useState, useEffect } from 'react';
import FanCard from './FanCard';
import { Profile, LeaderboardEntry } from '@/lib/types';

interface DummyCard {
  profile: Profile;
  stats: LeaderboardEntry;
  theme: string;
  titleBadge: string | null;
  badges: any[];
}

const DUMMY_CARDS: DummyCard[] = [
  {
    profile: {
      id: 'dummy-1',
      username: 'Messi_Magic',
      full_name: 'Leo Fan',
      avatar_url: null,
      country: 'Argentina',
      supported_team: 'Argentina',
      fan_card_tier: 'legend',
      is_premium: true,
      card_theme: 'shield_cyber_cyan',
      title_badge: 'Oracle',
      created_at: new Date().toISOString()
    },
    stats: {
      user_id: 'dummy-1',
      total_points: 920,
      correct_predictions: 72,
      total_predictions: 85,
      accuracy_percent: 85,
      current_streak: 9,
      rank: 1,
      updated_at: new Date().toISOString()
    },
    theme: 'shield_cyber_cyan',
    titleBadge: 'Oracle',
    badges: [
      { badge: { name: 'Century Points', icon: '💯' } },
      { badge: { name: 'Streak 5', icon: '🔥' } },
      { badge: { name: 'Top 10', icon: '🏆' } }
    ]
  },
  {
    profile: {
      id: 'dummy-2',
      username: 'CR7_Fanatic',
      full_name: 'Cristiano Junior',
      avatar_url: null,
      country: 'Portugal',
      supported_team: 'Portugal',
      fan_card_tier: 'legend',
      is_premium: true,
      card_theme: 'shield_classic_red',
      title_badge: 'Oracle',
      created_at: new Date().toISOString()
    },
    stats: {
      user_id: 'dummy-2',
      total_points: 850,
      correct_predictions: 65,
      total_predictions: 80,
      accuracy_percent: 81,
      current_streak: 7,
      rank: 3,
      updated_at: new Date().toISOString()
    },
    theme: 'shield_classic_red',
    titleBadge: 'Oracle',
    badges: [
      { badge: { name: 'Century Points', icon: '💯' } },
      { badge: { name: 'Streak 5', icon: '🔥' } }
    ]
  },
  {
    profile: {
      id: 'dummy-3',
      username: 'Neymar_Jr10',
      full_name: 'Gabriel Santos',
      avatar_url: null,
      country: 'Brazil',
      supported_team: 'Brazil',
      fan_card_tier: 'expert',
      is_premium: true,
      card_theme: 'gold',
      title_badge: 'Goal God',
      created_at: new Date().toISOString()
    },
    stats: {
      user_id: 'dummy-3',
      total_points: 710,
      correct_predictions: 55,
      total_predictions: 75,
      accuracy_percent: 73,
      current_streak: 4,
      rank: 12,
      updated_at: new Date().toISOString()
    },
    theme: 'gold',
    titleBadge: 'Goal God',
    badges: [
      { badge: { name: 'First Prediction', icon: '🎯' } },
      { badge: { name: 'Century Points', icon: '💯' } }
    ]
  },
  {
    profile: {
      id: 'dummy-4',
      username: 'Bellingham_HQ',
      full_name: 'Jude Fan',
      avatar_url: null,
      country: 'England',
      supported_team: 'England',
      fan_card_tier: 'legend',
      is_premium: true,
      card_theme: 'galaxy',
      title_badge: 'The Analyst',
      created_at: new Date().toISOString()
    },
    stats: {
      user_id: 'dummy-4',
      total_points: 890,
      correct_predictions: 68,
      total_predictions: 78,
      accuracy_percent: 87,
      current_streak: 8,
      rank: 2,
      updated_at: new Date().toISOString()
    },
    theme: 'galaxy',
    titleBadge: 'The Analyst',
    badges: [
      { badge: { name: 'Century Points', icon: '💯' } },
      { badge: { name: 'Streak 5', icon: '🔥' } },
      { badge: { name: 'Top 10', icon: '🏆' } }
    ]
  },
  {
    profile: {
      id: 'dummy-5',
      username: 'Mbappe_Speed',
      full_name: 'Lucas Dubois',
      avatar_url: null,
      country: 'France',
      supported_team: 'France',
      fan_card_tier: 'expert',
      is_premium: true,
      card_theme: 'shield_apex_blue',
      title_badge: 'Tactician',
      created_at: new Date().toISOString()
    },
    stats: {
      user_id: 'dummy-5',
      total_points: 680,
      correct_predictions: 50,
      total_predictions: 70,
      accuracy_percent: 71,
      current_streak: 3,
      rank: 25,
      updated_at: new Date().toISOString()
    },
    theme: 'shield_apex_blue',
    titleBadge: 'Tactician',
    badges: [
      { badge: { name: 'First Prediction', icon: '🎯' } }
    ]
  }
];

export default function HeroFanCardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Rotate to 90 degrees (edge-on view)
      setIsTransitioning(true);
      setRotation(90);

      // 2. At 400ms (when completely edge-on), snap index and rotation back to -90
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex((prev) => (prev + 1) % DUMMY_CARDS.length);
        setRotation(-90);

        // 3. Immediately turn transition back on and rotate to 0 degrees to reveal next card
        setTimeout(() => {
          setIsTransitioning(true);
          setRotation(0);
        }, 30);
      }, 400);

    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const activeCard = DUMMY_CARDS[currentIndex];

  return (
    <div className="relative w-full max-w-[340px] h-[500px] flex items-center justify-center mx-auto select-none">
      {/* Dynamic Background Aura Glow matching active card theme */}
      <div 
        className="absolute inset-0 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000 scale-110"
        style={{
          background: activeCard.theme.includes('red') ? '#EF4444' :
                      activeCard.theme.includes('cyan') ? '#06B6D4' :
                      activeCard.theme.includes('blue') ? '#3B82F6' :
                      activeCard.theme.includes('gold') ? '#FFD700' :
                      activeCard.theme.includes('galaxy') ? '#8B5CF6' : '#00C853'
        }}
      />

      {/* 3D Perspective Card Wrapper */}
      <div
        className="relative"
        style={{
          perspective: '1200px',
        }}
      >
        <div
          style={{
            transform: `rotateY(${rotation}deg)`,
            transition: isTransitioning ? 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          <FanCard
            profile={activeCard.profile}
            stats={activeCard.stats}
            badges={activeCard.badges}
            theme={activeCard.theme}
            titleBadge={activeCard.titleBadge}
          />
        </div>
      </div>
    </div>
  );
}
