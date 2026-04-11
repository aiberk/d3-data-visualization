// ---------------------------------------------------------------------------
// The core data types — a two-level nested Record for O(1) country × year access
// ---------------------------------------------------------------------------

export interface YearData {
  total_count: number;
  sentiment: number;
  believer: number;
  neutral: number;
  denial: number;
  aggressive: number;
  sentiment_std: number | null;
  beliver_v_denier: number | null;
  aggressive_rate_believer: number | null;
  aggressive_rate_denier: number | null;
}

/**
 * The main data structure: country name → year → metrics.
 *
 * Access pattern: countryData["Argentina"][2018].sentiment → 0.130
 *
 * Two O(1) lookups to reach any data point. No filtering, no searching.
 * Sparse — not every country has every year. Missing entries return undefined.
 */
export interface DataStructure {
  [country: string]: {
    [year: number]: YearData;
  };
}
