import type { Player } from './index';
export const coach = 'Mohamed Ouahbi';
export const squad: Player[] = [
  { number: 1,  name: 'Yassine Bounou',         position: 'GK', age: 35, club: 'Al-Hilal' },
  { number: 12, name: 'Munir Mohamedi',         position: 'GK', age: 37, club: 'Nahdat Berkane' },
  { number: 22, name: 'El Mehdi Al Harrar',     position: 'GK', age: 25, club: 'Raja Casablanca' },
  { number: 2,  name: 'Achraf Hakimi',          position: 'DF', age: 27, club: 'PSG', captain: true },
  { number: 3,  name: 'Noussair Mazraoui',      position: 'DF', age: 28, club: 'Manchester United' },
  { number: 4,  name: 'Nayef Aguerd',           position: 'DF', age: 30, club: 'Real Sociedad' },
  { number: 5,  name: 'Chadi Riad',             position: 'DF', age: 22, club: 'Crystal Palace' },
  { number: 13, name: 'Issa Diop',              position: 'DF', age: 29, club: 'Fulham' },
  { number: 14, name: 'Anass Salah-Eddine',     position: 'DF', age: 24, club: 'PSV Eindhoven' },
  { number: 15, name: 'Abdelhamid Ait Boudlal', position: 'DF', age: 19, club: 'Stade Rennais' },
  { number: 25, name: 'Yahia Attiyat Allah',    position: 'DF', age: 31, club: 'Al Ahly' },
  { number: 16, name: 'Adam Aznou',             position: 'DF', age: 20, club: 'Bayern Munich' },
  { number: 6,  name: 'Sofyan Amrabat',         position: 'MF', age: 29, club: 'Fenerbahçe' },
  { number: 8,  name: 'Azzedine Ounahi',        position: 'MF', age: 26, club: 'Girona' },
  { number: 10, name: 'Brahim Díaz',            position: 'MF', age: 26, club: 'Real Madrid' },
  { number: 23, name: 'Neil El Aynaoui',        position: 'MF', age: 24, club: 'AS Roma' },
  { number: 18, name: 'Bilal El Khannouss',     position: 'MF', age: 22, club: 'VfB Stuttgart' },
  { number: 20, name: 'Ayyoub Bouaddi',         position: 'MF', age: 18, club: 'Lille' },
  { number: 24, name: 'Oussama Targhalline',    position: 'MF', age: 23, club: 'Feyenoord' },
  { number: 7,  name: 'Hakim Ziyech',           position: 'FW', age: 33, club: 'Galatasaray' },
  { number: 9,  name: 'Youssef En-Nesyri',      position: 'FW', age: 29, club: 'Fenerbahçe' },
  { number: 11, name: 'Amine Adli',             position: 'FW', age: 26, club: 'Bayer Leverkusen' },
  { number: 17, name: 'Eliesse Ben Seghir',     position: 'FW', age: 21, club: 'Monaco' },
  { number: 19, name: 'Ayoub El Kaabi',         position: 'FW', age: 32, club: 'Olympiacos' },
  { number: 21, name: 'Soufiane Rahimi',        position: 'FW', age: 29, club: 'Al Ain' },
  { number: 26, name: 'Abde Ezzalzouli',        position: 'FW', age: 24, club: 'Real Betis' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 13, 3, 6, 8, 10, 26, 19, 7]
};
