import type { Player } from './index';
export const squad: Player[] = [
  // Porteros
  { number: 16, name: 'Mike Maignan', position: 'GK', club: 'AC Milan' },
  { number: 23, name: 'Robin Risser', position: 'GK', club: 'RC Strasbourg' },
  { number: 1, name: 'Brice Samba', position: 'GK', club: 'Stade Rennais FC' },
  // Defensas
  { number: 17, name: 'Lucas Digne', position: 'DF', club: 'Aston Villa FC' },
  { number: 2, name: 'Malo Gusto', position: 'DF', club: 'Chelsea FC' },
  { number: 21, name: 'Lucas Hernández', position: 'DF', club: 'Paris Saint-Germain' },
  { number: 22, name: 'Theo Hernández', position: 'DF', club: 'AC Milan' },
  { number: 12, name: 'Ibrahima Konaté', position: 'DF', club: 'Liverpool FC' },
  { number: 5, name: 'Jules Koundé', position: 'DF', club: 'FC Barcelona' },
  { number: 4, name: 'Maxence Lacroix', position: 'DF', club: 'Crystal Palace FC' },
  { number: 3, name: 'William Saliba', position: 'DF', club: 'Arsenal FC' },
  { number: 24, name: 'Dayot Upamecano', position: 'DF', club: 'FC Bayern Munich' },
  // Centrocampistas
  { number: 13, name: 'N\'Golo Kanté', position: 'MF', club: 'Al-Ittihad Club' },
  { number: 8, name: 'Manu Koné', position: 'MF', club: 'AS Roma' },
  { number: 6, name: 'Adrien Rabiot', position: 'MF', club: 'Olympique de Marseille' },
  { number: 18, name: 'Aurélien Tchouaméni', position: 'MF', club: 'Real Madrid CF' },
  { number: 25, name: 'Warren Zaïre-Emery', position: 'MF', club: 'Paris Saint-Germain' },
  // Delanteros
  { number: 26, name: 'Maghnes Akliouche', position: 'FW', club: 'AS Monaco' },
  { number: 11, name: 'Bradley Barcola', position: 'FW', club: 'Paris Saint-Germain' },
  { number: 20, name: 'Rayan Cherki', position: 'FW', club: 'Olympique Lyonnais' },
  { number: 7, name: 'Ousmane Dembélé', position: 'FW', club: 'Paris Saint-Germain' },
  { number: 19, name: 'Desiré Doué', position: 'FW', club: 'Paris Saint-Germain' },
  { number: 9, name: 'Jean-Philippe Mateta', position: 'FW', club: 'Crystal Palace FC' },
  { number: 10, name: 'Kylian Mbappé', position: 'FW', club: 'Real Madrid CF', captain: true },
  { number: 14, name: 'Michael Olise', position: 'FW', club: 'FC Bayern Munich' },
  { number: 15, name: 'Marcus Thuram', position: 'FW', club: 'Inter de Milán' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [16, 17, 3, 21, 22, 13, 6, 18, 10, 11, 7] // Ejemplo, ajustar según el once real
};
