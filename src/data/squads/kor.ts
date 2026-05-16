import type { Player } from './index';

export const coach = 'Hong Myung-bo';
export const squad: Player[] = [
  { number: 1,  name: 'Kim Seung-gyu',          position: 'GK', age: 35, club: 'FC Tokyo' },
  { number: 21, name: 'Jo Hyeon-woo',           position: 'GK', age: 34, club: 'Ulsan HD' },
  { number: 12, name: 'Song Bum-keun',          position: 'GK', age: 28, club: 'Jeonbuk Hyundai' },
  { number: 4,  name: 'Kim Min-jae',            position: 'DF', age: 29, club: 'Bayern Munich', captain: true },
  { number: 15, name: 'Cho Yu-min',             position: 'DF', age: 29, club: 'Sharjah FC' },
  { number: 3,  name: 'Lee Han-beom',           position: 'DF', age: 23, club: 'FC Midtjylland' },
  { number: 5,  name: 'Lee Gi-hyuk',            position: 'DF', age: 25, club: 'Gangwon FC' },
  { number: 14, name: 'Kim Tae-hyeon',          position: 'DF', age: 25, club: 'Kashima Antlers' },
  { number: 22, name: 'Seol Young-woo',         position: 'DF', age: 27, club: 'Crvena Zvezda' },
  { number: 2,  name: 'Kim Moon-hwan',          position: 'DF', age: 30, club: 'Daejeon Hana Citizen' },
  { number: 20, name: 'Park Jin-seob',          position: 'DF', age: 30, club: 'Zhejiang Professional' },
  { number: 25, name: 'Jens Castrop',           position: 'DF', age: 22, club: 'Gladbach' },
  { number: 18, name: 'Lee Kang-in',            position: 'MF', age: 25, club: 'PSG' },
  { number: 13, name: 'Paik Seung-ho',          position: 'MF', age: 29, club: 'Birmingham City' },
  { number: 6,  name: 'Hwang In-beom',          position: 'MF', age: 29, club: 'Feyenoord' },
  { number: 8,  name: 'Kim Jin-kyu',            position: 'MF', age: 29, club: 'Jeonbuk Hyundai' },
  { number: 10, name: 'Lee Jae-sung',           position: 'MF', age: 33, club: 'Mainz 05' },
  { number: 17, name: 'Bae Jun-ho',             position: 'MF', age: 22, club: 'Stoke City' },
  { number: 16, name: 'Lee Dong-gyeong',        position: 'MF', age: 28, club: 'Ulsan HD' },
  { number: 24, name: 'Lee Tae-seok',           position: 'DF', age: 23, club: 'Austria Wien' },
  { number: 7,  name: 'Son Heung-min',          position: 'FW', age: 33, club: 'Los Angeles FC' },
  { number: 11, name: 'Hwang Hee-chan',         position: 'FW', age: 30, club: 'Wolves' },
  { number: 9,  name: 'Cho Gue-sung',           position: 'FW', age: 28, club: 'FC Midtjylland' },
  { number: 19, name: 'Oh Hyeon-gyu',           position: 'FW', age: 25, club: 'Beşiktaş' },
  { number: 23, name: 'Yang Hyun-jun',          position: 'MF', age: 24, club: 'Celtic' },
  { number: 26, name: 'Eom Ji-sung',            position: 'MF', age: 24, club: 'Swansea City' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 15, 22, 13, 20, 18, 10, 7, 9]
};


