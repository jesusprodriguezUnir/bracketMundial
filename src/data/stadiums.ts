export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  image: string;
  highlight: string;
  description: string;
  matchesSummary: string;
  timezone: string;
}

export const STADIUMS: Stadium[] = [
  {
    id: 'toronto',
    name: "Toronto Stadium",
    city: "Toronto",
    country: "Canadá",
    capacity: 45000,
    highlight: "Sede del partido inaugural de Canadá.",
    description: "Un estadio vibrante que ha sido testigo de momentos históricos del fútbol canadiense. Ubicado en Exhibition Place, este recinto será el epicentro del inicio del torneo en suelo canadiense.",
    matchesSummary: "Albergará 6 partidos, incluyendo el debut de la selección de Canadá en el torneo el 12 de junio.",
    timezone: "America/Toronto",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-toronto-stadium.jpg"
  },
  {
    id: 'vancouver',
    name: "BC Place Vancouver",
    city: "Vancouver",
    country: "Canadá",
    capacity: 54000,
    highlight: "Sede icónica con techo retráctil.",
    description: "BC Place es una maravilla arquitectónica en la costa oeste de Canadá. Con su distintivo techo retráctil y su ubicación en el centro de la ciudad, ofrece una atmósfera inigualable.",
    matchesSummary: "Albergará 7 partidos, incluyendo encuentros de la fase de grupos y eliminatorias de octavos de final.",
    timezone: "America/Vancouver",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-vancouver-stadium.jpg"
  },
  {
    id: 'azteca',
    name: "Estadio Azteca",
    city: "Ciudad de México",
    country: "México",
    capacity: 83000,
    highlight: "Sede del partido inaugural del Mundial 2026.",
    description: "El 'Coloso de Santa Úrsula' es un templo del fútbol mundial. Será el primer estadio en la historia en albergar tres ediciones de la Copa del Mundo y tres partidos inaugurales (1970, 1986 y 2026).",
    matchesSummary: "Albergará 5 partidos, destacando el Gran Partido Inaugural el 11 de junio donde México hará su debut.",
    timezone: "America/Mexico_City",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-azteca-mexico-city.jpg"
  },
  {
    id: 'akron',
    name: "Estadio Guadalajara",
    city: "Zapopan",
    country: "México",
    capacity: 48000,
    highlight: "Diseño único inspirado en un volcán.",
    description: "Conocido localmente como Estadio Akron, su diseño se integra con el paisaje circundante simulando un volcán coronado por una nube. Es uno de los estadios más modernos y sostenibles de América Latina.",
    matchesSummary: "Albergará 4 partidos de la fase de grupos, convirtiéndose en el corazón futbolístico de Jalisco.",
    timezone: "America/Mexico_City",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-guadalajara.jpg"
  },
  {
    id: 'bbva',
    name: "Estadio Monterrey",
    city: "Guadalupe",
    country: "México",
    capacity: 53500,
    highlight: "Vistas impresionantes del Cerro de la Silla.",
    description: "El Estadio BBVA ofrece una de las vistas más espectaculares del mundo desde las gradas. Su estructura de acero y diseño de vanguardia lo convierten en una sede emblemática para el norte de México.",
    matchesSummary: "Albergará 4 partidos, incluyendo duelos decisivos de la fase de grupos y una eliminatoria de dieciseisavos.",
    timezone: "America/Mexico_City",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-monterrey.jpg"
  },
  {
    id: 'mercedes-benz',
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    capacity: 71000,
    highlight: "Sede de una de las semifinales.",
    description: "Un estadio ultra-moderno con un techo retráctil único en forma de obturador de cámara. Es famoso por su pantalla circular de 360 grados y su compromiso con la sostenibilidad.",
    matchesSummary: "Albergará 8 partidos, incluyendo una de las semifinales y varios encuentros de alto perfil en la fase de grupos.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-atlanta-stadium.jpg"
  },
  {
    id: 'gillette',
    name: "Gillette Stadium",
    city: "Foxborough",
    country: "USA",
    capacity: 65878,
    highlight: "Fortaleza deportiva de Nueva Inglaterra.",
    description: "Hogar de los New England Patriots, este estadio es conocido por su atmósfera eléctrica. Ha sido renovado recientemente para ofrecer una experiencia de clase mundial a los aficionados al fútbol.",
    matchesSummary: "Albergará 7 partidos, incluyendo cuartos de final y encuentros clave de la fase inicial.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-boston-stadium.jpg"
  },
  {
    id: 'att-stadium',
    name: "AT&T Stadium",
    city: "Arlington",
    country: "USA",
    capacity: 80000,
    highlight: "Sede de una semifinal y el estadio con más partidos.",
    description: "A menudo llamado 'Jerry World', es una de las instalaciones deportivas más imponentes del planeta. Destaca por su gigantesca pantalla central y su capacidad para crear un espectáculo sin igual.",
    matchesSummary: "Es el estadio que más partidos albergará del torneo con un total de 9, incluyendo una semifinal.",
    timezone: "America/Chicago",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-dallas-stadium.jpg"
  },
  {
    id: 'nrg',
    name: "NRG Stadium",
    city: "Houston",
    country: "USA",
    capacity: 72220,
    highlight: "Sede versátil con gran historia futbolística.",
    description: "El primer estadio de la NFL con techo retráctil. Houston tiene una larga tradición de albergar grandes eventos internacionales y el NRG Stadium está diseñado para el máximo confort.",
    matchesSummary: "Albergará 7 partidos, con encuentros de fase de grupos, dieciseisavos y octavos de final.",
    timezone: "America/Chicago",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-houston-stadium.jpg"
  },
  {
    id: 'arrowhead',
    name: "Kansas City Stadium",
    city: "Kansas City",
    country: "USA",
    capacity: 76416,
    highlight: "El estadio más ruidoso del mundo.",
    description: "Arrowhead Stadium ostenta el récord Guinness del estadio más ruidoso. Su diseño de tazón abierto asegura que cada grito de gol resuene con una intensidad sin precedentes.",
    matchesSummary: "Albergará 6 partidos, incluyendo un emocionante duelo de cuartos de final.",
    timezone: "America/Chicago",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-kansas-city-stadium.jpg"
  },
  {
    id: 'sofi',
    name: "SoFi Stadium",
    city: "Inglewood",
    country: "USA",
    capacity: 70000,
    highlight: "Sede del debut de Estados Unidos.",
    description: "Considerado el estadio más caro y avanzado jamás construido. Su diseño 'indoor-outdoor' y su pantalla Infinity Screen de doble cara redefinen la experiencia del espectador.",
    matchesSummary: "Albergará 8 partidos, incluyendo el estreno de la selección de USA el 12 de junio y cuartos de final.",
    timezone: "America/Los_Angeles",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-los-angeles-stadium.jpg"
  },
  {
    id: 'hard-rock',
    name: "Miami Stadium",
    city: "Miami Gardens",
    country: "USA",
    capacity: 64767,
    highlight: "Sede del partido por el tercer puesto.",
    description: "Un destino global que combina el glamour de Miami con la pasión del fútbol. Recientemente remodelado con una cubierta que protege a los fans del sol y la lluvia.",
    matchesSummary: "Albergará 7 partidos, destacando el encuentro por el tercer puesto y un partido de cuartos de final.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-miami-stadium.jpg"
  },
  {
    id: 'metlife',
    name: "New York New Jersey Stadium",
    city: "East Rutherford",
    country: "USA",
    capacity: 82500,
    highlight: "Sede de la GRAN FINAL.",
    description: "Ubicado a la sombra de Manhattan, el MetLife Stadium es el escenario elegido para el partido más importante del mundo. Su inmensa capacidad lo convierte en el coliseo perfecto para la final.",
    matchesSummary: "Albergará 8 partidos, culminando con la Final de la Copa Mundial de la FIFA el 19 de julio de 2026.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-new-york-new-jersey-stadium.jpg"
  },
  {
    id: 'lincoln-financial',
    name: "Philadelphia Stadium",
    city: "Filadelfia",
    country: "USA",
    capacity: 69796,
    highlight: "Corazón deportivo en la ciudad del amor fraternal.",
    description: "El Lincoln Financial Field es conocido por su diseño ecológico, utilizando energía solar y eólica. Es una sede que combina modernidad con una afición apasionada.",
    matchesSummary: "Albergará 6 partidos, incluyendo encuentros de fase de grupos y una eliminatoria de octavos de final.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-philadelphia-stadium.jpg"
  },
  {
    id: 'levis',
    name: "San Francisco Bay Area Stadium",
    city: "Santa Clara",
    country: "USA",
    capacity: 68500,
    highlight: "El estadio más tecnológico en Silicon Valley.",
    description: "Ubicado en el epicentro de la tecnología mundial, el Levi's Stadium es un modelo de conectividad y sostenibilidad, siendo el primero en obtener la certificación LEED Gold.",
    matchesSummary: "Albergará 6 partidos de la fase de grupos y dieciseisavos de final.",
    timezone: "America/Los_Angeles",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-san-francisco-stadium.jpg"
  },
  {
    id: 'lumen-field',
    name: "Seattle Stadium",
    city: "Seattle",
    country: "USA",
    capacity: 69000,
    highlight: "Atmósfera única frente a Puget Sound.",
    description: "Lumen Field es famoso por su diseño que amplifica el ruido de los aficionados. Su ubicación urbana ofrece vistas increíbles de la ciudad y el mar.",
    matchesSummary: "Albergará 6 partidos, incluyendo el segundo partido de la selección de Estados Unidos.",
    timezone: "America/Los_Angeles",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-seattle-stadium.jpg"
  }
];
