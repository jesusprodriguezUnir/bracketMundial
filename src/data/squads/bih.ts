import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Nikola Vasilj', position: 'GK', age: 31, club: 'St Pauli' },
  { number: 12, name: 'Mladen Jurkas', position: 'GK', age: 18, club: 'Borac Banja Luka' },
  { number: 22, name: 'Martin Zlomislic', position: 'GK', age: 24, club: 'HNK Rijeka' },
  // Defensores
  { number: 2, name: 'Nihad Mujakic', position: 'DF', age: 25, club: 'Gaziantep' },
  { number: 3, name: 'Dennis Hadzikadunic', position: 'DF', age: 27, club: 'Sampdoria' },
  { number: 4, name: 'Tarik Muharemovic', position: 'DF', age: 24, club: 'Sassuolo' },
  { number: 5, name: 'Sead Kolasinac', position: 'DF', age: 32, club: 'Atalanta' },
  { number: 7, name: 'Amar Dedic', position: 'DF', age: 23, club: 'Benfica' },
  { number: 18, name: 'Nikola Katic', position: 'DF', age: 29, club: 'Schalke' },
  { number: 21, name: 'Stjepan Radeljic', position: 'DF', age: 29, club: 'HNK Rijeka' },
  { number: 24, name: 'Nidal Celik', position: 'DF', age: 24, club: 'Lens' },
  // Volantes
  { number: 6, name: 'Benjamin Tahirovic', position: 'MF', age: 23, club: 'Brøndby' },
  { number: 8, name: 'Armin Gigovic', position: 'MF', age: 24, club: 'Young Boys' },
  { number: 13, name: 'Ivan Basic', position: 'MF', age: 24, club: 'Astana' },
  { number: 14, name: 'Ivan Sunjic', position: 'MF', age: 28, club: 'Pafos' },
  { number: 16, name: 'Amir Hadziahmetovic', position: 'MF', age: 28, club: 'Hull City' },
  { number: 17, name: 'Dzenis Burnic', position: 'MF', age: 26, club: 'Karlsruhe' },
  { number: 26, name: 'Ermin Mahmic', position: 'MF', age: 21, club: 'Slovan Liberec' },
  // Delanteros
  { number: 9, name: 'Samed Bazdar', position: 'FW', age: 22, club: 'Real Zaragoza' },
  { number: 10, name: 'Ermedin Demirovic', position: 'FW', age: 27, club: 'Stuttgart' },
  { number: 11, name: 'Edin Dzeko', position: 'FW', age: 40, club: 'Schalke', captain: true },
  { number: 15, name: 'Amar Memic', position: 'FW', age: 24, club: 'Viktoria Plzen' },
  { number: 19, name: 'Kerim Alajbegovic', position: 'FW', age: 21, club: 'Bayer Leverkusen' },
  { number: 20, name: 'Esmir Bajraktarevic', position: 'FW', age: 20, club: 'PSV Eindhoven' },
  { number: 23, name: 'Haris Tabakovic', position: 'FW', age: 26, club: 'Borussia Mönchengladbach' },
  { number: 25, name: 'Jovo Lukic', position: 'FW', age: 24, club: 'Universitatea Cluj' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 7, 18, 3, 5, 6, 16, 20, 8, 10, 11]
};
