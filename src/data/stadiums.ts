export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  image: string;
  highlight: string;
  timezone: string;
}

export const STADIUMS: Stadium[] = [
  {
    id: 'toronto',
    name: "Toronto Stadium",
    city: "Toronto",
    country: "Canadá",
    capacity: 44315,
    highlight: "Sede del partido inaugural de Canadá. Albergará 6 partidos.",
    timezone: "America/Toronto",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-toronto-stadium.jpg"
  },
  {
    id: 'vancouver',
    name: "BC Place Vancouver",
    city: "Vancouver",
    country: "Canadá",
    capacity: 48821,
    highlight: "Sede icónica con techo retráctil. Albergará 7 partidos.",
    timezone: "America/Vancouver",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-vancouver-stadium.jpg"
  },
  {
    id: 'azteca',
    name: "Estadio Azteca",
    city: "Ciudad de México",
    country: "México",
    capacity: 72766,
    highlight: "Sede del partido inaugural. Primer estadio en albergar tres partidos inaugurales. Albergará 5 partidos.",
    timezone: "America/Mexico_City",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-azteca-mexico-city.jpg"
  },
  {
    id: 'akron',
    name: "Estadio Akron",
    city: "Guadalajara",
    country: "México",
    capacity: 44330,
    highlight: "Estadio moderno con un diseño único de 'volcán'. Albergará 4 partidos.",
    timezone: "America/Mexico_City",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-guadalajara.jpg"
  },
  {
    id: 'bbva',
    name: "Estadio BBVA",
    city: "Monterrey",
    country: "México",
    capacity: 50113,
    highlight: "Vistas impresionantes del Cerro de la Silla. Albergará 4 partidos.",
    timezone: "America/Mexico_City",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-monterrey.jpg"
  },
  {
    id: 'mercedes-benz',
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    capacity: 67382,
    highlight: "Sede de semifinales. Techo retráctil innovador. Albergará 8 partidos.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-atlanta-stadium.jpg"
  },
  {
    id: 'gillette',
    name: "Gillette Stadium",
    city: "Boston",
    country: "USA",
    capacity: 63815,
    highlight: "Centro neurálgico del deporte en Nueva Inglaterra. Albergará 7 partidos.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-boston-stadium.jpg"
  },
  {
    id: 'att-stadium',
    name: "AT&T Stadium",
    city: "Dallas",
    country: "USA",
    capacity: 70122,
    highlight: "Sede de semifinales. El estadio que más partidos albergará (9).",
    timezone: "America/Chicago",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-dallas-stadium.jpg"
  },
  {
    id: 'nrg',
    name: "NRG Stadium",
    city: "Houston",
    country: "USA",
    capacity: 68311,
    highlight: "Sede versátil con techo retráctil. Albergará 7 partidos.",
    timezone: "America/Chicago",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-houston-stadium.jpg"
  },
  {
    id: 'arrowhead',
    name: "Arrowhead Stadium",
    city: "Kansas City",
    country: "USA",
    capacity: 67513,
    highlight: "Conocido por su increíble atmósfera y el ruido de su afición. Albergará 6 partidos.",
    timezone: "America/Chicago",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-kansas-city-stadium.jpg"
  },
  {
    id: 'sofi',
    name: "SoFi Stadium",
    city: "Los Ángeles",
    country: "USA",
    capacity: 69650,
    highlight: "Sede del partido inaugural de USA. El estadio más caro jamás construido. Albergará 8 partidos.",
    timezone: "America/Los_Angeles",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-los-angeles-stadium.jpg"
  },
  {
    id: 'hard-rock',
    name: "Hard Rock Stadium",
    city: "Miami",
    country: "USA",
    capacity: 64091,
    highlight: "Sede del partido por el tercer puesto. Destino polivalente. Albergará 7 partidos.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-miami-stadium.jpg"
  },
  {
    id: 'metlife',
    name: "MetLife Stadium",
    city: "New York New Jersey",
    country: "USA",
    capacity: 78576,
    highlight: "Sede de la FINAL. El estadio con mayor capacidad del torneo. Albergará 8 partidos.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-new-york-new-jersey-stadium.jpg"
  },
  {
    id: 'lincoln-financial',
    name: "Lincoln Financial Field",
    city: "Filadelfia",
    country: "USA",
    capacity: 65827,
    highlight: "Instalación de vanguardia en el Complejo Deportivo. Albergará 6 partidos.",
    timezone: "America/New_York",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-philadelphia-stadium.jpg"
  },
  {
    id: 'levis',
    name: "Levi's Stadium",
    city: "San Francisco Bay Area",
    country: "USA",
    capacity: 69391,
    highlight: "Estadio ecológico en el corazón de Silicon Valley. Albergará 6 partidos.",
    timezone: "America/Los_Angeles",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-san-francisco-stadium.jpg"
  },
  {
    id: 'lumen-field',
    name: "Lumen Field",
    city: "Seattle",
    country: "USA",
    capacity: 65123,
    highlight: "Famoso por sus gradas empinadas y fans ruidosos. Albergará 6 partidos.",
    timezone: "America/Los_Angeles",
    image: "https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-seattle-stadium.jpg"
  }
];
