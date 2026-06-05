import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Juan Musso', position: 'GK', age: 32, club: 'Atlético Madrid' },
  { number: 12, name: 'Gerónimo Rulli', position: 'GK', age: 34, club: 'Marseille' },
  { number: 23, name: 'Emiliano Martínez', position: 'GK', age: 34, club: 'Aston Villa' },
  // Defensores
  { number: 2, name: 'Leonardo Balerdi', position: 'DF', age: 27, club: 'Marseille' },
  { number: 3, name: 'Nicolás Tagliafico', position: 'DF', age: 34, club: 'Lyon' },
  { number: 4, name: 'Gonzalo Montiel', position: 'DF', age: 29, club: 'River Plate' },
  { number: 6, name: 'Lisandro Martínez', position: 'DF', age: 28, club: 'Manchester United' },
  { number: 13, name: 'Cristian Romero', position: 'DF', age: 28, club: 'Tottenham' },
  { number: 19, name: 'Nicolás Otamendi', position: 'DF', age: 37, club: 'Benfica' },
  { number: 25, name: 'Facundo Medina', position: 'DF', age: 27, club: 'Marseille' },
  { number: 26, name: 'Nahuel Molina', position: 'DF', age: 28, club: 'Atlético Madrid' },
  // Volantes
  { number: 5, name: 'Leandro Paredes', position: 'MF', age: 32, club: 'Boca Juniors' },
  { number: 7, name: 'Rodrigo De Paul', position: 'MF', age: 32, club: 'Inter Miami' },
  { number: 8, name: 'Valentín Barco', position: 'MF', age: 22, club: 'Strasbourg' },
  { number: 11, name: 'Giovani Lo Celso', position: 'MF', age: 29, club: 'Real Betis' },
  { number: 14, name: 'Exequiel Palacios', position: 'MF', age: 28, club: 'Bayer Leverkusen' },
  { number: 15, name: 'Nicolás González', position: 'MF', age: 28, club: 'Atlético Madrid' },
  { number: 16, name: 'Thiago Almada', position: 'MF', age: 25, club: 'Atlético Madrid' },
  { number: 18, name: 'Nico Paz', position: 'MF', age: 21, club: 'Como' },
  { number: 20, name: 'Alexis Mac Allister', position: 'MF', age: 28, club: 'Liverpool' },
  { number: 24, name: 'Enzo Fernández', position: 'MF', age: 25, club: 'Chelsea' },
  // Delanteros
  { number: 9, name: 'Julián Álvarez', position: 'FW', age: 26, club: 'Atlético Madrid' },
  { number: 10, name: 'Lionel Messi', position: 'FW', age: 39, club: 'Inter Miami', captain: true },
  { number: 17, name: 'Giuliano Simeone', position: 'FW', age: 24, club: 'Atlético Madrid' },
  { number: 21, name: 'José López', position: 'FW', age: 25, club: 'Palmeiras' },
  { number: 22, name: 'Lautaro Martínez', position: 'FW', age: 29, club: 'Inter' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [23, 3, 6, 13, 26, 7, 24, 20, 10, 22, 9]
};
