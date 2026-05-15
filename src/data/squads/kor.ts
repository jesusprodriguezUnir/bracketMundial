import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Kim Seung-gyu',          position: 'GK', age: 35, club: 'Jeonbuk' },
  { number: 21, name: 'Jo Hyeon-woo',           position: 'GK', age: 33, club: 'Ulsan' },
  { number: 23, name: 'Song Bum-keun',          position: 'GK', age: 28, club: 'Jeonbuk' },
  { number: 4,  name: 'Kim Min-jae',            position: 'DF', age: 29, club: 'Bayern Munich', captain: true },
  { number: 3,  name: 'Kim Young-gwon',         position: 'DF', age: 35, club: 'Ulsan' },
  { number: 2,  name: 'Kim Moon-hwan',          position: 'DF', age: 29, club: 'Jeonbuk' },
  { number: 15, name: 'Jung Seung-hyun',        position: 'DF', age: 31, club: 'Shimizu S-Pulse' },
  { number: 13, name: 'Hong Chul',              position: 'DF', age: 33, club: 'Suwon' },
  { number: 20, name: 'Lee Ki-je',              position: 'DF', age: 26, club: 'Gimcheon' },
  { number: 22, name: 'Park Jin-seop',          position: 'DF', age: 25, club: 'Gangwon' },
  { number: 8,  name: 'Hwang In-beom',          position: 'MF', age: 28, club: 'Feyenoord' },
  { number: 16, name: 'Jung Woo-young',         position: 'MF', age: 35, club: 'Al-Qadsiah' },
  { number: 6,  name: 'Son Jun-ho',             position: 'MF', age: 30, club: 'Shandong Taishan' },
  { number: 14, name: 'Lee Jae-sung',           position: 'MF', age: 31, club: 'Mainz' },
  { number: 5,  name: 'Paik Seung-ho',          position: 'MF', age: 28, club: 'Jeonbuk' },
  { number: 17, name: 'Kwon Chang-hoon',        position: 'MF', age: 30, club: 'Strasbourg' },
  { number: 10, name: 'Lee Kang-in',            position: 'MF', age: 24, club: 'PSG' },
  { number: 7,  name: 'Son Heung-min',          position: 'FW', age: 34, club: 'Tottenham' },
  { number: 9,  name: 'Cho Gue-sung',           position: 'FW', age: 27, club: 'Celta Vigo' },
  { number: 11, name: 'Hwang Hee-chan',         position: 'FW', age: 29, club: 'Wolves' },
  { number: 18, name: 'Oh Hyeon-gyu',           position: 'FW', age: 24, club: 'Celtic' },
  { number: 19, name: 'Lim Chang-woo',          position: 'FW', age: 23, club: 'Gangwon' },
  { number: 24, name: 'Yang Min-hyeok',         position: 'FW', age: 19, club: 'Bayer Leverkusen' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 3, 13, 16, 8, 11, 10, 7, 9]
};

