import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 13, name: 'Tarık Çetin', position: 'GK', age: 29, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250067422.jpg' },
  { number: 31, name: 'Ederson', position: 'GK', age: 33, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250073809.jpg' },
  { number: 34, name: 'Mert Günok', position: 'GK', age: 37, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/103243.jpg' },
  { number: 75, name: 'Kuzey Sapaz', position: 'GK', age: 18, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222121.jpg' },
  { number: 89, name: 'Yasir Caklı', position: 'GK', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222125.jpg' },
  // Defensores
  { number: 14, name: 'Yiğit Efe Demir', position: 'DF', age: 22, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174545.jpg' },
  { number: 15, name: 'Nathan Aké', position: 'DF', age: 31, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250027008.jpg' },
  { number: 18, name: 'Mert Müldür', position: 'DF', age: 27, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250097238.jpg' },
  { number: 21, name: 'Kojo Peprah Oppong', position: 'DF', age: 22, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210900.jpg' },
  { number: 27, name: 'Nélson Semedo', position: 'DF', age: 32, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250086090.jpg' },
  { number: 37, name: 'Milan Škriniar', position: 'DF', age: 31, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250041563.jpg' },
  { number: 67, name: 'Kamil Efe Üregen', position: 'DF', age: 18, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216713.jpg' },
  { number: 77, name: 'Ognjen Mimović', position: 'DF', age: 22, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164004.jpg' },
  { number: 78, name: 'Çağan Sarıdikmen', position: 'DF', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222120.jpg' },
  { number: 82, name: 'Bedirhan Korkmaz', position: 'DF', age: 16, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222123.jpg' },
  { number: 86, name: 'Gökmen Özdemir', position: 'DF', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222122.jpg' },
  // Centrocampistas
  { number: 3, name: 'Archie Brown', position: 'MF', age: 24, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135831.jpg' },
  { number: 5, name: 'İsmail Yüksek', position: 'MF', age: 27, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174144.jpg' },
  { number: 6, name: 'Matteo Guendouzi', position: 'MF', age: 27, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250122927.jpg' },
  { number: 17, name: 'İrfan Can Kahveci', position: 'MF', age: 31, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250046542.jpg' },
  { number: 22, name: 'Levent Mercan', position: 'MF', age: 25, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123981.jpg' },
  { number: 28, name: 'Bartuğ Elmaz', position: 'MF', age: 23, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129575.jpg' },
  { number: 70, name: 'Oğuz Aydın', position: 'MF', age: 25, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118077.jpg' },
  { number: 80, name: 'Adnan Fettahoğlu', position: 'MF', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250207778.jpg' },
  { number: 84, name: 'Emin Sayar', position: 'MF', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250207784.jpg' },
  { number: 85, name: 'Güner Ekici', position: 'MF', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222124.jpg' },
  { number: 90, name: 'Emirhan Ateş', position: 'MF', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250207773.jpg' },
  { number: 91, name: 'N\'Golo Kanté', position: 'MF', age: 35, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250097248.jpg' },
  // Delanteros
  { number: 7, name: 'Kerem Aktürkoğlu', position: 'FW', age: 27, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250146674.jpg' },
  { number: 9, name: 'Romelu Lukaku', position: 'FW', age: 33, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250010802.jpg' },
  { number: 10, name: 'Marco Asensio', position: 'FW', age: 30, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250080570.jpg' },
  { number: 11, name: 'Mason Greenwood', position: 'FW', age: 24, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116767.jpg' },
  { number: 19, name: 'Vedat Muriqi', position: 'FW', age: 32, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250059699.jpg' },
  { number: 45, name: 'Dorgeles Nene', position: 'FW', age: 23, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187184.jpg' },
  { number: 54, name: 'Alaettin Ekici', position: 'FW', age: 17, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216848.jpg' },
  { number: 95, name: 'Çağrı Fedai', position: 'FW', age: 20, club: 'Fenerbahçe SK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171630.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [13, 14, 15, 18, 21, 3, 5, 6, 7, 9, 10],
};
