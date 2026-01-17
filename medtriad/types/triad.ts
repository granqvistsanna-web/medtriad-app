/**
 * Medical triad categories for grouping and distractor selection
 */
export type TriadCategory =
  | 'cardiology'
  | 'neurology'
  | 'endocrine'
  | 'pulmonary'
  | 'gastroenterology'
  | 'infectious'
  | 'hematology'
  | 'rheumatology'
  | 'renal'
  | 'obstetrics';

/**
 * A medical triad - a condition characterized by three clinical findings
 */
export interface Triad {
  /** Unique identifier for the triad (e.g., "becks-triad") */
  id: string;

  /** The medical condition name (e.g., "Cardiac Tamponade") */
  condition: string;

  /** Exactly three clinical findings - tuple type enforces this at compile time */
  findings: [string, string, string];

  /** Category for grouping and distractor selection */
  category: TriadCategory;
}

/**
 * Container type matching the JSON data structure
 */
export interface TriadsData {
  triads: Triad[];
}
