"use client";

import { gameAudioAssets } from "@/lib/assets/audio-assets";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { Card, CardRank } from "@/lib/guandan/card";
import type { GameHistoryEntry } from "@/lib/guandan/gameState";
import type { PlayerId } from "@/lib/guandan/player";

type AudioAssetKey = keyof typeof gameAudioAssets;

type GameAudioEvent =
  | "ui.click"
  | "ui.sortCards"
  | "ui.skipAi"
  | "table.deal"
  | "table.shuffle"
  | "play.cards"
  | "play.bomb"
  | "play.pass"
  | "voice.role0.play"
  | "voice.role1.play"
  | "voice.role2.play";

const EVENT_TO_ASSET: Record<GameAudioEvent, AudioAssetKey> = {
  "ui.click": "uiClick",
  "ui.sortCards": "uiSortCards",
  "ui.skipAi": "uiSkipAi",
  "table.deal": "tableDeal",
  "table.shuffle": "tableShuffle",
  "play.cards": "playCards",
  "play.bomb": "playBomb",
  "play.pass": "playPass",
  "voice.role0.play": "role0Play",
  "voice.role1.play": "role1Play",
  "voice.role2.play": "role2Play"
};

const PLAYER_VOICE_FOLDER: Record<PlayerId, string> = {
  player: "user",
  enemyAI1: "role-0",
  partnerAI: "role-1",
  enemyAI2: "role-2"
};

const VOICE_BASE_PATH = "/assets/audio/game/voice";
const audioCache = new Map<string, HTMLAudioElement>();
const lastPlayedAt = new Map<string, number>();
const DEFAULT_COOLDOWN_MS = 80;

export function playGameAudio(
  event: GameAudioEvent,
  enabled: boolean,
  options: { cooldownMs?: number; volume?: number } = {}
): void {
  const assetKey = EVENT_TO_ASSET[event];
  const asset = gameAudioAssets[assetKey];
  playAudioSrc(asset.src, enabled, event, {
    cooldownMs: options.cooldownMs,
    volume: options.volume ?? asset.volume
  });
}

export function playTurnAudio(entry: GameHistoryEntry, enabled: boolean): void {
  const voiceKey = getTurnVoiceKey(entry);

  if (voiceKey) {
    const folder = PLAYER_VOICE_FOLDER[entry.playerId];
    playAudioSrc(`${VOICE_BASE_PATH}/${folder}/plays/${voiceKey}.mp3`, enabled, `voice.${folder}.${voiceKey}`, {
      cooldownMs: 120,
      volume: 1
    });
  }

  if (entry.action === "pass") {
    playGameAudio("play.pass", enabled, { cooldownMs: 180 });
    return;
  }

  playGameAudio(getPlayEvent(entry.cards), enabled, { cooldownMs: 90 });
}

function playAudioSrc(
  src: string,
  enabled: boolean,
  cacheKey: string,
  options: { cooldownMs?: number; volume?: number } = {}
): void {
  if (!enabled || typeof window === "undefined") return;

  const now = Date.now();
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const lastPlayed = lastPlayedAt.get(cacheKey) ?? 0;
  if (now - lastPlayed < cooldownMs) return;

  const audio = getAudio(src);

  lastPlayedAt.set(cacheKey, now);
  audio.pause();
  audio.currentTime = 0;
  audio.volume = options.volume ?? 1;

  void audio.play().catch(() => {
    // Browsers may block audio until the first user gesture. The next click will retry.
  });
}

function getAudio(src: string): HTMLAudioElement {
  const cached = audioCache.get(src);
  if (cached) return cached;

  const audio = new Audio(src);
  audio.preload = "auto";
  audioCache.set(src, audio);
  return audio;
}

function getTurnVoiceKey(entry: GameHistoryEntry): string | null {
  if (entry.action === "pass") {
    return "pass";
  }

  return getPlayVoiceKey(entry.cards);
}

function getPlayVoiceKey(cards: Card[]): string | null {
  const pattern = detectCardPattern(cards);
  if (!pattern.valid) return null;

  if (pattern.type === "fourJokers") {
    return "four-jokers";
  }

  if (isStraightFlush(cards, pattern.type)) {
    return "straight-flush";
  }

  if (pattern.type === "straight") {
    return "straight";
  }

  if (pattern.type === "tripleWithPair") {
    return "triple-with-pair";
  }

  if (pattern.type === "single" || pattern.type === "pair" || pattern.type === "triple" || pattern.type === "bomb") {
    const rank = pattern.cards[0]?.rank ?? cards[0]?.rank;
    return rank ? `${pattern.type}-${getRankAudioKey(rank)}` : null;
  }

  return null;
}

function getPlayEvent(cards: Card[]): GameAudioEvent {
  const pattern = detectCardPattern(cards);

  if (pattern.type === "bomb" || pattern.type === "fourJokers") {
    return "play.bomb";
  }

  return "play.cards";
}

function isStraightFlush(cards: Card[], patternType: string): boolean {
  if (patternType !== "straight" || cards.length !== 5 || cards.some((card) => card.isJoker)) return false;

  const firstSuit = cards[0]?.suit;
  if (!firstSuit || firstSuit === "joker") return false;

  return cards.every((card) => card.suit === firstSuit);
}

function getRankAudioKey(rank: CardRank): string {
  if (rank === 11) return "j";
  if (rank === 12) return "q";
  if (rank === 13) return "k";
  if (rank === 14) return "a";
  if (rank === 15) return "2";
  if (rank === 16) return "sj";
  if (rank === 17) return "bj";
  return String(rank);
}
