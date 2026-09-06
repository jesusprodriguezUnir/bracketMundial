import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Tjark Ernst', position: 'GK', age: 23, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128150.jpg' },
  { number: 33, name: 'Florian Kastenmeier', position: 'GK', age: 29, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225049.jpg' },
  { number: 37, name: 'Mannou Berger', position: 'GK', age: 21, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250178085.jpg' },
  { number: 39, name: 'Liam Bossin', position: 'GK', age: 30, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065934.jpg' },
  { number: 51, name: 'Stenn De Mol', position: 'GK', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199586.jpg' },
  { number: 61, name: 'Tim Haksteeg', position: 'GK', age: 20, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183766.jpg' },
  // Defensores
  { number: 2, name: 'Bart Nieuwkoop', position: 'DF', age: 30, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250056685.jpg' },
  { number: 4, name: 'Tsuyoshi Watanabe', position: 'DF', age: 29, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187148.jpg' },
  { number: 5, name: 'Gijs Smal', position: 'DF', age: 29, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174851.jpg' },
  { number: 6, name: 'Jerry St. Juste', position: 'DF', age: 29, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250087967.jpg' },
  { number: 15, name: 'Jordan Bos', position: 'DF', age: 23, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192004.jpg' },
  { number: 16, name: 'Javi Lopez', position: 'DF', age: 24, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250126914.jpg' },
  { number: 20, name: 'Mats Deijl', position: 'DF', age: 29, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197412.jpg' },
  { number: 24, name: 'Thijs Kraaijeveld', position: 'DF', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250182482.jpg' },
  { number: 26, name: 'Givairo Read', position: 'DF', age: 20, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183808.jpg' },
  { number: 32, name: 'Tijme Wessels', position: 'DF', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199597.jpg' },
  { number: 35, name: 'Mika Medina', position: 'DF', age: 25, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123956.jpg' },
  { number: 52, name: 'Marleyson Cruz', position: 'DF', age: 20, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189848.jpg' },
  { number: 53, name: 'Twan Schens', position: 'DF', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199595.jpg' },
  { number: 55, name: 'Hakeem Agboluaje', position: 'DF', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190228.jpg' },
  { number: 63, name: 'Matthew Mparaganda', position: 'DF', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199589.jpg' },
  { number: 65, name: 'Dani Slory', position: 'DF', age: 17, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200576.jpg' },
  { number: 70, name: 'Boaz Plantinga', position: 'DF', age: 17, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216077.jpg' },
  // Centrocampistas
  { number: 7, name: 'Jakub Moder', position: 'MF', age: 27, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250092129.jpg' },
  { number: 8, name: 'Gjivai Zechiel', position: 'MF', age: 22, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250178067.jpg' },
  { number: 10, name: 'Luciano Valente', position: 'MF', age: 22, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250208803.jpg' },
  { number: 14, name: 'Sem Steijn', position: 'MF', age: 24, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174850.jpg' },
  { number: 22, name: 'Tobias Van Den Elshout', position: 'MF', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193618.jpg' },
  { number: 28, name: 'Oussama Targhalline', position: 'MF', age: 24, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163878.jpg' },
  { number: 34, name: 'Charles Vanhoutte', position: 'MF', age: 27, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187845.jpg' },
  { number: 54, name: 'Nick De Koning', position: 'MF', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200556.jpg' },
  { number: 56, name: 'Nassim El Harmouz', position: 'MF', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190226.jpg' },
  { number: 60, name: 'Kevin Khan', position: 'MF', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199588.jpg' },
  { number: 66, name: 'Zino Sneijer', position: 'MF', age: 20, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189184.jpg' },
  { number: 67, name: 'Luca Dahl Tomasson', position: 'MF', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218024.jpg' },
  // Delanteros
  { number: 11, name: 'Gonçalo Borges', position: 'FW', age: 25, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113342.jpg' },
  { number: 17, name: 'Reiss Nelson', position: 'FW', age: 26, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250077450.jpg' },
  { number: 19, name: 'Nacho Ferri', position: 'FW', age: 21, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176378.jpg' },
  { number: 23, name: 'Anis Hadj Moussa', position: 'FW', age: 24, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250198119.jpg' },
  { number: 27, name: 'Gaoussou Diarra', position: 'FW', age: 23, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210895.jpg' },
  { number: 36, name: 'Jivayno Zinhagel', position: 'FW', age: 17, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200578.jpg' },
  { number: 49, name: 'Shaqueel Van Persie', position: 'FW', age: 19, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183765.jpg' },
  { number: 57, name: 'Jerayno Schaken', position: 'FW', age: 17, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216080.jpg' },
  { number: 58, name: 'Arman Nahany', position: 'FW', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218399.jpg' },
  { number: 59, name: 'Izu Onunta', position: 'FW', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199590.jpg' },
  { number: 64, name: 'Kelvin Neijenhuis', position: 'FW', age: 18, club: 'Feyenoord Rotterdam', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190224.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 35, 6, 4, 26, 34, 8, 28, 10, 19, 49],
};
