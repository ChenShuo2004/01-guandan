export type CoachAction =
  | "idle"
  | "wave"
  | "thinking"
  | "point"
  | "warning"
  | "happy"
  | "correct"
  | "wrong"
  | "celebrate";

export interface CoachResponse {
  summary: string;
  recommendation: string;
  reasons: string[];
  warning?: string;
  action: CoachAction;
}
