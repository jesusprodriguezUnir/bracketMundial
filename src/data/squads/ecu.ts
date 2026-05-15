import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Hernán Galíndez',        position: 'GK', age: 36, club: 'Aucas' },
  { number: 12, name: 'Alexander Domínguez',    position: 'GK', age: 38, club: 'LDU Quito' },
  { number: 23, name: 'Moisés Ramírez',         position: 'GK', age: 26, club: 'Aucas' },
  { number: 2,  name: 'Ángelo Preciado',        position: 'DF', age: 26, club: 'Genk' },
  { number: 3,  name: 'Piero Hincapié',         position: 'DF', age: 23, club: 'Bayer Leverkusen' },
  { number: 4,  name: 'Robert Arboleda',        position: 'DF', age: 32, club: 'São Paulo' },
  { number: 5,  name: 'Diego Palacios',         position: 'DF', age: 26, club: 'LA Galaxy' },
  { number: 13, name: 'Félix Torres',           position: 'DF', age: 27, club: 'Santos Laguna' },
  { number: 22, name: 'Xavier Arreaga',         position: 'DF', age: 30, club: 'Seattle Sounders' },
  { number: 6,  name: 'Moisés Caicedo',         position: 'MF', age: 24, club: 'Chelsea', captain: true },
  { number: 8,  name: 'Carlos Gruezo',          position: 'MF', age: 29, club: 'SD Eibar' },
  { number: 10, name: 'Gonzalo Plata',          position: 'FW', age: 24, club: 'Al-Qadsiah' },
  { number: 14, name: 'Jhegson Méndez',         position: 'MF', age: 27, club: 'LA Galaxy' },
  { number: 16, name: 'Alan Minda',             position: 'FW', age: 24, club: 'Aucas' },
  { number: 17, name: 'Jeremy Sarmiento',       position: 'MF', age: 23, club: 'Brighton' },
  { number: 18, name: 'José Cifuentes',         position: 'MF', age: 25, club: 'Leeds United' },
  { number: 7,  name: 'Pervis Estupiñán',       position: 'DF', age: 26, club: 'Brighton' },
  { number: 9,  name: 'Enner Valencia',         position: 'FW', age: 36, club: 'LDU Quito' },
  { number: 11, name: 'Michael Estrada',        position: 'FW', age: 28, club: 'Toulouse' },
  { number: 15, name: 'Djorkaeff Reasco',       position: 'FW', age: 24, club: 'Newell\'s Old Boys' },
  { number: 19, name: 'Kevin Rodríguez',        position: 'FW', age: 25, club: 'Ipswich Town' },
  { number: 20, name: 'Lolo Rodríguez',         position: 'FW', age: 24, club: 'Aucas' },
  { number: 21, name: 'Romario Ibarra',         position: 'FW', age: 29, club: 'Pachuca' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 13, 3, 7, 6, 8, 18, 10, 9, 16]
};

