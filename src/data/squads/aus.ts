import type { Player } from './index';

export const squad: Player[] = [
  // Goalkeepers
  { number: 1, name: 'Mathew Ryan', position: 'GK', age: 34, club: 'Levante UD', captain: true },
  { number: 12, name: 'Paul Izzo', position: 'GK', age: 31, club: 'Randers FC' },
  { number: 23, name: 'Patrick Beach', position: 'GK', age: 23, club: 'Melbourne City' },

  // Defenders
  { number: 2, name: 'Jordan Bos', position: 'DF', age: 23, club: 'Feyenoord' },
  { number: 3, name: 'Miloš Degenek', position: 'DF', age: 32, club: 'APOEL FC' },
  { number: 5, name: 'Harry Souttar', position: 'DF', age: 27, club: 'Leicester City' },
  { number: 13, name: 'Alessandro Circati', position: 'DF', age: 22, club: 'Parma Calcio 1913' },
  { number: 15, name: 'Aziz Behich', position: 'DF', age: 35, club: 'Melbourne City' },
  { number: 24, name: 'Cameron Burgess', position: 'DF', age: 30, club: 'Swansea City' },
  { number: 25, name: 'Lucas Herrington', position: 'DF', age: 19, club: 'Colorado Rapids' },
  { number: 26, name: 'Kai Trewin', position: 'DF', age: 25, club: 'New York City FC' },
  { number: 27, name: 'Jacob Italiano', position: 'DF', age: 24, club: 'Grazer AK' },
  { number: 28, name: 'Jason Geria', position: 'DF', age: 33, club: 'Albirex Niigata' },

  // Midfielders
  { number: 6, name: 'Aiden O\'Neill', position: 'MF', age: 27, club: 'New York City FC' },
  { number: 8, name: 'Jackson Irvine', position: 'MF', age: 33, club: 'FC St. Pauli' },
  { number: 10, name: 'Ajdin Hrustic', position: 'MF', age: 29, club: 'Heracles Almelo' },
  { number: 14, name: 'Connor Metcalfe', position: 'MF', age: 26, club: 'FC St. Pauli' },
  { number: 16, name: 'Cameron Devlin', position: 'MF', age: 28, club: 'Heart of Midlothian' },
  { number: 29, name: 'Paul Okon-Engstler', position: 'MF', age: 21, club: 'Sydney FC' },

  // Forwards
  { number: 7, name: 'Mathew Leckie', position: 'FW', age: 35, club: 'Melbourne City' },
  { number: 11, name: 'Cristian Volpato', position: 'FW', age: 22, club: 'Sassuolo' },
  { number: 19, name: 'Nestory Irankunda', position: 'FW', age: 20, club: 'Watford' },
  { number: 20, name: 'Awer Mabil', position: 'FW', age: 30, club: 'CD Castellón' },
  { number: 22, name: 'Mohamed Touré', position: 'FW', age: 22, club: 'Norwich City' },
  { number: 30, name: 'Tete Yengi', position: 'FW', age: 25, club: 'Machida Zelvia' },
  { number: 31, name: 'Nishan Velupillay', position: 'FW', age: 25, club: 'Melbourne Victory' }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 3, 15, 8, 10, 14, 7, 11, 22]
};
