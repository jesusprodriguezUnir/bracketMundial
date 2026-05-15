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
    name: 'Ivan Hašek',
    born: '1963-09-03',
    nationality: 'República Checa',
    photoUrl: 'https://www.thesportsdb.com/images/media/player/thumb/nr702z1777373018.jpg',
    bio: {
      es: 'Exinternacional de Checoslovaquia con el que participó en dos Eurocopas. Asumió el cargo de seleccionador de la República Checa en 2023 apostando por un proyecto joven.',
      en: 'Former Czechoslovakia international who featured in two European Championships. He took charge of the Czech Republic in 2023, building a project around young talents.',
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
    name: 'Marquez Lopez',
    born: '1970-04-14',
    nationality: 'España',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/7p5x9s1707012345.jpg',
    bio: {
      es: 'Entrenador español con experiencia en el fútbol asiático. Asumió la dirección de Qatar tras el Mundial 2022 con el objetivo de competir en el torneo de 2026.',
      en: 'Spanish coach with experience in Asian football. He took charge of Qatar after the 2022 World Cup with the aim of competing in the 2026 edition.',
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
    name: 'Dorival Júnior',
    born: '1961-09-08',
    nationality: 'Brasil',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/y62b1q1717631545.jpg',
    bio: {
      es: 'Técnico brasileño de amplia trayectoria en el fútbol doméstico, campeón de Copa Libertadores con Flamengo. Asumió la selección en 2024 con la misión de devolver el juego vistoso a la Canarinha.',
      en: 'Brazilian coach with a distinguished domestic career, Copa Libertadores winner with Flamengo. He took charge of the national team in 2024 to restore Brazil\'s attractive playing style.',
    },
  },
  MAR: {
    name: 'Walid Regragui',
    born: '1975-07-02',
    nationality: 'Marruecos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/m9is5p1639670485.jpg',
    bio: {
      es: 'Dirigió a Marruecos a un histórico cuarto puesto en el Mundial 2022, siendo la primera selección africana en lograrlo. Renovó para continuar el legado del equipo de las mil y una noches.',
      en: 'Led Morocco to a historic fourth place at the 2022 World Cup, the first African nation to achieve it. He renewed his contract to continue the legacy of that extraordinary squad.',
    },
  },
  HAI: {
    name: 'Marc Collat',
    born: '1968-03-10',
    nationality: 'Francia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Marc_Collat_2015.jpg/400px-Marc_Collat_2015.jpg',
    bio: {
      es: 'Técnico francés especializado en el desarrollo de selecciones emergentes en el Caribe y Centroamérica. Trabaja en modernizar el sistema defensivo y la proyección ofensiva de Haití.',
      en: 'French coach specializing in developing emerging national teams in the Caribbean and Central America. He focuses on modernizing Haiti\'s defensive structure and attacking output.',
    },
  },
  SCO: {
    name: 'Steve Clarke',
    born: '1963-08-29',
    nationality: 'Escocia',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/kainkm1549399439.jpg',
    bio: {
      es: 'El seleccionador más exitoso de Escocia en décadas modernas, logró clasificaciones para la Eurocopa 2020 y 2024. Tras la Euro 2024 inició una renovación generacional del equipo.',
      en: 'Scotland\'s most successful manager of the modern era, guiding them to Euro 2020 and Euro 2024. After Euro 2024 he began a generational renewal of the squad.',
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
    name: 'Daniel Garnero',
    born: '1971-04-09',
    nationality: 'Argentina',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/n0i3jz1767653510.jpg',
    bio: {
      es: 'Técnico argentino con experiencia en el fútbol sudamericano y europeo. Asumió Paraguay con el propósito de construir un equipo competitivo para las eliminatorias CONMEBOL.',
      en: 'Argentine coach with experience in South American and European football. He took charge of Paraguay to build a competitive side through CONMEBOL qualifiers.',
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
    name: 'Patrick Kluivert',
    born: '1976-07-01',
    nationality: 'Países Bajos',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/c909vk1491481092.jpg',
    bio: {
      es: 'Exgoleador del Ajax y el Barcelona, una de las grandes promesas del fútbol neerlandés en los 90. Ahora lidera el proyecto de Curazao como seleccionador nacional.',
      en: 'Former Ajax and Barcelona striker, one of Dutch football\'s great talents of the 90s. He now leads Curaçao\'s national project as head coach.',
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
    name: 'Jon Dahl Tomasson',
    born: '1976-08-29',
    nationality: 'Dinamarca',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/7gxqmx1610915993.jpg',
    bio: {
      es: 'Exdelantero danés, campeón de la Champions con el Milan. Tomó las riendas de Suecia en 2022 y clasificó al equipo para el Mundial 2026 apostando por la solidez colectiva.',
      en: 'Former Danish striker and Champions League winner with AC Milan. He took charge of Sweden in 2022, qualifying the team for the 2026 World Cup through collective solidity.',
    },
  },
  TUN: {
    name: 'Faouzi Benzarti',
    born: '1953-10-04',
    nationality: 'Túnez',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Faouzi_Benzarti_2013.jpg/400px-Faouzi_Benzarti_2013.jpg',
    bio: {
      es: 'Decano del banquillo tunecino, ha dirigido a la selección en varias etapas a lo largo de su carrera. Regresó para guiar a las Águilas de Cartago a la clasificación para el Mundial 2026.',
      en: 'The most experienced Tunisian coach, having managed the national team in several stints throughout his career. He returned to guide the Eagles of Carthage to 2026 World Cup qualification.',
    },
  },

  // Group G
  BEL: {
    name: 'Domenico Tedesco',
    born: '1985-12-12',
    nationality: 'Alemania',
    photoUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/vs6jr71622208802.jpg',
    bio: {
      es: 'Técnico italo-alemán que revitalizó la Golden Generation belga dándole frescura táctica. Llevó a Bélgica al Euro 2024 y trabaja en una transición generacional ordenada.',
      en: 'Italian-German coach who reinvigorated Belgium\'s Golden Generation with tactical freshness. He led Belgium to Euro 2024 and is managing an orderly generational transition.',
    },
  },
  EGY: {
    name: 'Hossam El-Badry',
    born: '1957-08-01',
    nationality: 'Egipto',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hossam_El_Badry_2013.jpg/400px-Hossam_El_Badry_2013.jpg',
    bio: {
      es: 'El entrenador más laureado del fútbol egipcio, ganó la liga nacional en múltiples ocasiones con Al Ahly. Regresó como seleccionador para recuperar el protagonismo de los Faraones.',
      en: 'The most decorated coach in Egyptian football, winning the national league multiple times with Al Ahly. He returned as national team coach to restore the Pharaohs to prominence.',
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
    name: 'Danny Hay',
    born: '1975-05-15',
    nationality: 'Nueva Zelanda',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Danny_Hay_2022.jpg/400px-Danny_Hay_2022.jpg',
    bio: {
      es: 'Exdefensa central de los All Whites que pasó por el Derby County inglés. Tomó la selección en 2020 y apostó por el desarrollo de jóvenes neozelandeses que compiten en el extranjero.',
      en: 'Former All Whites centre-back who played for Derby County in England. He took charge of the national team in 2020, focusing on developing young New Zealanders playing abroad.',
    },
  },

  // Group H
  ESP: {
    name: 'Luis de la Fuente',
    born: '1961-04-21',
    nationality: 'España',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Luis_de_la_Fuente_2023.jpg/400px-Luis_de_la_Fuente_2023.jpg',
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
    name: 'Roberto Mancini',
    born: '1964-11-27',
    nationality: 'Italia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Roberto_Mancini_2021.jpg/400px-Roberto_Mancini_2021.jpg',
    bio: {
      es: 'Exfigura del Manchester City y del Inter, campeón de Europa con Italia en 2021. Sorprendió al mundo del fútbol aceptando el banquillo de Arabia Saudí en 2023.',
      en: 'Former Manchester City and Inter stalwart, European champion with Italy in 2021. He surprised the football world by accepting the Saudi Arabia post in 2023.',
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
    name: 'Aliou Cissé',
    born: '1975-03-24',
    nationality: 'Senegal',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Aliou_Cissé_2018.jpg/400px-Aliou_Cissé_2018.jpg',
    bio: {
      es: 'Histórico capitán de la selección que disputó el Mundial 2002 y llegó a cuartos de final. Como técnico llevó a Senegal a su primera Copa Africana en 2022 y al Mundial de Qatar.',
      en: 'Historic national team captain who reached the 2002 World Cup quarter-finals. As coach he led Senegal to their first Africa Cup title in 2022 and to the Qatar World Cup.',
    },
  },
  IRQ: {
    name: 'Jesús Casas',
    born: '1970-12-14',
    nationality: 'España',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Jesús_Casas_2023.jpg/400px-Jesús_Casas_2023.jpg',
    bio: {
      es: 'Técnico español con experiencia en el fútbol árabe y asiático. Asumió la selección iraquí con el objetivo de aprovechar el talento de su nueva generación y clasificar al Mundial 2026.',
      en: 'Spanish coach with experience in Arab and Asian football. He took charge of Iraq aiming to harness their new generation\'s talent and secure a 2026 World Cup spot.',
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
    name: 'Hussein Ammouta',
    born: '1967-12-21',
    nationality: 'Marruecos',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Hussein_Ammouta_2021.jpg/400px-Hussein_Ammouta_2021.jpg',
    bio: {
      es: 'Técnico marroquí que logró con Jordania uno de los mayores hitos del fútbol asiático: llegar a la final de la Copa Asiática 2023. Su trabajo táctico transformó a los Nashama.',
      en: 'Moroccan coach who achieved one of the greatest feats in Asian football with Jordan: reaching the 2023 AFC Asian Cup final. His tactical work transformed the Nashama.',
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
    name: 'Srecko Katanec',
    born: '1963-03-16',
    nationality: 'Eslovenia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Srecko_Katanec_2018.jpg/400px-Srecko_Katanec_2018.jpg',
    bio: {
      es: 'Exdefensa y técnico esloveno que dirigió la selección de su país al Mundial 2002. Con Uzbekistán guió a los «Lobos Blancos» hasta las semifinales de la Copa Asiática 2023.',
      en: 'Former Slovenian defender and coach who guided his country to the 2002 World Cup. With Uzbekistan he led the "White Wolves" to the semi-finals of the 2023 AFC Asian Cup.',
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
    name: 'Otto Addo',
    born: '1975-06-09',
    nationality: 'Ghana',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Otto_Addo_2022.jpg/400px-Otto_Addo_2022.jpg',
    bio: {
      es: 'Exmediocampista del Borussia Dortmund y referente de la diáspora ghanese en Europa. Regresó para liderar las Estrellas Negras en las eliminatorias mundialistas.',
      en: 'Former Borussia Dortmund midfielder and standard-bearer of the Ghanaian diaspora in Europe. He returned to lead the Black Stars through World Cup qualifying.',
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
