import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Yann Sommer', position: 'GK', age: 37, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/97746.jpg' },
  { number: 29, name: 'Nordin Jackers', position: 'GK', age: 29, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250066521.jpg' },
  // Defensores
  { number: 3, name: 'Han-beom Lee', position: 'DF', age: 24, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197263.jpg' },
  { number: 4, name: 'Joel Ordoñez', position: 'DF', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176201.jpg' },
  { number: 32, name: 'Matteo Dams', position: 'DF', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169764.jpg' },
  { number: 41, name: 'Hugo Siquet', position: 'DF', age: 24, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128898.jpg' },
  { number: 44, name: 'Brandon Mechele', position: 'DF', age: 33, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250053044.jpg' },
  { number: 54, name: 'Samba Coulibaly', position: 'DF', age: 18, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200895.jpg' },
  { number: 82, name: 'Samuel Van Hoogen', position: 'DF', age: 20, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189614.jpg' },
  { number: 90, name: 'Andre Garcia', position: 'DF', age: 18, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216973.jpg' },
  // Centrocampistas
  { number: 8, name: 'Freddie Potts', position: 'MF', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250165376.jpg' },
  { number: 10, name: 'Hugo Vetlesen', position: 'MF', age: 26, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250115134.jpg' },
  { number: 16, name: 'Cheveyo Tsawa', position: 'MF', age: 19, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250172155.jpg' },
  { number: 20, name: 'Hans Vanaken', position: 'MF', age: 34, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064188.jpg' },
  { number: 62, name: 'Lynnt Audoor', position: 'MF', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130405.jpg' },
  { number: 80, name: 'Félix Lemarechal', position: 'MF', age: 23, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250160006.jpg' },
  { number: 85, name: 'Tian Koren', position: 'MF', age: 17, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201806.jpg' },
  // Delanteros
  { number: 7, name: 'Nicolo Tresoldi', position: 'FW', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181849.jpg' },
  { number: 9, name: 'Carlos Forbs', position: 'FW', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138957.jpg' },
  { number: 11, name: 'Jan Virgili', position: 'FW', age: 20, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200748.jpg' },
  { number: 17, name: 'Romeo Vermant', position: 'FW', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138982.jpg' },
  { number: 27, name: 'Wisdom Mike', position: 'FW', age: 17, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201122.jpg' },
  { number: 39, name: 'Milan Robberechts', position: 'FW', age: 22, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225251.jpg' },
  { number: 67, name: 'Mamadou Diakhon', position: 'FW', age: 20, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192955.jpg' },
  { number: 77, name: 'Andrej Vasovic', position: 'FW', age: 18, club: 'Club Brugge KV', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250184377.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 4, 32, 41, 8, 10, 16, 7, 9, 11],
};
