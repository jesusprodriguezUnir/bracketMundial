import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Bart Verbruggen', position: 'GK', age: 24, club: 'Brighton' },
  { number: 13, name: 'Robin Roefs', position: 'GK', age: 23, club: 'Sunderland' },
  { number: 23, name: 'Mark Flekken', position: 'GK', age: 33, club: 'Bayer Leverkusen' },
  // Defensores
  { number: 2, name: 'Jurriën Timber', position: 'DF', age: 25, club: 'Arsenal' },
  { number: 4, name: 'Virgil van Dijk', position: 'DF', age: 34, club: 'Liverpool', captain: true },
  { number: 5, name: 'Nathan Aké', position: 'DF', age: 31, club: 'Manchester City' },
  { number: 6, name: 'Jan Paul van Hecke', position: 'DF', age: 25, club: 'Brighton' },
  { number: 15, name: 'Micky van de Ven', position: 'DF', age: 25, club: 'Tottenham' },
  { number: 22, name: 'Denzel Dumfries', position: 'DF', age: 30, club: 'Inter' },
  { number: 25, name: 'Jorrel Hato', position: 'DF', age: 19, club: 'Chelsea' },
  // Volantes
  { number: 3, name: 'Marten de Roon', position: 'MF', age: 35, club: 'Atalanta' },
  { number: 8, name: 'Ryan Gravenberch', position: 'MF', age: 24, club: 'Liverpool' },
  { number: 12, name: 'Mats Wieffer', position: 'MF', age: 27, club: 'Brighton' },
  { number: 14, name: 'Tijjani Reijnders', position: 'MF', age: 28, club: 'Manchester City' },
  { number: 16, name: 'Guus Til', position: 'MF', age: 29, club: 'PSV Eindhoven' },
  { number: 20, name: 'Teun Koopmeiners', position: 'MF', age: 28, club: 'Juventus' },
  { number: 21, name: 'Frenkie de Jong', position: 'MF', age: 28, club: 'Barcelona' },
  { number: 26, name: 'Quinten Timber', position: 'MF', age: 25, club: 'Marseille' },
  // Delanteros
  { number: 7, name: 'Justin Kluivert', position: 'FW', age: 27, club: 'Bournemouth' },
  { number: 9, name: 'Wout Weghorst', position: 'FW', age: 33, club: 'Ajax' },
  { number: 10, name: 'Memphis Depay', position: 'FW', age: 32, club: 'Corinthians' },
  { number: 11, name: 'Cody Gakpo', position: 'FW', age: 26, club: 'Liverpool' },
  { number: 17, name: 'Noa Lang', position: 'FW', age: 27, club: 'Napoli' },
  { number: 18, name: 'Donyell Malen', position: 'FW', age: 27, club: 'Roma' },
  { number: 19, name: 'Brian Brobbey', position: 'FW', age: 24, club: 'Sunderland' },
  { number: 24, name: 'Crysencio Summerville', position: 'FW', age: 25, club: 'West Ham' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 22, 14, 8, 21, 11, 10, 18]
};
