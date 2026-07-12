import type { BodygraphResult } from "./bodygraph";

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** IANA 시간대, 예: "Asia/Seoul" */
  timeZone: string;
}

export interface HumanDesignApiResponse extends BodygraphResult {
  interpretation: string;
  apiKeySource: string;
}

export interface HumanDesignApiError {
  error: string;
}
