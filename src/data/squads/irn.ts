import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Alireza Beiranvand', position: 'GK', age: 33, club: 'Tractor' },
  { number: 12, name: 'Seyed Hossein Hosseini', position: 'GK', age: 33, club: 'Sepahan' },
  { number: 22, name: 'Payam Niazmand', position: 'GK', age: 31, club: 'Persepolis' },
  { number: 30, name: 'Mohammad Khalifeh', position: 'GK', age: 21, club: 'Aluminium Arak' },

  { number: 2, name: 'Saleh Hardani', position: 'DF', age: 27, club: 'Esteghlal' },
  { number: 3, name: 'Ehsan Hajsafi', position: 'DF', age: 36, club: 'Sepahan' },
  { number: 4, name: 'Shoja Khalilzadeh', position: 'DF', age: 36, club: 'Tractor' },
  { number: 5, name: 'Ali Nemati', position: 'DF', age: 30, club: 'Foolad' },
  { number: 13, name: 'Hossein Kanaani', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 15, name: 'Milad Mohammadi', position: 'DF', age: 32, club: 'Persepolis' },
  { number: 19, name: 'Ramin Rezaeian', position: 'DF', age: 36, club: 'Foolad' },
  { number: 21, name: 'Omid Noorafkan', position: 'DF', age: 29, club: 'Sepahan' },
  { number: 24, name: 'Danial Eiri', position: 'DF', age: 22, club: 'Malavan' },

  { number: 6, name: 'Saeid Ezatolahi', position: 'MF', age: 29, club: 'Shabab Al Ahli' },
  { number: 7, name: 'Alireza Jahanbakhsh', position: 'MF', age: 32, club: 'FCV Dender' },
  { number: 8, name: 'Rouzbeh Cheshmi', position: 'MF', age: 32, club: 'Esteghlal' },
  { number: 10, name: 'Saman Ghoddos', position: 'MF', age: 32, club: 'Ittihad Kalba' },
  { number: 11, name: 'Mohammad Mohebi', position: 'MF', age: 27, club: 'Rostov' },
  { number: 14, name: 'Amir Mohammad Razzaghinia', position: 'MF', age: 20, club: 'Esteghlal' },
  { number: 16, name: 'Mohammad Ghorbani', position: 'MF', age: 24, club: 'Al Wahda' },
  { number: 17, name: 'Mehdi Ghaedi', position: 'MF', age: 27, club: 'Al-Nasr' },
  { number: 18, name: 'Mehdi Torabi', position: 'MF', age: 31, club: 'Tractor' },
  { number: 23, name: 'Aria Yousefi', position: 'MF', age: 23, club: 'Sepahan' },

  { number: 9, name: 'Mehdi Taremi', position: 'FW', age: 33, club: 'Olympiacos', captain: true },
  { number: 20, name: 'Amirhossein Hosseinzadeh', position: 'FW', age: 25, club: 'Tractor' },
  { number: 25, name: 'Dennis Dargahi', position: 'FW', age: 29, club: 'Standard Liege' },
  { number: 26, name: 'Hadi Habibinejad', position: 'FW', age: 30, club: 'Chadormalou' },
  { number: 27, name: 'Ali Alipour', position: 'FW', age: 30, club: 'Persepolis' },
  { number: 28, name: 'Amirhossein Mahmoudi', position: 'FW', age: 19, club: 'Persepolis' },
  { number: 29, name: 'Kasra Taheri', position: 'FW', age: 19, club: 'Paykan' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 13, 15, 6, 10, 7, 17, 11, 9]
};
