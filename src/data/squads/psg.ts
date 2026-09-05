import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 16, name: 'Alessandro Longoni', position: 'GK', age: 18, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193777.jpg' },
  { number: 30, name: 'Lucas Chevalier', position: 'GK', age: 24, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135068.jpg' },
  { number: 39, name: 'Matvei Safonov', position: 'GK', age: 27, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250090101.jpg' },
  { number: 70, name: 'Arthur Vignaud', position: 'GK', age: 18, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192231.jpg' },
  // Defensores
  { number: 2, name: 'Achraf Hakimi', position: 'DF', age: 27, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088061.jpg' },
  { number: 4, name: 'Lucas Beraldo', position: 'DF', age: 22, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193442.jpg' },
  { number: 5, name: 'Marquinhos', position: 'DF', age: 32, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064064.jpg' },
  { number: 6, name: 'Illia Zabarnyi', position: 'DF', age: 24, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250119185.jpg' },
  { number: 12, name: 'Lucas Digne', position: 'DF', age: 33, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250014002.jpg' },
  { number: 21, name: 'Lucas Hernández', position: 'DF', age: 30, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250063803.jpg' },
  { number: 25, name: 'Nuno Mendes', position: 'DF', age: 24, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250136465.jpg' },
  { number: 42, name: 'David Boly', position: 'DF', age: 17, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200894.jpg' },
  { number: 51, name: 'Willian Pacho', position: 'DF', age: 24, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174126.jpg' },
  // Centrocampistas
  { number: 8, name: 'Fabián Ruiz', position: 'MF', age: 30, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250115436.jpg' },
  { number: 11, name: 'Maghnes Akliouche', position: 'MF', age: 24, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250160436.jpg' },
  { number: 17, name: 'Vitinha', position: 'MF', age: 26, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101444.jpg' },
  { number: 24, name: 'Senny Mayulu', position: 'MF', age: 20, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177597.jpg' },
  { number: 27, name: 'Dro Fernández', position: 'MF', age: 18, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192609.jpg' },
  { number: 33, name: 'Warren Zaïre-Emery', position: 'MF', age: 20, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153849.jpg' },
  { number: 87, name: 'João Neves', position: 'MF', age: 21, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164991.jpg' },
  // Delanteros
  { number: 7, name: 'Khvicha Kvaratskhelia', position: 'FW', age: 25, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101808.jpg' },
  { number: 9, name: 'Ferran Torres', position: 'FW', age: 26, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088320.jpg' },
  { number: 10, name: 'Ousmane Dembélé', position: 'FW', age: 29, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250066886.jpg' },
  { number: 14, name: 'Désiré Doué', position: 'FW', age: 21, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250162177.jpg' },
  { number: 22, name: 'Mika Godts', position: 'FW', age: 21, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154132.jpg' },
  { number: 47, name: 'Quentin Ndjantou', position: 'FW', age: 19, club: 'Paris Saint-Germain FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177602.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [16, 2, 4, 5, 6, 8, 11, 17, 7, 9, 10],
};
