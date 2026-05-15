import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Mert Günok',             position: 'GK', age: 35, club: 'Beşiktaş' },
  { number: 12, name: 'Uğurcan Çakır',          position: 'GK', age: 28, club: 'Trabzonspor' },
  { number: 23, name: 'Altay Bayındır',         position: 'GK', age: 27, club: 'Manchester United' },
  { number: 2,  name: 'Zeki Çelik',             position: 'DF', age: 27, club: 'Roma' },
  { number: 3,  name: 'Ferdi Kadıoğlu',         position: 'DF', age: 25, club: 'Brighton' },
  { number: 4,  name: 'Samet Akaydın',          position: 'DF', age: 30, club: 'Fenerbahçe' },
  { number: 5,  name: 'Merih Demiral',          position: 'DF', age: 26, club: 'Al-Qadsiah' },
  { number: 13, name: 'Kaan Ayhan',             position: 'DF', age: 30, club: 'Galatasaray' },
  { number: 15, name: 'Abdülkerim Bardakcı',    position: 'DF', age: 27, club: 'Galatasaray' },
  { number: 22, name: 'Mert Müldür',            position: 'DF', age: 26, club: 'Sassuolo' },
  { number: 6,  name: 'Okay Yokuşlu',           position: 'MF', age: 31, club: 'Celta Vigo' },
  { number: 8,  name: 'İsmail Yüksek',          position: 'MF', age: 24, club: 'Fenerbahçe' },
  { number: 10, name: 'Hakan Çalhanoğlu',       position: 'MF', age: 32, club: 'Inter Milan', captain: true },
  { number: 14, name: 'Salih Özcan',            position: 'MF', age: 26, club: 'Borussia Dortmund' },
  { number: 16, name: 'Orkun Kökçü',            position: 'MF', age: 24, club: 'Benfica' },
  { number: 17, name: 'Kerem Aktürkoğlu',       position: 'FW', age: 26, club: 'Galatasaray' },
  { number: 18, name: 'Arda Güler',             position: 'MF', age: 20, club: 'Real Madrid' },
  { number: 7,  name: 'Cengiz Ünder',           position: 'FW', age: 28, club: 'Fenerbahçe' },
  { number: 9,  name: 'Cenk Tosun',             position: 'FW', age: 35, club: 'Beşiktaş' },
  { number: 11, name: 'Yusuf Sarı',             position: 'FW', age: 24, club: 'Galatasaray' },
  { number: 19, name: 'Semih Kılıçsoy',         position: 'FW', age: 20, club: 'Beşiktaş' },
  { number: 20, name: 'Baris Alper Yilmaz',     position: 'FW', age: 25, club: 'Galatasaray' },
  { number: 21, name: 'Ozan Kabak',             position: 'DF', age: 26, club: 'Hoffenheim' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 5, 15, 3, 6, 10, 18, 16, 17, 20]
};

