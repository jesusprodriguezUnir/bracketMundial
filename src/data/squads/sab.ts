import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Amin Ramazanov', position: 'GK', age: 23, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138479.jpg' },
  { number: 12, name: 'Rauf Ayyubov', position: 'GK', age: 17, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250202766.jpg' },
  { number: 92, name: 'Stas Pokatilov', position: 'GK', age: 33, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250059361.jpg' },
  { number: 94, name: 'Ravan Mirzammadov', position: 'GK', age: 21, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193107.jpg' },
  // Defensores
  { number: 3, name: 'Steve Solvet', position: 'DF', age: 30, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209341.jpg' },
  { number: 4, name: 'Aden McCarthy', position: 'DF', age: 22, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221230.jpg' },
  { number: 5, name: 'Rahman Dashdamirov', position: 'DF', age: 26, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250186986.jpg' },
  { number: 17, name: 'Tellur Mutallimov', position: 'DF', age: 31, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250087979.jpg' },
  { number: 27, name: 'Tymoteusz Puchacz', position: 'DF', age: 27, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250090285.jpg' },
  { number: 33, name: 'Erivaldo Almeida', position: 'DF', age: 26, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221486.jpg' },
  { number: 80, name: 'Akim Zedadka', position: 'DF', age: 31, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188243.jpg' },
  // Centrocampistas
  { number: 6, name: 'Abdulakh Khaibulaev', position: 'MF', age: 25, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171312.jpg' },
  { number: 7, name: 'Umarali Rakhmonaliev', position: 'MF', age: 23, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209340.jpg' },
  { number: 9, name: 'Khayal Aliyev', position: 'MF', age: 22, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169206.jpg' },
  { number: 10, name: 'Aleksey Isaev', position: 'MF', age: 30, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129032.jpg' },
  { number: 11, name: 'Kaheem Parris', position: 'MF', age: 26, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174049.jpg' },
  { number: 13, name: 'Ivan Lepinjica', position: 'MF', age: 27, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250110583.jpg' },
  { number: 16, name: 'Rauf Rustamli', position: 'MF', age: 23, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130045.jpg' },
  { number: 37, name: 'Du Queiroz', position: 'MF', age: 26, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225045.jpg' },
  { number: 88, name: 'Rodrigo Fernandes', position: 'MF', age: 25, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106774.jpg' },
  { number: 89, name: 'Jafar Mukhtarov', position: 'MF', age: 21, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221231.jpg' },
  { number: 95, name: 'Shahin Ibrahimov', position: 'MF', age: 19, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250202772.jpg' },
  // Delanteros
  { number: 8, name: 'Christian Nwachukwu', position: 'FW', age: 20, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250196599.jpg' },
  { number: 20, name: 'Joy-Lance Mickels', position: 'FW', age: 32, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250081185.jpg' },
  { number: 21, name: 'Veljko Simić', position: 'FW', age: 31, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042209.jpg' },
  { number: 34, name: 'Xander Severina', position: 'FW', age: 25, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221487.jpg' },
  { number: 99, name: 'Orphe Mbina', position: 'FW', age: 25, club: 'Sabah FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250198298.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 4, 5, 17, 6, 7, 9, 8, 20, 21],
};
