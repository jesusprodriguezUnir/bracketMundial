import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Zion Suzuki', position: 'GK', age: 23, club: 'Parma' },
  { number: 12, name: 'Keisuke Osako', position: 'GK', age: 26, club: 'Sanfrecce Hiroshima' },
  { number: 23, name: 'Tomoki Hayakawa', position: 'GK', age: 27, club: 'Kashima Antlers' },
  // Defensores
  { number: 2, name: 'Yukinari Sugawara', position: 'DF', age: 25, club: 'Southampton' },
  { number: 3, name: 'Shogo Taniguchi', position: 'DF', age: 34, club: 'Sint-Truiden' },
  { number: 4, name: 'Ko Itakura', position: 'DF', age: 29, club: 'Ajax' },
  { number: 5, name: 'Yuto Nagatomo', position: 'DF', age: 39, club: 'FC Tokyo' },
  { number: 16, name: 'Tsuyoshi Watanabe', position: 'DF', age: 29, club: 'Feyenoord' },
  { number: 20, name: 'Ayumu Seko', position: 'DF', age: 25, club: 'Le Havre' },
  { number: 21, name: 'Hiroki Ito', position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 22, name: 'Takehiro Tomiyasu', position: 'DF', age: 28, club: 'Ajax' },
  { number: 25, name: 'Junnosuke Suzuki', position: 'DF', age: 22, club: 'FC Copenhagen' },
  // Volantes
  { number: 6, name: 'Wataru Endo', position: 'MF', age: 32, club: 'Liverpool', captain: true },
  { number: 7, name: 'Ao Tanaka', position: 'MF', age: 27, club: 'Leeds' },
  { number: 15, name: 'Daichi Kamada', position: 'MF', age: 30, club: 'Crystal Palace' },
  { number: 17, name: 'Yuito Suzuki', position: 'MF', age: 24, club: 'Freiburg' },
  { number: 24, name: 'Kaishu Sano', position: 'MF', age: 25, club: 'Mainz' },
  // Delanteros
  { number: 8, name: 'Takefusa Kubo', position: 'FW', age: 25, club: 'Real Sociedad' },
  { number: 9, name: 'Keisuke Goto', position: 'FW', age: 21, club: 'Sint-Truidense' },
  { number: 10, name: 'Ritsu Doan', position: 'FW', age: 27, club: 'Eintracht Frankfurt' },
  { number: 11, name: 'Daizen Maeda', position: 'FW', age: 28, club: 'Celtic' },
  { number: 13, name: 'Keito Nakamura', position: 'FW', age: 25, club: 'Stade de Reims' },
  { number: 14, name: 'Junya Ito', position: 'FW', age: 32, club: 'KRC Genk' },
  { number: 18, name: 'Ayase Ueda', position: 'FW', age: 27, club: 'Feyenoord' },
  { number: 19, name: 'Koki Ogawa', position: 'FW', age: 28, club: 'NEC Nijmegen' },
  { number: 26, name: 'Kento Shiogai', position: 'FW', age: 21, club: 'Wolfsburg' },
];

export const lineup = {
  formation: '3-4-3',
  startingXI: [1, 22, 21, 4, 17, 6, 7, 15, 13, 10, 8]
};
