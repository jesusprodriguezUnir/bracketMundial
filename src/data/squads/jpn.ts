import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Keisuke Osako',          position: 'GK', age: 26, club: 'Sanfrecce Hiroshima' },
  { number: 12, name: 'Zion Suzuki',            position: 'GK', age: 23, club: 'Parma Calcio 1913' },
  { number: 23, name: 'Tomoki Hayakawa',        position: 'GK', age: 27, club: 'Kashima Antlers' },
  { number: 3,  name: 'Yuto Nagatomo',          position: 'DF', age: 39, club: 'FC Tokyo' },
  { number: 2,  name: 'Shogo Taniguchi',        position: 'DF', age: 34, club: 'Sint-Truidense VV' },
  { number: 4,  name: 'Ko Itakura',             position: 'DF', age: 29, club: 'AFC Ajax' },
  { number: 22, name: 'Tsuyoshi Watanabe',      position: 'DF', age: 29, club: 'Feyenoord' },
  { number: 5,  name: 'Takehiro Tomiyasu',      position: 'DF', age: 27, club: 'AFC Ajax' },
  { number: 21, name: 'Hiroki Ito',             position: 'DF', age: 27, club: 'Bayern Munich' },
  { number: 15, name: 'Ayumu Seko',             position: 'DF', age: 25, club: 'Le Havre AC' },
  { number: 24, name: 'Yukinari Sugawara',      position: 'DF', age: 25, club: 'Werder Bremen' },
  { number: 13, name: 'Junnosuke Suzuki',       position: 'DF', age: 22, club: 'FC Copenhagen' },
  { number: 6,  name: 'Wataru Endo',            position: 'MF', age: 33, club: 'Liverpool FC', captain: true },
  { number: 14, name: 'Junya Ito',              position: 'MF', age: 33, club: 'KRC Genk' },
  { number: 8,  name: 'Daichi Kamada',          position: 'MF', age: 29, club: 'Crystal Palace' },
  { number: 17, name: 'Ao Tanaka',              position: 'MF', age: 27, club: 'Leeds United' },
  { number: 7,  name: 'Kaishu Sano',            position: 'MF', age: 25, club: 'Mainz 05' },
  { number: 20, name: 'Takefusa Kubo',          position: 'MF', age: 25, club: 'Real Sociedad' },
  { number: 10, name: 'Yuito Suzuki',           position: 'MF', age: 24, club: 'SC Freiburg' },
  { number: 11, name: 'Ritsu Doan',             position: 'FW', age: 27, club: 'Eintracht Frankfurt' },
  { number: 9,  name: 'Ayase Ueda',             position: 'FW', age: 27, club: 'Feyenoord' },
  { number: 18, name: 'Koki Ogawa',             position: 'FW', age: 28, club: 'NEC Nijmegen' },
  { number: 16, name: 'Daizen Maeda',           position: 'FW', age: 28, club: 'Celtic FC' },
  { number: 19, name: 'Keito Nakamura',         position: 'FW', age: 25, club: 'Stade de Reims' },
  { number: 25, name: 'Kento Shiogai',          position: 'FW', age: 21, club: 'VfL Wolfsburg' },
  { number: 26, name: 'Keisuke Goto',           position: 'FW', age: 21, club: 'Sint-Truidense VV' },
];

export const lineup = {
  formation: '3-4-2-1',
  startingXI: [1, 4, 2, 22, 14, 6, 17, 7, 20, 8, 9]
};
