import type { Player } from './index';
export const coach = 'Ali Boumnijel'; // Asumido o buscado, usualmente asistente o encargado tras Kadri
export const squad: Player[] = [
  { number: 1,  name: 'Aymen Dahmen',           position: 'GK', age: 29, club: 'Montpellier' },
  { number: 16, name: 'Chamakh',                position: 'GK', age: 24, club: 'Espérance Tunis' },
  { number: 22, name: 'Sabri Ben Hassen',       position: 'GK', age: 27, club: 'CS Sfaxien' },
  { number: 2,  name: 'Yan Valery',             position: 'DF', age: 27, club: 'Angers' },
  { number: 3,  name: 'Moutaz Neffati',         position: 'DF', age: 22, club: 'Espérance Tunis' },
  { number: 4,  name: 'Dylan Bronn',            position: 'DF', age: 28, club: 'Salernitana' },
  { number: 5,  name: 'Montassar Talbi',        position: 'DF', age: 26, club: 'Lorient' },
  { number: 6,  name: 'Omar Rekik',             position: 'DF', age: 24, club: 'Arsenal' },
  { number: 13, name: 'Adem Arous',             position: 'DF', age: 23, club: 'Stade Tunisien' },
  { number: 15, name: 'Raed Chikhaoui',         position: 'DF', age: 24, club: 'Étoile du Sahel' },
  { number: 12, name: 'Ali Abdi',               position: 'DF', age: 32, club: 'Caen' },
  { number: 21, name: 'Ben Hmida',              position: 'DF', age: 28, club: 'Espérance Tunis' },
  { number: 14, name: 'Ellyes Skhiri',          position: 'MF', age: 29, club: 'Eintracht Frankfurt' },
  { number: 18, name: 'Hajj Mahmoud',           position: 'MF', age: 25, club: 'Lugano' },
  { number: 17, name: 'Rani Khedira',           position: 'MF', age: 32, club: 'Union Berlin' },
  { number: 8,  name: 'Anis Ben Slimane',       position: 'MF', age: 25, club: 'Sheffield United' },
  { number: 20, name: 'Ben Ouanes',             position: 'MF', age: 30, club: 'Kasimpasa' },
  { number: 24, name: 'Gharbi',                 position: 'MF', age: 22, club: 'Stade de Reims' },
  { number: 10, name: 'Hannibal Mejbri',        position: 'MF', age: 23, club: 'Manchester United' },
  { number: 7,  name: 'Ayari',                  position: 'FW', age: 22, club: 'Brighton' },
  { number: 11, name: 'Achouri',                position: 'FW', age: 27, club: 'FC Copenhagen' },
  { number: 9,  name: 'Elias Saad',             position: 'FW', age: 26, club: 'St. Pauli' },
  { number: 19, name: 'Firas Chaouat',          position: 'FW', age: 30, club: 'Al-Abha' },
  { number: 23, name: 'Hazem Mastouri',         position: 'FW', age: 27, club: 'Union Monastirienne' },
  { number: 25, name: 'Rayan Elloumi',          position: 'FW', age: 22, club: 'Stade Tunisien' },
  { number: 26, name: 'Sebastian Tounekti',     position: 'FW', age: 23, club: 'Haugesund' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 4, 12, 14, 17, 10, 7, 19, 11]
};
