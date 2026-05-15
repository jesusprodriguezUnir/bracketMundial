import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Eloy Room',              position: 'GK', age: 33, club: 'Columbus Crew' },
  { number: 12, name: 'Nandor Bihari',          position: 'GK', age: 30, club: 'SV Mattersburg' },
  { number: 23, name: 'Sander Sno',             position: 'GK', age: 38, club: 'Deportivo FCO' },
  { number: 2,  name: 'Rangelo Janga',          position: 'DF', age: 31, club: 'SC Heerenveen' },
  { number: 3,  name: 'Rurickson Liberia',      position: 'DF', age: 28, club: 'Deportivo FCO' },
  { number: 4,  name: 'Cuco Martina',           position: 'DF', age: 36, club: 'SV Mattersburg' },
  { number: 5,  name: 'Juriën Timber',          position: 'DF', age: 24, club: 'Arsenal' },
  { number: 13, name: 'Etienne Reijnen',        position: 'DF', age: 36, club: 'Colorado Rapids' },
  { number: 15, name: 'Richie Poulain',         position: 'DF', age: 30, club: 'Deportivo FCO' },
  { number: 6,  name: 'Leandro Bacuna',         position: 'MF', age: 34, club: 'Middlesbrough' },
  { number: 8,  name: 'Giliano Wijnaldum',      position: 'MF', age: 28, club: 'PSV' },
  { number: 10, name: 'Quiñy Sardjoe',          position: 'MF', age: 30, club: 'Deportivo FCO', captain: true },
  { number: 14, name: 'Jamiro Monteiro',        position: 'MF', age: 31, club: 'RSC Anderlecht' },
  { number: 16, name: 'Vurnon Anita',           position: 'MF', age: 36, club: 'Newcastle Jets' },
  { number: 17, name: 'Darryl Lachman',         position: 'DF', age: 33, club: 'RKC Waalwijk' },
  { number: 7,  name: 'Jafar Arias',            position: 'FW', age: 28, club: 'San Jose Earthquakes' },
  { number: 9,  name: 'Gevaro Nepomuceno',      position: 'FW', age: 33, club: 'Panathinaikos' },
  { number: 11, name: 'Juniño',                 position: 'FW', age: 30, club: 'Deportivo FCO' },
  { number: 18, name: 'Brandley Kuwas',         position: 'FW', age: 31, club: 'Adana Demirspor' },
  { number: 19, name: 'Federico Munnink',       position: 'FW', age: 27, club: 'Deportivo FCO' },
  { number: 20, name: 'Bobby Petta',            position: 'FW', age: 27, club: 'AZ Alkmaar' },
  { number: 21, name: 'Myron Boadu',            position: 'FW', age: 24, club: 'Monaco' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 5, 4, 17, 13, 6, 14, 16, 18, 21, 9]
};

