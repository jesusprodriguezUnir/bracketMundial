import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Thomas Strakosha', position: 'GK', age: 31, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250046901.jpg' },
  { number: 41, name: 'Marios Balamotis', position: 'GK', age: 21, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210649.jpg' },
  { number: 91, name: 'Alberto Brignoli', position: 'GK', age: 35, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250085391.jpg' },
  // Defensores
  { number: 2, name: 'Harold Moukoudi', position: 'DF', age: 28, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250066898.jpg' },
  { number: 3, name: 'Stavros Pilios', position: 'DF', age: 25, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187689.jpg' },
  { number: 12, name: 'Lazaros Rota', position: 'DF', age: 29, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250143747.jpg' },
  { number: 21, name: 'Domagoj Vida', position: 'DF', age: 37, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/108567.jpg' },
  { number: 22, name: 'Charalampos Lykogiannis', position: 'DF', age: 32, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250013058.jpg' },
  { number: 44, name: 'Filipe Relvas', position: 'DF', age: 26, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210435.jpg' },
  // Centrocampistas
  { number: 6, name: 'Kaan Kairinen', position: 'MF', age: 27, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250079003.jpg' },
  { number: 8, name: 'Mijat Gaćinović', position: 'MF', age: 31, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042749.jpg' },
  { number: 14, name: 'Lovro Majer', position: 'MF', age: 28, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250098470.jpg' },
  { number: 16, name: 'Kervin Arriaga', position: 'MF', age: 28, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197123.jpg' },
  { number: 18, name: 'Răzvan Marin', position: 'MF', age: 30, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250055294.jpg' },
  { number: 20, name: 'Petros Mantalos', position: 'MF', age: 35, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250012957.jpg' },
  { number: 27, name: 'Milán Vitális', position: 'MF', age: 24, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250126069.jpg' },
  // Delanteros
  { number: 9, name: 'Luka Jović', position: 'FW', age: 28, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058244.jpg' },
  { number: 10, name: 'Oleksandr Zubkov', position: 'FW', age: 30, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064446.jpg' },
  { number: 11, name: 'Aboubakary Koita', position: 'FW', age: 27, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250110953.jpg' },
  { number: 19, name: 'Barnabás Varga', position: 'FW', age: 31, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183450.jpg' },
  { number: 23, name: 'João Mário', position: 'FW', age: 33, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250014109.jpg' },
  { number: 90, name: 'Zini', position: 'FW', age: 24, club: 'PAE AEK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187664.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 12, 21, 6, 8, 14, 9, 10, 11],
};
