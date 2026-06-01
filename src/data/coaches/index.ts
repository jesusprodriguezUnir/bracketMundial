// Coach data for all 48 World Cup 2026 nations.
// Indexed by FIFA team code (uppercase, same key as SQUADS/LINEUPS).

export interface Coach {
  name: string;
  born: string;        // YYYY-MM-DD — age is computed at runtime
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
      es: 'Legendario defensa del fútbol coreano, fue clave en el histórico cuarto puesto del Mundial 2002. Regresó a la selección como técnico en 2023.',
      en: 'Legendary Korean defender who was key to the historic fourth-place finish at 2002. He returned as head coach in 2023.',
    },
  },
  CZE: {
    name: 'Miroslav Koubek',
    born: '1951-09-01',
    nationality: 'República Checa',
    photoUrl: 'https://www.thesportsdb.com/images/media/player/thumb/nr702z1777373018.jpg',
    bio: {
      es: 'Experimentado director técnico checo con gran trayectoria en el fútbol local, destacando por sus éxitos con el Viktoria Plzeň, al que llevó a ganar la liga. Fue nombrado seleccionador nacional en 2026 para el Mundial.',
      en: 'Highly experienced Czech manager with a long career in domestic football, most notably guiding Viktoria Plzeň to league titles. Appointed national team head coach in 2026 for the World Cup.',
    },
  },

  // Group B
  CAN: {
    name: 'Jesse Marsch',
    born: '1973-06-12',
    nationality: 'Estados Unidos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/aezkxu1603548457.jpg',
    bio: {
      es: 'Exmediocampista de la MLS formado como técnico en el sistema Red Bull. Nombrado seleccionador de Canadá en 2023.',
      en: 'Former MLS midfielder who built his coaching career in the Red Bull system. Appointed Canada head coach in 2023.',
    },
  },
  BIH: {
    name: 'Sergej Barbarez',
    born: '1971-08-17',
    nationality: 'Bosnia y Herzegovina',
    photoUrl: 'https://www.thesportsdb.com/images/media/player/thumb/u6g0nu1778539592.jpg',
    bio: {
      es: 'Exdelantero del Hamburgo y figura histórica de la selección bosnia. Asumió la dirección técnica en 2023.',
      en: 'Former Hamburg striker and historic Bosnia figure. He took over as head coach in 2023.',
    },
  },
  QAT: {
    name: 'Julen Lopetegui',
    born: '1966-08-28',
    nationality: 'España',
    bio: {
      es: 'Entrenador español de amplia trayectoria en clubes europeos y selecciones nacionales. Dirigió a España, Real Madrid, Sevilla, Wolverhampton y West Ham antes de asumir el banquillo de Qatar en 2025 para el ciclo mundialista.',
      en: 'Highly experienced Spanish manager who coached Spain, Real Madrid, Sevilla, Wolverhampton, and West Ham before taking charge of Qatar in 2025 for the World Cup cycle.',
    },
  },
  SUI: {
    name: 'Murat Yakin',
    born: '1974-09-26',
    nationality: 'Suiza',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/6tdccv1668797947.jpg',
    bio: {
      es: 'Exdefensa internacional suizo que tomó el relevo en 2021. Llevó a Suiza a cuartos del Mundial 2022 y al Euro 2024.',
      en: 'Former Swiss international defender who took over in 2021. Led Switzerland to the 2022 World Cup quarter-finals and Euro 2024.',
    },
  },

  // Group C
  BRA: {
    name: 'Carlo Ancelotti',
    born: '1959-06-10',
    nationality: 'Italia',
    bio: {
      es: 'Uno de los entrenadores más laureados de la historia. Asumió el banquillo de Brasil en 2025 tras su legendario paso por el Real Madrid.',
      en: 'One of the most successful managers in football history. He took charge of Brazil in 2025 after a legendary tenure at Real Madrid.',
    },
  },
  MAR: {
    name: 'Walid Regragui',
    born: '1975-07-02',
    nationality: 'Marruecos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/m9is5p1639670485.jpg',
    bio: {
      es: 'Dirigió a Marruecos a un histórico cuarto puesto en el Mundial 2022, siendo la primera selección africana en lograrlo.',
      en: 'Led Morocco to a historic fourth place at the 2022 World Cup, the first African nation to achieve it.',
    },
  },
  HAI: {
    name: 'Sébastien Migné',
    born: '1972-12-11',
    nationality: 'Francia',
    bio: {
      es: 'Técnico francés con amplia trayectoria en el fútbol africano y caribeño. Asumió la selección de Haití en 2024 logrando una destacada clasificación mundialista.',
      en: 'French coach with an extensive career in African and Caribbean football. Took charge of Haiti in 2024, securing a remarkable World Cup spot.',
    },
  },
  SCO: {
    name: 'Steve Clarke',
    born: '1963-08-29',
    nationality: 'Escocia',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/kainkm1549399439.jpg',
    bio: {
      es: 'El seleccionador más exitoso de Escocia en décadas modernas, logró clasificaciones para la Eurocopa 2020 y 2024.',
      en: "Scotland's most successful manager of the modern era, guiding them to Euro 2020 and Euro 2024.",
    },
  },

  // Group D
  USA: {
    name: 'Mauricio Pochettino',
    born: '1972-03-02',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/ruel3u1549370038.jpg',
    bio: {
      es: 'Exdefensa argentino que dirigió al Tottenham a la final de la Champions 2019. Nombrado seleccionador de Estados Unidos en 2023.',
      en: 'Former Argentine defender who led Tottenham to the 2019 Champions League final. Appointed USA head coach in 2023.',
    },
  },
  PAR: {
    name: 'Gustavo Alfaro',
    born: '1962-08-14',
    nationality: 'Argentina',
    bio: {
      es: 'Técnico argentino de amplia trayectoria, conocido por su orden táctico. Dirigió a Ecuador en el Mundial 2022 y asumió Paraguay en 2024 para guiarlos al Mundial 2026.',
      en: 'Experienced Argentine manager known for tactical discipline. He coached Ecuador at the 2022 World Cup and took charge of Paraguay in 2024 to lead them to 2026.',
    },
  },
  AUS: {
    name: 'Tony Popovic',
    born: '1973-07-04',
    nationality: 'Australia',
    bio: {
      es: 'Exdefensa central de los Socceroos y del Crystal Palace. Nombrado seleccionador de Australia en 2024.',
      en: 'Former Socceroos and Crystal Palace centre-back. He was appointed Australia head coach in 2024.',
    },
  },
  TUR: {
    name: 'Vincenzo Montella',
    born: '1974-06-18',
    nationality: 'Italia',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/d1sjsy1661854263.jpg',
    bio: {
      es: 'Exdelantero de la Fiorentina y la Roma. Como técnico llevó a Turquía a semifinales de la Eurocopa 2024.',
      en: 'Former Fiorentina and Roma striker. As a coach he led Turkey to the Euro 2024 semi-finals.',
    },
  },

  // Group E
  GER: {
    name: 'Julian Nagelsmann',
    born: '1987-07-23',
    nationality: 'Alemania',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/x9iybb1628244756.jpg',
    bio: {
      es: 'El técnico más joven en llegar a cuartos de Champions con Hoffenheim. Guió a Alemania a un ilusionante Euro 2024.',
      en: 'The youngest coach to reach the Champions League quarter-finals with Hoffenheim. He guided Germany through an exciting Euro 2024.',
    },
  },
  CUW: {
    name: 'Dick Advocaat',
    born: '1947-09-27',
    nationality: 'Países Bajos',
    bio: {
      es: 'Veterano y legendario entrenador neerlandés. Conocido como «El Pequeño General», asumió el mando de Curazao en 2024 para liderar su histórica primera clasificación mundialista.',
      en: 'Veteran and legendary Dutch manager. Known as "The Little General", he took charge of Curaçao in 2024 to lead them to their historic first-ever World Cup.',
    },
  },
  CIV: {
    name: 'Emerse Faé',
    born: '1982-01-16',
    nationality: 'Costa de Marfil',
    bio: {
      es: 'Tomó el relevo de urgencia en la AFCON 2024 y con Costa de Marfil ganó el título continental, siendo después confirmado titular.',
      en: 'He took emergency charge at AFCON 2024, won the continental title, and was subsequently confirmed as permanent head coach.',
    },
  },
  ECU: {
    name: 'Sebastián Beccacece',
    born: '1980-05-20',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/olbhct1743391593.jpg',
    bio: {
      es: 'Técnico argentino conocido por su fútbol ofensivo y de alta intensidad. Asumió Ecuador en 2024.',
      en: 'Argentine coach known for his offensive, high-intensity football. He took charge of Ecuador in 2024.',
    },
  },

  // Group F
  NED: {
    name: 'Ronald Koeman',
    born: '1963-03-21',
    nationality: 'Países Bajos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/cmwxwz1600893612.jpg',
    bio: {
      es: 'Leyenda del fútbol neerlandés. Llevó a los Oranje a la final de la Nations League 2023 y a semis del Euro 2024.',
      en: 'Dutch football legend. He led the Oranje to the 2023 Nations League final and the semi-finals of Euro 2024.',
    },
  },
  JPN: {
    name: 'Hajime Moriyasu',
    born: '1968-08-23',
    nationality: 'Japón',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/b6v8381668791841.jpg',
    bio: {
      es: 'Al frente de Japón desde 2018, logró clasificar al equipo a cuartos del Mundial 2022 con victorias sobre Alemania y España.',
      en: 'In charge of Japan since 2018, he guided the team to the 2022 World Cup last eight with wins over Germany and Spain.',
    },
  },
  SWE: {
    name: 'Jon Dahl Tomasson',
    born: '1976-08-29',
    nationality: 'Dinamarca',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/7gxqmx1610915993.jpg',
    bio: {
      es: 'Exdelantero danés, campeón de la Champions con el Milan. Tomó las riendas de Suecia en 2022.',
      en: 'Former Danish striker and Champions League winner with AC Milan. He took charge of Sweden in 2022.',
    },
  },
  TUN: {
    name: 'Sabri Lamouchi',
    born: '1971-11-09',
    nationality: 'Francia',
    bio: {
      es: 'Exinternacional francés de origen tunecino. Con gran experiencia internacional dirigiendo a Costa de Marfil y diversos clubes europeos y asiáticos. Asumió Túnez en 2026.',
      en: 'Former French international of Tunisian descent. Highly experienced manager who coached Ivory Coast and several European and Asian clubs. Took charge of Tunisia in 2026.',
    },
  },

  // Group G
  BEL: {
    name: 'Domenico Tedesco',
    born: '1985-12-12',
    nationality: 'Alemania',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/vs6jr71622208802.jpg',
    bio: {
      es: 'Técnico italo-alemán que revitalizó la Golden Generation belga. Llevó a Bélgica al Euro 2024.',
      en: 'Italian-German coach who reinvigorated Belgium\'s Golden Generation. He led Belgium to Euro 2024.',
    },
  },
  EGY: {
    name: 'Hossam Hassan',
    born: '1966-08-10',
    nationality: 'Egipto',
    bio: {
      es: 'Leyenda absoluta del fútbol egipcio y máximo goleador histórico de los Faraones. Asumió el cargo de seleccionador nacional en 2024 para liderar la renovación de Egipto de cara al Mundial 2026.',
      en: 'Absolute legend of Egyptian football and all-time top goalscorer for the Pharaohs. He took charge of the national team in 2024 to lead Egypt into the 2026 World Cup.',
    },
  },
  IRN: {
    name: 'Amir Ghalenoei',
    born: '1969-07-22',
    nationality: 'Irán',
    bio: {
      es: 'Uno de los técnicos más respetados del fútbol iraní. Asumió la selección en 2024 con un estilo más ofensivo.',
      en: 'One of the most respected coaches in Iranian football. He took charge in 2024 to bring a more attacking style.',
    },
  },
  NZL: {
    name: 'Darren Bazeley',
    born: '1972-10-05',
    nationality: 'Inglaterra',
    bio: {
      es: 'Entrenador inglés con larga trayectoria en el fútbol formativo de Nueva Zelanda. Nombrado seleccionador de los All Whites en 2023 con el objetivo de clasificar y dirigir en el Mundial 2026.',
      en: 'English manager with an extensive background in New Zealand youth development. Appointed head coach of the All Whites in 2023 to guide them to the 2026 World Cup.',
    },
  },

  // Group H
  ESP: {
    name: 'Luis de la Fuente',
    born: '1961-04-21',
    nationality: 'España',
    bio: {
      es: 'Riojano que forjó su talento en las categorías inferiores de la RFEF. Coronó su trayectoria ganando la Eurocopa 2024.',
      en: 'From La Rioja, he honed his talent in Spanish youth football. He crowned his career by winning Euro 2024.',
    },
  },
  CPV: {
    name: 'Pedro Brito (Bubista)',
    born: '1967-05-25',
    nationality: 'Cabo Verde',
    bio: {
      es: 'Conocido como «Bubista», artífice de la transformación del fútbol caboverdiano y la clasificación al Mundial 2026.',
      en: 'Known as "Bubista," architect of Cape Verde\'s footballing transformation and 2026 World Cup qualification.',
    },
  },
  KSA: {
    name: 'Georgios Donis',
    born: '1969-10-22',
    nationality: 'Grecia',
    bio: {
      es: 'Exinternacional griego de amplia trayectoria en clubes europeos y de la Liga Profesional Saudí. Nombrado seleccionador de Arabia Saudita en abril de 2026 para el Mundial.',
      en: 'Former Greek international with extensive experience in European football and the Saudi Pro League. Appointed head coach of Saudi Arabia in April 2026 for the World Cup.',
    },
  },
  URU: {
    name: 'Marcelo Bielsa',
    born: '1955-07-25',
    nationality: 'Argentina',
    bio: {
      es: '«El Loco», uno de los pensadores más influyentes del fútbol moderno. Tomó las riendas de Uruguay en 2023.',
      en: '"El Loco," one of the most influential thinkers in modern football. He took charge of Uruguay in 2023.',
    },
  },

  // Group I
  FRA: {
    name: 'Didier Deschamps',
    born: '1968-10-15',
    nationality: 'Francia',
    bio: {
      es: 'Capitán de la Francia campeona del mundo en 1998, repitió el logro como técnico en 2018. El seleccionador más longevo de Les Bleus.',
      en: 'Captain of the 1998 World Cup-winning France side, he repeated the achievement as manager in 2018.',
    },
  },
  SEN: {
    name: 'Pape Thiaw',
    born: '1981-02-05',
    nationality: 'Senegal',
    bio: {
      es: 'Exdelantero de la histórica selección senegalesa del Mundial 2002. Asumió la dirección técnica a finales de 2024 tras la salida de Aliou Cissé, logrando clasificar al equipo al Mundial 2026.',
      en: 'Former striker of the historic 2002 Senegal World Cup squad. He took over as head coach in late 2024 following the exit of Aliou Cissé, guiding them to the 2026 World Cup.',
    },
  },
  IRQ: {
    name: 'Graham Arnold',
    born: '1963-08-03',
    nationality: 'Australia',
    bio: {
      es: 'Entrenador australiano de gran trayectoria que dirigió a los Socceroos en el Mundial 2022 logrando el pase a octavos de final. Asumió el banquillo de Irak para liderar su campaña en el Mundial 2026.',
      en: 'Highly experienced Australian manager who led the Socceroos at the 2022 World Cup, reaching the round of 16. Appointed head coach of Iraq to lead their 2026 World Cup campaign.',
    },
  },
  NOR: {
    name: 'Ståle Solbakken',
    born: '1968-01-27',
    nationality: 'Noruega',
    bio: {
      es: 'Al frente de la selección desde 2021, combina a Erling Haaland con un proyecto colectivo sólido.',
      en: 'In charge since 2021, he combines Erling Haaland with a solid collective project.',
    },
  },

  // Group J
  ARG: {
    name: 'Lionel Scaloni',
    born: '1978-05-16',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/d3jsh91641891885.jpg',
    bio: {
      es: 'Ganó la Copa América 2021, el Mundial 2022 y la Copa América 2024, convirtiendo a la Albiceleste en el equipo más exitoso del planeta.',
      en: 'He won the 2021 Copa América, the 2022 World Cup and the 2024 Copa América, making Argentina the most successful team on the planet.',
    },
  },
  ALG: {
    name: 'Vladimir Petkovic',
    born: '1963-08-15',
    nationality: 'Bosnia y Herzegovina',
    bio: {
      es: 'Técnico bosniaco con extensa trayectoria europea. Asumió Argelia en 2022 para relanzar a los Guerreros del Desierto.',
      en: 'Bosnian coach with an extensive European career. He took charge of Algeria in 2022 to relaunch the Desert Warriors.',
    },
  },
  AUT: {
    name: 'Ralf Rangnick',
    born: '1958-06-29',
    nationality: 'Alemania',
    bio: {
      es: 'El padre del gegenpressing moderno, referente intelectual de Klopp y Nagelsmann. Llevó a Austria a la Eurocopa 2024.',
      en: 'The godfather of modern gegenpressing and intellectual architect behind Klopp and Nagelsmann. Led Austria to Euro 2024.',
    },
  },
  JOR: {
    name: 'Jamal Sellami',
    born: '1970-10-06',
    nationality: 'Marruecos',
    bio: {
      es: 'Exinternacional marroquí. Asumió la selección de Jordania en junio de 2024 tras la salida de Hussein Ammouta, guiándolos con éxito a su histórica primera clasificación mundialista.',
      en: 'Former Moroccan international. Took charge of Jordan in June 2024 following the departure of Hussein Ammouta, successfully guiding them to their historic first-ever World Cup.',
    },
  },

  // Group K
  POR: {
    name: 'Roberto Martínez',
    born: '1973-07-13',
    nationality: 'España',
    bio: {
      es: 'Llevó a Bélgica a lo más alto del ranking FIFA. En Portugal desde 2023 con un fútbol atractivo.',
      en: 'He guided Belgium to the top of the FIFA rankings. With Portugal since 2023 running an exciting campaign.',
    },
  },
  COD: {
    name: 'Sébastien Desabre',
    born: '1980-01-10',
    nationality: 'Francia',
    bio: {
      es: 'Técnico francés con amplia experiencia en el fútbol africano. Asumió la selección del Congo en 2023.',
      en: 'French coach with extensive experience in African football. He took charge of DR Congo in 2023.',
    },
  },
  UZB: {
    name: 'Srecko Katanec',
    born: '1963-03-16',
    nationality: 'Eslovenia',
    bio: {
      es: 'Con Uzbekistán guió a los «Lobos Blancos» hasta las semifinales de la Copa Asiática 2023.',
      en: 'With Uzbekistan he led the "White Wolves" to the semi-finals of the 2023 AFC Asian Cup.',
    },
  },
  COL: {
    name: 'Néstor Lorenzo',
    born: '1966-03-05',
    nationality: 'Argentina',
    bio: {
      es: 'Exdefensa del Atlético de Madrid. Asumió Colombia en 2022 y llevó a los Cafeteros a la final de la Copa América 2024.',
      en: 'Former Atlético de Madrid defender. Took charge of Colombia in 2022 and guided them to the 2024 Copa América final.',
    },
  },

  // Group L
  ENG: {
    name: 'Thomas Tuchel',
    born: '1973-08-29',
    nationality: 'Alemania',
    bio: {
      es: 'Técnico alemán que ganó la Champions con el Chelsea en 2021. Nombrado seleccionador de Inglaterra en octubre de 2024.',
      en: 'German coach who won the 2021 Champions League with Chelsea. Appointed England manager in October 2024.',
    },
  },
  CRO: {
    name: 'Zlatko Dalić',
    born: '1966-10-26',
    nationality: 'Croacia',
    bio: {
      es: 'Artífice de la era dorada del fútbol croata: finalista del Mundial 2018 y tercer puesto en 2022.',
      en: 'The architect of Croatian football\'s golden era: 2018 World Cup finalist and 2022 third-place finisher.',
    },
  },
  GHA: {
    name: 'Carlos Queiroz',
    born: '1953-03-01',
    nationality: 'Portugal',
    bio: {
      es: 'Experimentado técnico portugués que ha dirigido al Real Madrid, la selección de Portugal, Irán, Colombia, Egipto y Qatar, entre otras. Asumió las riendas de Ghana en 2026 para liderar a las Black Stars en la Copa del Mundo.',
      en: 'Highly experienced Portuguese manager who has coached Real Madrid, the Portugal national team, Iran, Colombia, Egypt, and Qatar, among others. He took charge of Ghana in 2026 to lead the Black Stars in the World Cup.',
    },
  },
  PAN: {
    name: 'Thomas Christiansen',
    born: '1973-03-04',
    nationality: 'Dinamarca',
    bio: {
      es: 'Asumió Panamá y llevó a los Canaleros a su segunda clasificación mundialista de la historia.',
      en: 'He took charge of Panama and guided Los Canaleros to their second-ever World Cup qualification.',
    },
  },
};

export const getCoach = (teamId: string): Coach | null => COACHES[teamId] ?? null;
