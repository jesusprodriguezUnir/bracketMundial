import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Roberto Junior Fernández', position: 'GK', age: 38, club: 'Cerro Porteño' },
  { number: 12, name: 'Orlando Gill', position: 'GK', age: 25, club: 'Sportivo Luqueño' },
  { number: 23, name: 'Gastón Olveira', position: 'GK', age: 33, club: 'Olimpia' },

  // Defensores
  { number: 2, name: 'Gustavo Gómez', position: 'DF', age: 33, club: 'Palmeiras', captain: true },
  { number: 3, name: 'Omar Alderete', position: 'DF', age: 29, club: 'Getafe' },
  { number: 4, name: 'Fabián Balbuena', position: 'DF', age: 34, club: 'Dinamo Moscú' },
  { number: 5, name: 'Junior Alonso', position: 'DF', age: 33, club: 'Atlético Mineiro' },
  { number: 13, name: 'Juan José Cáceres', position: 'DF', age: 26, club: 'Lanús' },
  { number: 14, name: 'Gustavo Velázquez', position: 'DF', age: 35, club: "Newell's" },
  { number: 15, name: 'José Canale', position: 'DF', age: 29, club: 'Lanús' },
  { number: 22, name: 'Alexandro Maidana', position: 'DF', age: 22, club: 'Cerro Porteño' },

  // Mediocampistas
  { number: 6, name: 'Diego Gómez', position: 'MF', age: 23, club: 'Inter Miami' },
  { number: 8, name: 'Andrés Cubas', position: 'MF', age: 30, club: 'Vancouver Whitecaps' },
  { number: 16, name: 'Maurício Magalhães', position: 'MF', age: 24, club: 'Vitória Guimarães' },
  { number: 17, name: 'Damián Bobadilla', position: 'MF', age: 24, club: 'São Paulo' },
  { number: 18, name: 'Braian Ojeda', position: 'MF', age: 25, club: 'Real Salt Lake' },
  { number: 20, name: 'Matías Galarza', position: 'MF', age: 23, club: 'Talleres' },
  { number: 24, name: 'Alejandro Romero Gamarra', position: 'MF', age: 31, club: 'Al-Ain' },

  // Delanteros
  { number: 7, name: 'Julio Enciso', position: 'FW', age: 22, club: 'Brighton' },
  { number: 9, name: 'Antonio Sanabria', position: 'FW', age: 30, club: 'Torino' },
  { number: 10, name: 'Miguel Almirón', position: 'FW', age: 32, club: 'Newcastle' },
  { number: 11, name: 'Ramón Sosa', position: 'FW', age: 26, club: 'Nottingham Forest' },
  { number: 19, name: 'Álex Arce', position: 'FW', age: 30, club: 'LDU Quito' },
  { number: 21, name: 'Gustavo Caballero', position: 'FW', age: 24, club: 'Nacional' },
  { number: 25, name: 'Gabriel Ávalos', position: 'FW', age: 35, club: 'Independiente' },
  { number: 26, name: 'Isidro Pitta', position: 'FW', age: 27, club: 'Cuiabá' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 2, 3, 15, 8, 16, 6, 10, 9, 7]
};
