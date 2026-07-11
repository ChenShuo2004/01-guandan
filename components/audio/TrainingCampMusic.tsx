"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { audioAssets } from "@/lib/assets/audio-assets";

const TARGET_VOLUME = 0.3;
const FADE_IN_MS = 1600;
const FADE_OUT_MS = 1200;
const FADE_STEP_MS = 50;
const TRAINING_ROUTE_PREFIXES = ["/practice", "/training/memory"];
const MUSIC_SETTING_EVENT = "guandan-training-camp-music-setting";
export const TRAINING_CAMP_MUSIC_PAUSE_EVENT = "guandan-training-camp-music-pause";

export function setTrainingCampMusicPaused(paused: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TRAINING_CAMP_MUSIC_PAUSE_EVENT, {
      detail: { paused }
    })
  );
}

let audio: HTMLAudioElement | null = null;
let fadeTimer: number | null = null;
let interactionCleanup: (() => void) | null = null;

function isTrainingCampRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return TRAINING_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getTrainingCampAudio() {
  if (!audio) {
    audio = new Audio(audioAssets.trainingCampBackground.src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
  }

  return audio;
}

function clearFadeTimer() {
  if (fadeTimer !== null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function clearInteractionFallback() {
  if (interactionCleanup) {
    interactionCleanup();
    interactionCleanup = null;
  }
}

function fadeTo(targetVolume: number, durationMs: number, onDone?: () => void) {
  const player = getTrainingCampAudio();
  const startVolume = player.volume;
  const totalSteps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
  let currentStep = 0;

  clearFadeTimer();

  fadeTimer = window.setInterval(() => {
    currentStep += 1;
    const progress = Math.min(currentStep / totalSteps, 1);
    player.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress >= 1) {
      clearFadeTimer();
      onDone?.();
    }
  }, FADE_STEP_MS);
}

async function startTrainingCampMusic() {
  const player = getTrainingCampAudio();
  player.loop = true;

  try {
    await player.play();
    clearInteractionFallback();
    fadeTo(TARGET_VOLUME, FADE_IN_MS);
  } catch {
    waitForFirstInteraction();
  }
}

function stopTrainingCampMusic() {
  clearInteractionFallback();

  if (!audio) {
    return;
  }

  fadeTo(0, FADE_OUT_MS, () => {
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  });
}

function pauseTrainingCampMusic() {
  clearFadeTimer();
  clearInteractionFallback();

  if (!audio) {
    return;
  }

  audio.pause();
}

function resumeTrainingCampMusic() {
  const player = getTrainingCampAudio();

  if (!player.paused) {
    return;
  }

  player.volume = TARGET_VOLUME;

  void player.play().catch(() => {
    waitForFirstInteraction();
  });
}

function waitForFirstInteraction() {
  if (interactionCleanup) {
    return;
  }

  const retryPlay = () => {
    clearInteractionFallback();
    void startTrainingCampMusic();
  };

  window.addEventListener("pointerdown", retryPlay, { once: true });
  window.addEventListener("keydown", retryPlay, { once: true });
  window.addEventListener("touchstart", retryPlay, { once: true });

  interactionCleanup = () => {
    window.removeEventListener("pointerdown", retryPlay);
    window.removeEventListener("keydown", retryPlay);
    window.removeEventListener("touchstart", retryPlay);
  };
}

export function TrainingCampMusic() {
  const pathname = usePathname();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [gamePaused, setGamePaused] = useState(false);
  const shouldPlay = musicEnabled && isTrainingCampRoute(pathname);

  useEffect(() => {
    function handleMusicSetting(event: Event) {
      const enabled = (event as CustomEvent<{ enabled: boolean }>).detail?.enabled;
      if (typeof enabled === "boolean") {
        setMusicEnabled(enabled);
      }
    }

    function handleMusicPause(event: Event) {
      const paused = (event as CustomEvent<{ paused: boolean }>).detail?.paused;
      if (typeof paused === "boolean") {
        setGamePaused(paused);
      }
    }

    window.addEventListener(MUSIC_SETTING_EVENT, handleMusicSetting);
    window.addEventListener(TRAINING_CAMP_MUSIC_PAUSE_EVENT, handleMusicPause);
    return () => {
      window.removeEventListener(MUSIC_SETTING_EVENT, handleMusicSetting);
      window.removeEventListener(TRAINING_CAMP_MUSIC_PAUSE_EVENT, handleMusicPause);
    };
  }, []);

  useEffect(() => {
    if (!shouldPlay) {
      stopTrainingCampMusic();
      return;
    }

    if (gamePaused) {
      pauseTrainingCampMusic();
      return;
    }

    if (audio?.paused) {
      resumeTrainingCampMusic();
      return;
    }

    void startTrainingCampMusic();
  }, [shouldPlay, gamePaused]);

  useEffect(() => {
    return () => {
      stopTrainingCampMusic();
      clearFadeTimer();
    };
  }, []);

  return null;
}
