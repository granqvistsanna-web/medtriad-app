/**
 * DESIGN SYSTEM EXCEPTION: Category Colors
 *
 * These 10 medical category color palettes serve UX purpose
 * (visual differentiation) and are intentionally outside the
 * semantic color system. See DESIGN-SYSTEM.md for rationale.
 */

import { TriadCategory } from '@/types';

export interface CategoryColorScheme {
  bg: string;
  text: string;
  activeBg: string;
}

export const CATEGORY_COLORS: Record<TriadCategory, CategoryColorScheme> = {
  // Muted, sophisticated palette harmonized with app's wine/teal aesthetic
  cardiology: { bg: '#F8E8EE', text: '#8B2252', activeBg: '#8B2252' },      // Wine (brand primary)
  neurology: { bg: '#E8F4F3', text: '#2D5F5B', activeBg: '#4A908A' },       // Muted teal
  endocrine: { bg: '#FDF6E8', text: '#9A6B2F', activeBg: '#9A6B2F' },       // Muted amber
  pulmonary: { bg: '#E8EEF4', text: '#456B8A', activeBg: '#456B8A' },       // Dusty blue
  gastroenterology: { bg: '#EBF5EE', text: '#3D7A5A', activeBg: '#3D7A5A' },// Sage green
  infectious: { bg: '#F5E8F0', text: '#7A3D6A', activeBg: '#7A3D6A' },      // Dusty mauve
  hematology: { bg: '#F5EBEB', text: '#8A4545', activeBg: '#8A4545' },      // Muted rose
  rheumatology: { bg: '#F0EBF5', text: '#5B4A7A', activeBg: '#5B4A7A' },    // Dusty purple
  renal: { bg: '#E8F2F5', text: '#3D6A7A', activeBg: '#3D6A7A' },           // Muted cyan
  obstetrics: { bg: '#F8EBF0', text: '#7A4A5B', activeBg: '#7A4A5B' },      // Dusty rose
};

export const CATEGORY_LABELS: Record<TriadCategory, string> = {
  cardiology: 'Cardiology',
  neurology: 'Neurology',
  endocrine: 'Endocrine',
  pulmonary: 'Pulmonary',
  gastroenterology: 'GI',
  infectious: 'Infectious',
  hematology: 'Hematology',
  rheumatology: 'Rheumatology',
  renal: 'Renal',
  obstetrics: 'OB/GYN',
};
