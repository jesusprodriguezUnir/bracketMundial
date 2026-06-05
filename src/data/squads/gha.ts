import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Lawrence Ati-Zigi', position: 'GK', age: 30, club: 'St Gallen' },
  { number: 12, name: 'Joseph Anang', position: 'GK', age: 25, club: 'St Patrick\'s Athletic' },
  { number: 16, name: 'Benjamin Asare', position: 'GK', age: 33, club: 'Hearts of Oak' },
  // Defensores
  { number: 2, name: 'Alidu Seidu', position: 'DF', age: 26, club: 'Rennes' },
  { number: 4, name: 'Jonas Adjetey', position: 'DF', age: 22, club: 'Wolfsburg' },
  { number: 6, name: 'Abdul Mumin', position: 'DF', age: 28, club: 'Rayo Vallecano' },
  { number: 14, name: 'Gideon Mensah', position: 'DF', age: 28, club: 'Auxerre' },
  { number: 17, name: 'Baba Rahman', position: 'DF', age: 32, club: 'PAOK' },
  { number: 18, name: 'Jerome Opoku', position: 'DF', age: 28, club: 'Basaksehir' },
  { number: 21, name: 'Kojo Peprah Oppong', position: 'DF', age: 22, club: 'Nice' },
  { number: 23, name: 'Derrick Luckassen', position: 'DF', age: 31, club: 'Pafos' },
  { number: 26, name: 'Marvin Senaya', position: 'DF', age: 25, club: 'Auxerre' },
  // Volantes
  { number: 3, name: 'Caleb Yirenkyi', position: 'MF', age: 20, club: 'FC Nordsjælland' },
  { number: 5, name: 'Thomas Partey', position: 'MF', age: 32, club: 'Villarreal' },
  { number: 8, name: 'Kwasi Sibo', position: 'MF', age: 28, club: 'Real Oviedo' },
  { number: 15, name: 'Elisha Owusu', position: 'MF', age: 28, club: 'Auxerre' },
  { number: 20, name: 'Augustine Boakye', position: 'MF', age: 26, club: 'Saint-Étienne' },
  // Delanteros
  { number: 7, name: 'Abdul Fatawu', position: 'FW', age: 21, club: 'Leicester' },
  { number: 9, name: 'Jordan Ayew', position: 'FW', age: 34, club: 'Leicester', captain: true },
  { number: 10, name: 'Brandon Thomas-Asante', position: 'FW', age: 27, club: 'Coventry City' },
  { number: 11, name: 'Antoine Semenyo', position: 'FW', age: 25, club: 'Manchester City' },
  { number: 13, name: 'Christopher Bonsu Baah', position: 'FW', age: 22, club: 'Al-Qadsiah' },
  { number: 19, name: 'Iñaki Williams', position: 'FW', age: 32, club: 'Athletic Bilbao' },
  { number: 22, name: 'Kamaldeen Sulemana', position: 'FW', age: 24, club: 'Atalanta' },
  { number: 24, name: 'Ernest Nuamah', position: 'FW', age: 23, club: 'Lyon' },
  { number: 25, name: 'Prince Kwabena Adu', position: 'FW', age: 23, club: 'Viktoria Plzen' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 6, 14, 5, 15, 24, 11, 19]
};
