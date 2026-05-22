import type { Player } from './index';
export const squad: Player[] = [
  // Arqueros
  { number: 1, name: 'Vozinha', position: 'GK', age: 40, club: 'Chaves', captain: true },
  { number: 12, name: 'Márcio Rosa', position: 'GK', age: 29, club: 'Anorthosis' },
  { number: 23, name: 'CJ dos Santos', position: 'GK', age: 25, club: 'Chicago Fire' },
  // Defensores
  { number: 13, name: 'Steven Moreira', position: 'DF', age: 32, club: 'Columbus Crew' },
  { number: 2, name: 'Wagner Pina', position: 'DF', age: 21, club: 'Estoril' },
  { number: 5, name: 'João Paulo Fernandes', position: 'DF', age: 27, club: 'Levski Sofia' },
  { number: 15, name: 'Sidny Cabral', position: 'DF', age: 21, club: 'Rot-Weiß Erfurt' },
  { number: 4, name: 'Logan Costa', position: 'DF', age: 25, club: 'Villarreal' },
  { number: 3, name: 'Pico Lopes', position: 'DF', age: 33, club: 'Shamrock Rovers' },
  { number: 16, name: 'Kelvin Pires', position: 'DF', age: 23, club: 'SJK' },
  { number: 24, name: 'Stopira', position: 'DF', age: 37, club: 'Boavista Praia' },
  { number: 25, name: "'Diney' Borges", position: 'DF', age: 29, club: 'Al Bataeh' },
  // Mediocampistas
  { number: 14, name: 'Jamiro Monteiro', position: 'MF', age: 32, club: 'San Jose Earthquakes' },
  { number: 10, name: 'Telmo Arcanjo', position: 'MF', age: 22, club: 'Vitória Guimarães' },
  { number: 8, name: 'Yannick Semedo', position: 'MF', age: 28, club: 'Vizela' },
  { number: 17, name: 'Laros Duarte', position: 'MF', age: 28, club: 'Groningen' },
  { number: 26, name: 'Deroy Duarte', position: 'MF', age: 24, club: 'Fortuna Sittard' },
  { number: 6, name: 'Kevin Pina', position: 'MF', age: 28, club: 'Krasnodar' },
  // Delanteros
  { number: 9, name: 'Ryan Mendes', position: 'FW', age: 36, club: 'Fatih Karagümrük' },
  { number: 18, name: 'Willy Semedo', position: 'FW', age: 31, club: 'Omonia' },
  { number: 20, name: 'Garry Rodrigues', position: 'FW', age: 35, club: 'Sivasspor' },
  { number: 7, name: 'Jovane Cabral', position: 'FW', age: 28, club: 'Salernitana' },
  { number: 21, name: 'Nuno da Costa', position: 'FW', age: 33, club: 'Kasımpaşa' },
  { number: 22, name: 'Dailon Livramento', position: 'FW', age: 25, club: 'Verona' },
  { number: 11, name: 'Gilson Benchimol', position: 'FW', age: 24, club: 'Benfica B' },
  { number: 19, name: 'Hélio Varela', position: 'FW', age: 23, club: 'Farense' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 4, 3, 5, 6, 14, 10, 9, 11, 7]
};