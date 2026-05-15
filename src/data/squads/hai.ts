import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Josué Duverger',         position: 'GK', age: 31, club: 'Violette AC' },
  { number: 12, name: 'Jocelyn Macena',         position: 'GK', age: 28, club: 'Racing Club Haïtien' },
  { number: 23, name: 'Jean Sébastien Génatus',  position: 'GK', age: 26, club: 'AS Cavaly' },
  { number: 2,  name: 'Mechak Jérôme',          position: 'DF', age: 27, club: 'Colorado Rapids' },
  { number: 3,  name: 'Shaquell Moore',         position: 'DF', age: 28, club: 'LAFC' },
  { number: 4,  name: 'Steeven Saba',           position: 'DF', age: 30, club: 'CF Montréal' },
  { number: 5,  name: 'Derrick Etienne Sr.',    position: 'DF', age: 29, club: 'Columbus Crew' },
  { number: 14, name: 'Kevin Lafrance',         position: 'DF', age: 28, club: 'Violette AC' },
  { number: 22, name: 'Jems Geffrard',          position: 'DF', age: 25, club: 'Orlando City' },
  { number: 6,  name: 'Wilde-Donald Guerrier',  position: 'MF', age: 32, club: 'Nashville SC' },
  { number: 8,  name: 'James Léandre',          position: 'MF', age: 28, club: 'AS Cavaly' },
  { number: 10, name: 'Frantzdy Pierrot',       position: 'MF', age: 27, club: 'Molenbeek' },
  { number: 16, name: 'Duckens Nazon',          position: 'FW', age: 31, club: 'Clermont Foot' },
  { number: 17, name: 'Jessy Deminguet',        position: 'MF', age: 28, club: 'Angers' },
  { number: 18, name: 'Mikeál Cantave',         position: 'MF', age: 24, club: 'Violette AC' },
  { number: 7,  name: 'Dario Bijoux',           position: 'FW', age: 30, club: 'Nashville SC' },
  { number: 9,  name: 'Ronaldo Dimanche',       position: 'FW', age: 28, club: 'Montserrat' },
  { number: 11, name: 'Derrick Etienne Jr.',    position: 'FW', age: 27, club: 'Portland Timbers' },
  { number: 19, name: 'Laurent Romain',         position: 'FW', age: 25, club: 'Violette AC' },
  { number: 20, name: 'Nathanya Auguste',       position: 'FW', age: 22, club: 'AS Cavaly' },
  { number: 21, name: 'Kervens Belfort',        position: 'FW', age: 34, club: 'FC Dallas', captain: true },
  { number: 24, name: 'Adekel Calixte',         position: 'MF', age: 23, club: 'Rayo Vallecano' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 2, 14, 5, 10, 6, 17, 11, 16, 21]
};
