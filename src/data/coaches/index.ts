// Coach data for all 48 World Cup 2026 nations.
// Indexed by FIFA team code (uppercase, same key as SQUADS/LINEUPS).
// Update bios and born dates if there are staff changes before the tournament.

export interface Coach {
  name: string;
  born: string;        // YYYY-MM-DD — age is computed at runtime, does not go stale
  nationality: string;
  photoUrl?: string;
  bio: { es: string; en: string };
}

export const COACHES: Record<string, Coach> = {
  // Group A
  MEX: {
    name: 'Javier Aguirre',
    born: '1958-12-01',
    nationality: 'México',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/newfth1678830171.jpg',
    bio: {
      es: 'Conocido como «El Vasco», ha dirigido a Osasuna, Atlético de Madrid y Espanyol en Europa. Fue seleccionador de Japón y Egipto antes de regresar al banquillo mexicano en 2023.',
      en: 'Known as "El Vasco," he has managed Osasuna, Atlético de Madrid, and Espanyol in Europe. He previously coached Japan and Egypt before returning to Mexico in 2023.',
    },
  },
  RSA: {
    name: 'Hugo Broos',
    born: '1952-04-10',
    nationality: 'Bélgica',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/p1v77y1621453267.jpg',
    bio: {
      es: 'Técnico belga que llevó a Camerún al título de la AFCON 2017. Tomó las riendas de Sudáfrica en 2021 y logró la clasificación para el Mundial 2026.',
      en: 'Belgian coach who led Cameroon to the 2017 AFCON title. He took charge of South Africa in 2021 and secured qualification for the 2026 World Cup.',
    },
  },
  KOR: {
    name: 'Hong Myung-bo',
    born: '1969-02-12',
    nationality: 'Corea del Sur',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/up6h1w1765217882.jpg',
    bio: {
      es: 'Legendario defensa del fútbol coreano, fue clave en el histórico cuarto puesto del Mundial 2002. Regresó a la selección como técnico en 2023 para liderar el proyecto rumbo a 2026.',
      en: 'Legendary Korean defender who was key to South Korea\'s historic fourth-place finish at the 2002 World Cup. He returned as head coach in 2023 to lead the team toward 2026.',
    },
  },
  CZE: {
    name: 'Miroslav Koubek',
    born: '1951-09-01',
    nationality: 'República Checa',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/FC_Viktoria_Plze%C5%88_-_Czech_League_title_celebration_May_2015_-_05.jpg',
    bio: {
      es: 'Exguardameta que desarrolló la mayor parte de su carrera como técnico en la liga checa, destacando en el Viktoria Plzeň. Fue nombrado seleccionador nacional en diciembre de 2025 para liderar al equipo en el Mundial.',
      en: 'Former goalkeeper who spent most of his coaching career in the Czech league, most notably with Viktoria Plzeň. He was appointed national team head coach in December 2025 to lead the team in the World Cup.',
    },
  },

  // Group B
  CAN: {
    name: 'Jesse Marsch',
    born: '1973-06-12',
    nationality: 'Estados Unidos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/aezkxu1603548457.jpg',
    bio: {
      es: 'Exmediocampista de la MLS formado como técnico en el sistema Red Bull (Salzburg, Leipzig). Nombrado seleccionador de Canadá en 2023 para continuar el impulso del Mundial 2022.',
      en: 'Former MLS midfielder who built his coaching career in the Red Bull system (Salzburg, Leipzig). Appointed Canada head coach in 2023 to build on the 2022 World Cup momentum.',
    },
  },
  BIH: {
    name: 'Sergej Barbarez',
    born: '1971-08-17',
    nationality: 'Bosnia y Herzegovina',
    photoUrl: 'https://www.thesportsdb.com/images/media/player/thumb/u6g0nu1778539592.jpg',
    bio: {
      es: 'Exdelantero del Hamburgo y figura histórica de la selección bosnia, con la que marcó goles decisivos en clasificatorias. Asumió la dirección técnica de la selección en 2023.',
      en: 'Former Hamburg striker and Bosnia\'s all-time leading scorer, netting crucial qualifying goals. He took over as head coach of the national team in 2023.',
    },
  },
  QAT: {
    name: 'Julen Lopetegui',
    born: '1966-08-28',
    nationality: 'España',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Julen_Lopetegui_2018.jpg/400px-Julen_Lopetegui_2018.jpg',
    bio: {
      es: 'Exguardameta español con amplia carrera como técnico en el Sevilla, Real Madrid y la selección española. Nombrado seleccionador de Qatar en mayo de 2025 para preparar al equipo para el Mundial en casa.',
      en: 'Former Spanish goalkeeper with an extensive coaching career at Sevilla, Real Madrid and the Spain national team. Appointed Qatar head coach in May 2025 to prepare the team for the home World Cup.',
    },
  },
  SUI: {
    name: 'Murat Yakin',
    born: '1974-09-26',
    nationality: 'Suiza',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/6tdccv1668797947.jpg',
    bio: {
      es: 'Exdefensa internacional suizo que tomó el relevo de Vladimir Petković en 2021. Llevó a Suiza a cuartos de final del Mundial 2022 y al Euro 2024.',
      en: 'Former Swiss international defender who took over from Vladimir Petković in 2021. He led Switzerland to the 2022 World Cup quarter-finals and Euro 2024.',
    },
  },

  // Group C
  BRA: {
    name: 'Carlo Ancelotti',
    born: '1959-06-10',
    nationality: 'Italia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Carlo_Ancelotti_2016.jpg',
    bio: {
      es: 'Uno de los técnicos más exitosos de la historia, único en ganar cinco Champions League y títulos en las cinco grandes ligas europeas. Asumió el mando de la Canarinha en 2025 para buscar el sexto título mundial.',
      en: 'One of the most successful managers in history, the only one to win five Champions League titles and league titles in all five major European leagues. He took charge of the Canarinha in 2025 to pursue their sixth world title.',
    },
  },
  MAR: {
    name: 'Mohamed Ouahbi',
    born: '1976-09-07',
    nationality: 'Marruecos',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Mohamed_Ouahbi_against_Paraguay_3.jpg',
    bio: {
      es: 'Técnico belga-marroquí que asumió el cargo en marzo de 2026 tras la renuncia de Walid Regragui. Lideró a Marruecos al título mundial Sub-20 en Chile 2025 —venciendo a Argentina en la final— y ahora dirige a la selección absoluta.',
      en: 'Belgian-Moroccan coach who took charge in March 2026 following Walid Regragui\'s resignation. He led Morocco to the U-20 World Cup title in Chile 2025 — beating Argentina in the final — and now leads the senior national team.',
    },
  },
  HAI: {
    name: 'Sébastien Migné',
    born: '1972-11-30',
    nationality: 'Francia',
    photoUrl: 'https://www.icihaiti.com/images/sebastien-migne.jpg',
    bio: {
      es: 'Técnico francés con amplia experiencia en África (Congo, Kenia, Guinea Ecuatorial, Camerún). Asumió Haití en junio de 2024 y logró la histórica clasificación de los Granaderos para el Mundial 2026, su segunda participación en la historia.',
      en: 'French coach with extensive experience across Africa (Congo, Kenya, Equatorial Guinea, Cameroon). He took charge of Haiti in June 2024 and secured the historic 2026 World Cup qualification for the Grenadiers, their second-ever appearance.',
    },
  },
  SCO: {
    name: 'Steve Clarke',
    born: '1963-08-29',
    nationality: 'Escocia',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/kainkm1549399439.jpg',
    bio: {
      es: 'El seleccionador más exitoso de Escocia en décadas modernas, logró clasificaciones para la Eurocopa 2020 y 2024. Llevó a Escocia al Mundial 2026 por primera vez desde 1998, con una victoria histórica ante Dinamarca en noviembre de 2025.',
      en: 'Scotland\'s most successful manager of the modern era, guiding them to Euro 2020 and Euro 2024. He led Scotland to the 2026 World Cup for the first time since 1998, with a historic win over Denmark in November 2025.',
    },
  },

  // Group D
  USA: {
    name: 'Mauricio Pochettino',
    born: '1972-03-02',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/ruel3u1549370038.jpg',
    bio: {
      es: 'Exdefensa argentino que como técnico dirigió al Tottenham a la final de la Champions 2019. Nombrado seleccionador de Estados Unidos en 2023 para preparar el Mundial en casa.',
      en: 'Former Argentine defender who as a manager led Tottenham to the 2019 Champions League final. Appointed USA head coach in 2023 to prepare for the home World Cup.',
    },
  },
  PAR: {
    name: 'Gustavo Alfaro',
    born: '1962-08-14',
    nationality: 'Argentina',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Gustavo_Alfaro_%282022%29_%28cropped%29.jpg',
    bio: {
      es: 'Técnico argentino reconocido por su capacidad táctica para consolidar defensas. Tras llevar a Ecuador al Mundial 2022 y dirigir a Costa Rica, asumió el reto de clasificar a Paraguay para la cita de 2026.',
      en: 'Argentine coach renowned for his tactical ability to solidify defenses. After leading Ecuador to the 2022 World Cup and managing Costa Rica, he took on the challenge of qualifying Paraguay for 2026.',
    },
  },
  AUS: {
    name: 'Tony Popovic',
    born: '1973-07-04',
    nationality: 'Australia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Tony_Popovic.jpg/400px-Tony_Popovic.jpg',
    bio: {
      es: 'Exdefensa central de los Socceroos y del Crystal Palace. Fue nombrado seleccionador de Australia en 2024 tras una exitosa carrera en la A-League.',
      en: 'Former Socceroos and Crystal Palace centre-back. He was appointed Australia head coach in 2024 after a successful career managing in the A-League.',
    },
  },
  TUR: {
    name: 'Vincenzo Montella',
    born: '1974-06-18',
    nationality: 'Italia',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/d1sjsy1661854263.jpg',
    bio: {
      es: 'Exdelantero de la Fiorentina y la Roma, brillante goleador en la Serie A. Como técnico llevó a Turquía a semifinales de la Eurocopa 2024 y sigue al frente del proyecto.',
      en: 'Former Fiorentina and Roma striker, prolific scorer in Serie A. As a coach he led Turkey to the Euro 2024 semi-finals and continues to lead the national project.',
    },
  },

  // Group E
  GER: {
    name: 'Julian Nagelsmann',
    born: '1987-07-23',
    nationality: 'Alemania',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/x9iybb1628244756.jpg',
    bio: {
      es: 'El técnico más joven en llegar a cuartos de Champions con Hoffenheim. Tomó las riendas de Alemania en 2023 y guió al país anfitrión a un ilusionante Euro 2024.',
      en: 'The youngest coach to reach the Champions League quarter-finals with Hoffenheim. He took charge of Germany in 2023 and guided the host nation through an exciting Euro 2024.',
    },
  },
  CUW: {
    name: 'Fred Rutten',
    born: '1962-12-05',
    nationality: 'Países Bajos',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Fredrutten.jpg',
    bio: {
      es: 'Exdefensa del Twente con una dilatada carrera en los banquillos de la Eredivisie (PSV, Feyeynoord, Vitesse) y el Schalke 04. Tomó el mando de Curazao en 2026 para liderar su histórica primera participación mundialista.',
      en: 'Former Twente defender with an extensive coaching career in the Eredivisie (PSV, Feyenoord, Vitesse) and Schalke 04. He took charge of Curaçao in 2026 to lead their historic first World Cup appearance.',
    },
  },
  CIV: {
    name: 'Emerse Faé',
    born: '1982-01-16',
    nationality: 'Costa de Marfil',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Emerse_Faé_2013.jpg/400px-Emerse_Faé_2013.jpg',
    bio: {
      es: 'Exmediocampista de la selección marfileña y del Niza. Tomó el relevo de urgencia en la AFCON 2024 y con Ivory Coast ganó el título continental, siendo después confirmado como técnico titular.',
      en: 'Former Ivory Coast international and Nice midfielder. He took emergency charge at AFCON 2024, won the continental title, and was subsequently confirmed as permanent head coach.',
    },
  },
  ECU: {
    name: 'Sebastián Beccacece',
    born: '1980-05-20',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/olbhct1743391593.jpg',
    bio: {
      es: 'Técnico argentino conocido por su fútbol ofensivo y de alta intensidad. Asumió Ecuador en 2024 con el objetivo de plasmar un estilo de presión alta en la Tri.',
      en: 'Argentine coach known for his offensive, high-intensity football. He took charge of Ecuador in 2024 aiming to implement a high-press style with La Tri.',
    },
  },

  // Group F
  NED: {
    name: 'Ronald Koeman',
    born: '1963-03-21',
    nationality: 'Países Bajos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/cmwxwz1600893612.jpg',
    bio: {
      es: 'Leyenda del fútbol neerlandés como jugador y ahora técnico de la selección. Llevó a los Oranje a la final de la Nations League 2023 y a semis del Euro 2024.',
      en: 'Dutch football legend as a player and now as national team coach. He led the Oranje to the 2023 Nations League final and the semi-finals of Euro 2024.',
    },
  },
  JPN: {
    name: 'Hajime Moriyasu',
    born: '1968-08-23',
    nationality: 'Japón',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/b6v8381668791841.jpg',
    bio: {
      es: 'Al frente de Japón desde 2018, logró clasificar al equipo a cuartos de final del Mundial 2022 con victorias sobre Alemania y España. Continúa el proceso de modernización del fútbol japonés.',
      en: 'In charge of Japan since 2018, he guided the team to the 2022 World Cup last eight with stunning wins over Germany and Spain. He continues Japan\'s football modernization process.',
    },
  },
  SWE: {
    name: 'Graham Potter',
    born: '1975-05-20',
    nationality: 'Inglaterra',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Graham_Potter_at_%C3%96stersunds_FK_in_2017._%28cropped%29.jpg/400px-Graham_Potter_at_%C3%96stersunds_FK_in_2017._%28cropped%29.jpg',
    bio: {
      es: 'Técnico inglés con profundas raíces en el fútbol sueco (Östersund, 2011–2018). Llegó a las Tres Coronas en octubre de 2025, consiguió la clasificación vía play-off —con una goleada 3-1 ante Ucrania y 3-2 ante Polonia— y renovó contrato hasta 2030.',
      en: 'English coach with deep roots in Swedish football (Östersund, 2011–2018). He took charge of Sweden in October 2025, secured qualification through the play-offs — beating Ukraine 3-1 and Poland 3-2 — and signed a contract extension to 2030.',
    },
  },
  TUN: {
    name: 'Sabri Lamouchi',
    born: '1971-11-09',
    nationality: 'Francia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sabri_Lamouchi_-_Portrait_2022.jpg/400px-Sabri_Lamouchi_-_Portrait_2022.jpg',
    bio: {
      es: 'Exmediocampista franco-tunecino del Mónaco, el Inter y el Marsella, con doce internacionalidades con Francia. Nombrado técnico de Túnez en enero de 2026, llegó con el objetivo de preparar a las Águilas de Cartago para el Mundial.',
      en: 'Former French-Tunisian midfielder who played for Monaco, Inter and Marseille with twelve France caps. Appointed Tunisia head coach in January 2026, he arrived to prepare the Eagles of Carthage for the World Cup.',
    },
  },

  // Group G
  BEL: {
    name: 'Rudi Garcia',
    born: '1964-02-20',
    nationality: 'Francia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Rudi_Garcia_%28Flickr%2C_2011%29.jpg',
    bio: {
      es: 'Técnico francés con amplia experiencia en el Lille, la Roma, el Marsella, el Lyon y el Nápoles. Nombrado seleccionador de Bélgica en enero de 2025 para impulsar la transición generacional de los Diablos Rojos de cara al Mundial 2026.',
      en: 'French coach with extensive experience at Lille, Roma, Marseille, Lyon and Napoli. Appointed Belgium head coach in January 2025 to drive the Red Devils\'s generational transition heading into the 2026 World Cup.',
    },
  },
  EGY: {
    name: 'Hossam Hassan',
    born: '1966-08-10',
    nationality: 'Egipto',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Hossam_Hassan.png',
    bio: {
      es: 'El máximo goleador histórico de la selección egipcia y del fútbol africano, disputó el Mundial 1990 como jugador. Asumió el banquillo de los Faraones en 2024 y los llevó invictos a la clasificación para el Mundial 2026.',
      en: 'Egypt\'s and Africa\'s all-time top scorer, he played at the 1990 World Cup. He took charge of the Pharaohs in 2024 and guided them unbeaten through 2026 World Cup qualification.',
    },
  },
  IRN: {
    name: 'Amir Ghalenoei',
    born: '1969-07-22',
    nationality: 'Irán',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Amir_Ghalenoei_2023.jpg/400px-Amir_Ghalenoei_2023.jpg',
    bio: {
      es: 'Uno de los técnicos más respetados del fútbol iraní, con varios títulos de liga. Asumió la selección en 2024 para llevar al Team Melli al Mundial 2026 con un estilo más ofensivo.',
      en: 'One of the most respected coaches in Iranian football, with multiple league titles. He took charge of the national team in 2024 to bring a more attacking style to the Team Melli.',
    },
  },
  NZL: {
    name: 'Darren Bazeley',
    born: '1972-10-05',
    nationality: 'Inglaterra',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Darren_Bazeley_%2830_March%29.jpg',
    bio: {
      es: 'Exlateral inglés con más de 500 partidos profesionales en Watford, Wolverhampton y Walsall. Confirmado como entrenador permanente de los All Whites en 2023, llevó a Nueva Zelanda a su primer Mundial desde 2010.',
      en: 'Former English full-back with over 500 professional appearances at Watford, Wolverhampton and Walsall. Confirmed as permanent All Whites coach in 2023, he led New Zealand to their first World Cup since 2010.',
    },
  },

  // Group H
  ESP: {
    name: 'Luis de la Fuente',
    born: '1961-04-21',
    nationality: 'España',
    photoUrl: 'https://www.thesportsdb.com/images/media/player/thumb/p10z0k1694605417.jpg',
    bio: {
      es: 'Riojano que forjó su talento en las categorías inferiores de la RFEF, ganando tres Eurocopas sub-21. Coronó su trayectoria ganando la Eurocopa 2024 con la selección absoluta.',
      en: 'From La Rioja, he honed his talent in Spanish youth football, winning three U-21 European Championships. He crowned his career by winning Euro 2024 with the senior national team.',
    },
  },
  CPV: {
    name: 'Pedro Brito (Bubista)',
    born: '1967-05-25',
    nationality: 'Cabo Verde',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bubista_2022.jpg/400px-Bubista_2022.jpg',
    bio: {
      es: 'Conocido como «Bubista», es el artífice de la transformación del fútbol caboverdiano. Ha llevado a los Tiburones Azules a clasificaciones históricas en la AFCON y al Mundial 2026.',
      en: 'Known as "Bubista," he is the architect of Cape Verde\'s footballing transformation. He has led the Blue Sharks to historic AFCON runs and qualification for the 2026 World Cup.',
    },
  },
  KSA: {
    name: 'Georgios Donis',
    born: '1969-10-22',
    nationality: 'Grecia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Georgios_Donis.jpg',
    bio: {
      es: 'Exmediocampista greco-alemán, el primer griego en jugar en la Premier League con el Blackburn Rovers. Nombrado seleccionador de Arabia Saudí en abril de 2026 tras una larga trayectoria en la liga saudí, incluyendo el Al Hilal.',
      en: 'Former Greek-German midfielder, the first Greek to play in the Premier League with Blackburn Rovers. Appointed Saudi Arabia head coach in April 2026 after a lengthy career in the Saudi league, including Al Hilal.',
    },
  },
  URU: {
    name: 'Marcelo Bielsa',
    born: '1955-07-25',
    nationality: 'Argentina',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Marcelo_Bielsa_2018.jpg/400px-Marcelo_Bielsa_2018.jpg',
    bio: {
      es: '«El Loco», uno de los pensadores más influyentes del fútbol moderno. Tomó las riendas de Uruguay en 2023 y aplica su filosofía de presión e intensidad a la Celeste.',
      en: '"El Loco," one of the most influential thinkers in modern football. He took charge of Uruguay in 2023, applying his trademark pressing philosophy to La Celeste.',
    },
  },

  // Group I
  FRA: {
    name: 'Didier Deschamps',
    born: '1968-10-15',
    nationality: 'Francia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Didier_Deschamps_2018.jpg/400px-Didier_Deschamps_2018.jpg',
    bio: {
      es: 'Capitán de la Francia campeona del mundo en 1998, repitió el logro como técnico en 2018. El seleccionador más longevo de Les Bleus continúa el proyecto de cara al Mundial 2026.',
      en: 'Captain of the 1998 World Cup-winning France side, he repeated the achievement as manager in 2018. The longest-serving Les Bleus coach continues his project toward the 2026 World Cup.',
    },
  },
  SEN: {
    name: 'Pape Thiaw',
    born: '1981-02-05',
    nationality: 'Senegal',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Pape_Thiaw.png',
    bio: {
      es: 'Exdelantero senegalés que jugó el Mundial 2002 y pasó por clubes de Francia, Suiza, España y Rusia. Nombrado seleccionador en diciembre de 2024 tras la destitución de Aliou Cissé, clasificó a Senegal para el Mundial 2026 en octubre de 2025.',
      en: 'Former Senegalese striker who played at the 2002 World Cup and had spells in France, Switzerland, Spain and Russia. Appointed head coach in December 2024 following Aliou Cissé\'s dismissal, he led Senegal to 2026 World Cup qualification in October 2025.',
    },
  },
  IRQ: {
    name: 'Graham Arnold',
    born: '1963-08-03',
    nationality: 'Australia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Graham_Arnold.jpg',
    bio: {
      es: 'Exdelantero australiano que llevó a los Socceroos al mejor rendimiento mundialista de su historia en 2022. Nombrado técnico de Irak en mayo de 2025, guió a los Leones de Mesopotamia a su primer Mundial desde 1986 venciendo a Bolivia en el play-off intercontinental.',
      en: 'Former Australian striker who guided the Socceroos to their best-ever World Cup in 2022. Appointed Iraq coach in May 2025, he led the Lions of Mesopotamia to their first World Cup since 1986 by beating Bolivia in the intercontinental play-off.',
    },
  },
  NOR: {
    name: 'Ståle Solbakken',
    born: '1968-01-27',
    nationality: 'Noruega',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Ståle_Solbakken_2021.jpg/400px-Ståle_Solbakken_2021.jpg',
    bio: {
      es: 'Exmediocampista noruego con una larga carrera en banquillos daneses y con el FC Colonia. Al frente de la selección desde 2021, combina a Erling Haaland con un proyecto colectivo sólido.',
      en: 'Former Norwegian midfielder with a long coaching career in Denmark and at FC Cologne. In charge since 2021, he combines Erling Haaland with a solid collective project.',
    },
  },

  // Group J
  ARG: {
    name: 'Lionel Scaloni',
    born: '1978-05-16',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/d3jsh91641891885.jpg',
    bio: {
      es: 'El técnico que despertó a un gigante dormido: ganó la Copa América 2021, el Mundial 2022 y la Copa América 2024, convirtiendo a la Albiceleste en el equipo más exitoso del planeta.',
      en: 'The coach who woke a sleeping giant: he won the 2021 Copa América, the 2022 World Cup and the 2024 Copa América, making the Albiceleste the most successful team on the planet.',
    },
  },
  ALG: {
    name: 'Vladimir Petkovic',
    born: '1963-08-15',
    nationality: 'Bosnia y Herzegovina',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Vladimir_Petkovic_2018.jpg/400px-Vladimir_Petkovic_2018.jpg',
    bio: {
      es: 'Técnico bosniaco con una extensa trayectoria europea, conocido por guiar a Suiza al Mundial 2014. Asumió Argelia en 2022 con la misión de relanzar a los Guerreros del Desierto.',
      en: 'Bosnian coach with an extensive European career, known for guiding Switzerland at the 2014 World Cup. He took charge of Algeria in 2022 to relaunch the Desert Warriors.',
    },
  },
  AUT: {
    name: 'Ralf Rangnick',
    born: '1958-06-29',
    nationality: 'Alemania',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ralf_Rangnick_2018.jpg/400px-Ralf_Rangnick_2018.jpg',
    bio: {
      es: 'El padre del gegenpressing moderno, responsable de la filosofía Red Bull y referente intelectual de Klopp y Nagelsmann. Al frente de Austria desde 2022, llevó al equipo a la Eurocopa 2024.',
      en: 'The godfather of modern gegenpressing and the intellectual architect behind Klopp and Nagelsmann. In charge of Austria since 2022, he led the team to Euro 2024.',
    },
  },
  JOR: {
    name: 'Jamal Sellami',
    born: '1970-10-06',
    nationality: 'Marruecos',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jamal_Sellami_2024.jpg/400px-Jamal_Sellami_2024.jpg',
    bio: {
      es: 'Exmediocampista marroquí que disputó el Mundial 1998 con el Raja de Casablanca y el Beşiktaş. Asumió Jordania en junio de 2024 y llevó a los Nashama a su primera clasificación histórica para un Mundial.',
      en: 'Former Moroccan midfielder who played at the 1998 World Cup with Raja Casablanca and Beşiktaş. He took charge of Jordan in June 2024 and guided the Nashama to their first-ever World Cup qualification.',
    },
  },

  // Group K
  POR: {
    name: 'Roberto Martínez',
    born: '1973-07-13',
    nationality: 'España',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Roberto_Martínez_2018.jpg/400px-Roberto_Martínez_2018.jpg',
    bio: {
      es: 'Técnico español nacido en Balaguer, llevó a Bélgica a lo más alto del ranking FIFA. En Portugal desde 2023, lanzó a la selección hacia la clasificación para el Mundial con un fútbol atractivo.',
      en: 'Spanish coach born in Balaguer, he guided Belgium to the top of the FIFA rankings. With Portugal since 2023, he has led an exciting qualification campaign for the 2026 World Cup.',
    },
  },
  COD: {
    name: 'Sébastien Desabre',
    born: '1980-01-10',
    nationality: 'Francia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Sébastien_Desabre_2019.jpg/400px-Sébastien_Desabre_2019.jpg',
    bio: {
      es: 'Técnico francés con amplia experiencia en el fútbol africano, ha dirigido a Uganga y otros equipos continentales. Asumió la selección del Congo en 2023 con la vista puesta en el Mundial.',
      en: 'French coach with extensive experience in African football, having managed Uganda and other continental sides. He took charge of DR Congo in 2023 with the World Cup as the goal.',
    },
  },
  UZB: {
    name: 'Fabio Cannavaro',
    born: '1973-09-13',
    nationality: 'Italia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fabio_Cannavaro_2025.jpg/400px-Fabio_Cannavaro_2025.jpg',
    bio: {
      es: 'Uno de los mejores defensas de la historia, capitán de Italia en el Mundial 2006 y ganador del Balón de Oro ese mismo año. Nombrado técnico de Uzbekistán en octubre de 2025 para guiar a los Lobos Blancos en su debut histórico en un Mundial.',
      en: 'One of the greatest defenders in history, Italy\'s World Cup-winning captain in 2006 and Ballon d\'Or winner that same year. Appointed Uzbekistan coach in October 2025 to lead the White Wolves in their historic World Cup debut.',
    },
  },
  COL: {
    name: 'Néstor Lorenzo',
    born: '1966-03-05',
    nationality: 'Argentina',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Néstor_Lorenzo_2022.jpg/400px-Néstor_Lorenzo_2022.jpg',
    bio: {
      es: 'Exdefensa del Atlético de Madrid y colaborador de largo recorrido con José Pékerman. Asumió Colombia en 2022 y llevó a los Cafeteros a la final de la Copa América 2024.',
      en: 'Former Atlético de Madrid defender and long-time José Pékerman collaborator. He took charge of Colombia in 2022 and guided Los Cafeteros to the 2024 Copa América final.',
    },
  },

  // Group L
  ENG: {
    name: 'Thomas Tuchel',
    born: '1973-08-29',
    nationality: 'Alemania',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Thomas_Tuchel_2022.jpg/400px-Thomas_Tuchel_2022.jpg',
    bio: {
      es: 'Técnico alemán que ganó la Champions con el Chelsea en 2021. Nombrado seleccionador de Inglaterra en octubre de 2024 tras la renuncia de Gareth Southgate, lleva su intensidad al banquillo de los Three Lions.',
      en: 'German coach who won the 2021 Champions League with Chelsea. Appointed England manager in October 2024 following Gareth Southgate\'s resignation, he brings his intensity to the Three Lions.',
    },
  },
  CRO: {
    name: 'Zlatko Dalić',
    born: '1966-10-26',
    nationality: 'Croacia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Zlatko_Dalić_2018.jpg/400px-Zlatko_Dalić_2018.jpg',
    bio: {
      es: 'Artífice de la era dorada del fútbol croata: finalista del Mundial 2018 y tercer puesto en 2022. Continúa al frente de los Vatreni para el Mundial 2026 con una renovación generacional en marcha.',
      en: 'The architect of Croatian football\'s golden era: 2018 World Cup finalist and 2022 third-place finisher. He continues with the Vatreni for 2026 as a generational renewal takes shape.',
    },
  },
  GHA: {
    name: 'Carlos Queiroz',
    born: '1953-03-01',
    nationality: 'Portugal',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Carlos_Queiroz_2026.jpg/400px-Carlos_Queiroz_2026.jpg',
    bio: {
      es: 'Técnico portugués con una de las trayectorias más extensas del fútbol mundial: ayudante de Ferguson en el Manchester United, seleccionador de Portugal, Irán, Colombia y Egipto. Nombrado técnico de Ghana en abril de 2026 para su quinta participación consecutiva en un Mundial.',
      en: 'Portuguese coach with one of the most extensive careers in world football: Ferguson\'s assistant at Manchester United, head coach of Portugal, Iran, Colombia and Egypt. Appointed Ghana coach in April 2026 for his fifth consecutive World Cup appearance.',
    },
  },
  PAN: {
    name: 'Thomas Christiansen',
    born: '1973-03-04',
    nationality: 'Dinamarca',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Thomas_Christiansen_2021.jpg/400px-Thomas_Christiansen_2021.jpg',
    bio: {
      es: 'Exdelantero danés-español que dio sus primeros pasos como técnico en España. Asumió Panamá y llevó a los Canaleros a su segunda clasificación mundialista de la historia.',
      en: 'Former Danish-Spanish striker who took his first coaching steps in Spain. He took charge of Panama and guided Los Canaleros to their second-ever World Cup qualification.',
    },
  },
};

export const getCoach = (teamId: string): Coach | null => COACHES[teamId] ?? null;
