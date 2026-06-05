import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Roberto Junior Fernández', position: 'GK', age: 38, club: 'Cerro Porteño' },
  { number: 12, name: 'Orlando Gill', position: 'GK', age: 25, club: 'San Lorenzo de Almagro' },
  { number: 22, name: 'Gastón Oliveira', position: 'GK', age: 33, club: 'Olimpia' },
  // Defensores
  { number: 2, name: 'Gustavo Velázquez', position: 'DF', age: 35, club: 'Cerro Porteño' },
  { number: 3, name: 'Omar Alderete', position: 'DF', age: 29, club: 'Sunderland' },
  { number: 4, name: 'Juan José Cáceres', position: 'DF', age: 26, club: 'Dynamo Moscow' },
  { number: 5, name: 'Fabián Balbuena', position: 'DF', age: 34, club: 'Grêmio' },
  { number: 6, name: 'Junior Alonso', position: 'DF', age: 32, club: 'Atlético Mineiro' },
  { number: 13, name: 'José Canale', position: 'DF', age: 29, club: 'Lanus' },
  { number: 15, name: 'Gustavo Gómez', position: 'DF', age: 33, club: 'Palmeiras', captain: true },
  { number: 26, name: 'Alexandro Maidana', position: 'DF', age: 22, club: 'Talleres' },
  // Volantes
  { number: 8, name: 'Diego Gómez', position: 'MF', age: 23, club: 'Brighton' },
  { number: 11, name: 'Maurício', position: 'MF', age: 0, club: 'Palmeiras' },
  { number: 14, name: 'Andrés Cubas', position: 'MF', age: 29, club: 'Vancouver Whitecaps' },
  { number: 16, name: 'Damián Bobadilla', position: 'MF', age: 24, club: 'São Paulo' },
  { number: 17, name: 'Alejandro ‘Kaku’ Romero', position: 'MF', age: 30, club: 'Al-Ain' },
  { number: 20, name: 'Braian Ojeda', position: 'MF', age: 25, club: 'Orlando City' },
  { number: 23, name: 'Matías Galarza', position: 'MF', age: 23, club: 'Atlanta United' },
  // Delanteros
  { number: 7, name: 'Ramón Sosa', position: 'FW', age: 26, club: 'Palmeiras' },
  { number: 9, name: 'Antonio Sanabria', position: 'FW', age: 30, club: 'Cremonese' },
  { number: 10, name: 'Miguel Almirón', position: 'FW', age: 31, club: 'Atlanta United' },
  { number: 18, name: 'Álex Arce', position: 'FW', age: 30, club: 'Independiente de Rivadavia' },
  { number: 19, name: 'Julio Enciso', position: 'FW', age: 22, club: 'Racing Strasbourg' },
  { number: 21, name: 'Gabriel Ávalos', position: 'FW', age: 35, club: 'Independiente de Avellaneda' },
  { number: 24, name: 'Gustavo Caballero', position: 'FW', age: 24, club: 'Portsmouth' },
  { number: 25, name: 'Isidro Pitta', position: 'FW', age: 27, club: 'Red Bull Bragantino' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 4, 15, 3, 13, 14, 11, 8, 10, 9, 19]
};
