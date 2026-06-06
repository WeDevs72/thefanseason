import { Match, Prediction, Profile } from './types';

// Class merger utility
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// Timezone formatting helpers
export function getUserTimezone(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user-timezone');
    if (saved) return saved;
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
}

export function formatMatchDate(dateString: string, timeZone: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return 'Finished';
  }

  if (diffMins < 60) {
    return `Starts in ${diffMins}m`;
  }
  if (diffHours < 24) {
    return `Starts in ${diffHours}h`;
  }
  return `Starts in ${diffDays}d`;
}

// Points System Logic
export function calculatePoints(
  predictedWinner: 'home' | 'away' | 'draw',
  predictedHomeScore: number | null,
  predictedAwayScore: number | null,
  actualHomeScore: number | null,
  actualAwayScore: number | null
): { points: number; isCorrect: boolean } {
  if (actualHomeScore === null || actualAwayScore === null) {
    return { points: 0, isCorrect: false };
  }

  const actualWinner =
    actualHomeScore > actualAwayScore ? 'home' :
    actualAwayScore > actualHomeScore ? 'away' : 'draw';

  let points = 0;
  const isCorrect = predictedWinner === actualWinner;

  if (isCorrect) {
    points += 1; // 1 point for correct winner
    
    // Check if exact score matches
    if (
      predictedHomeScore === actualHomeScore &&
      predictedAwayScore === actualAwayScore
    ) {
      points += 2; // +2 bonus for exact score (total 3)
    }
  }

  return { points, isCorrect };
}

// Check and return appropriate Fan Card Tier
export function evaluateFanCardTier(stats: {
  total_predictions: number;
  accuracy_percent: number;
  rank: number | null;
}): 'rookie' | 'follower' | 'analyst' | 'expert' | 'legend' {
  const { total_predictions, accuracy_percent, rank } = stats;

  if (rank !== null && rank <= 10) return 'legend';
  if (rank !== null && rank <= 100) return 'expert';
  if (accuracy_percent >= 70 && total_predictions >= 10) return 'analyst';
  if (total_predictions >= 5) return 'follower';
  return 'rookie';
}
