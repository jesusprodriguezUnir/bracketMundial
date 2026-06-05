import type { Player } from './index';

export const coach = 'Hong Myung-bo';
export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Kim Seung-gyu', position: 'GK', age: 35, club: 'FC Tokyo' },
  { number: 12, name: 'Song Bum-keun', position: 'GK', age: 28, club: 'Jeonbuk Hyundai Motors' },
  { number: 21, name: 'Jo Hyeon-woo', position: 'GK', age: 34, club: 'Ulsan HD FC' },
  // Defensores
  { number: 2, name: 'Lee Han-beom', position: 'DF', age: 23, club: 'FC Midtjylland' },
  { number: 3, name: 'Lee Ki-hyuk', position: 'DF', age: 25, club: 'Gangwon FC' },
  { number: 4, name: 'Kim Min-jae', position: 'DF', age: 29, club: 'Bayern Munich', captain: true },
  { number: 5, name: 'Kim Tae-hyeon', position: 'DF', age: 25, club: 'Kashima Antlers' },
  { number: 13, name: 'Lee Tae-seok', position: 'DF', age: 23, club: 'Austria Wien' },
  { number: 14, name: 'Cho Wi-je', position: 'DF', age: 0, club: 'Jeonbuk Hyundai Motors' },
  { number: 15, name: 'Kim Moon-hwan', position: 'DF', age: 31, club: 'Daejeon Hana Citizen' },
  { number: 16, name: 'Park Jin-seob', position: 'DF', age: 30, club: 'Zhejiang FC' },
  { number: 22, name: 'Seol Young-woo', position: 'DF', age: 28, club: 'Red Star Belgrade' },
  { number: 23, name: 'Jens Castrop', position: 'DF', age: 22, club: 'Borussia Mönchengladbach' },
  // Volantes
  { number: 6, name: 'Hwang In-beom', position: 'MF', age: 29, club: 'Feyenoord' },
  { number: 8, name: 'Paik Seung-ho', position: 'MF', age: 29, club: 'Birmingham City' },
  { number: 10, name: 'Lee Jae-sung', position: 'MF', age: 33, club: 'Mainz 05' },
  { number: 20, name: 'Yang Hyun-jun', position: 'MF', age: 24, club: 'Celtic' },
  { number: 24, name: 'Kim Jin-gyu', position: 'MF', age: 29, club: 'Jeonbuk Hyundai Motors' },
  { number: 26, name: 'Lee Dong-gyeong', position: 'MF', age: 28, club: 'Ulsan Hyundai' },
  // Delanteros
  { number: 7, name: 'Son Heung-min', position: 'FW', age: 33, club: 'Los Angeles FC' },
  { number: 9, name: 'Cho Gue-sung', position: 'FW', age: 28, club: 'FC Midtjylland' },
  { number: 11, name: 'Hwang Hee-chan', position: 'FW', age: 30, club: 'Wolves' },
  { number: 17, name: 'Bae Jun-ho', position: 'FW', age: 22, club: 'Stoke City' },
  { number: 18, name: 'Oh Hyeon-gyu', position: 'FW', age: 24, club: 'Besiktas' },
  { number: 19, name: 'Lee Kang-in', position: 'FW', age: 25, club: 'Paris St-Germain' },
  { number: 25, name: 'Eom Ji-sung', position: 'FW', age: 23, club: 'Swansea City' },
];

export const lineup = {
  formation: '3-4-3',
  startingXI: [21, 2, 4, 22, 6, 10, 13, 19, 7, 11]
};
