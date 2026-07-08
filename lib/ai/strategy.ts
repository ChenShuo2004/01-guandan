import type { Card, CardRank } from "@/lib/guandan/card";
import { getRankCounts, sortCardsAscending } from "@/lib/guandan/card";
import { canBeatLastPlay } from "@/lib/guandan/cardCompare";
import { detectCardPattern } from "@/lib/guandan/cardRule";

export type AILevel = "easy" | "normal" | "hard";

export function chooseNormalMove(hand: Card[], lastPlayedCards: Card[]) {
  const candidates = generateCandidates(hand);

  if (lastPlayedCards.length === 0) {
    return chooseLeadMove(candidates);
  }

  const nonBombAnswer = candidates
    .filter((cards) => {
      const pattern = detectCardPattern(cards);
      return pattern.type !== "bomb" && pattern.type !== "fourJokers";
    })
    .filter((cards) => canBeatLastPlay(cards, lastPlayedCards).canPlay)
    .sort(compareCandidate)[0];

  if (nonBombAnswer) return nonBombAnswer;

  const lastPattern = detectCardPattern(lastPlayedCards);
  const handIsShort = hand.length <= 6;

  if (lastPattern.type === "bomb" || handIsShort) {
    return candidates
      .filter((cards) => canBeatLastPlay(cards, lastPlayedCards).canPlay)
      .sort(compareCandidate)[0] ?? [];
  }

  return [];
}

function chooseLeadMove(candidates: Card[][]) {
  const preferred = candidates
    .filter((cards) => {
      const pattern = detectCardPattern(cards);
      return pattern.type !== "bomb" && pattern.type !== "fourJokers";
    })
    .sort((a, b) => {
      if (a.length !== b.length) return b.length - a.length;
      return compareCandidate(a, b);
    })[0];

  return preferred ?? candidates.sort(compareCandidate)[0] ?? [];
}

function generateCandidates(hand: Card[]) {
  const candidates: Card[][] = [];
  const rankCounts = getRankCounts(hand);

  for (const group of rankCounts.values()) {
    const sortedGroup = sortCardsAscending(group);
    if (sortedGroup.length >= 1) candidates.push(sortedGroup.slice(0, 1));
    if (sortedGroup.length >= 2) candidates.push(sortedGroup.slice(0, 2));
    if (sortedGroup.length >= 3) candidates.push(sortedGroup.slice(0, 3));
    if (sortedGroup.length >= 4) candidates.push(sortedGroup);
  }

  for (const [rank, group] of rankCounts.entries()) {
    if (group.length < 3) continue;
    const pair = [...rankCounts.entries()].find(
      ([pairRank, pairGroup]) => pairRank !== rank && pairGroup.length >= 2
    );

    if (pair) {
      candidates.push([...sortCardsAscending(group).slice(0, 3), ...sortCardsAscending(pair[1]).slice(0, 2)]);
    }
  }

  const straight = findLowestStraight(rankCounts);
  if (straight.length >= 5) candidates.push(straight);

  const jokers = hand.filter((card) => card.isJoker);
  if (jokers.length === 4) candidates.push(sortCardsAscending(jokers));

  return candidates.filter((cards) => detectCardPattern(cards).valid);
}

function findLowestStraight(rankCounts: Map<CardRank, Card[]>) {
  const ranks = [...rankCounts.keys()].filter((rank) => rank < 15).sort((a, b) => a - b);
  let run: CardRank[] = [];

  for (const rank of ranks) {
    if (run.length === 0 || rank === run[run.length - 1] + 1) {
      run.push(rank);
    } else {
      run = [rank];
    }

    if (run.length >= 5) {
      return run.slice(0, 5).map((runRank) => sortCardsAscending(rankCounts.get(runRank) ?? [])[0]);
    }
  }

  return [];
}

function compareCandidate(a: Card[], b: Card[]) {
  const patternA = detectCardPattern(a);
  const patternB = detectCardPattern(b);
  return patternA.power - patternB.power;
}
