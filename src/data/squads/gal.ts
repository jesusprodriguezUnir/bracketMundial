import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Uğurcan Çakır', position: 'GK', age: 30, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250078452.jpg' },
  { number: 19, name: 'Günay Güvenç', position: 'GK', age: 35, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250073722.jpg' },
  { number: 24, name: 'Jankat Yılmaz', position: 'GK', age: 22, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139356.jpg' },
  { number: 70, name: 'Enes Büyük', position: 'GK', age: 20, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177185.jpg' },
  // Defensores
  { number: 3, name: 'El Chadaille Bitshiabu', position: 'DF', age: 21, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153851.jpg' },
  { number: 4, name: 'Ismail Jakobs', position: 'DF', age: 27, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117015.jpg' },
  { number: 6, name: 'Davinson Sánchez', position: 'DF', age: 30, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250099374.jpg' },
  { number: 7, name: 'Roland Sallai', position: 'DF', age: 29, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065179.jpg' },
  { number: 17, name: 'Eren Elmalı', position: 'DF', age: 26, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163343.jpg' },
  { number: 42, name: 'Abdülkerim Bardakcı', position: 'DF', age: 31, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250043129.jpg' },
  { number: 64, name: 'Yusuf Kahraman', position: 'DF', age: 18, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250206683.jpg' },
  { number: 71, name: 'Cihan Akgün', position: 'DF', age: 17, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212907.jpg' },
  { number: 90, name: 'Wilfried Singo', position: 'DF', age: 25, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132323.jpg' },
  // Centrocampistas
  { number: 8, name: 'Gabriel Sara', position: 'MF', age: 27, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199220.jpg' },
  { number: 18, name: 'Lesley Ugochukwu', position: 'MF', age: 22, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250136342.jpg' },
  { number: 20, name: 'İlkay Gündoğan', position: 'MF', age: 35, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250005335.jpg' },
  { number: 34, name: 'Lucas Torreira', position: 'MF', age: 30, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118286.jpg' },
  { number: 57, name: 'Necati Yançel', position: 'MF', age: 17, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250206687.jpg' },
  { number: 67, name: 'Eyüp Karasu', position: 'MF', age: 19, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212934.jpg' },
  { number: 68, name: 'Furkan Koçak', position: 'MF', age: 18, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200405.jpg' },
  { number: 73, name: 'Berat Luş', position: 'MF', age: 19, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189922.jpg' },
  { number: 74, name: 'Renato Nhaga', position: 'MF', age: 19, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216977.jpg' },
  { number: 76, name: 'Onur Kağan Yıldız', position: 'MF', age: 17, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224253.jpg' },
  { number: 83, name: 'Aleksei Batrakov', position: 'MF', age: 21, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224345.jpg' },
  { number: 99, name: 'Mario Lemina', position: 'MF', age: 33, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134357.jpg' },
  // Delanteros
  { number: 10, name: 'Leroy Sané', position: 'FW', age: 30, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250063984.jpg' },
  { number: 11, name: 'Yunus Akgün', position: 'FW', age: 26, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250103764.jpg' },
  { number: 21, name: 'Deniz Gül', position: 'FW', age: 22, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163534.jpg' },
  { number: 27, name: 'Rafael Leão', position: 'FW', age: 27, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250089228.jpg' },
  { number: 45, name: 'Victor Osimhen', position: 'FW', age: 27, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132987.jpg' },
  { number: 51, name: 'Arda Tagay', position: 'FW', age: 18, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212957.jpg' },
  { number: 53, name: 'Barış Alper Yılmaz', position: 'FW', age: 26, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250158929.jpg' },
  { number: 62, name: 'Ada Yüzgeç', position: 'FW', age: 17, club: 'Galatasaray SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250207790.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 4, 6, 7, 8, 18, 20, 10, 11, 21],
};
