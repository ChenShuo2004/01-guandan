"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { audioAssets } from "@/lib/assets/audio-assets";

const TARGET_VOLUME = 0.3;
const FADE_IN_MS = 1600;
const FADE_OUT_MS = 1200;
const FADE_STEP_MS = 50;
const TRAINING_ROUTE_PREFIXES = ["/practice"];

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
  const shouldPlay = isTrainingCampRoute(pathname);

  useEffect(() => {
    if (shouldPlay) {
      void startTrainingCampMusic();
      return;
    }

    stopTrainingCampMusic();
  }, [shouldPlay]);

  useEffect(() => {
    return () => {
      stopTrainingCampMusic();
      clearFadeTimer();
    };
  }, []);

  return null;
}
