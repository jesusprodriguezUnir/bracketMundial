import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Vozinha', position: 'GK', age: 40, club: 'Gil Vicente', captain: true },
  { number: 12, name: 'Márcio Rosa', position: 'GK', age: 29, club: 'Anorthosis' },
  { number: 23, name: 'Dylan Silva', position: 'GK', age: 24, club: 'Casa Pia' },
  { number: 2, name: 'Stopira', position: 'DF', age: 37, club: 'Feirense' },
  { number: 3, name: 'Roberto Lopes', position: 'DF', age: 33, club: 'Shamrock Rovers' },
  { number: 4, name: 'Logan Costa', position: 'DF', age: 25, club: 'Villarreal' },
  { number: 5, name: 'João Paulo Fernandes', position: 'DF', age: 27, club: 'Levski Sofia' },
  { number: 13, name: 'Steven Moreira', position: 'DF', age: 32, club: 'Columbus Crew' },
  { number: 15, name: 'Jeffry Fortes', position: 'DF', age: 36, club: 'De Graafschap' },
  { number: 16, name: 'Dérick Poloni', position: 'DF', age: 30, club: 'Chaves' },
  { number: 6, name: 'Kevin Pina', position: 'MF', age: 28, club: 'Gil Vicente' },
  { number: 7, name: 'Jovane Cabral', position: 'MF', age: 28, club: 'Salernitana' },
  { number: 8, name: 'Bebé', position: 'MF', age: 36, club: 'Rayo Vallecano' },
  { number: 10, name: 'Kenny Rocha Santos', position: 'MF', age: 26, club: 'Saint-Étienne' },
  { number: 14, name: 'Jamiro Monteiro', position: 'MF', age: 32, club: 'San Jose Earthquakes' },
  { number: 17, name: 'Laros Duarte', position: 'MF', age: 28, club: 'Groningen' },
  { number: 9, name: 'Ryan Mendes', position: 'FW', age: 36, club: 'Fatih Karagümrük' },
  { number: 11, name: 'Benchimol', position: 'FW', age: 30, club: 'Académico de Viseu' },
  { number: 18, name: 'Willy Semedo', position: 'FW', age: 31, club: 'Al-Faisaly' },
  { number: 19, name: 'Gilson Tavares', position: 'FW', age: 24, club: 'Benfica B' },
  { number: 20, name: 'Hélio Varela', position: 'FW', age: 23, club: 'Farense' },
  { number: 21, name: 'Lisandro Semedo', position: 'FW', age: 29, club: 'Rizespor' },
  { number: 22, name: 'Dailon Rocha Livramento', position: 'FW', age: 25, club: 'Verona' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 4, 3, 5, 6, 14, 10, 9, 11, 8]
};