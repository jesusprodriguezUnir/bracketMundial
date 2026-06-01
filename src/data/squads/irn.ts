import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Alireza Beiranvand', position: 'GK', age: 33, club: 'Tractor' },
  { number: 12, name: 'Hossein Hosseini', position: 'GK', age: 33, club: 'Esteghlal' },
  { number: 22, name: 'Payam Niazmand', position: 'GK', age: 31, club: 'Sepahan' },

  { number: 2, name: 'Saleh Hardani', position: 'DF', age: 27, club: 'Esteghlal' },
  { number: 3, name: 'Ehsan Hajisafi', position: 'DF', age: 36, club: 'AEK Athens' },
  { number: 4, name: 'Shoja Khalilzadeh', position: 'DF', age: 37, club: 'Tractor' },
  { number: 5, name: 'Ali Nemati', position: 'DF', age: 30, club: 'Foolad' },
  { number: 13, name: 'Hossein Kanaanizadegan', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 15, name: 'Milad Mohammadi', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 19, name: 'Ramin Rezaeian', position: 'DF', age: 36, club: 'Esteghlal' },
  { number: 24, name: 'Danial Iri', position: 'DF', age: 22, club: 'Malavan' },

  { number: 6, name: 'Saeid Ezatolahi', position: 'MF', age: 29, club: 'Shabab Al Ahli' },
  { number: 8, name: 'Rouzbeh Cheshmi', position: 'MF', age: 32, club: 'Esteghlal' },
  { number: 10, name: 'Saman Ghoddos', position: 'MF', age: 32, club: 'Kalba' },
  { number: 14, name: 'Amirmohammad Razzaghinia', position: 'MF', age: 20, club: 'Esteghlal' },
  { number: 16, name: 'Mohammad Ghorbani', position: 'MF', age: 24, club: 'Al Wahda' },
  { number: 17, name: 'Mehdi Ghayedi', position: 'MF', age: 27, club: 'Al Nasr' },
  { number: 18, name: 'Ariya Yousefi', position: 'MF', age: 24, club: 'Sepahan' },
  { number: 21, name: 'Mehdi Torabi', position: 'MF', age: 31, club: 'Tractor' },
  { number: 7, name: 'Alireza Jahanbakhsh', position: 'MF', age: 32, club: 'Dender' },
  { number: 11, name: 'Mohammad Mohebi', position: 'MF', age: 27, club: 'Rostov' },

  { number: 9, name: 'Mehdi Taremi', position: 'FW', age: 33, club: 'Inter Milan', captain: true },
  { number: 23, name: 'Amirhossein Hosseinzadeh', position: 'FW', age: 25, club: 'Tractor' },
  { number: 25, name: 'Dennis Eckert', position: 'FW', age: 29, club: 'Standard Liege' },
  { number: 20, name: 'Ali Alipour', position: 'FW', age: 30, club: 'Persepolis' },
  { number: 26, name: 'Shahriyar Moghanloo', position: 'FW', age: 31, club: 'Sepahan' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 13, 15, 6, 10, 7, 17, 11, 9]
};
