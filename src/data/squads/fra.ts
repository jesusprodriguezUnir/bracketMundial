import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Brice Samba', position: 'GK', age: 31, club: 'Rennes' },
  { number: 16, name: 'Mike Maignan', position: 'GK', age: 31, club: 'Milan' },
  { number: 23, name: 'Robin Risser', position: 'GK', age: 22, club: 'Lens' },
  // Defensores
  { number: 2, name: 'Malo Gusto', position: 'DF', age: 22, club: 'Chelsea' },
  { number: 3, name: 'Lucas Digne', position: 'DF', age: 32, club: 'Aston Villa' },
  { number: 4, name: 'Dayot Upamecano', position: 'DF', age: 27, club: 'Bayern Munich' },
  { number: 5, name: 'Jules Koundé', position: 'DF', age: 27, club: 'Barcelona' },
  { number: 15, name: 'Ibrahima Konaté', position: 'DF', age: 26, club: 'Free agent' },
  { number: 17, name: 'William Saliba', position: 'DF', age: 25, club: 'Arsenal' },
  { number: 19, name: 'Théo Hernández', position: 'DF', age: 29, club: 'Al-Hilal' },
  { number: 21, name: 'Lucas Hernández', position: 'DF', age: 30, club: 'Paris St-Germain' },
  { number: 26, name: 'Maxence Lacroix', position: 'DF', age: 26, club: 'Crystal Palace' },
  // Volantes
  { number: 6, name: 'Manu Koné', position: 'MF', age: 24, club: 'Roma' },
  { number: 8, name: 'Aurélien Tchouaméni', position: 'MF', age: 25, club: 'Real Madrid' },
  { number: 13, name: 'N\'Golo Kanté', position: 'MF', age: 35, club: 'Fenerbahce' },
  { number: 14, name: 'Adrien Rabiot', position: 'MF', age: 31, club: 'Milan' },
  { number: 18, name: 'Warren Zaïre-Emery', position: 'MF', age: 19, club: 'Paris St-Germain' },
  // Delanteros
  { number: 7, name: 'Ousmane Dembélé', position: 'FW', age: 28, club: 'Paris St-Germain' },
  { number: 9, name: 'Marcus Thuram', position: 'FW', age: 29, club: 'Inter' },
  { number: 10, name: 'Kylian Mbappé', position: 'FW', age: 27, club: 'Real Madrid', captain: true },
  { number: 11, name: 'Michael Olise', position: 'FW', age: 24, club: 'Bayern Munich' },
  { number: 12, name: 'Bradley Barcola', position: 'FW', age: 24, club: 'Paris St-Germain' },
  { number: 20, name: 'Désiré Doué', position: 'FW', age: 21, club: 'Paris St-Germain' },
  { number: 22, name: 'Jean-Philippe Mateta', position: 'FW', age: 28, club: 'Crystal Palace' },
  { number: 24, name: 'Rayan Cherki', position: 'FW', age: 22, club: 'Manchester City' },
  { number: 25, name: 'Maghnes Akliouche', position: 'FW', age: 24, club: 'Monaco' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [16, 19, 17, 4, 5, 8, 14, 18, 11, 10, 12]
};
