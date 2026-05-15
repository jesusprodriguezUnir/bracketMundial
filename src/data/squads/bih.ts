import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Nikola Vasilj', position: 'GK', age: 30, club: 'St. Pauli' },
  { number: 12, name: 'Martin Zlomislić', position: 'GK', age: 24, club: 'Rijeka' },
  { number: 23, name: 'Osman Hadžikić', position: 'GK', age: 25, club: 'Slaven Belupo' },
  { number: 2, name: 'Sead Kolašinac', position: 'DF', age: 32, club: 'Atalanta' },
  { number: 3, name: 'Jusuf Gazibegović', position: 'DF', age: 26, club: 'Sturm Graz' },
  { number: 4, name: 'Nikola Katić', position: 'DF', age: 28, club: 'Schalke' },
  { number: 5, name: 'Dennis Hadžikadunić', position: 'DF', age: 26, club: 'Sampdoria' },
  { number: 15, name: 'Amar Dedić', position: 'DF', age: 23, club: 'Benfica' },
  { number: 17, name: 'Tarik Muharemović', position: 'DF', age: 24, club: 'Sassuolo' },
  { number: 19, name: 'Nihad Mujakić', position: 'DF', age: 25, club: 'Gaziantep' },
  { number: 20, name: 'Stjepan Radeljić', position: 'DF', age: 27, club: 'Rijeka' },
  { number: 21, name: 'Nidal Čelik', position: 'DF', age: 24, club: 'Lens' },
  { number: 6, name: 'Amir Hadžiahmetović', position: 'MF', age: 28, club: 'Hull City' },
  { number: 8, name: 'Benjamin Tahirović', position: 'MF', age: 23, club: 'Brøndby' },
  { number: 10, name: 'Armin Gigović', position: 'MF', age: 23, club: 'Young Boys' },
  { number: 11, name: 'Dženis Burnić', position: 'MF', age: 26, club: 'Karlsruher SC' },
  { number: 13, name: 'Ivan Bašić', position: 'MF', age: 24, club: 'Astana' },
  { number: 14, name: 'Esmir Bajraktarević', position: 'MF', age: 21, club: 'PSV Eindhoven' },
  { number: 16, name: 'Amar Memić', position: 'MF', age: 24, club: 'Viktoria Plzeň' },
  { number: 18, name: 'Ivan Šunjić', position: 'MF', age: 28, club: 'Pafos' },
  { number: 22, name: 'Kerim Alajbegović', position: 'MF', age: 21, club: 'RB Salzburg' },
  { number: 7, name: 'Edin Džeko', position: 'FW', age: 40, club: 'Schalke', captain: true },
  { number: 9, name: 'Ermedin Demirović', position: 'FW', age: 27, club: 'Stuttgart' },
  { number: 26, name: 'Samed Baždar', position: 'FW', age: 22, club: 'Jagiellonia Białystok' },
  { number: 27, name: 'Haris Tabaković', position: 'FW', age: 26, club: 'Borussia Mönchengladbach' },
  { number: 25, name: 'Jovo Lukić', position: 'FW', age: 24, club: 'Universitatea Cluj' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 15, 4, 5, 2, 8, 6, 14, 10, 9, 7]
};