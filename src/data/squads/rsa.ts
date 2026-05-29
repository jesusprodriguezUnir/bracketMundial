import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1,  name: 'Ronwen Williams',        position: 'GK', age: 34, club: 'Mamelodi Sundowns', captain: true },
  { number: 16, name: 'Ricardo Goss',           position: 'GK', age: 32, club: 'Siwelele' },
  { number: 17, name: 'Sipho Chaine',           position: 'GK', age: 29, club: 'Orlando Pirates' },
  
  // Defensas
  { number: 2,  name: 'Khuliso Mudau',          position: 'DF', age: 31, club: 'Mamelodi Sundowns' },
  { number: 3,  name: 'Aubrey Modiba',          position: 'DF', age: 30, club: 'Mamelodi Sundowns' },
  { number: 4,  name: 'Khulumani Ndamane',      position: 'DF', age: 22, club: 'Mamelodi Sundowns' },
  { number: 5,  name: 'Nkosinathi Sibisi',      position: 'DF', age: 30, club: 'Orlando Pirates' },
  { number: 8,  name: 'Kamogelo Sebelebele',    position: 'DF', age: 23, club: 'Orlando Pirates' },
  { number: 12, name: 'Thabang Matuludi',       position: 'DF', age: 22, club: 'Polokwane City' },
  { number: 13, name: 'Samukele Kabini',        position: 'DF', age: 20, club: 'Molde FK' },
  { number: 14, name: 'Mbekezeli Mbokazi',      position: 'DF', age: 23, club: 'Chicago Fire' },
  { number: 15, name: 'Bradley Cross',          position: 'DF', age: 25, club: 'Kaizer Chiefs' },
  { number: 21, name: 'Ime Okon',               position: 'DF', age: 22, club: 'Hannover 96' },
  { number: 22, name: 'Olwethu Makhanya',        position: 'DF', age: 22, club: 'Philadelphia Union' },

  // Centrocampistas
  { number: 6,  name: 'Teboho Mokoena',         position: 'MF', age: 29, club: 'Mamelodi Sundowns' },
  { number: 18, name: 'Sphephelo Sithole',      position: 'MF', age: 27, club: 'CD Tondela' },
  { number: 19, name: 'Thalente Mbatha',        position: 'MF', age: 26, club: 'Orlando Pirates' },
  { number: 20, name: 'Jayden Adams',           position: 'MF', age: 25, club: 'Mamelodi Sundowns' },

  // Delanteros
  { number: 10, name: 'Themba Zwane',           position: 'MF', age: 36, club: 'Mamelodi Sundowns' },
  { number: 9,  name: 'Lyle Foster',            position: 'FW', age: 26, club: 'Burnley' },
  { number: 7,  name: 'Oswin Appollis',         position: 'FW', age: 24, club: 'Orlando Pirates' },
  { number: 11, name: 'Relebohile Mofokeng',    position: 'FW', age: 21, club: 'Orlando Pirates' },
  { number: 23, name: 'Iqraam Rayners',         position: 'FW', age: 30, club: 'Mamelodi Sundowns' },
  { number: 24, name: 'Evidence Makgopa',       position: 'FW', age: 26, club: 'Orlando Pirates' },
  { number: 25, name: 'Tshepang Moremi',        position: 'FW', age: 25, club: 'Orlando Pirates' },
  { number: 26, name: 'Thapelo Maseko',         position: 'FW', age: 22, club: 'AEL Limassol' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 6, 18, 7, 10, 11, 9]
};
