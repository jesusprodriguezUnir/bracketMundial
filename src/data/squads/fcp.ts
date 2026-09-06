import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 14, name: 'Cláudio Ramos', position: 'GK', age: 34, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/1909059.jpg' },
  { number: 24, name: 'João Costa', position: 'GK', age: 30, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250040614.jpg' },
  { number: 50, name: 'João Afonso', position: 'GK', age: 19, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210106.jpg' },
  { number: 91, name: 'Gonçalo Ribeiro', position: 'GK', age: 20, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169106.jpg' },
  { number: 99, name: 'Diogo Costa', position: 'GK', age: 26, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076675.jpg' },
  // Defensores
  { number: 4, name: 'Jakub Kiwior', position: 'DF', age: 26, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250105681.jpg' },
  { number: 5, name: 'Jan Bednarek', position: 'DF', age: 30, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250056266.jpg' },
  { number: 12, name: 'Zaidu Sanusi', position: 'DF', age: 29, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144327.jpg' },
  { number: 18, name: 'Nehuén Pérez', position: 'DF', age: 26, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128223.jpg' },
  { number: 20, name: 'Alberto Costa', position: 'DF', age: 22, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174182.jpg' },
  { number: 33, name: 'Souza', position: 'DF', age: 20, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224970.jpg' },
  { number: 52, name: 'Martim Fernandes', position: 'DF', age: 20, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163559.jpg' },
  { number: 74, name: 'Francisco Moura', position: 'DF', age: 27, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112138.jpg' },
  { number: 84, name: 'Martim Cunha', position: 'DF', age: 19, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250185409.jpg' },
  // Centrocampistas
  { number: 8, name: 'Victor Froholdt', position: 'MF', age: 20, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169957.jpg' },
  { number: 13, name: 'Pablo Rosario', position: 'MF', age: 29, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250097271.jpg' },
  { number: 16, name: 'Inbeom Hwang', position: 'MF', age: 29, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134536.jpg' },
  { number: 22, name: 'Alan Varela', position: 'MF', age: 25, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188256.jpg' },
  { number: 42, name: 'Seko Fofana', position: 'MF', age: 31, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042773.jpg' },
  { number: 58, name: 'Tiago Silva', position: 'MF', age: 19, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250185405.jpg' },
  { number: 66, name: 'Bernardo Lima', position: 'MF', age: 18, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250204915.jpg' },
  { number: 92, name: 'João Teixeira', position: 'MF', age: 20, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169491.jpg' },
  // Delanteros
  { number: 7, name: 'William Gomes', position: 'FW', age: 20, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250205755.jpg' },
  { number: 9, name: 'Samu', position: 'FW', age: 22, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250186228.jpg' },
  { number: 10, name: 'Gabriel Veiga', position: 'FW', age: 24, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153874.jpg' },
  { number: 11, name: 'Pepê', position: 'FW', age: 29, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250159919.jpg' },
  { number: 17, name: 'Borja Sainz', position: 'FW', age: 25, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250137272.jpg' },
  { number: 19, name: 'André Silva', position: 'FW', age: 30, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042521.jpg' },
  { number: 29, name: 'Santiago Giménez', position: 'FW', age: 25, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177879.jpg' },
  { number: 57, name: 'Duarte Cunha', position: 'FW', age: 18, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250198318.jpg' },
  { number: 72, name: 'André Miranda', position: 'FW', age: 18, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193624.jpg' },
  { number: 77, name: 'Oskar Pietuszewski', position: 'FW', age: 18, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250191115.jpg' },
  { number: 89, name: 'Mateus Mide', position: 'FW', age: 18, club: 'FC Porto', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250204916.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [99, 5, 4, 13, 10, 11, 7, 14, 12, 18, 8],
};
