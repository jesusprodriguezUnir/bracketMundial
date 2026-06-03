import type { Player } from './index';
export const squad: Player[] = [
  // Porteros
  { number: 1,  name: 'Hernán Galíndez',      position: 'GK', age: 39, club: 'CA Huracán' },
  { number: 23, name: 'Moisés Ramírez',       position: 'GK', age: 25, club: 'AE Kifisia FC' },
  { number: 12, name: 'Gonzalo Valle',        position: 'GK', age: 30, club: 'LDU Quito' },

  // Defensas
  { number: 4,  name: 'Willian Pacho',        position: 'DF', age: 24, club: 'Paris Saint-Germain' },
  { number: 3,  name: 'Piero Hincapié',       position: 'DF', age: 24, club: 'Arsenal FC' },
  { number: 5,  name: 'Joel Ordóñez',         position: 'DF', age: 22, club: 'Club Brugge' },
  { number: 22, name: 'Jackson Porozo',       position: 'DF', age: 25, club: 'Club Tijuana' },
  { number: 13, name: 'Félix Torres',         position: 'DF', age: 29, club: 'SC Internacional' },
  { number: 7,  name: 'Pervis Estupiñán',     position: 'DF', age: 28, club: 'AC Milan' },
  { number: 15, name: 'Yaimar Medina',        position: 'DF', age: 21, club: 'KRC Genk' },
  { number: 2,  name: 'Ángelo Preciado',      position: 'DF', age: 28, club: 'Atlético Mineiro' },

  // Centrocampistas
  { number: 6,  name: 'Moisés Caicedo',       position: 'MF', age: 24, club: 'Chelsea FC', captain: true },
  { number: 8,  name: 'Jordy Alcívar',        position: 'MF', age: 26, club: 'Independiente Del Valle' },
  { number: 14, name: 'Denil Castillo',       position: 'MF', age: 22, club: 'FC Midtjylland' },
  { number: 18, name: 'Alan Franco',          position: 'MF', age: 27, club: 'Atlético Mineiro' },
  { number: 17, name: 'Pedro Vite',           position: 'MF', age: 24, club: 'Pumas UNAM' },
  { number: 16, name: 'Alan Minda',           position: 'MF', age: 23, club: 'Atlético Mineiro' },
  { number: 21, name: 'Kendry Páez',          position: 'MF', age: 19, club: 'CA River Plate' },
  { number: 26, name: 'Anthony Valencia',     position: 'MF', age: 22, club: 'Royal Antwerp FC' },

  // Delanteros
  { number: 10, name: 'Gonzalo Plata',        position: 'FW', age: 25, club: 'CR Flamengo' },
  { number: 11, name: 'John Yeboah',          position: 'FW', age: 25, club: 'Venezia FC' },
  { number: 9,  name: 'Énner Valencia',       position: 'FW', age: 36, club: 'CF Pachuca' },
  { number: 24, name: 'Jordy Caicedo',        position: 'FW', age: 28, club: 'CA Huracán' },
  { number: 25, name: 'Jeremy Arévalo',       position: 'FW', age: 21, club: 'VfB Stuttgart' },
  { number: 20, name: 'Nilson Angulo',        position: 'FW', age: 22, club: 'Sunderland AFC' },
  { number: 19, name: 'Kevin Rodríguez',      position: 'FW', age: 26, club: 'Royale Union Saint-Gilloise' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 3, 7, 6, 18, 21, 10, 9, 19]
};
