import { generateGroupMatches } from './src/data/fifa-2026';

const matches = generateGroupMatches();
const dates = matches.map(m => m.date);
const uniqueDates = [...new Set(dates)];

console.log('Unique dates:', uniqueDates);
if (uniqueDates.length === 1) {
    console.log('BUG DETECTED: All matches have the same date:', uniqueDates[0]);
} else {
    console.log('Dates look correct. Found', uniqueDates.length, 'different dates.');
    console.log('Sample dates:', uniqueDates.slice(0, 5));
}
