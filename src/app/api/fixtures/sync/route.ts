import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// High-fidelity fallback World Cup 2026 Matches starting June 11, 2026
const DEFAULT_MATCHES = [
  {
    api_match_id: 202601,
    home_team: 'USA',
    away_team: 'Morocco',
    home_team_logo: 'https://media.api-sports.io/football/teams/2384.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/31.png',
    match_date: '2026-06-11T18:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group A',
    venue: 'Azteca Stadium, Mexico City',
    status: 'upcoming'
  },
  {
    api_match_id: 202602,
    home_team: 'Canada',
    away_team: 'Australia',
    home_team_logo: 'https://media.api-sports.io/football/teams/2382.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/23.png',
    match_date: '2026-06-11T21:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group B',
    venue: 'BC Place, Vancouver',
    status: 'upcoming'
  },
  {
    api_match_id: 202603,
    home_team: 'Mexico',
    away_team: 'Japan',
    home_team_logo: 'https://media.api-sports.io/football/teams/16.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/12.png',
    match_date: '2026-06-12T01:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group C',
    venue: 'MetLife Stadium, East Rutherford',
    status: 'upcoming'
  },
  {
    api_match_id: 202604,
    home_team: 'Argentina',
    away_team: 'Saudi Arabia',
    home_team_logo: 'https://media.api-sports.io/football/teams/26.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/28.png',
    match_date: '2026-06-12T15:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group D',
    venue: 'SoFi Stadium, Los Angeles',
    status: 'upcoming'
  },
  {
    api_match_id: 202605,
    home_team: 'Brazil',
    away_team: 'Senegal',
    home_team_logo: 'https://media.api-sports.io/football/teams/6.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/13.png',
    match_date: '2026-06-13T18:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group E',
    venue: 'Hard Rock Stadium, Miami',
    status: 'upcoming'
  },
  {
    api_match_id: 202606,
    home_team: 'France',
    away_team: 'South Korea',
    home_team_logo: 'https://media.api-sports.io/football/teams/2.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/17.png',
    match_date: '2026-06-14T20:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group F',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    status: 'upcoming'
  },
  {
    api_match_id: 202607,
    home_team: 'England',
    away_team: 'Uruguay',
    home_team_logo: 'https://media.api-sports.io/football/teams/10.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/7.png',
    match_date: '2026-06-15T19:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group G',
    venue: 'Gillette Stadium, Boston',
    status: 'upcoming'
  },
  {
    api_match_id: 202608,
    home_team: 'Germany',
    away_team: 'Croatia',
    home_team_logo: 'https://media.api-sports.io/football/teams/9.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/3.png',
    match_date: '2026-06-16T17:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group H',
    venue: 'NRG Stadium, Houston',
    status: 'upcoming'
  },
  {
    api_match_id: 202609,
    home_team: 'Spain',
    away_team: 'India',
    home_team_logo: 'https://media.api-sports.io/football/teams/1.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/2381.png',
    match_date: '2026-06-17T21:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group I',
    venue: 'Lumen Field, Seattle',
    status: 'upcoming'
  },
  {
    api_match_id: 202610,
    home_team: 'Portugal',
    away_team: 'Netherlands',
    home_team_logo: 'https://media.api-sports.io/football/teams/27.png',
    away_team_logo: 'https://media.api-sports.io/football/teams/11.png',
    match_date: '2026-06-18T18:00:00Z',
    stage: 'Group Stage',
    group_name: 'Group J',
    venue: 'AT&T Stadium, Dallas',
    status: 'upcoming'
  },
  {
    api_match_id: 202611,
    home_team: 'Winner QF1',
    away_team: 'Winner QF2',
    home_team_logo: null,
    away_team_logo: null,
    match_date: '2026-07-14T20:00:00Z',
    stage: 'Semi Final',
    group_name: null,
    venue: 'Mercedes-Benz Stadium, Atlanta',
    status: 'upcoming'
  },
  {
    api_match_id: 202612,
    home_team: 'Winner QF3',
    away_team: 'Winner QF4',
    home_team_logo: null,
    away_team_logo: null,
    match_date: '2026-07-15T20:00:00Z',
    stage: 'Semi Final',
    group_name: null,
    venue: 'AT&T Stadium, Dallas',
    status: 'upcoming'
  },
  {
    api_match_id: 202613,
    home_team: 'Winner SF1',
    away_team: 'Winner SF2',
    home_team_logo: null,
    away_team_logo: null,
    match_date: '2026-07-19T19:00:00Z',
    stage: 'Final',
    group_name: null,
    venue: 'MetLife Stadium, East Rutherford',
    status: 'upcoming'
  }
];

export async function GET(req: Request) {
  try {
    // 1. Authorize Cron/Request
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const apiKey = process.env.API_FOOTBALL_KEY;
    const isMock = !apiKey || apiKey === '' || apiKey.startsWith('your_');
    
    const supabaseAdmin = createAdminClient();

    if (isMock) {
      console.log('API-Football Key is empty/mock. Performing direct local matches seed.');
      
      const { data, error } = await supabaseAdmin
        .from('matches')
        .upsert(DEFAULT_MATCHES, { onConflict: 'api_match_id' })
        .select();

      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        source: 'local_seeding_fallback',
        syncedCount: data.length,
        matches: data
      });
    }

    // Call API-Football for real match fixtures
    // World Cup League ID is usually 1, and the season is 2026
    const res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey
      }
    });

    if (!res.ok) {
      throw new Error(`API-Football returned error code: ${res.status}`);
    }

    const responseData = await res.json();
    const fixturesList = responseData.response || [];

    if (fixturesList.length === 0) {
      // If API-Football doesn't have fixtures yet, seed default ones
      const { data, error } = await supabaseAdmin
        .from('matches')
        .upsert(DEFAULT_MATCHES, { onConflict: 'api_match_id' })
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        source: 'local_seeding_empty_api_response',
        syncedCount: data.length,
        matches: data
      });
    }

    // Map API-Football data to our schema
    const mappedMatches = fixturesList.map((f: any) => ({
      api_match_id: f.fixture.id,
      home_team: f.teams.home.name,
      away_team: f.teams.away.name,
      home_team_logo: f.teams.home.logo,
      away_team_logo: f.teams.away.logo,
      match_date: f.fixture.date,
      stage: f.league.round || 'Group Stage',
      group_name: f.league.round?.includes('Group') ? f.league.round : null,
      venue: `${f.fixture.venue.name}, ${f.fixture.venue.city}`,
      status: f.fixture.status.short === 'FT' ? 'finished' :
              ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short) ? 'live' : 'upcoming',
      home_score: f.goals.home,
      away_score: f.goals.away
    }));

    const { data, error } = await supabaseAdmin
      .from('matches')
      .upsert(mappedMatches, { onConflict: 'api_match_id' })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      source: 'api_football',
      syncedCount: data.length,
      matches: data
    });
  } catch (error: any) {
    console.error('Error in matches sync endpoint:', error);
    return NextResponse.json({ error: error.message || 'Matches sync failed' }, { status: 500 });
  }
}
