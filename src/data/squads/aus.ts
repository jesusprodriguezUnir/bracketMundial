import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Mathew Ryan', position: 'GK', age: 33, club: 'Levante', captain: true },
  { number: 12, name: 'Paul Izzo', position: 'GK', age: 31, club: 'Randers' },
  { number: 18, name: 'Patrick Beach', position: 'GK', age: 23, club: 'Melbourne City' },
  // Defensores
  { number: 2, name: 'Milos Degenek', position: 'DF', age: 32, club: 'Apoel' },
  { number: 3, name: 'Alessandro Circati', position: 'DF', age: 22, club: 'Parma' },
  { number: 4, name: 'Jacob Italiano', position: 'DF', age: 24, club: 'Grazer AK' },
  { number: 5, name: 'Jordan Bos', position: 'DF', age: 23, club: 'Feyenoord' },
  { number: 6, name: 'Jason Geria', position: 'DF', age: 32, club: 'Albirex Niigata' },
  { number: 15, name: 'Kai Trewin', position: 'DF', age: 25, club: 'New York City' },
  { number: 16, name: 'Aziz Behich', position: 'DF', age: 35, club: 'Melbourne City' },
  { number: 19, name: 'Harry Souttar', position: 'DF', age: 27, club: 'Leicester' },
  { number: 21, name: 'Cameron Burgess', position: 'DF', age: 30, club: 'Swansea' },
  { number: 25, name: 'Lucas Herrington', position: 'DF', age: 19, club: 'Colorado Rapids' },
  // Volantes
  { number: 7, name: 'Mathew Leckie', position: 'MF', age: 35, club: 'Melbourne City' },
  { number: 8, name: 'Connor Metcalfe', position: 'MF', age: 27, club: 'St Pauli' },
  { number: 10, name: 'Ajdin Hrustic', position: 'MF', age: 30, club: 'Heracles Almelo' },
  { number: 13, name: 'Aiden O’Neill', position: 'MF', age: 28, club: 'New York City' },
  { number: 14, name: 'Cameron Devlin', position: 'MF', age: 27, club: 'Hearts' },
  { number: 20, name: 'Cristian Volpato', position: 'MF', age: 22, club: 'Sassuolo' },
  { number: 22, name: 'Jackson Irvine', position: 'MF', age: 32, club: 'St Pauli' },
  { number: 24, name: 'Paul Okon-Engstler', position: 'MF', age: 21, club: 'Sydney FC' },
  // Delanteros
  { number: 9, name: 'Mohamed Touré', position: 'FW', age: 22, club: 'Norwich' },
  { number: 11, name: 'Awer Mabil', position: 'FW', age: 30, club: 'Castellón' },
  { number: 17, name: 'Nestory Irankunda', position: 'FW', age: 19, club: 'Watford' },
  { number: 23, name: 'Nishan Velupillay', position: 'FW', age: 24, club: 'Melbourne Victory' },
  { number: 26, name: 'Tete Yengi', position: 'FW', age: 25, club: 'Machida Zelvia' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 5, 19, 2, 16, 22, 10, 8, 7, 20, 9]
};
