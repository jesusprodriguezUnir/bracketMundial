import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alisson', position: 'GK', age: 34, club: 'Liverpool' },
  { number: 12, name: 'Weverton', position: 'GK', age: 38, club: 'Grêmio' },
  { number: 23, name: 'Ederson', position: 'GK', age: 32, club: 'Fenerbahce' },
  // Defensores
  { number: 2, name: 'Wesley', position: 'DF', age: 23, club: 'Roma' },
  { number: 3, name: 'Gabriel Magalhães', position: 'DF', age: 28, club: 'Arsenal' },
  { number: 4, name: 'Marquinhos', position: 'DF', age: 32, club: 'Paris St-Germain' },
  { number: 6, name: 'Alex Sandro', position: 'DF', age: 35, club: 'Flamengo' },
  { number: 13, name: 'Danilo', position: 'DF', age: 34, club: 'Flamengo', captain: true },
  { number: 14, name: 'Bremer', position: 'DF', age: 29, club: 'Juventus' },
  { number: 15, name: 'Léo Pereira', position: 'DF', age: 29, club: 'Flamengo' },
  { number: 16, name: 'Douglas Santos', position: 'DF', age: 31, club: 'Zenit St Petersburg' },
  { number: 24, name: 'Roger Ibañez', position: 'DF', age: 27, club: 'Al-Ahli' },
  // Volantes
  { number: 5, name: 'Casemiro', position: 'MF', age: 34, club: 'Manchester United' },
  { number: 8, name: 'Bruno Guimarães', position: 'MF', age: 28, club: 'Newcastle' },
  { number: 17, name: 'Fabinho', position: 'MF', age: 33, club: 'Al-Ittihad' },
  { number: 18, name: 'Danilo Santos', position: 'MF', age: 31, club: 'Botafogo' },
  { number: 20, name: 'Lucas Paquetá', position: 'MF', age: 28, club: 'Flamengo' },
  // Delanteros
  { number: 7, name: 'Vinícius Júnior', position: 'FW', age: 25, club: 'Real Madrid' },
  { number: 9, name: 'Matheus Cunha', position: 'FW', age: 27, club: 'Manchester United' },
  { number: 10, name: 'Neymar', position: 'FW', age: 34, club: 'Santos' },
  { number: 11, name: 'Raphinha', position: 'FW', age: 29, club: 'Barcelona' },
  { number: 19, name: 'Endrick', position: 'FW', age: 19, club: 'Real Madrid' },
  { number: 21, name: 'Luiz Henrique', position: 'FW', age: 25, club: 'Zenit St Petersburg' },
  { number: 22, name: 'Gabriel Martinelli', position: 'FW', age: 24, club: 'Arsenal' },
  { number: 25, name: 'Igor Thiago', position: 'FW', age: 24, club: 'Brentford' },
  { number: 26, name: 'Rayan', position: 'FW', age: 20, club: 'Bournemouth' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [6, 4, 3, 2, 5, 10, 8, 7, 9, 11]
};
