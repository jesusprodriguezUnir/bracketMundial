import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Alireza Beiranvand', position: 'GK', age: 33, club: 'Tractor' },
  { number: 12, name: 'Hossein Hosseini', position: 'GK', age: 33, club: 'Sepahan' },
  { number: 22, name: 'Payam Niazmand', position: 'GK', age: 31, club: 'Persepolis' },
  { number: 26, name: 'Mohammad Khalifeh', position: 'GK', age: 21, club: 'Aluminium Arak' },

  { number: 2, name: 'Saleh Hardani', position: 'DF', age: 27, club: 'Esteghlal' },
  { number: 3, name: 'Danial Esmaeilifar', position: 'DF', age: 33, club: 'Tractor' },
  { number: 4, name: 'Shoja Khalilzadeh', position: 'DF', age: 37, club: 'Tractor' },
  { number: 5, name: 'Ali Nemati', position: 'DF', age: 30, club: 'Foolad' },
  { number: 13, name: 'Hossein Kanaanizadegan', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 15, name: 'Milad Mohammadi', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 19, name: 'Ramin Rezaeian', position: 'DF', age: 36, club: 'Foolad' },
  { number: 24, name: 'Danial Iri', position: 'DF', age: 22, club: 'Malavan' },

  { number: 6, name: 'Saeid Ezatolahi', position: 'MF', age: 29, club: 'Shabab Al Ahli' },
  { number: 10, name: 'Saman Ghoddos', position: 'MF', age: 32, club: 'Kalba' },
  { number: 14, name: 'Amirmohammad Razzaghinia', position: 'MF', age: 20, club: 'Esteghlal' },
  { number: 16, name: 'Mohammad Ghorbani', position: 'MF', age: 24, club: 'Al Wahda' },
  { number: 21, name: 'Omid Noorafkan', position: 'MF', age: 29, club: 'Sepahan' },

  { number: 7, name: 'Alireza Jahanbakhsh', position: 'FW', age: 32, club: 'Dender' },
  { number: 8, name: 'Ali Gholizadeh', position: 'FW', age: 30, club: 'Lech Poznan' },
  { number: 9, name: 'Mehdi Taremi', position: 'FW', age: 33, club: 'Olympiacos', captain: true },
  { number: 11, name: 'Mohammad Mohebi', position: 'FW', age: 27, club: 'Rostov' },
  { number: 17, name: 'Mehdi Ghayedi', position: 'FW', age: 27, club: 'Al Nasr' },
  { number: 18, name: 'Allahyar Sayyadmanesh', position: 'FW', age: 24, club: 'Westerlo' },
  { number: 20, name: 'Sardar Azmoun', position: 'FW', age: 31, club: 'Shabab Al Ahli' },
  { number: 23, name: 'Amirhossein Hosseinzadeh', position: 'FW', age: 25, club: 'Tractor' },
  { number: 25, name: 'Dennis Eckert', position: 'FW', age: 29, club: 'Standard Liege' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 13, 15, 6, 10, 7, 17, 11, 9]
};
