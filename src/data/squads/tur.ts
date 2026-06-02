import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Mert Günok',             position: 'GK', age: 37, club: 'Beşiktaş' },
  { number: 12, name: 'Uğurcan Çakır',          position: 'GK', age: 30, club: 'Trabzonspor' },
  { number: 23, name: 'Altay Bayındır',         position: 'GK', age: 28, club: 'Manchester United' },
  { number: 2,  name: 'Zeki Çelik',             position: 'DF', age: 29, club: 'Roma' },
  { number: 3,  name: 'Ferdi Kadıoğlu',         position: 'DF', age: 26, club: 'Brighton' },
  { number: 4,  name: 'Samet Akaydın',          position: 'DF', age: 32, club: 'Fenerbahçe' },
  { number: 5,  name: 'Merih Demiral',          position: 'DF', age: 28, club: 'Al-Qadsiah' },
  { number: 6,  name: 'Çağlar Söyüncü',         position: 'DF', age: 30, club: 'Fenerbahçe' },
  { number: 15, name: 'Abdülkerim Bardakcı',    position: 'DF', age: 31, club: 'Galatasaray' },
  { number: 21, name: 'Ozan Kabak',             position: 'DF', age: 26, club: 'Hoffenheim' },
  { number: 22, name: 'Mert Müldür',            position: 'DF', age: 27, club: 'Fenerbahçe' },
  { number: 24, name: 'Eren Elmalı',            position: 'DF', age: 25, club: 'Trabzonspor' },
  { number: 8,  name: 'İsmail Yüksek',          position: 'MF', age: 27, club: 'Fenerbahçe' },
  { number: 10, name: 'Hakan Çalhanoğlu',       position: 'MF', age: 32, club: 'Inter Milan', captain: true },
  { number: 13, name: 'Kaan Ayhan',             position: 'MF', age: 31, club: 'Galatasaray' },
  { number: 14, name: 'Salih Özcan',            position: 'MF', age: 28, club: 'Borussia Dortmund' },
  { number: 16, name: 'Orkun Kökçü',            position: 'MF', age: 25, club: 'Benfica' },
  { number: 7,  name: 'İrfan Can Kahveci',      position: 'FW', age: 30, club: 'Fenerbahçe' },
  { number: 9,  name: 'Deniz Gül',              position: 'FW', age: 21, club: 'Porto' },
  { number: 11, name: 'Can Uzun',               position: 'FW', age: 20, club: 'Eintracht Frankfurt' },
  { number: 17, name: 'Kerem Aktürkoğlu',       position: 'FW', age: 27, club: 'Benfica' },
  { number: 18, name: 'Arda Güler',             position: 'FW', age: 21, club: 'Real Madrid' },
  { number: 19, name: 'Kenan Yıldız',           position: 'FW', age: 21, club: 'Juventus' },
  { number: 20, name: 'Barış Alper Yılmaz',     position: 'FW', age: 26, club: 'Galatasaray' },
  { number: 25, name: 'Oğuz Aydın',             position: 'FW', age: 25, club: 'Fenerbahçe' },
  { number: 26, name: 'Yunus Akgün',            position: 'FW', age: 26, club: 'Galatasaray' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 5, 15, 3, 8, 10, 18, 16, 19, 20]
};

