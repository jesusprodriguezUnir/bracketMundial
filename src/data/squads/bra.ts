import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Alisson Becker',         position: 'GK', age: 33, club: 'Liverpool' },
  { number: 12, name: 'Ederson',                position: 'GK', age: 32, club: 'Manchester City' },
  { number: 23, name: 'Bento',                  position: 'GK', age: 25, club: 'Al-Qadsiah' },
  { number: 2,  name: 'Danilo',                 position: 'DF', age: 34, club: 'Juventus', captain: true },
  { number: 3,  name: 'Guilherme Arana',        position: 'DF', age: 28, club: 'Atlético Mineiro' },
  { number: 4,  name: 'Marquinhos',             position: 'DF', age: 31, club: 'PSG' },
  { number: 6,  name: 'Gabriel Magalhães',      position: 'DF', age: 27, club: 'Arsenal' },
  { number: 13, name: 'Éder Militão',           position: 'DF', age: 27, club: 'Real Madrid' },
  { number: 14, name: 'Bremer',                 position: 'DF', age: 27, club: 'Juventus' },
  { number: 22, name: 'Wendell',                position: 'DF', age: 32, club: 'Porto' },
  { number: 5,  name: 'Casemiro',               position: 'MF', age: 34, club: 'Manchester United' },
  { number: 8,  name: 'Bruno Guimarães',        position: 'MF', age: 27, club: 'Newcastle' },
  { number: 15, name: 'Gerson',                 position: 'MF', age: 28, club: 'Flamengo' },
  { number: 16, name: 'Lucas Paquetá',          position: 'MF', age: 28, club: 'West Ham' },
  { number: 17, name: 'Rodrygo',                position: 'FW', age: 25, club: 'Real Madrid' },
  { number: 20, name: 'Andreas Pereira',        position: 'MF', age: 30, club: 'Fulham' },
  { number: 7,  name: 'David Neres',            position: 'FW', age: 28, club: 'Napoli' },
  { number: 9,  name: 'Gabriel Barbosa',        position: 'FW', age: 29, club: 'Flamengo' },
  { number: 10, name: 'Vinícius Jr.',           position: 'FW', age: 25, club: 'Real Madrid' },
  { number: 11, name: 'Raphinha',               position: 'FW', age: 29, club: 'Barcelona' },
  { number: 18, name: 'Gabriel Martinelli',     position: 'FW', age: 25, club: 'Arsenal' },
  { number: 19, name: 'Endrick',                position: 'FW', age: 19, club: 'Real Madrid' },
  { number: 21, name: 'Pedro',                  position: 'FW', age: 28, club: 'Flamengo' },
  { number: 24, name: 'Estêvão',                position: 'FW', age: 18, club: 'Palmeiras' },
  { number: 25, name: 'Savinho',                position: 'FW', age: 21, club: 'Manchester City' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 6, 3, 8, 16, 20, 11, 10, 17]
};
