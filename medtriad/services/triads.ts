import triadsData from '@/data/triads.json';
import { Triad, TriadCategory } from '@/types';
import { shuffle } from '@/utils/shuffle';

// Type assertion for imported JSON
const triads = triadsData.triads as Triad[];

/**
 * Get all triads from the dataset
 */
export function getAllTriads(): Triad[] {
  return triads;
}

/**
 * Get triads filtered by category
 */
export function getTriadsByCategory(category: TriadCategory): Triad[] {
  return triads.filter(t => t.category === category);
}

/**
 * Get a random subset of triads
 * Used for generating a round of questions
 */
export function getRandomTriads(count: number): Triad[] {
  const shuffled = shuffle([...triads]);
  return shuffled.slice(0, Math.min(count, triads.length));
}
