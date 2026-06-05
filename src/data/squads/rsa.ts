import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Ronwen Williams', position: 'GK', age: 34, club: 'Mamelodi Sundowns', captain: true },
  { number: 16, name: 'Sipho Chaine', position: 'GK', age: 29, club: 'Orlando Pirates' },
  { number: 22, name: 'Ricardo Goss', position: 'GK', age: 32, club: 'Siwelele FC' },
  // Defensores
  { number: 2, name: 'Thabang Matuludi', position: 'DF', age: 22, club: 'Polokwane City' },
  { number: 3, name: 'Khulumani Ndamane', position: 'DF', age: 22, club: 'Mamelodi Sundowns' },
  { number: 14, name: 'Mbekezeli Mbokazi', position: 'DF', age: 23, club: 'Chicago Fire' },
  { number: 18, name: 'Samukele Kabini', position: 'DF', age: 20, club: 'Molde' },
  { number: 19, name: 'Nkosinathi Sibisi', position: 'DF', age: 30, club: 'Orlando Pirates' },
  { number: 20, name: 'Khuliso Mudau', position: 'DF', age: 31, club: 'Mamelodi Sundowns' },
  { number: 21, name: 'Ime Okon', position: 'DF', age: 22, club: 'Hannover 96' },
  { number: 24, name: 'Olwethu Makhanya', position: 'DF', age: 22, club: 'Philadelphia Union' },
  { number: 25, name: 'Kamogelo Sebelebele', position: 'DF', age: 23, club: 'Orlando Pirates' },
  { number: 26, name: 'Bradley Cross', position: 'DF', age: 25, club: 'Kaizer Chiefs' },
  // Volantes
  { number: 4, name: 'Teboho Mokoena', position: 'MF', age: 29, club: 'Mamelodi Sundowns' },
  { number: 5, name: 'Thalente Mbatha', position: 'MF', age: 26, club: 'Orlando Pirates' },
  { number: 6, name: 'Aubrey Modiba', position: 'MF', age: 30, club: 'Mamelodi Sundowns' },
  { number: 13, name: 'Sphephelo Sithole', position: 'MF', age: 27, club: 'CD Tondela' },
  { number: 23, name: 'Jayden Adams', position: 'MF', age: 25, club: 'Mamelodi Sundowns' },
  // Delanteros
  { number: 7, name: 'Oswin Appollis', position: 'FW', age: 24, club: 'Orlando Pirates' },
  { number: 8, name: 'Tshepang Moremi', position: 'FW', age: 26, club: 'Orlando Pirates' },
  { number: 9, name: 'Lyle Foster', position: 'FW', age: 26, club: 'Burnley' },
  { number: 10, name: 'Relebohile Mofokeng', position: 'FW', age: 21, club: 'Orlando Pirates' },
  { number: 11, name: 'Themba Zwane', position: 'FW', age: 37, club: 'Mamelodi Sundowns' },
  { number: 12, name: 'Thapelo Maseko', position: 'FW', age: 22, club: 'Mamelodi Sundowns' },
  { number: 15, name: 'Iqraam Rayners', position: 'FW', age: 30, club: 'Mamelodi Sundowns' },
  { number: 17, name: 'Evidence Makgopa', position: 'FW', age: 26, club: 'Orlando Pirates' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 20, 3, 19, 6, 4, 13, 7, 11, 10, 9]
};
