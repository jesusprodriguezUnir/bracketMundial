import type { Player } from './index';

export const coach = 'Luis de la Fuente';
export const squad: Player[] = [
  // Porteros
  {
    number: 1,
    name: 'David Raya',
    position: 'GK',
    age: 30,
    club: 'Arsenal',
    bio: {
      es: "Del fútbol sala al Mundial pasando por las divisiones inferiores de Inglaterra, la carrera de Raya no se parece a ninguna otra. Tras empezar como jugador de campo en fútbol sala, se convirtió en portero en la academia del Cornellá en Barcelona. Luego llegó el traslado a Inglaterra a los 17 años. Es el primer jugador convocado por España que ha logrado dos ascensos en la EFL (con Blackburn y Brentford). En el Arsenal se ha consolidado como uno de los mejores porteros del mundo, tan rápido con los pies como con sus inusualmente grandes manos. En su espinillera izquierda lleva una foto de su debut internacional con España en 2022. Unai Simón tiene competencia.",
      en: "From futsal to the World Cup via England’s lower leagues, Raya’s career is unlike any other. After starting out as an outfield player in futsal he became a goalkeeper during his time in Cornellá’s academy in Barcelona. Then came the move to England aged 17. Perhaps unsurprisingly he is the first player to be called up by Spain who has won two promotions in the EFL, first from League One to the Championship with Blackburn and then to the Premier League with Brentford. At Arsenal he has established himself as one of the best goalkeepers in the world – as quick-thinking with his feet as he is with his unusually large hands. On his left shinpad he has a picture of his international debut with Spain in 2022, passing the ball with his feet of course. Unai Simón has a fight on his hands."
    },
    special: "Former futsal player"
  },
  {
    number: 13,
    name: 'Joan García',
    position: 'GK',
    age: 25,
    club: 'Barcelona',
    bio: {
      es: "García se ha convertido en uno de los porteros más destacados de La Liga. Tras darse a conocer en la lucha por el descenso con el Espanyol, el catalán fichó por el Barcelona. El director deportivo, Deco, no dudó en pagar la cláusula de rescisión de 25 millones de euros por uno de los guardametas mejor valorados de Europa. Pero García no llegó al Barcelona para ser suplente de Marc-André ter Stegen, sino todo lo contrario. Se siente destinado a ser el número 1 del Barcelona y de España en los próximos años. Tras no ser convocado en otoño, Luis de la Fuente lo llamó en marzo y debutó precisamente en el campo del Espanyol, donde recibió algunos silbidos por cambiar de club en la ciudad.",
      en: "García has become one of the standout goalkeepers in La Liga. After making a name for himself in a relegation battle with Espanyol, the Catalan signed for neighbours Barcelona. The sporting director, Deco, had no qualms in paying the €25m release clause for one of the most highly-rated goalkeepers in Europe. But García did not come to Barcelona to be backup to Marc-André ter Stegen – the opposite. He felt he was destined to be No 1 for Barcelona and Spain in the years to come. After missing out in the autumn international breaks, the 25-year-old was handed a call-up by Luis de la Fuente in March and his first cap came at Espanyol’s home ground, although he was whistled by some members of the crowd for his move across town to Barcelona."
    }
  },
  {
    number: 23,
    name: 'Unai Simón',
    position: 'GK',
    age: 28,
    club: 'Athletic Club',
    bio: {
      es: "Uno de los mayores logros de Luis de la Fuente ha sido la regularidad en la portería. Simón paró dos penaltis en la tanda de la final de la Nations League 2023 contra Croacia. 'Me alegro especialmente por Unai, al que se ha maltratado durante mucho tiempo. Espero que la gente reconozca lo valioso que es', dijo De la Fuente entonces. Simón fue titular el verano siguiente cuando España ganó la Eurocopa 2024, jugando con dolor tras romperse un ligamento de la muñeca. De momento, sigue siendo el número 1 a pesar del gran nivel de David Raya y Joan García.",
      en: "One of Luis de la Fuente’s biggest achievements has been the consistency in goal – despite not being so sure about Simón at youth level. Antonio Sivera got the nod in the first game of the 2019 Under-21 Euros, which Spain lost to Italy. Simón started the next few games as De la Fuente’s side went on to win the trophy. There have been few doubts at senior level. Simón saved two penalties in the shootout victory over Croatia in the 2023 Nations League final. “I’m especially pleased for Unai, who has been mistreated for a long time. I hope people recognise how valuable he is,” De la Fuente said at the time. Simón was between the posts the following summer when Spain won Euro 2024, playing through the pain after rupturing a ligament in his wrist. For the moment he’s still the No 1 despite the rise of David Raya and Joan García."
    },
    special: "No 1 goalkeeper"
  },
  // Defensores
  {
    number: 2,
    name: 'Marc Pubill',
    position: 'DF',
    age: 22,
    club: 'Atlético Madrid',
    bio: {
      es: "El defensa de 22 años se ha ganado un billete al Mundial superando a nombres como Dean Huijsen o su compañero en el Atlético Robin Le Normand. El exjugador de la cantera del Espanyol y del Levante descendió con el Almería el verano en que España se coronaba campeona de Europa, pero su rendimiento llamó la atención del Atlético de Madrid. 'Me enamoré del Atlético en una semana', dijo tras unirse. Se ha convertido en una figura de confianza en la zaga de Diego Simeone. Pubill llega a la selección absoluta como campeón olímpico en París 2024 y puede jugar tanto de central como de lateral derecho.",
      en: "The 22-year-old uncapped defender has beaten the likes of Dean Huijsen and his Atlético teammate Robin Le Normand, who won Euro 2024 with Spain, to a seat on the plane. It has been some rise for Pubill. The former Espanyol and Levante academy player was relegated with Almería the summer his country were crowned champions of Europe but his performances in the second tier were enough for Atlético to come calling. “I fell in love with Atlético within a week,” he said after joining and has become a trusted figure in Diego Simeone’s backline, starting all but one of their Champions League knockout matches en route to the semi-finals. Pubill steps into the senior setup as an Olympic champion with Spain’s Under-23s at Paris 2024 and can provide cover at centre-back or right-back."
    }
  },
  {
    number: 3,
    name: 'Álex Grimaldo',
    position: 'DF',
    age: 31,
    club: 'Bayer Leverkusen',
    bio: {
      es: "Hay pocos laterales en el fútbol mundial capaces de registrar dobles dígitos en goles y asistencias en una sola temporada. Grimaldo lo logró por segunda vez en Alemania, siendo clave en el doblete de liga y copa del Leverkusen en 2023-24. A pesar de esto, sigue siendo uno de los jugadores más consistentes y respetados, tras superar numerosos problemas de lesiones (que incluso le llevaron a contratar un chef personal en Alemania). Es un especialista a balón parado, con un golpeo que recuerda a Juninho Pernambucano o Cristiano Ronaldo. Se espera que sea el suplente de Cucurella este verano.",
      en: "There are few full-backs in world football who are capable of registering double figures for goals and assists in a single season. Grimaldo has just done that for a second time in Germany having been a major contributor to Leverkusen’s league and cup double-winning side of 2023-24. And yet none of Europe’s heavyweights have decided to pursue him in the transfer market. Nonetheless the 30-year-old is one of the most consistent performers around and well respected by his peers after battling back from numerous injury problems – ones that forced him to fly out a personal chef to Germany. Grimaldo is a dead-ball specialist and strikes the ball like Juninho Pernambucano and Cristiano Ronaldo used to, although he has admitted that this technique can cause injuries if you do not execute it well. He’s expected to be backup to Cucurella this summer."
    },
    special: "Dead-ball specialist"
  },
  {
    number: 4,
    name: 'Eric García',
    position: 'DF',
    age: 24,
    club: 'Barcelona',
    bio: {
      es: "Nadie en el Barcelona ve a García simplemente como un defensa central. El canterano de La Masía, que jugó para el Manchester City de Pep Guardiola a una edad temprana, se ha ganado la confianza de Hansi Flick por su polivalencia. Puede jugar de central, mediocentro o lateral derecho. 'Eric ha estado conmigo en la Sub-19, Sub-21, los Juegos Olímpicos... Es un jugador polivalente y muy admirado por la Federación y por mí especialmente', afirma Luis de la Fuente. Una figura clave en las categorías inferiores de España que ahora se asienta en la absoluta.",
      en: "Nobody at Barcelona sees García simply as a centre-back. The graduate of La Masía, who played for Pep Guardiola’s Manchester City at a young age, has won the trust of Hansi Flick thanks to his ability to adapt to different positions. He can play in the middle of the back four but also as a central midfielder and a right-back, never looking out of his depth – something Luis de la Fuente values greatly. “Eric has been with me in the Under-19s, Under-21s, the Olympics … He’s a versatile player and very admired by the Federation and by me especially,” the head coach says. A key figure for years in Spain’s youth teams, now García is making the grade with the senior side."
    }
  },
  {
    number: 5,
    name: 'Marcos Llorente',
    position: 'DF',
    age: 31,
    club: 'Atlético Madrid',
    bio: {
      es: "Llorente llega a su primer Mundial como una figura polarizadora. El polivalente jugador del Atlético de Madrid, clave para Simeone en el centro del campo y la defensa, es muy activo en redes sociales mostrando su increíble físico. También es conocido por promover teorías alternativas sobre los 'chemtrails', las cremas solares y la luz artificial 'tóxica' (usa gafas con cristales tintados de amarillo y rojo para 'proteger su biología'). Aunque criticado por científicos, ha creado tendencia en el fútbol: jugadores como Haaland, Griezmann o Morata también usan gafas tintadas.",
      en: "Llorente arrives at his first World Cup as a polarising figure. The versatile player, who has become a key man under Diego Simeone at Atlético in midfield and defence, is an active user of social media, often showing off how he looks after his incredible physique. But he has also been known to fuel conspiracy theories about chemtrails, suncream and what he calls “toxic” artificial light, saying he wears yellow and red-tinted glasses to “protect his biology”. His comments have been criticised by the scientific community and the Spanish government but Llorente has become a trendsetter within football – players such as Erling Haaland, Antoine Griezmann and Álvaro Morata all wear tinted glasses like him."
    },
    special: "Polarising figure"
  },
  {
    number: 12,
    name: 'Pedro Porro',
    position: 'DF',
    age: 26,
    club: 'Tottenham',
    bio: {
      es: "Agresivo en la transición, atento a las tareas defensivas y ambicioso en ataque, Porro reúne todas las cualidades del lateral moderno. Se le conoce como un 'jugador de calle' por su espíritu competitivo y su entrega. Proveniente de Don Benito (Extremadura), su paso por el Tottenham ha completado su madurez deportiva. Tras el fin de la era de Carvajal y Navas, tiene una oportunidad inmejorable para consolidarse en la selección.",
      en: "Aggressive in the transition, alert to his defensive responsibilities and ambitious going forward, Porro has developed all the attributes of the modern full-back. He’s also known as a ‘jugador de calle’ (a street player) because of his competitive spirit and willingness to do anything for his team. These are often traits of people who come from Don Benito, a rural part of Extremadura in western Spain. Being mired in a relegation battle with Tottenham has only added to his education as an athlete, both on and off the pitch. In high-pressure situations, he always responds. With the duopoly of Dani Carvajal and Jesús Navas over, he has the opportunity to shine for the national team."
    },
    special: "Street player"
  },
  {
    number: 14,
    name: 'Aymeric Laporte',
    position: 'DF',
    age: 32,
    club: 'Athletic Club',
    bio: {
      es: "'Jugar para España ha sido lo mejor que me ha pasado en mi carrera', dijo Laporte tras ganar la Nations League en 2023, formando pareja con Robin Le Normand. El impacto de Laporte en la defensa española desde su nacionalización en 2021 ha sido inmenso. De la Fuente siguió contando con él tras su marcha al Al-Nassr de Arabia Saudí, siendo titular en la Eurocopa 2024. Regresó al Athletic Club el pasado verano y aporta una veteranía fundamental en una zaga con jóvenes como Pau Cubarsí y Dean Huijsen.",
      en: "“Playing for Spain has been the best thing to happen to me in my career,” Laporte said after winning the Nations League in 2023, playing in a defensive partnership with Robin Le Normand, another naturalised Frenchman. Laporte’s impact on Spain’s defence since his switch of allegiance in 2021 has been immense. De la Fuente continued to pick him after he left Manchester City for Al-Nassr in Saudi Arabia, with the centre-back trusted to start alongside Le Normand on Spain’s way to the Euro 2024 title. He returned to Athletic Club last summer and is a permanent fixture in Ernesto Valverde’s backline. With Spain he provides much-needed experience in defensive ranks that include youngsters Pau Cubarsí and Dean Huijsen."
    }
  },
  {
    number: 22,
    name: 'Pau Cubarsí',
    position: 'DF',
    age: 19,
    club: 'Barcelona',
    bio: {
      es: "Con solo 19 años, Cubarsí se ha convertido en el líder de la defensa del Barcelona. La salida de Iñigo Martínez el pasado verano le dio galones con Hansi Flick, pasando de ser el aprendiz a organizar la línea defensiva. Aunque ha tenido baches (como una expulsión ante el Atlético en Champions), De la Fuente lo considera ya un potencial titular en la selección. Llega al Mundial tras conquistar su segunda Liga con el Barça.",
      en: "At just 19 years old, Cubarsí has become the leader of Barcelona’s defence. The departure of Iñigo Martínez last summer gave the youngster a new status within Hansi Flick’s squad: he stopped being the young apprentice learning off the senior players beside him and started marshalling the defence himself. It has not always gone to plan, a red card against Atlético Madrid in the Champions League a case in point. But his stature in the selección has changed as well, with Luis de la Fuente now considering him a possible starter. Now the coach must decide whether to play him alongside the experience of Aymeric Laporte or gamble with the young pairing of Cubarsí and Dean Huijsen. Comes into the World Cup having just won his second La Liga title."
    },
    special: "Young leader"
  },
  {
    number: 24,
    name: 'Marc Cucurella',
    position: 'DF',
    age: 28,
    club: 'Chelsea',
    bio: {
      es: "El lateral izquierdo se ha convertido en un líder inesperado de la selección. Fue clave en el triunfo de la Eurocopa 2024, asistiendo a Oyarzabal en el gol de la victoria en la final. En el Chelsea ha pasado de ser criticado por el precio de su traspaso (60M€) a ser uno de los jugadores más respetados del club. Su incansable recorrido por la banda y su agresividad en los duelos lo hacen indispensable para Luis de la Fuente.",
      en: "The left-back has become a surprise leader of this Spain team. He was key to the Euro 2024 triumph, setting up Mikel Oyarzabal’s winner in the final, and is now one of the main figures in the buildup to the World Cup. At Chelsea he has gone from being a target of ridicule for his €60m transfer fee to one of the most respected players at the club – even during a difficult season his starting place has been undisputed. His stamina on the wing and ferocity in challenging for the ball have made him such an important player for Luis de la Fuente too. Last year Cucurella and his wife Claudia opened up to the media about their family life and the challenges of being a parent to his autistic son."
    }
  },
  // Volantes
  {
    number: 6,
    name: 'Mikel Merino',
    position: 'MF',
    age: 30,
    club: 'Arsenal',
    bio: {
      es: "Una fractura de estrés en el pie sufrida en enero contra el Manchester United le apartó de la segunda mitad de temporada, pero no de este torneo, ya que De la Fuente siempre dejó claro que Merino era intocable. Fue el héroe del partido de cuartos de la Eurocopa al marcar en el último minuto de la prórroga contra Alemania. Su celebración emulando la de su padre Miguel con Osasuna en el mismo estadio 33 años antes quedó grabada en la memoria colectiva del fútbol español.",
      en: "A stress fracture of the foot sustained against Manchester United in January – and the surgery required to repair it – ruled Merino out of much of the second half of the season, but not this tournament, with Luis de la Fuente always making it clear that the attacking midfielder remained part of his plans. Merino started the last six World Cup qualifiers, his importance to the national team growing in tandem with his goalscoring output. He demonstrated his attacking impact in one of the defining moments of the last Euros, with a goal in the final minute of extra time against Germany in Stuttgart. His celebration, twirling the corner flag, just as his father Miguel had done with Osasuna in the same stadium 33 years earlier in the Uefa Cup, became an unforgettable image of Spanish success. In 2020 the San Sebastián restaurant Txuleta named him winner of their Txuleta Award as Real Sociedad’s best player, though the pandemic and a hectic diary meant he did not pick up his prize of two large steaks and a slap-up dinner until 2022."
    }
  },
  {
    number: 8,
    name: 'Fabián Ruiz',
    position: 'MF',
    age: 30,
    club: 'Paris St-Germain',
    bio: {
      es: "El espigado centrocampista, cuya madre trabajaba como limpiadora en las instalaciones del Real Betis donde él jugaba, se ha convertido en uno de los mejores de Europa. Destacó en el Betis con Quique Setién y se marchó al Nápoles por 30M€. En Italia se hizo un jugador total, con un elegante pie izquierdo y gran llegada. Ganó la Champions con el PSG en 2025 y la Eurocopa en 2024. Afronta su primer Mundial en plena madurez deportiva.",
      en: "The skinny midfielder whose mother used to work as a cleaner at the Real Betis training ground where he played has become one of Spain and Europe’s best. Given his chance at Betis by Quique Setién, the Andalusian club cashed in with a €30m sale to Napoli in 2018. Ruiz’s time in Italy turned him into a complete midfielder – an elegant left foot, a powerful strike and a nose for goal. He made his Spain debut in 2019 and was a regular under Luis Enrique, despite missing out on the squad for the 2022 World Cup. He is now playing his club football under Enrique, of course, and the pair won the Champions League in 2025, a year after Ruiz lifted the Euros under De la Fuente in Germany. After a season hampered by injuries, the 30-year-old will play in his first World Cup and Real Madrid and Barcelona will be taking a keen interest in his performances."
    }
  },
  {
    number: 9,
    name: 'Gavi',
    position: 'MF',
    age: 22,
    club: 'Barcelona',
    bio: {
      es: "Gavi es el corazón de cualquier equipo en el que juegue, ya sea el Barcelona o la selección, aunque sus entrenadores deben protegerlo. Dos graves lesiones consecutivas (rotura de ligamento cruzado en 2023 y luego problemas de menisco) amenazaron con frenar su carrera, pero sigue siendo el ojito derecho de Hansi Flick y de Luis de la Fuente, quienes valoran su entrega y su innegable talento como pocos en el fútbol moderno.",
      en: "Gavi is the beating heart of any team he plays in, whether that’s Barcelona or Spain, but he has to be protected by his coaches. Two serious injuries – rupturing his anterior cruciate ligament in 2023 and then a meniscus problem in the same knee – threatened to stall his young career but they have not stopped him becoming a favourite with Hansi Flick and Luis de la Fuente. Flick has repeatedly shown up for photo shoots with Gavi’s name on a Barcelona shirt while he is out injured; De la Fuente brought him to the Euro 2024 final so he could be part of the celebrations. There are few Spanish midfielders as talented and hard-working as Pablo Martín Páez Gavira – and both coaches know it."
    }
  },
  {
    number: 10,
    name: 'Dani Olmo',
    position: 'MF',
    age: 27,
    club: 'Barcelona',
    bio: {
      es: "Olmo sigue buscando la regularidad en el Barcelona y la selección. Aporta una polivalencia tremenda que Hansi Flick y Luis de la Fuente aprecian, pudiendo jugar de extremo, interior o mediapunta (su posición preferida). De la Fuente siempre ha confiado en él, convocándolo desde que Olmo dejó el Barcelona para marcharse al Dinamo de Zagreb con solo 17 años.",
      en: "Olmo is still trying to prove himself as a starter with Barcelona and Spain; inconsistency is what is holding him back from being an important player for both teams. He does, however, have a quality that is useful to both Hansi Flick and Luis de la Fuente: that of adapting to different roles in midfield and attack. He’s played as a winger and in a midfield three, also as the creative half of a two-man pivot. But No 10 is his preferred position and De la Fuente might just have an opening in that department at the World Cup after Mikel Merino’s fitness problems. De la Fuente has always had his eye on Olmo, even after he left Barcelona for Dinamo Zagreb at the age of 17: the Spain coach, then in charge of the Under-19s, never failed to call him up."
    }
  },
  {
    number: 15,
    name: 'Álex Baena',
    position: 'MF',
    age: 24,
    club: 'Atlético Madrid',
    bio: {
      es: "Dos factores explican el éxito en la carrera de Baena: la perseverancia de su familia para que no abandonara el Villarreal cuando tenía morriña de su Almería natal, y conocer a Míchel en el Girona, donde explotó su visión de juego y su inteligencia táctica. Firmó 14 asistencias en la temporada 2023-24 y el Atlético de Madrid pagó 32M€ por él el pasado verano. De la Fuente es uno de sus grandes valedores.",
      en: "There are two key reasons why Baena’s career has flowered as it has. One is the perseverance of his family in convincing him to stick it out at Villarreal when he was homesick after leaving his home city of Almería. The second was meeting Míchel, whom he played under for a season at Girona on loan from Villarreal. He played 38 games that year, scoring five goals, and showed off his impressive vision and tactical intelligence as an attacking midfielder. Unai Emery and Marcelino helped produce a player whose focus is more on setting up goals than scoring them. Baena registered 14 assists in the 2023-24 season, earning a call-up for Euro 2024. Last summer Atlético paid €32m for his services – his first season has been inconsistent but De la Fuente likes him a lot."
    }
  },
  {
    number: 16,
    name: 'Rodri',
    position: 'MF',
    age: 23,
    club: 'Manchester City',
    bio: {
      es: "El primer Balón de Oro de España desde 1960 llega a este Mundial rodeado de incógnitas sobre su estado físico, tras romperse el ligamento cruzado anterior en septiembre de 2024. Las lesiones musculares han dificultado su vuelta a la regularidad. Si está en plenas condiciones, será el ancla titular indiscutible de la selección por delante de Martín Zubimendi.",
      en: "Spain’s first Ballon d’Or winner since 1960 arrives at this World Cup with a couple of question marks hanging over him. One is whether he can put to bed doubts over his fitness that have been lingering since he ruptured his anterior cruciate ligament in September 2024. Muscle injuries have hampered his return to full fitness despite Pep Guardiola’s best efforts at managing his minutes this season. After returning to his best at times for Manchester City, injury problems affected his end to the campaign and it remains to be seen what sort of condition he will be in for the World Cup. If he’s fit, he will start ahead of Martín Zubimendi. But if he’s anything short of 100%, Luis de la Fuente will have a decision to make because of the form of the Arsenal player."
    },
    special: "Ballon d'Or winner"
  },
  {
    number: 18,
    name: 'Martín Zubimendi',
    position: 'MF',
    age: 27,
    club: 'Arsenal',
    bio: {
      es: "Otro producto de la factoría de centrocampistas de precisión que ha hecho de España una potencia desde 2008. Sus virtudes son la disciplina, el rigor táctico y la toma de decisiones bajo presión. Al igual que Xabi Alonso o Busquets, ayuda a la defensa y distribuye con criterio a los atacantes. Su gran rendimiento en la Real Sociedad le valió su fichaje por el Arsenal. Si Rodri flaquea, Zubimendi está listo para dirigir el timón español.",
      en: "Another off the production line of midfield robots that have made Spain a force since 2008. Among his assets are professionalism, discipline and good decision-making, especially under pressure. Zubimendi is the Basque version of what is produced in Barcelona’s La Masía. Like Alonso and Busquets, he is a footballer capable of lending a hand to his defence but also distributing the ball to his most dangerous attackers. The biggest clubs in the world always want a player like him and Arsenal have reaped the rewards of his consistency across his first season since signing from Real Sociedad. If Rodri’s fitness falters, like it did in the Euro 2024 final, Zubimendi is capable of running Spain’s midfield himself."
    },
    special: "Mr Consistent"
  },
  {
    number: 20,
    name: 'Pedri',
    position: 'MF',
    age: 23,
    club: 'Barcelona',
    bio: {
      es: "Pedri llega al Mundial con ganas de revancha tras perderse el tramo final de la Eurocopa 2024 por una lesión ante Alemania. De la Fuente le veía originalmente como mediapunta, pero Hansi Flick le ha retrasado al doble pivote en el Barcelona, donde acaba de ganar su tercera Liga. 'Es la posición donde más cómodo me siento, toco mucho el balón', reconoce Pedri sobre este nuevo rol que De la Fuente ha tomado nota para la selección.",
      en: "Pedri may have an axe to grind at the World Cup after missing out on the latter stages of Spain’s run to win Euro 2024 after his injury in the quarter-final against Germany. Luis de la Fuente used to think the Tenerife native was best as a No 10 but Hansi Flick has moved him into a deeper position at Barcelona, where the 23-year-old has just won his third league title. “It’s the position I’ve felt most comfortable in throughout my short career. I touch the ball a lot there,” Pedri has said of his deep-lying role. And De la Fuente has taken note, playing Pedri closer to Rodri or Martín Zubimendi. Fabián Ruiz is the main competitor for a place in the side and Pedri might just have the edge."
    },
    special: "Tempo-setter"
  },
  // Delanteros
  {
    number: 7,
    name: 'Ferran Torres',
    position: 'FW',
    age: 26,
    club: 'Barcelona',
    bio: {
      es: "Ya sea como extremo o delantero centro, Torres siempre ha respondido con goles desde que De la Fuente asumió el cargo. 'Conocí a Ferran con 16 años, estuvo conmigo en la Sub-18, Sub-20, Sub-21. Le conozco perfectamente y su capacidad para jugar en varias posiciones', dijo el técnico. Confiable, trabajador y con un olfato goleador contrastado (incluyendo un hat-trick ante Alemania en 2020).",
      en: "Whether as a winger or a central striker, Torres has been among the goals (seven at the time of writing) since Luis de la Fuente took over as Spain’s head coach. “I met Ferran when he was 16. He was with me in the Under-18s, Under-20s, Under-21s,” De la Fuente said. “I know him perfectly, I know the ability that he has to play in different positions. Of course the focus is often on other players and our Spanish players are not valued. He’s always reliable and sometimes brilliant.” The 26-year-old has earned the respect of his teammates too in recent years with his selfless play off the ball, not to mention his adept finishing when found in the box. A hat-trick against Germany and Manuel Neuer in 2020 remains his standout moment in a Spain shirt."
    }
  },
  {
    number: 11,
    name: 'Yéremy Pino',
    position: 'FW',
    age: 24,
    club: 'Crystal Palace',
    bio: {
      es: "Pino volaba a los 18 ganando la Europa League con el Villarreal y debutando con la selección absoluta, hasta que a los 21 se rompió el cruzado. 'Tuve momentos de mucha duda, no sabía si volvería a ser el mismo', admitió. Tras una dura rehabilitación y demostrar su resiliencia, fichó por el Crystal Palace por 26 millones de libras. Destaca por su desborde, verticalidad y polivalencia en todo el frente de ataque.",
      en: "Pino was flying at 18: the Villarreal academy graduate winning the Europa League in his first season and making his senior Spain breakthrough. He looked unstoppable until, in 2023 aged 21, he tore the anterior cruciate ligament in his left knee. \"I had real moments of doubt and uncertainty, not knowing if I'd be able to return the same or not,\" he said. \"During rehab I remember Mikel Oyarzabal telling me: ‘Learn from the process, that it's very beautiful’. At first I didn’t understand him, I thought it was shit. But over time I saw that yes, you have to learn from it.” He made it back, proved his resilience and, last year, earned a £26m move to Crystal Palace. His league form at Palace, trying to fill Eberechi Eze's boots, has been mixed, but he stood out in their Conference League victory in May, striking both posts with a free-kick in the final. He'll be a busy, creative threat if he gets a chance this summer, and he's ready to be versatile. \"The gaffer knows I can play on either flank, through the middle, or as a second striker. I am at his disposal to play right-back if necessary.\""
    }
  },
  {
    number: 17,
    name: 'Nico Williams',
    position: 'FW',
    age: 23,
    club: 'Athletic Club',
    bio: {
      es: "Williams fue uno de los pilares del éxito de España en la Eurocopa 2024. Decidió renovar con el Athletic en lugar de fichar por el Barcelona tras un largo serial de traspasos. Ha tenido una temporada complicada por lesiones musculares, pero su velocidad y regate lo hacen uno de los extremos más temidos de Europa. Sigue los pasos de su hermano Iñaki (que jugó el Mundial con Ghana) disputando una Copa del Mundo.",
      en: "Williams was one of the pillars of Spain’s success at Euro 2024. He then decided to extend his contract at his boyhood club, Athletic, instead of signing for Barcelona after a transfer saga that lasted months but this season was not kind to him. A groin injury has hampered his progress after becoming one of Europe’s most feared dribblers and he missed out on Spain’s friendlies in March. After seeing a specialist about his groin, the 23-year-old will follow his brother Iñaki – who played for Ghana in 2022 – in appearing at a World Cup. Fitness issues to both Williams and Lamine Yamal mean there are questions over whether the dynamic duo can be as influential as they were in 2024. Nico’s mother, Maria, was pregnant with Inaki when she and their father Felix set off from Ghana and walked barefoot across the Sahara in search of a better life in Spain."
    }
  },
  {
    number: 19,
    name: 'Lamine Yamal',
    position: 'FW',
    age: 19,
    club: 'Barcelona',
    bio: {
      es: "La gran promesa del fútbol español se ha convertido en una superestrella mundial. Tras quedar segundo en el Balón de Oro del año pasado, el extremo del Barcelona es el líder ofensivo indiscutible de su club y de la selección. De regate indescifrable y descaro único, Yamal ha roto todos los récords de precocidad con España desde su debut y gol con 16 años y 57 días.",
      en: "Spanish football’s rising star has become one of world football’s superstars. After finishing second in the Ballon d’Or standings to Ousmane Dembélé last year the Barcelona winger was already setting his sights on the top prize. Despite winning his second consecutive league title, it has not been a straightforward season for the 18-year-old, who caused a spat with Real Madrid before and after last October’s clásico and has missed spells – including the final weeks of the campaign – with injury. However, there’s no doubt now that he is Barcelona and Spain’s talisman. If he avoids further fitness issues and leads La Roja to glory in North America, he will be many people’s pick for this year’s Ballon d’Or. The son of a Guinean mother and a Moroccan father, Yamal has broken records throughout his career, including becoming the youngest person to play and to score for Spain at 16 years and 57 days."
    },
    special: "Super star"
  },
  {
    number: 21,
    name: 'Mikel Oyarzabal',
    position: 'FW',
    age: 29,
    club: 'Real Sociedad',
    bio: {
      es: "Nadie ha crecido tanto en la selección como Mikel Oyarzabal tras marcar el gol del título de la Eurocopa 2024 ante Inglaterra. Ha pasado de revulsivo a ser el delantero titular indiscutible. Llega a su primer Mundial (se perdió el de 2022 por lesión de cruzado) en el mejor momento goleador de su carrera. Fuera del campo, es graduado en Administración y Dirección de Empresas.",
      en: "No one in the Spanish national team has grown more since Euro 2024 than Mikel Oyarzabal. His 86th-minute goal in the final against England propelled him to stardom, and since then, his performances and confidence have only continued to improve. He started that tournament as a substitute, but since then has become an undisputed starter. He arrives at his first World Cup – he missed 2022 after tearing the anterior cruciate ligament in his left knee, which kept him out for nine months – in exceptional form, having banked his most prolific season at club level and scored 11 goals in the his 10 internationals before the squad was named. Oyarzabal has a degree in business administration, having combined his studies with football. “There were days when I was tired when I got to class, or I was depressed because we had lost, but it was a good way to disconnect with football,” he said. While not particularly tall – he measures 1.79m  - Oyarzabal wears size 12 boots . “People are curious but you get used to it,” he says. “I’ve had big feet since I was very young.”"
    }
  },
  {
    number: 25,
    name: 'Víctor Muñoz',
    position: 'FW',
    age: 23,
    club: 'Osasuna',
    bio: {
      es: "Muñoz es la gran sorpresa en la lista de Luis de la Fuente. El extremo de 22 años explotó en Osasuna tras salir de la cantera del Real Madrid. Con una velocidad punta de 35 km/h, destaca por su verticalidad, regate y desmarque a la espalda de la defensa. Debutó marcando ante Serbia en marzo y aportará frescura y desborde desde el banquillo.",
      en: "Muñoz is the surprise inclusion in Luis de la Fuente’s squad. The 22-year-old winger has enjoyed a breakthrough season at Osasuna after leaving Real Madrid, who still own 50% of his rights. Having clocked 35km/h this campaign, he is one of the fastest players in La Liga and makes very dangerous runs in behind. A direct dribbler, Muñoz could make a real difference off the bench for Spain this summer. He scored on his first cap in March, a 3-0 win against Serbia. “It would be a dream,” he said after that game when asked about the possibility of going to the World Cup, “but I’m concentrating on the day to day, on working hard, improving, enjoying the process and, if it has to happen, I’m sure it’ll happen.”"
    }
  },
  {
    number: 26,
    name: 'Borja Iglesias',
    position: 'FW',
    age: 33,
    club: 'Celta Vigo',
    bio: {
      es: "Iglesias explotó tarde, a los 25 años en el Espanyol, fichando luego por el Betis por 28M€ donde ganó la Copa del Rey y debutó con la selección en 2022. Tras ganar la Bundesliga en su breve cesión al Leverkusen, 'El Panda' vive una segunda juventud en el Celta. Aporta un perfil de delantero de espaldas y fijador de centrales idóneo como recurso ofensivo de área.",
      en: "Iglesias didn’t get his big break until the age of 25 when he scored 17 top-flight goals in a season for Espanyol. Real Betis shelled out €28m to sign him in 2019 and he established himself as one of La Liga’s best strikers, winning the Copa del Rey and making his international debut in 2022. While in Seville he became great friends with the likes of Aitor Ruibal and Héctor Bellerín, appearing alongside them to promote social causes and call out homophobia in football. After returning from a short spell at Bayer Leverkusen with a Bundesliga medal, Iglesias is now enjoying a new lease of life at Celta. Spain need a striker of his profile – able to hold up the ball with his back to play. “El Panda” isn’t expected to start at the World Cup due to the form of Mikel Oyarzabal but is a very good back-up option for Luis de la Fuente to have."
    }
  }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [23, 3, 22, 14, 5, 16, 8, 20, 17, 21, 19]
};
