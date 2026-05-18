import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Alisson Becker', position: 'GK', age: 33, club: 'Liverpool' },
  { number: 12, name: 'Ederson', position: 'GK', age: 32, club: 'Fenerbahçe' },
  { number: 23, name: 'Weverton', position: 'GK', age: 38, club: 'Grêmio' },

  { number: 2, name: 'Danilo', position: 'DF', age: 34, club: 'Flamengo', captain: true },
  { number: 3, name: 'Marquinhos', position: 'DF', age: 32, club: 'PSG' },
  { number: 4, name: 'Gabriel Magalhães', position: 'DF', age: 28, club: 'Arsenal' },
  { number: 6, name: 'Alex Sandro', position: 'DF', age: 35, club: 'Flamengo' },
  { number: 13, name: 'Ibañez', position: 'DF', age: 27, club: 'Al Ahli' },
  { number: 14, name: 'Bremer', position: 'DF', age: 29, club: 'Juventus' },
  { number: 15, name: 'Léo Pereira', position: 'DF', age: 29, club: 'Flamengo' },
  { number: 16, name: 'Douglas Santos', position: 'DF', age: 31, club: 'Zenit' },
  { number: 22, name: 'Wesley', position: 'DF', age: 23, club: 'Roma' },

  { number: 5, name: 'Casemiro', position: 'MF', age: 34, club: 'Manchester United' },
  { number: 8, name: 'Bruno Guimarães', position: 'MF', age: 28, club: 'Newcastle' },
  { number: 17, name: 'Lucas Paquetá', position: 'MF', age: 28, club: 'Flamengo' },
  { number: 18, name: 'Fabinho', position: 'MF', age: 33, club: 'Al-Ittihad' },
  { number: 25, name: 'Danilo', position: 'MF', age: 25, club: 'Botafogo' },

  { number: 7, name: 'Vinícius Jr', position: 'FW', age: 25, club: 'Real Madrid' },
  { number: 9, name: 'Matheus Cunha', position: 'FW', age: 27, club: 'Manchester United' },
  { number: 10, name: 'Neymar', position: 'FW', age: 34, club: 'Santos' },
  { number: 11, name: 'Raphinha', position: 'FW', age: 29, club: 'Barcelona' },
  { number: 19, name: 'Endrick', position: 'FW', age: 19, club: 'Lyon' },
  { number: 20, name: 'Gabriel Martinelli', position: 'FW', age: 24, club: 'Arsenal' },
  { number: 21, name: 'Igor Thiago', position: 'FW', age: 24, club: 'Brentford' },
  { number: 24, name: 'Luiz Henrique', position: 'FW', age: 25, club: 'Zenit' },
  { number: 26, name: 'Rayan', position: 'FW', age: 19, club: 'Bournemouth' },
];


export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 6, 5, 8, 17, 11, 9, 7]
};
