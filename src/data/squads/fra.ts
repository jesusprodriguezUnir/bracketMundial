import type { Player } from './index';
export const squad: Player[] = [
  { number: 16, name: 'Mike Maignan', position: 'GK', age: 30, club: 'AC Milan' },
  { number: 1, name: 'Brice Samba', position: 'GK', age: 31, club: 'Stade Rennais FC' },
  { number: 23, name: 'Robin Risser', position: 'GK', age: 21, club: 'RC Strasbourg' },
  { number: 5, name: 'Jules Koundé', position: 'DF', age: 27, club: 'FC Barcelona' },
  { number: 2, name: 'Malo Gusto', position: 'DF', age: 22, club: 'Chelsea FC' },
  { number: 21, name: 'Lucas Hernández', position: 'DF', age: 30, club: 'Paris Saint-Germain' },
  { number: 19, name: 'Theo Hernández', position: 'DF', age: 28, club: 'AC Milan' },
  { number: 12, name: 'Ibrahima Konaté', position: 'DF', age: 26, club: 'Liverpool FC' },
  { number: 4, name: 'William Saliba', position: 'DF', age: 25, club: 'Arsenal FC' },
  { number: 3, name: 'Dayot Upamecano', position: 'DF', age: 27, club: 'FC Bayern Munich' },
  { number: 22, name: 'Maxence Lacroix', position: 'DF', age: 25, club: 'Crystal Palace FC' },
  { number: 24, name: 'Lucas Digne', position: 'DF', age: 32, club: 'Aston Villa FC' },
  { number: 6, name: 'Aurélien Tchouaméni', position: 'MF', age: 25, club: 'Real Madrid CF' },
  { number: 8, name: 'Manu Koné', position: 'MF', age: 24, club: 'AS Roma' },
  { number: 17, name: 'Adrien Rabiot', position: 'MF', age: 30, club: 'Olympique de Marseille' },
  { number: 10, name: 'Warren Zaïre-Emery', position: 'MF', age: 20, club: 'Paris Saint-Germain' },
  { number: 14, name: 'N\'Golo Kanté', position: 'MF', age: 35, club: 'Al-Ittihad Club' },
  { number: 7, name: 'Ousmane Dembélé', position: 'FW', age: 28, club: 'Paris Saint-Germain' },
  { number: 9, name: 'Kylian Mbappé', position: 'FW', age: 27, club: 'Real Madrid CF', captain: true },
  { number: 11, name: 'Bradley Barcola', position: 'FW', age: 23, club: 'Paris Saint-Germain' },
  { number: 20, name: 'Rayan Cherki', position: 'FW', age: 22, club: 'Olympique Lyonnais' },
  { number: 13, name: 'Désiré Doué', position: 'FW', age: 20, club: 'Paris Saint-Germain' },
  { number: 25, name: 'Michael Olise', position: 'FW', age: 24, club: 'FC Bayern Munich' },
  { number: 15, name: 'Marcus Thuram', position: 'FW', age: 28, club: 'Inter de Milán' },
  { number: 18, name: 'Jean-Philippe Mateta', position: 'FW', age: 28, club: 'Crystal Palace FC' },
  { number: 26, name: 'Maghnes Akliouche', position: 'FW', age: 24, club: 'AS Monaco' }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [16, 19, 4, 3, 5, 6, 17, 10, 25, 9, 11]
};
