import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Alisson Becker',         position: 'GK', age: 33, club: 'Liverpool' },
  { number: 12, name: 'Ederson',                position: 'GK', age: 32, club: 'Fenerbahçe' },
  { number: 23, name: 'Bento',                  position: 'GK', age: 26, club: 'Al Nassr' },

  { number: 2,  name: 'Danilo',                 position: 'DF', age: 34, club: 'Flamengo', captain: true },
  { number: 4,  name: 'Marquinhos',             position: 'DF', age: 32, club: 'PSG' },
  { number: 6,  name: 'Gabriel Magalhães',      position: 'DF', age: 28, club: 'Arsenal' },
  { number: 14, name: 'Bremer',                 position: 'DF', age: 29, club: 'Juventus' },
  { number: 22, name: 'Alex Sandro',            position: 'DF', age: 35, club: 'Flamengo' },
  { number: 3,  name: 'Thiago Silva',           position: 'DF', age: 41, club: 'Fluminense' },
  { number: 13, name: 'Murilo',                 position: 'DF', age: 29, club: 'Palmeiras' },
  { number: 15, name: 'Carlos Augusto',         position: 'DF', age: 27, club: 'Inter Milan' },
  { number: 25, name: 'Wesley',                 position: 'DF', age: 23, club: 'Flamengo' },

  { number: 5,  name: 'Casemiro',               position: 'MF', age: 34, club: 'Manchester United' },
  { number: 8,  name: 'Bruno Guimarães',        position: 'MF', age: 28, club: 'Newcastle' },
  { number: 16, name: 'Lucas Paquetá',          position: 'MF', age: 28, club: 'Flamengo' },
  { number: 24, name: 'Andrey Santos',          position: 'MF', age: 22, club: 'Chelsea' },
  { number: 18, name: 'Gerson',                 position: 'MF', age: 29, club: 'Flamengo' },
  { number: 20, name: 'Joelinton',              position: 'MF', age: 29, club: 'Newcastle' },

  { number: 10, name: 'Vini Jr',                position: 'FW', age: 25, club: 'Real Madrid' },
  { number: 11, name: 'Raphinha',               position: 'FW', age: 29, club: 'Barcelona' },
  { number: 9,  name: 'Neymar Jr',              position: 'FW', age: 34, club: 'Santos' },
  { number: 19, name: 'Endrick',                position: 'FW', age: 19, club: 'Lyon' },
  { number: 17, name: 'Gabriel Martinelli',     position: 'FW', age: 24, club: 'Arsenal' },
  { number: 26, name: 'Matheus Cunha',          position: 'FW', age: 27, club: 'Manchester United' },
  { number: 7,  name: 'Antony',                 position: 'FW', age: 26, club: 'Manchester United' },
  { number: 21, name: 'Igor Thiago',            position: 'FW', age: 24, club: 'Brentford' },
];


export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 6, 22, 5, 8, 16, 11, 9, 10]
};
