import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Emiliano Martínez', position: 'GK', age: 34, club: 'Aston Villa' },
  { number: 12, name: 'Gerónimo Rulli', position: 'GK', age: 34, club: 'Marseille' },
  { number: 23, name: 'Juan Musso', position: 'GK', age: 32, club: 'Atlético de Madrid' },

  // Defensores
  { number: 2, name: 'Nahuel Molina', position: 'DF', age: 28, club: 'Atlético de Madrid' },
  { number: 3, name: 'Nicolás Tagliafico', position: 'DF', age: 34, club: 'Lyon' },
  { number: 4, name: 'Cristian Romero', position: 'DF', age: 28, club: 'Tottenham Hotspur' },
  { number: 13, name: 'Nicolás Otamendi', position: 'DF', age: 38, club: 'Benfica' },
  { number: 14, name: 'Lisandro Martínez', position: 'DF', age: 28, club: 'Manchester United' },
  { number: 24, name: 'Leonardo Balerdi', position: 'DF', age: 27, club: 'Marseille' },
  { number: 25, name: 'Facundo Medina', position: 'DF', age: 27, club: 'Marseille' },
  { number: 26, name: 'Gonzalo Montiel', position: 'DF', age: 29, club: 'River Plate' },

  // Volantes
  { number: 5, name: 'Leandro Paredes', position: 'MF', age: 32, club: 'Boca Juniors' },
  { number: 6, name: 'Alexis Mac Allister', position: 'MF', age: 28, club: 'Liverpool' },
  { number: 7, name: 'Rodrigo De Paul', position: 'MF', age: 32, club: 'Inter Miami' },
  { number: 8, name: 'Enzo Fernández', position: 'MF', age: 25, club: 'Chelsea' },
  { number: 15, name: 'Exequiel Palacios', position: 'MF', age: 28, club: 'Bayer Leverkusen' },
  { number: 18, name: 'Giovani Lo Celso', position: 'MF', age: 30, club: 'Real Betis' },
  { number: 22, name: 'Valentín Barco', position: 'MF', age: 22, club: 'Strasbourg' },

  // Delanteros
  { number: 10, name: 'Lionel Messi', position: 'FW', age: 39, club: 'Inter Miami', captain: true },
  { number: 9, name: 'Julián Álvarez', position: 'FW', age: 26, club: 'Atlético de Madrid' },
  { number: 11, name: 'Lautaro Martínez', position: 'FW', age: 29, club: 'Inter' },
  { number: 21, name: 'Giuliano Simeone', position: 'FW', age: 24, club: 'Atlético de Madrid' },
  { number: 27, name: 'Nicolás González', position: 'FW', age: 28, club: 'Atlético de Madrid' },
  { number: 28, name: 'Thiago Almada', position: 'FW', age: 25, club: 'Atlético de Madrid' },
  { number: 29, name: 'Nicolás Paz', position: 'FW', age: 22, club: 'Como 1907' },
  { number: 30, name: 'José Manuel López', position: 'FW', age: 25, club: 'Palmeiras' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 14, 4, 2, 7, 8, 6, 10, 11, 9]
};
