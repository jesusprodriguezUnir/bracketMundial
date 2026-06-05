import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alireza Beiranvand', position: 'GK', age: 33, club: 'Tractor' },
  { number: 12, name: 'Payam Niazmand', position: 'GK', age: 31, club: 'Persepolis' },
  { number: 22, name: 'Seyed Hossein Hosseini', position: 'GK', age: 33, club: 'Sepahan' },
  // Defensores
  { number: 2, name: 'Saleh Hardani', position: 'DF', age: 27, club: 'Esteghlal' },
  { number: 3, name: 'Ehsan Hajsafi', position: 'DF', age: 36, club: 'Sepahan' },
  { number: 4, name: 'Shoja Khalilzadeh', position: 'DF', age: 37, club: 'Tractor' },
  { number: 5, name: 'Milad Mohammadi', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 13, name: 'Hossein Kanaani-Zadegan', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 17, name: 'Aria Yousefi', position: 'DF', age: 24, club: 'Sepahan' },
  { number: 19, name: 'Ali Nemati', position: 'DF', age: 29, club: 'Foolad Khuzestan' },
  { number: 23, name: 'Ramin Rezaeian', position: 'DF', age: 36, club: 'Foolad Khuzestan' },
  { number: 25, name: 'Danial Eiri', position: 'DF', age: 22, club: 'Malavan' },
  // Volantes
  { number: 6, name: 'Saeid Ezatolahi', position: 'MF', age: 30, club: 'Shabab Al-Ahli' },
  { number: 14, name: 'Saman Ghoddos', position: 'MF', age: 33, club: 'Al Ittihad Kalba' },
  { number: 15, name: 'Rouzbeh Cheshmi', position: 'MF', age: 32, club: 'Esteghlal' },
  { number: 21, name: 'Mohammad Ghorbani', position: 'MF', age: 24, club: 'Al Wahda' },
  { number: 26, name: 'Amirmohammad Razzaghinia', position: 'MF', age: 19, club: 'Esteghlal' },
  // Delanteros
  { number: 7, name: 'Alireza Jahanbakhsh', position: 'FW', age: 32, club: 'Dender' },
  { number: 8, name: 'Mohammad Mohebi', position: 'FW', age: 27, club: 'Rostov' },
  { number: 9, name: 'Mehdi Taremi', position: 'FW', age: 33, club: 'Olympiakos', captain: true },
  { number: 10, name: 'Mehdi Ghaedi', position: 'FW', age: 28, club: 'Al Nassr' },
  { number: 11, name: 'Ali Alipour', position: 'FW', age: 30, club: 'Persepolis' },
  { number: 16, name: 'Mehdi Torabi', position: 'FW', age: 31, club: 'Tractor' },
  { number: 18, name: 'Amirhossein Hosseinzadeh', position: 'FW', age: 25, club: 'Tractor' },
  { number: 20, name: 'Shahriar Moghanloo', position: 'FW', age: 31, club: 'Kalba' },
  { number: 24, name: 'Dennis-Yerai Eckert Ayensa', position: 'FW', age: 28, club: 'Standard Liège' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 13, 5, 6, 14, 7, 10, 8, 9]
};
