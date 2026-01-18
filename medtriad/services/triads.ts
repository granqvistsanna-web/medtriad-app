import triadsData from '@/data/triads.json';
import { Triad, TriadCategory } from '@/types';

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
