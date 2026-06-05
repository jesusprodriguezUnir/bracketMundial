import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Hernán Galíndez', position: 'GK', age: 39, club: 'CA Huracán' },
  { number: 12, name: 'Moisés Ramírez', position: 'GK', age: 25, club: 'Kifisia' },
  { number: 22, name: 'Gonzalo Valle', position: 'GK', age: 30, club: 'LDU Quito' },
  // Defensores
  { number: 2, name: 'Félix Torres', position: 'DF', age: 28, club: 'Internacional' },
  { number: 3, name: 'Piero Hincapié', position: 'DF', age: 23, club: 'Arsenal' },
  { number: 4, name: 'Joel Ordóñez', position: 'DF', age: 22, club: 'Club Brugge' },
  { number: 6, name: 'Willian Pacho', position: 'DF', age: 24, club: 'Paris St-Germain' },
  { number: 7, name: 'Pervis Estupiñán', position: 'DF', age: 28, club: 'Milan' },
  { number: 17, name: 'Ángelo Preciado', position: 'DF', age: 28, club: 'Atlético Mineiro' },
  { number: 25, name: 'Jackson Porozo', position: 'DF', age: 26, club: 'Tijuana' },
  { number: 26, name: 'Yaimar Medina', position: 'DF', age: 22, club: 'Genk' },
  // Volantes
  { number: 5, name: 'Jordy Alcívar', position: 'MF', age: 27, club: 'Independiente del Valle' },
  { number: 18, name: 'Denil Castillo', position: 'MF', age: 22, club: 'Midtjylland' },
  { number: 21, name: 'Alan Franco', position: 'MF', age: 27, club: 'Atlético Mineiro' },
  { number: 23, name: 'Moisés Caicedo', position: 'MF', age: 25, club: 'Chelsea', captain: true },
  // Delanteros
  { number: 8, name: 'Anthony Valencia', position: 'FW', age: 22, club: 'Royal Antwerp' },
  { number: 9, name: 'John Yeboah', position: 'FW', age: 25, club: 'Venezia' },
  { number: 10, name: 'Kendry Páez', position: 'FW', age: 19, club: 'River Plate' },
  { number: 11, name: 'Kevin Rodríguez', position: 'FW', age: 26, club: 'Union Saint-Gilloise' },
  { number: 13, name: 'Enner Valencia', position: 'FW', age: 37, club: 'Pachuca' },
  { number: 14, name: 'Alan Minda', position: 'FW', age: 23, club: 'Atlético Mineiro' },
  { number: 15, name: 'Pedro Vite', position: 'FW', age: 23, club: 'Pumas UNAM' },
  { number: 16, name: 'Jordy Caicedo', position: 'FW', age: 28, club: 'CA Huracán' },
  { number: 19, name: 'Gonzalo Plata', position: 'FW', age: 26, club: 'Flamengo' },
  { number: 20, name: 'Nilson Angulo', position: 'FW', age: 22, club: 'Sunderland' },
  { number: 24, name: 'Jeremy Arévalo', position: 'FW', age: 21, club: 'Stuttgart' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 17, 6, 3, 7, 23, 21, 10, 19, 13, 11]
};
