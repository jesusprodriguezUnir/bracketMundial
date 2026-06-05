import type { Player } from './index';

export const coach = 'Sabri Lamouchi';
export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Mouhib Chamakh', position: 'GK', age: 24, club: 'Club Africain' },
  { number: 16, name: 'Aymen Dahmen', position: 'GK', age: 29, club: 'CS Sfaxien' },
  { number: 22, name: 'Sabri Ben Hessen', position: 'GK', age: 27, club: 'Étoile du Sahel' },
  // Defensores
  { number: 2, name: 'Ali Abdi', position: 'DF', age: 32, club: 'Nice' },
  { number: 3, name: 'Montassar Talbi', position: 'DF', age: 26, club: 'Lorient' },
  { number: 4, name: 'Omar Rekik', position: 'DF', age: 24, club: 'Maribor' },
  { number: 5, name: 'Adem Arous', position: 'DF', age: 23, club: 'Kasimpasa' },
  { number: 6, name: 'Dylan Bronn', position: 'DF', age: 28, club: 'Servette' },
  { number: 20, name: 'Yan Valery', position: 'DF', age: 27, club: 'Sheffield Wednesday' },
  { number: 21, name: 'Mohamed Amine Ben Hmida', position: 'DF', age: 0, club: 'Espérance de Tunis' },
  { number: 23, name: 'Moutaz Neffati', position: 'DF', age: 22, club: 'IFK Norrköping' },
  { number: 24, name: 'Raed Chikhaoui', position: 'DF', age: 21, club: 'US Monastir' },
  // Volantes
  { number: 10, name: 'Hannibal Mejbri', position: 'MF', age: 23, club: 'Burnley' },
  { number: 11, name: 'Ismaël Gharbi', position: 'MF', age: 21, club: 'Braga' },
  { number: 12, name: 'Mortadha Ben Ouanes', position: 'MF', age: 32, club: 'Kasimpasa' },
  { number: 13, name: 'Rani Khedira', position: 'MF', age: 32, club: 'Union Berlin' },
  { number: 15, name: 'Hadj Mahmoud', position: 'MF', age: 25, club: 'Lugano' },
  { number: 17, name: 'Ellyes Skhiri', position: 'MF', age: 30, club: 'Eintracht Frankfurt' },
  { number: 25, name: 'Anis Ben Slimane', position: 'MF', age: 25, club: 'Norwich City' },
  // Delanteros
  { number: 7, name: 'Elias Achouri', position: 'FW', age: 26, club: 'FC Copenhagen' },
  { number: 8, name: 'Elias Saad', position: 'FW', age: 26, club: 'Augsburg' },
  { number: 9, name: 'Hazem Mastouri', position: 'FW', age: 27, club: 'Dynamo Makhachkala' },
  { number: 14, name: 'Khalil Ayari', position: 'FW', age: 21, club: 'Paris St-Germain' },
  { number: 18, name: 'Rayan Elloumi', position: 'FW', age: 22, club: 'Vancouver' },
  { number: 19, name: 'Firas Chaouat', position: 'FW', age: 29, club: 'Club Africain' },
  { number: 26, name: 'Sebastien Tounekti', position: 'FW', age: 23, club: 'Celtic' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [16, 20, 3, 6, 2, 17, 13, 10, 14, 19, 7]
};
