"use client";

import { gameAudioAssets } from "@/lib/assets/audio-assets";
import { detectCardPattern } from "@/lib/guandan/cardRule";
import type { Card } from "@/lib/guandan/card";
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

const PLAYER_VOICE_EVENT: Partial<Record<PlayerId, GameAudioEvent>> = {
  enemyAI1: "voice.role0.play",
  partnerAI: "voice.role1.play",
  enemyAI2: "voice.role2.play"
};

const audioCache = new Map<string, HTMLAudioElement>();
const lastPlayedAt = new Map<GameAudioEvent, number>();
const DEFAULT_COOLDOWN_MS = 80;

export function playGameAudio(
  event: GameAudioEvent,
  enabled: boolean,
  options: { cooldownMs?: number; volume?: number } = {}
): void {
  if (!enabled || typeof window === "undefined") return;

  const now = Date.now();
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const lastPlayed = lastPlayedAt.get(event) ?? 0;
  if (now - lastPlayed < cooldownMs) return;

  const assetKey = EVENT_TO_ASSET[event];
  const asset = gameAudioAssets[assetKey];
  const audio = getAudio(asset.src);

  lastPlayedAt.set(event, now);
  audio.pause();
  audio.currentTime = 0;
  audio.volume = options.volume ?? asset.volume;

  void audio.play().catch(() => {
    // Browsers may block audio until the first user gesture. The next click will retry.
  });
}

export function playTurnAudio(entry: GameHistoryEntry, enabled: boolean): void {
  if (entry.action === "pass") {
    playGameAudio("play.pass", enabled, { cooldownMs: 180 });
    return;
  }

  const voiceEvent = PLAYER_VOICE_EVENT[entry.playerId];
  if (voiceEvent) {
    playGameAudio(voiceEvent, enabled, { cooldownMs: 140 });
  }

  playGameAudio(getPlayEvent(entry.cards), enabled, { cooldownMs: 90 });
}

function getAudio(src: string): HTMLAudioElement {
  const cached = audioCache.get(src);
  if (cached) return cached;

  const audio = new Audio(src);
  audio.preload = "auto";
  audioCache.set(src, audio);
  return audio;
}

function getPlayEvent(cards: Card[]): GameAudioEvent {
  const pattern = detectCardPattern(cards);

  if (pattern.type === "bomb" || pattern.type === "fourJokers") {
    return "play.bomb";
  }

  return "play.cards";
}
