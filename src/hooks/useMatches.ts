import { useQuery } from '@tanstack/react-query';
import { Match, Game } from '@/types';

// Use Vite proxy to bypass CORS
const PANDASCORE_BASE_URL = '/api/pandascore';

interface FetchMatchesOptions {
  action?: 'running' | 'upcoming' | 'past';
  game?: Game;
}

interface PandaScoreMatch {
  id: number;
  name: string;
  slug: string;
  status: 'not_started' | 'running' | 'finished';
  scheduled_at: string;
  begin_at: string | null;
  number_of_games: number;
  videogame: { id: number; name: string; slug: string };
  league: { id: number; name: string; image_url: string | null };
  tournament: { id: number; name: string };
  opponents: Array<{ opponent: { id: number; name: string; acronym: string | null; image_url: string | null } }>;
  results: Array<{ team_id: number; score: number }>;
  games: Array<{ id: number; winner: { id: number } | null }>;
  streams_list: Array<{ raw_url: string }>;
  live: { url: string | null };
}

function transformMatch(match: PandaScoreMatch): Match {
  const teamA = match.opponents[0]?.opponent;
  const teamB = match.opponents[1]?.opponent;
  
  const teamAResult = match.results.find(r => r.team_id === teamA?.id);
  const teamBResult = match.results.find(r => r.team_id === teamB?.id);

  const teamAMapWins = match.games?.filter(g => g.winner?.id === teamA?.id).length || 0;
  const teamBMapWins = match.games?.filter(g => g.winner?.id === teamB?.id).length || 0;

  let game: Game = 'cs2';
  const gameSlug = match.videogame.slug.toLowerCase();
  if (gameSlug.includes('valorant')) game = 'valorant';
  else if (gameSlug.includes('league') || gameSlug.includes('lol')) game = 'league';
  else if (gameSlug.includes('dota')) game = 'dota2';

  let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
  if (match.status === 'running') status = 'live';
  else if (match.status === 'finished') status = 'finished';

  const currentRound = (teamAResult?.score || 0) + (teamBResult?.score || 0) + 1;

  return {
    id: `ps-${match.id}`,
    game,
    status,
    teamA: {
      id: teamA?.id?.toString() || 'unknown',
      name: teamA?.name || 'TBD',
      shortName: teamA?.acronym || teamA?.name?.substring(0, 4) || 'TBD',
      logo: teamA?.image_url || undefined,
      score: teamAResult?.score || 0,
    },
    teamB: {
      id: teamB?.id?.toString() || 'unknown',
      name: teamB?.name || 'TBD',
      shortName: teamB?.acronym || teamB?.name?.substring(0, 4) || 'TBD',
      logo: teamB?.image_url || undefined,
      score: teamBResult?.score || 0,
    },
    currentRound,
    totalRounds: match.number_of_games * 24,
    currentMap: `Map ${teamAMapWins + teamBMapWins + 1}`,
    mapScore: { teamA: teamAMapWins, teamB: teamBMapWins },
    tournament: match.tournament?.name || match.league?.name || 'Tournament',
    startTime: new Date(match.scheduled_at || match.begin_at || Date.now()),
    viewers: status === 'live' ? Math.floor(Math.random() * 100000) + 10000 : 0,
    bettingVolume: status === 'live' ? Math.floor(Math.random() * 50000) + 5000 : Math.floor(Math.random() * 5000),
  };
}

async function fetchMatches(options: FetchMatchesOptions = {}): Promise<Match[]> {
  const { action = 'running', game } = options;

  let endpoint = '/matches/running';
  if (action === 'upcoming') endpoint = '/matches/upcoming';
  else if (action === 'past') endpoint = '/matches/past';

  const params = new URLSearchParams();
  params.set('page[size]', '20');
  
  if (game) {
    const gameSlug = game === 'cs2' ? 'csgo' : game;
    params.set('filter[videogame]', gameSlug);
  }

  const response = await fetch(
    `${PANDASCORE_BASE_URL}${endpoint}?${params.toString()}`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`PandaScore API error: ${response.status}`);
  }

  const matches: PandaScoreMatch[] = await response.json();
  return matches.map(transformMatch);
}

export function useRunningMatches(game?: Game) {
  return useQuery({
    queryKey: ['matches', 'running', game],
    queryFn: () => fetchMatches({ action: 'running', game }),
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useUpcomingMatches(game?: Game) {
  return useQuery({
    queryKey: ['matches', 'upcoming', game],
    queryFn: () => fetchMatches({ action: 'upcoming', game }),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllMatches(game?: Game) {
  const runningQuery = useRunningMatches(game);
  const upcomingQuery = useUpcomingMatches(game);

  const matches = [
    ...(runningQuery.data || []),
    ...(upcomingQuery.data || []),
  ];

  return {
    data: matches,
    isLoading: runningQuery.isLoading || upcomingQuery.isLoading,
    isError: runningQuery.isError && upcomingQuery.isError,
    error: runningQuery.error || upcomingQuery.error,
    refetch: () => {
      runningQuery.refetch();
      upcomingQuery.refetch();
    },
  };
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async (): Promise<Match | null> => {
      const pandaScoreId = matchId.startsWith('ps-')
        ? matchId.replace('ps-', '')
        : matchId;

      const response = await fetch(
        `${PANDASCORE_BASE_URL}/matches/${pandaScoreId}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`PandaScore API error: ${response.status}`);
      }

      const match: PandaScoreMatch = await response.json();
      return transformMatch(match);
    },
    enabled: !!matchId,
    refetchInterval: matchId ? 30000 : false,
    staleTime: 15000,
    retry: 2,
  });
}
