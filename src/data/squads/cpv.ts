import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Josimar ‘Vozinha’ Dias', position: 'GK', age: 40, club: 'Chaves' },
  { number: 12, name: 'Marcio da Rosa', position: 'GK', age: 29, club: 'PFC Montana' },
  { number: 23, name: 'Carlos ‘CJ’ Dos Santos', position: 'GK', age: 25, club: 'San Diego FC' },
  // Defensores
  { number: 2, name: 'Ianique ‘Stopira’ Tavares', position: 'DF', age: 0, club: 'Torrense' },
  { number: 3, name: '‘Diney’ Borges', position: 'DF', age: 0, club: 'Al Bataeh' },
  { number: 4, name: 'Roberto ‘Pico’ Lopes', position: 'DF', age: 0, club: 'Shamrock Rovers' },
  { number: 5, name: 'Logan Costa', position: 'DF', age: 25, club: 'Villarreal' },
  { number: 8, name: 'João Paulo Fernandes', position: 'DF', age: 27, club: 'FCSB' },
  { number: 13, name: 'Sidny Lopes Cabral', position: 'DF', age: 21, club: 'Benfica' },
  { number: 22, name: 'Steven Moreira', position: 'DF', age: 32, club: 'Columbus Crew' },
  { number: 24, name: 'Wagner Pina', position: 'DF', age: 24, club: 'Trabzonspor' },
  { number: 25, name: 'Kelvin Pires', position: 'DF', age: 26, club: 'SJK' },
  // Volantes
  { number: 6, name: 'Kevin Lenini Pina', position: 'MF', age: 0, club: 'Krasnodar' },
  { number: 10, name: 'Jamiro Monteiro', position: 'MF', age: 32, club: 'PEC Zwolle' },
  { number: 11, name: 'Garry Rodrigues', position: 'MF', age: 35, club: 'Apollon Limassol' },
  { number: 14, name: 'Deroy Duarte', position: 'MF', age: 27, club: 'Ludogorets Razgrad' },
  { number: 15, name: 'Laros Duarte', position: 'MF', age: 28, club: 'Puskás Akadémia' },
  { number: 16, name: 'Yannick Semedo', position: 'MF', age: 28, club: 'Farense' },
  { number: 18, name: 'Telmo Arcanjo', position: 'MF', age: 22, club: 'Vitória de Guimarães' },
  { number: 20, name: 'Ryan Mendes', position: 'MF', age: 35, club: 'Igdir' },
  // Delanteros
  { number: 7, name: 'Jovane Cabral', position: 'FW', age: 28, club: 'Unattached' },
  { number: 9, name: 'Gilson ‘Benchimol’ Tavares', position: 'FW', age: 24, club: 'Akron Tolyatti' },
  { number: 17, name: 'Willy Semedo', position: 'FW', age: 31, club: 'Omonia Nicosia' },
  { number: 19, name: 'Dailon Livramento', position: 'FW', age: 25, club: 'Casa Pia' },
  { number: 21, name: 'Nuno da Costa', position: 'FW', age: 34, club: 'Basaksehir' },
  { number: 26, name: 'Helio Varela', position: 'FW', age: 24, club: 'Maccabi Tel-Aviv' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 22, 5, 4, 8, 6, 10, 18, 20, 9, 7]
};
