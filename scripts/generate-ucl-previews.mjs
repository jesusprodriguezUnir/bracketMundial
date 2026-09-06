#!/usr/bin/env node
/**
 * scripts/generate-ucl-previews.mjs
 * 
 * Generates match previews and chronicles for UEFA Champions League 2026/27.
 * Cleans out old tournament previews (e.g. World Cup 2026 residue) and generates
 * rich match previews and in-depth chronicles for Matchday 1 (M1 to M18) using:
 * - Stadium data (name, capacity, city) from src/data/ucl-stadiums.json
 * - Coach information from src/data/coaches/index.ts
 * - Injury reports and doubts from src/data/player-status.json
 * - Probabilities from src/data/odds/seed.ts
 * - Fixture information from src/data/league-schedule.ts
 */

import { readdirSync, unlinkSync, writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const PREVIEWS_DIR = join(ROOT_DIR, 'content', 'previews');
const ES_DIR = join(PREVIEWS_DIR, 'es');
const EN_DIR = join(PREVIEWS_DIR, 'en');

// Load stadiums
const stadiumsList = JSON.parse(readFileSync(join(ROOT_DIR, 'src', 'data', 'ucl-stadiums.json'), 'utf-8'));
const stadiumsMap = new Map(stadiumsList.map(s => [s.clubId, s]));

// Load player conditions (injuries/doubts from Predicted11 / FutbolFantasy)
let playerConditions = [];
try {
  const statusData = JSON.parse(readFileSync(join(ROOT_DIR, 'src', 'data', 'player-status.json'), 'utf-8'));
  playerConditions = statusData.conditions || [];
} catch (e) {
  console.warn('⚠ player-status.json could not be loaded:', e.message);
}

// Group conditions by teamId
const conditionsByTeam = new Map();
for (const cond of playerConditions) {
  if (!conditionsByTeam.has(cond.teamId)) {
    conditionsByTeam.set(cond.teamId, []);
  }
  conditionsByTeam.get(cond.teamId).push(cond);
}

// Matchday 1 matches editorial dataset
const MATCHDAY_1_DATA = [
  {
    matchId: 'M1',
    teamA: 'AEK',
    teamB: 'LSK',
    date: '2026-09-08',
    titleEs: 'Caldera ateniense para abrir la fase liga',
    titleEn: 'Athenian cauldron ignites the league phase opener',
    introEs: 'El PAE AEK debuta ante su ferviente afición en el Estadio Spyros Louis frente al LASK Linz austríaco. Los atenienses buscarán asfixiar desde el primer compás con una presión alta y verticalidad, mientras que el LASK apelará al rigor táctico y a la velocidad en las bandas para dar la primera gran sorpresa.',
    introEn: 'PAE AEK kick off their campaign before a passionate home crowd at the Spyros Louis Stadium against Austria\'s LASK Linz. The Athenians will aim to suffocate their visitors from the first whistle with high pressing and direct play, while LASK rely on tactical discipline and rapid wing transitions to spring an opening-day surprise.',
    tacticalEs: 'Marko Nikolić buscará imponer ritmo e intensidad en el centro del campo, exigiendo máxima concentración en repliegue para evitar las transiciones fulgurantes del conjunto austríaco dirigido por Thomas Darazs.',
    tacticalEn: 'Marko Nikolić will demand tempo and grit across the midfield battleground, emphasizing rapid counter-pressing to neutralize the vertical counters drilled by Thomas Darazs\'s side.',
    keyFactorsEs: 'El empuje del estadio olímpico de Atenas y la capacidad del AEK para romper el bloque bajo austríaco serán decisivos.',
    keyFactorsEn: 'The roar of Athens\' Olympic Stadium and AEK\'s capacity to unlock a disciplined Austrian low block will prove decisive.'
  },
  {
    matchId: 'M2',
    teamA: 'BRU',
    teamB: 'AVL',
    date: '2026-09-08',
    titleEs: 'Prueba de fuego europea para los Villans en Brujas',
    titleEn: 'European acid test for Emery\'s Villans in Bruges',
    introEs: 'El Jan Breydelstadion acoge un duelo electrizante entre el Club Brugge y el ambicioso Aston Villa de Unai Emery. Los belgas son un clásico hueso duro de roer en su feudo europeo, pero el cuadro de Birmingham llega dispuesto a exhibir su pegada y jerarquía Premier en la competición de las estrellas.',
    introEn: 'The Jan Breydelstadion hosts an electrifying encounter between Club Brugge and Unai Emery\'s ambitious Aston Villa. The Belgian hosts have a reputation for frustrating continental giants on home soil, but the Birmingham outfit arrive determined to assert their Premier League pedigree under the European lights.',
    tacticalEs: 'Nicky Hayen planteará un bloque solidario con transiciones rápidas para aprovechar las espaldas de la adelantada línea defensiva que suele desplegar el Aston Villa de Unai Emery.',
    tacticalEn: 'Nicky Hayen will set up a compact unit seeking swift vertical transitions to exploit the high defensive line favoured by Unai Emery\'s Aston Villa.',
    keyFactorsEs: 'La batalla entre el juego aéreo a balón parado del Aston Villa y la resistencia física del Brujas marcará el desenlace.',
    keyFactorsEn: 'The aerial set-piece prowess of Aston Villa pitted against Bruges\' physical resilience is set to tilt the scales.'
  },
  {
    matchId: 'M3',
    teamA: 'BVB',
    teamB: 'VIL',
    date: '2026-09-08',
    titleEs: 'Noche de gala bajo el Muro Amarillo ante el Submarino',
    titleEn: 'Yellow Wall gala night against the Yellow Submarine',
    introEs: 'El Signal Iduna Park viste sus mejores galas para recibir al Villarreal en una de las citas estelares del martes. El Borussia Dortmund apela a la mística de su afición para arrancar sumando de a tres ante un Submarino Amarillo de Marcelino García Toral siempre peligroso, cerebral y letal al contragolpe.',
    introEn: 'Signal Iduna Park dresses for a showpiece occasion as Borussia Dortmund welcome Villarreal in a headline Tuesday clash. Dortmund will rely on the raw passion of their home crowd to secure an opening win against a Marcelino-led Yellow Submarine renowned for tactical acumen and lethal counter-attacks.',
    tacticalEs: 'Nuri Şahin buscará monopolizar la posesión y desbordar por los costados, mientras que Marcelino armará su clásico 4-4-2 hermético buscando castigar cada pérdida de balón alemana con salidas supersónicas.',
    tacticalEn: 'Nuri Şahin will target territorial dominance and wide overloads, while Marcelino deploys his trademark compact 4-4-2 seeking to punish every German turnover in transition.',
    keyFactorsEs: 'La eficacia en las áreas y el ritmo frenético que imponga el Dortmund serán las grandes claves del partido.',
    keyFactorsEn: 'Clinical finishing inside the boxes and Dortmund\'s ability to sustain an overwhelming tempo will decide the outcome.'
  },
  {
    matchId: 'M4',
    teamA: 'FCP',
    teamB: 'MCI',
    date: '2026-09-08',
    titleEs: 'Duelo de titanes en Do Dragão: Guardiola visita Oporto',
    titleEn: 'Clash of titans at Do Dragão: Guardiola visits Porto',
    introEs: 'El Manchester City de Pep Guardiola inicia su andadura europea con una exigente visita al Estádio Do Dragão. El FC Porto es consciente de la dificultad, pero confía en su garra, intensidad y el calor de su público para desafiar el dominio y la precisión quirúrgica del combinado inglés.',
    introEn: 'Pep Guardiola\'s Manchester City begin their European crusade with a stern test away to FC Porto at Estádio Do Dragão. The Portuguese giants recognize the challenge but back their intensity, tactical aggression, and fervent home backing to disrupt City\'s surgical possession machine.',
    tacticalEs: 'Vítor Bruno exigirá un repliegue sin fisuras y presión asfixiante sobre los generadores de juego del City, buscando balones largos a la espalda de los centrales mancunianos.',
    tacticalEn: 'Vítor Bruno will demand flawless defensive compactness and relentless harassment of City\'s deep playmakers, seeking rapid releases into the space behind Manchester\'s backline.',
    keyFactorsEs: 'El control del tempo por parte del City y la contundencia defensiva del Oporto en el área propia definirán el choque.',
    keyFactorsEn: 'City\'s composure in setting the game\'s rhythm versus Porto\'s defensive heroics in their own box will shape this blockbuster.'
  },
  {
    matchId: 'M5',
    teamA: 'LIL',
    teamB: 'BET',
    date: '2026-09-08',
    titleEs: 'Batalla técnica franco-española en el Pierre-Mauroy',
    titleEn: 'Franco-Spanish technical showdown at Stade Pierre-Mauroy',
    introEs: 'El Real Betis de Manuel Pellegrini viaja al norte de Francia para medirse a un Lille OSC dinámico y vertiginoso. Dos equipos que ponderan el buen trato de balón y la creatividad en tres cuartos de campo garantizan un encuentro abierto y de alta riqueza táctica.',
    introEn: 'Manuel Pellegrini\'s Real Betis travel to northern France to lock horns with an energetic, rapid Lille OSC. Both clubs share a devotion to possession-based football and attacking flair, promising an open and tactically compelling battle.',
    tacticalEs: 'Bruno Génésio buscará explotar las bandas con transiciones fulgurantes, mientras que el "Ingeniero" Pellegrini intentará adueñarse de la medular para pausar el juego y abastecer a sus hombres de ataque.',
    tacticalEn: 'Bruno Génésio will look to stretch the pitch with dynamic wing runners, whereas Pellegrini\'s side will aim to dictate the tempo through midfield control and clever line-breaking passes.',
    keyFactorsEs: 'La pausa y clarividencia bética frente a la exuberancia física del Lille en el último tercio.',
    keyFactorsEn: 'Betis\'s technical poise in midfield clashing with Lille\'s physical punch in the final third.'
  },
  {
    matchId: 'M6',
    teamA: 'RMA',
    teamB: 'INT',
    date: '2026-09-08',
    titleEs: 'Clásico de la realeza continental en el Santiago Bernabéu',
    titleEn: 'Royalty clash under the Santiago Bernabéu lights',
    introEs: 'El partido estrella de la primera jornada de la Champions reúne a dos de las instituciones más laureadas de Europa. El Real Madrid de Carlo Ancelotti abre las puertas del Bernabéu al subcampeón FC Internazionale de Simone Inzaghi en una auténtica final anticipada con sabor a máxima gloria.',
    introEn: 'The standout blockbuster of matchday one pits two European aristocrats against each other. Carlo Ancelotti\'s Real Madrid raise the curtain at the Santiago Bernabéu against Simone Inzaghi\'s tactically formidable FC Internazionale in an early heavyweight encounter of the highest magnitude.',
    tacticalEs: 'Ancelotti apostará por el desequilibrio individual y la velocidad de sus atacantes para desarmar el engranaje 3-5-2 tan aceitado y difícil de perforar que caracteriza a la escuadra nerazzurra de Inzaghi.',
    tacticalEn: 'Ancelotti will rely on his forwards\' individual brilliance and explosive pace to unlock the disciplined, fluid 3-5-2 system perfected by Inzaghi\'s Nerazzurri.',
    keyFactorsEs: 'El duelo en la sala de máquinas y el acierto de cara a puerta ante dos de las defensas más experimentadas del mundo.',
    keyFactorsEn: 'The midfield arm-wrestle and clinical efficiency in front of goal against two of world football\'s most seasoned backlines.'
  },
  {
    matchId: 'M7',
    teamA: 'BAR',
    teamB: 'FEY',
    date: '2026-09-09',
    titleEs: 'El Camp Nou enciende los focos ante el campeón de Róterdam',
    titleEn: 'Camp Nou lights shine bright for Feyenoord showdown',
    introEs: 'El FC Barcelona de Hansi Flick debuta en la fase liga ante su afición recibiendo al Feyenoord de Brian Priske. Con una propuesta de presión asfixiante y ritmo eléctrico, los blaugranas quieren mandar un mensaje contundente al continente desde los primeros compases.',
    introEn: 'Hansi Flick\'s FC Barcelona kick off their league phase campaign at home against Brian Priske\'s Feyenoord. Built on ferocious pressing and rapid attacking movements, the Catalans aim to send an emphatic opening statement across Europe.',
    tacticalEs: 'Flick exigirá una línea defensiva adelantada y recuperación inmediata tras pérdida en campo rival, mientras que el Feyenoord buscará salir aseado y aprovechar los espacios que el Barça conceda a sus espaldas.',
    tacticalEn: 'Flick will enforce an ultra-high defensive line and immediate counter-pressing, while Feyenoord will try to play through the pressure and exploit available space in behind.',
    keyFactorsEs: 'La pegada de la ofensiva azulgrana y la capacidad del Feyenoord para no cometer pérdidas comprometidas en salida.',
    keyFactorsEn: 'Barcelona\'s attacking firepower matched against Feyenoord\'s composure when playing out under suffocating heat.'
  },
  {
    matchId: 'M8',
    teamA: 'VFB',
    teamB: 'VIK',
    date: '2026-09-09',
    titleEs: 'Fiesta en Stuttgart: los suabos reciben a la revelación nórdica',
    titleEn: 'Stuttgart celebration: Swabians host Norwegian underdogs',
    introEs: 'El VfB Stuttgart celebra su esperado retorno a la élite continental ante un Viking FK noruego cargado de ilusión y entusiasmo. Los alemanes parten como favoritos en casa, pero no podrán relajarse ante un adversario físicamente poderoso y sin nada que perder.',
    introEn: 'VfB Stuttgart celebrate their long-awaited return to Europe\'s top table as they host Norway\'s spirited Viking FK. The Germans enter as clear favourites on home turf, but must stay alert against physically imposing opponents playing with house money.',
    tacticalEs: 'Sebastian Hoeneß buscará imponer su fútbol de combinación, movilidad constante y centros envenenados al área, intentando desarmar el muro defensivo que dispondrá Bjarte Lunde Aarsheim.',
    tacticalEn: 'Sebastian Hoeneß will look to impose fluid positional play, quick overloads, and dangerous box entries to penetrate Bjarte Lunde Aarsheim\'s disciplined low block.',
    keyFactorsEs: 'La paciencia del Stuttgart con el balón y la eficacia en remate para abrir la lata temprano.',
    keyFactorsEn: 'Stuttgart\'s patience in circulating the ball and sharpness inside the area to grab an early breakthrough.'
  },
  {
    matchId: 'M9',
    teamA: 'LIV',
    teamB: 'ATL',
    date: '2026-09-09',
    titleEs: 'Tempestad en Anfield: Arne Slot recibe al Cholo Simeone',
    titleEn: 'Thunderstorm at Anfield: Arne Slot locks horns with Simeone',
    introEs: 'Pocos choques en Europa prometen tanta adrenalina y fricción táctica como este clásico contemporáneo. El Liverpool de Arne Slot pone a prueba su maquinaria ofensiva ante el Club Atlético de Madrid de Diego Simeone, maestro indiscutible de las grandes batallas continentales.',
    introEn: 'Few fixtures on the European calendar guarantee as much tactical friction and high-octane drama as this modern rivalry. Arne Slot\'s Liverpool test their attacking machinery against Diego Simeone\'s Atlético de Madrid, undisputed masters of continental warfare.',
    tacticalEs: 'Slot buscará un ritmo vertiginoso en las bandas impulsado por la afición de Anfield, mientras que el Cholo Simeone preparará una trampa táctica con basculación impecable y contraataques quirúrgicos.',
    tacticalEn: 'Slot will unleash heavy-metal pace through the flanks driven by the Anfield faithful, while "Cholo" Simeone prepares a tactical trap rooted in iron-clad defensive discipline and surgical breaks.',
    keyFactorsEs: 'La resistencia del muro rojiblanco en los primeros 20 minutos y el acierto de las estrellas en momentos cumbre.',
    keyFactorsEn: 'Atlético\'s resilience during the customary early Anfield storm and each team\'s composure in high-leverage moments.'
  },
  {
    matchId: 'M10',
    teamA: 'NAP',
    teamB: 'ARS',
    date: '2026-09-09',
    titleEs: 'Duelo táctico de autor en el Diego Armando Maradona',
    titleEn: 'Tactical masterclass in Naples: Conte welcomes Arteta',
    introEs: 'El SSC Napoli de Antonio Conte recibe al Arsenal FC de Mikel Arteta en una de las pruebas más exigentes del calendario europeo. Dos técnicos metódicos, exigentes y pasionales que han construido bloques sólidos capaces de competir al máximo nivel físico y técnico.',
    introEn: 'Antonio Conte\'s SSC Napoli welcome Mikel Arteta\'s Arsenal FC in one of the most intellectually demanding fixtures of the European season. Two meticulous, passionate coaches whose sides blend supreme tactical structure with elite athletic intensity.',
    tacticalEs: 'Conte buscará ahogar el juego interior del Arsenal mediante ayudas constantes en la medular y salidas directas, mientras que Arteta buscará ensanchar el campo y dominar a través del balón parado.',
    tacticalEn: 'Conte will seek to choke Arsenal\'s central progression with aggressive double-teaming in midfield, while Arteta looks to stretch Naples vertically and capitalize on deadly set-piece routines.',
    keyFactorsEs: 'El control de las transiciones y el duelo entre la zaga napolitana y el ataque de los Gunners.',
    keyFactorsEn: 'Transition defense and the individual clashes between Napoli\'s rearguard and Arsenal\'s sharp forward line.'
  },
  {
    matchId: 'M11',
    teamA: 'PSG',
    teamB: 'SLO',
    date: '2026-09-09',
    titleEs: 'El Parque de los Príncipes mide la solidez del Slovan',
    titleEn: 'Parc des Princes tests Slovan Bratislava\'s grit',
    introEs: 'El Paris Saint-Germain de Luis Enrique inicia la Champions League con la obligación de imponer su ley en casa ante el ŠK Slovan Bratislava. Los eslovacos de Vladimír Weiss viajan a la capital gala dispuestos a dejar el alma y resistir ante el vendaval ofensivo parisino.',
    introEn: 'Luis Enrique\'s Paris Saint-Germain begin their European journey determined to establish authority at home against ŠK Slovan Bratislava. Vladimír Weiss\'s Slovakian champions visit Paris ready to battle for every yard and resist the Parisian attacking barrage.',
    tacticalEs: 'Luis Enrique exigirá posesión dominante, circulación veloz y presión alta inmediata, mientras que el Slovan se atrincherará en su propio tercio buscando balones parados y segundas jugadas.',
    tacticalEn: 'Luis Enrique will demand suffocating ball control, rapid ball circulation, and high pressing, while Slovan bunker deep into their defensive third aiming to exploit set pieces.',
    keyFactorsEs: 'La fluidez del PSG para derribar un cerrojo ultradefensivo sin descuidar el equilibrio en la retaguardia.',
    keyFactorsEn: 'PSG\'s creativity to dismantle a parked bus without losing structural balance against long clearances.'
  },
  {
    matchId: 'M12',
    teamA: 'SPO',
    teamB: 'GAL',
    date: '2026-09-09',
    titleEs: 'Electricidad en Lisboa: Sporting recibe al volcán turco',
    titleEn: 'Lisbon spark: Sporting battle Turkish power Galatasaray',
    introEs: 'El Estádio José Alvalade es el escenario de un choque cargado de pólvora entre el Sporting CP y el Galatasaray. La escuela dinámica y veloz del fútbol portugués choca contra el talento diferencial y la fiereza competitiva del conjunto de Estambul.',
    introEn: 'The Estádio José Alvalade hosts a powder-keg battle between Sporting CP and Galatasaray. Portugal\'s dynamic, free-flowing football goes toe-to-toe with the star quality, attacking flair, and fiery temperament of Istanbul\'s champions.',
    tacticalEs: 'Rúben Amorim buscará hacer daño con sus carrileros profundos y juego interior, mientras que el Galatasaray de Okan Buruk apostará por el talento desequilibrante de sus atacantes para castigar cualquier despiste.',
    tacticalEn: 'Rúben Amorim will look to overload the flanks with deep-running wingbacks, while Okan Buruk\'s Galatasaray count on individual brilliance to exploit any defensive lapse.',
    keyFactorsEs: 'El acierto goleador y el control de las emociones en un partido de alto voltaje entre dos hinchadas apasionadas.',
    keyFactorsEn: 'Clinical finishing and emotional composure in a high-voltage fixture contested by passionate supporters.'
  },
  {
    matchId: 'M13',
    teamA: 'FEN',
    teamB: 'ROM',
    date: '2026-09-10',
    titleEs: 'Morbo máximo en Estambul: el reencuentro de José Mourinho',
    titleEn: 'Maximum drama in Istanbul: José Mourinho faces his past',
    introEs: 'El Ülker Stadyumu Şükrü Saracoğlu será una olla a presión para el reencuentro de José Mourinho con la AS Roma. El técnico portugués, ahora a los mandos del Fenerbahçe, se mide al club de la capital italiana en un duelo de enorme carga psicológica y rivalidad deportiva.',
    introEn: 'The Ülker Stadyumu will be a cauldron as José Mourinho squares off against his former club AS Roma. The Portuguese manager, now steering Fenerbahçe, welcomes the Giallorossi in a fixture dripping with psychological intrigue and emotional charge.',
    tacticalEs: 'Mourinho diseñará un planteamiento rocoso, competitivo y pragmático para cortar las líneas de pase de la Roma, intentando castigar a balón parado y con salidas fulgurantes.',
    tacticalEn: 'Mourinho will engineer a rock-solid, pragmatic tactical setup to stifle Roma\'s midfield supply, looking to strike via set pieces and rapid counter-punches.',
    keyFactorsEs: 'El ambiente ensordecedor de Estambul y la batalla mental por no cometer el primer error grave.',
    keyFactorsEn: 'The deafening atmosphere in Istanbul and the psychological stamina required to avoid making the first fatal mistake.'
  },
  {
    matchId: 'M14',
    teamA: 'PSV',
    teamB: 'SHK',
    date: '2026-09-10',
    titleEs: 'Fútbol de toque y pegada en el Philips Stadion',
    titleEn: 'Attacking fireworks in Eindhoven: PSV meet Shakhtar',
    introEs: 'El Philips Stadion abre sus puertas para un encuentro vibrante entre el PSV Eindhoven y el Shakhtar Donetsk. El equipo de Peter Bosz es sinónimo de gol, vértigo y agresividad ofensiva, mientras que los ucranianos destacan por su técnica depurada y encomiable resiliencia europea.',
    introEn: 'The Philips Stadion prepares for a vibrant spectacle between PSV Eindhoven and Shakhtar Donetsk. Peter Bosz\'s men are synonymous with attacking bravery and high-tempo flair, while their Ukrainian opponents boast technical class and renowned European resilience.',
    tacticalEs: 'Bosz no negociará su estilo: presión tras pérdida y avalancha en campo rival. Marino Pušić intentará capear el temporal mediante posesiones seguras y cambios de juego rápidos para encontrar desguarnecida a la zaga local.',
    tacticalEn: 'Bosz will not compromise: high lines and attacking waves in the opposition half. Marino Pušić will look to weather the storm with crisp passing under pressure and quick switches of play.',
    keyFactorsEs: 'La contundencia en las áreas de un PSV ultraofensivo frente a la frialdad del Shakhtar en los metros finales.',
    keyFactorsEn: 'Box-to-box precision: whether PSV\'s ultra-attacking system can convert chances without leaving the back door ajar.'
  },
  {
    matchId: 'M15',
    teamA: 'BAY',
    teamB: 'BOD',
    date: '2026-09-10',
    titleEs: 'El gigante bávaro pone a prueba el sueño ártico del Bodø/Glimt',
    titleEn: 'Bavarian heavyweights test Bodø/Glimt\'s Arctic fairytale',
    introEs: 'El FC Bayern München debuta en casa en la Allianz Arena recibiendo a los noruegos del FK Bodø/Glimt. El equipo de Vincent Kompany buscará imponer su jerarquía y poderío desde el inicio, pero se enfrenta a un conjunto intrépido que no renuncia a su identidad ofensiva en ningún escenario.',
    introEn: 'FC Bayern München open their European account at the Allianz Arena against Norway\'s courageous FK Bodø/Glimt. Vincent Kompany\'s squad will aim to establish early dominance, yet face a fearless opponent that never abandons its proactive style.',
    tacticalEs: 'Kompany desplegará un asedio constante con extremos abiertos y llegadas masivas de segunda línea, mientras que Kjetil Knutsen intentará que su equipo mantenga la personalidad con la pelota y no se refugie exclusivamente en su área.',
    tacticalEn: 'Kompany will orchestrate relentless pressure with wide overloads and surging box arrivals, while Kjetil Knutsen demands brave possession play rather than retreating into a passive shell.',
    keyFactorsEs: 'La precisión en los últimos metros del Bayern y la resistencia física del conjunto noruego para aguantar el vendaval.',
    keyFactorsEn: 'Bayern\'s surgical precision in the final third and Bodø/Glimt\'s physical endurance to withstand sustained pressure.'
  },
  {
    matchId: 'M16',
    teamA: 'COM',
    teamB: 'RBL',
    date: '2026-09-10',
    titleEs: 'Noche histórica junto al lago: el Como de Cesc desafía a Leipzig',
    titleEn: 'Historic night by Lake Como: Fàbregas takes on RB Leipzig',
    introEs: 'El Stadio Giuseppe Sinigaglia vive una velada inolvidable con el debut histórico del Como 1907 en la Champions League. El proyecto liderado por Cesc Fàbregas afronta un examen de máxima exigencia continental frente al RB Leipzig de Marco Rose, uno de los conjuntos más intensos y verticales de Europa.',
    introEn: 'The Stadio Giuseppe Sinigaglia hosts an unforgettable milestone as Como 1907 make their historic Champions League debut. Cesc Fàbregas\'s visionary project faces the sternest possible test against Marco Rose\'s RB Leipzig, famed for their lightning transitions and athletic engine.',
    tacticalEs: 'Cesc apostará por la personalidad, el pase asociativo y la salida limpia desde atrás para desactivar el temible \'pressing\' redbulliano, mientras que Rose buscará robar en campo contrario para castigar con velocidad supersónica.',
    tacticalEn: 'Fàbregas will demand courage, intricate combinations, and clean build-up to defuse Leipzig\'s suffocating press, while Rose aims to force turnovers high up the pitch and strike in seconds.',
    keyFactorsEs: 'La madurez competitiva del Como en su gran estreno y la efectividad del Leipzig en sus transiciones rápidas.',
    keyFactorsEn: 'Como\'s emotional composure on their grand debut versus Leipzig\'s lethal efficiency when turning defense into attack.'
  },
  {
    matchId: 'M17',
    teamA: 'MUN',
    teamB: 'SAB',
    date: '2026-09-10',
    titleEs: 'El Teatro de los Sueños recibe al sorprendente Sabah FK',
    titleEn: 'Old Trafford stage set for Azerbaijani upstarts Sabah',
    introEs: 'El Manchester United arranca su campaña continental en Old Trafford ante el modesto pero combativo Sabah FK de Azerbaiyán. Los ‘Red Devils’ de Erik ten Hag tienen la obligación de brindar una victoria solvente y convincente ante su afición frente a un rival que vive el día más glorioso de su historia.',
    introEn: 'Manchester United launch their European journey at Old Trafford against Azerbaijan\'s spirited Sabah FK. Erik ten Hag\'s Red Devils are under heavy obligation to deliver an authoritative performance before their supporters against opponents living their finest hour.',
    tacticalEs: 'Ten Hag buscará imprimir un ritmo asfixiante con desborde exterior y llegadas desde segunda línea, mientras que Krunoslav Rendulić planteará un cerrojo solidario buscando la velocidad aislada a la contra.',
    tacticalEn: 'Ten Hag will demand high tempo and relentless wide delivery to break the deadlock early, while Krunoslav Rendulić sets up a disciplined low block seeking rare counter-attacking openings.',
    keyFactorsEs: 'Abrir el marcador pronto para evitar la ansiedad en Old Trafford ante un rival que defenderá con alma y vida.',
    keyFactorsEn: 'Scoring an early goal to dispel any Old Trafford anxiety against an underdog willing to defend with everything on the line.'
  },
  {
    matchId: 'M18',
    teamA: 'SLP',
    teamB: 'RCL',
    date: '2026-09-10',
    titleEs: 'Batalla de despliegue físico y presión en Praga',
    titleEn: 'Physical battleground and tactical engine clash in Prague',
    introEs: 'El Sinobo Stadium de Praga es testigo de un duelo de máxima intensidad entre el SK Slavia Praha y el Racing Club de Lens. Dos conjuntos reconocidos por su inagotable capacidad física, presión asfixiante y agresividad en los duelos individuales cierran la apasionante primera jornada de la Champions.',
    introEn: 'Prague\'s Sinobo Stadium witnesses a high-intensity battle between SK Slavia Praha and Racing Club de Lens. Two squads renowned for boundless engine capacity, unrelenting work-rate, and ferocious individual duels bring the curtain down on matchday one.',
    tacticalEs: 'Jindřich Trpišovský y Will Still comparten una filosofía de máxima entrega y verticalidad. Será un choque donde los duelos individuales hombre a hombre y el control de las segundas jugadas definirán el ganador.',
    tacticalEn: 'Jindřich Trpišovský and Will Still share an uncompromising philosophy of relentless pressing and direct transition. Second-ball dominance and individual duel winning percentages will prove decisive.',
    keyFactorsEs: 'La fortaleza en el juego aéreo, la disciplina táctica y el no cometer faltas peligrosas en zonas de influencia.',
    keyFactorsEn: 'Aerial combat, defensive concentration on second balls, and minimizing dangerous fouls around the penalty area.'
  }
];

function buildMarkdownContent(m, lang) {
  const isEs = lang === 'es';
  const stad = stadiumsMap.get(m.teamA);
  const stadiumName = stad?.stadiumName || 'Estadio Principal';
  const city = stad?.city || '';
  const capacity = stad?.capacity ? stad.capacity.toLocaleString(isEs ? 'es-ES' : 'en-US') : null;

  // Injury & condition notes
  const condsA = conditionsByTeam.get(m.teamA) || [];
  const condsB = conditionsByTeam.get(m.teamB) || [];

  let medicalNotes = '';
  if (isEs) {
    const listA = condsA.map(c => `**${c.playerName}** (${c.status === 'injured' ? 'Baja médica' : 'Duda'}: ${c.diagnosis || 'molestias'})`).join(', ');
    const listB = condsB.map(c => `**${c.playerName}** (${c.status === 'injured' ? 'Baja médica' : 'Duda'}: ${c.diagnosis || 'molestias'})`).join(', ');
    
    medicalNotes = '### Parte médico y novedades (Predicted11 / FútbolFantasy)\n';
    if (listA) {
      medicalNotes += `- **${m.teamA}**: ${listA}.\n`;
    } else {
      medicalNotes += `- **${m.teamA}**: Plantilla completa disponible sin bajas sensibles reportadas.\n`;
    }
    if (listB) {
      medicalNotes += `- **${m.teamB}**: ${listB}.\n`;
    } else {
      medicalNotes += `- **${m.teamB}**: Plantilla completa disponible sin bajas sensibles reportadas.\n`;
    }
  } else {
    const listA = condsA.map(c => `**${c.playerName}** (${c.status === 'injured' ? 'Out injured' : 'Doubtful'}: ${c.diagnosis || 'physical issue'})`).join(', ');
    const listB = condsB.map(c => `**${c.playerName}** (${c.status === 'injured' ? 'Out injured' : 'Doubtful'}: ${c.diagnosis || 'physical issue'})`).join(', ');
    
    medicalNotes = '### Team news and injuries (Predicted11 / FútbolFantasy)\n';
    if (listA) {
      medicalNotes += `- **${m.teamA}**: ${listA}.\n`;
    } else {
      medicalNotes += `- **${m.teamA}**: Full squad available with no significant injuries reported.\n`;
    }
    if (listB) {
      medicalNotes += `- **${m.teamB}**: ${listB}.\n`;
    } else {
      medicalNotes += `- **${m.teamB}**: Full squad available with no significant injuries reported.\n`;
    }
  }

  const title = isEs ? m.titleEs : m.titleEn;
  const intro = isEs ? m.introEs : m.introEn;
  const tactical = isEs ? m.tacticalEs : m.tacticalEn;
  const keyFactors = isEs ? m.keyFactorsEs : m.keyFactorsEn;

  const stadiumInfo = isEs
    ? `El encuentro se disputará en el **${stadiumName}**${city ? ` (${city})` : ''}${capacity ? `, con un aforo de **${capacity} espectadores**` : ''}. Un escenario de primer nivel continental para una jornada inaugural de la fase liga de 36 equipos donde cada gol y cada punto resultan cruciales para el pase al Top 8.`
    : `The clash takes place at **${stadiumName}**${city ? ` (${city})` : ''}${capacity ? ` before an official capacity of **${capacity} spectators**` : ''}. A top-tier European setting for the 36-club league phase where every goal and every point carries massive weight in the race for the automatic Top 8 spots.`;

  const tacticalHeading = isEs ? '### Pizarra táctica y duelo en los banquillos' : '### Tactical duel and dugout chess';
  const keysHeading = isEs ? '### Claves del partido y pronóstico' : '### Match keys and tactical outlook';

  return `---
matchId: ${m.matchId}
teamA: ${m.teamA}
teamB: ${m.teamB}
title: "${title}"
author: Redacción UCL
publishedAt: ${m.date}
---

## Previa

${intro}

## Crónica

${stadiumInfo}

${tacticalHeading}
${tactical}

${medicalNotes}
${keysHeading}
${keyFactors}
`;
}

function cleanOldFiles(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  const files = readdirSync(dir).filter(f => f.endsWith('.md') && f !== '_template.md');
  for (const f of files) {
    unlinkSync(join(dir, f));
  }
  console.log(`🧹 Eliminados ${files.length} archivos antiguos en ${dir}`);
}

function run() {
  console.log('🚀 Iniciando generación de crónicas y previas oficiales UCL 2026/27...');

  // 1. Limpiar previas del Mundial
  cleanOldFiles(ES_DIR);
  cleanOldFiles(EN_DIR);

  // 2. Generar Jornada 1 (M1..M18)
  for (const m of MATCHDAY_1_DATA) {
    const contentEs = buildMarkdownContent(m, 'es');
    const contentEn = buildMarkdownContent(m, 'en');

    writeFileSync(join(ES_DIR, `${m.matchId}.md`), contentEs, 'utf-8');
    writeFileSync(join(EN_DIR, `${m.matchId}.md`), contentEn, 'utf-8');
  }

  console.log(`✅ Creadas con éxito ${MATCHDAY_1_DATA.length} previas y crónicas (ES/EN) para la Jornada 1.`);

  // 3. Ejecutar scripts/build-previews.mjs para regenerar seed.ts
  console.log('🔨 Compilando a src/data/previews/seed.ts...');
  execSync('node scripts/build-previews.mjs', { stdio: 'inherit' });
  console.log('🎉 ¡Proceso finalizado! Las crónicas de Champions League quedaron actualizadas.');
}

run();
