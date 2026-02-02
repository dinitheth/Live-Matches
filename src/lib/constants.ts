/**
 * Game UI Constants
 * Display names and icons for supported esports games
 */

import { Game } from '@/types';

// Game display names
export const gameNames: Record<Game, string> = {
    'cs2': 'Counter-Strike 2',
    'valorant': 'VALORANT',
    'league': 'League of Legends',
    'dota2': 'Dota 2',
};

// Game emoji logos for quick visual identification
export const gameLogos: Record<Game, string> = {
    'cs2': '🎯',
    'valorant': '💥',
    'league': '🏰',
    'dota2': '⚔️',
};

// Extended game name lookup that handles variations
export function getGameDisplayName(game: string): string {
    const normalized = game.toLowerCase();

    // Handle common variations
    const variations: Record<string, Game> = {
        'cs2': 'cs2',
        'csgo': 'cs2',
        'counter-strike': 'cs2',
        'valorant': 'valorant',
        'lol': 'league',
        'league': 'league',
        'league of legends': 'league',
        'dota2': 'dota2',
        'dota': 'dota2',
    };

    const gameKey = variations[normalized];
    return gameKey ? gameNames[gameKey] : game;
}

export function getGameLogo(game: string): string {
    const normalized = game.toLowerCase();

    const variations: Record<string, Game> = {
        'cs2': 'cs2',
        'csgo': 'cs2',
        'valorant': 'valorant',
        'lol': 'league',
        'league': 'league',
        'dota2': 'dota2',
        'dota': 'dota2',
    };

    const gameKey = variations[normalized];
    return gameKey ? gameLogos[gameKey] : '🎮';
}
