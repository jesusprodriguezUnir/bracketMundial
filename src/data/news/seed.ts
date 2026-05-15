// Bundled fallback — shown when the external feed is unavailable (offline, unconfigured URL).
// The generate-news.mjs script regenerates this file with --write-seed.

import type { NewsItem } from '../../lib/news-service';

interface NewsFeed {
  updatedAt: string;
  items: Record<string, { es: NewsItem[]; en: NewsItem[] }>;
}

export const NEWS_SEED: NewsFeed = {
  updatedAt: '2026-05-15',
  items: {
    ESP: {
      es: [
        { title: 'España defiende el título de Europa en el Mundial 2026', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-14' },
        { title: 'La Roja convoca a Yamal y Pedri para el grupo H', url: 'https://www.rfef.es', source: 'RFEF', date: '2026-05-10' },
        { title: 'Grupo H: España, Cabo Verde, Arabia Saudita y Uruguay', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
      ],
      en: [
        { title: 'Spain defends European crown at the 2026 World Cup', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-14' },
        { title: 'La Roja calls up Yamal and Pedri for Group H', url: 'https://www.rfef.es', source: 'RFEF', date: '2026-05-10' },
        { title: 'Group H: Spain, Cape Verde, Saudi Arabia and Uruguay', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
      ],
    },
    ARG: {
      es: [
        { title: 'Argentina busca el bicampeonato con Messi como bandera', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-13' },
        { title: 'Scaloni confirma la convocatoria: Di María vuelve', url: 'https://www.afa.com.ar', source: 'AFA', date: '2026-05-08' },
        { title: 'Grupo J: Argentina, Argelia, Austria y Jordania', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
      ],
      en: [
        { title: 'Argentina chase back-to-back titles with Messi leading the way', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-13' },
        { title: 'Scaloni names squad: Di María returns', url: 'https://www.afa.com.ar', source: 'AFA', date: '2026-05-08' },
        { title: 'Group J: Argentina, Algeria, Austria and Jordan', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
      ],
    },
    FRA: {
      es: [
        { title: 'Francia presenta su lista definitiva: Mbappé capitán', url: 'https://www.fff.fr', source: 'FFF', date: '2026-05-12' },
        { title: 'Grupo I: Francia, Senegal, Irak y Noruega', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Deschamps prepara su último gran torneo al frente de Les Bleus', url: 'https://www.fff.fr', source: 'FFF', date: '2026-05-01' },
      ],
      en: [
        { title: 'France unveil their final squad: Mbappé as captain', url: 'https://www.fff.fr', source: 'FFF', date: '2026-05-12' },
        { title: 'Group I: France, Senegal, Iraq and Norway', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Deschamps prepares for his final major tournament with Les Bleus', url: 'https://www.fff.fr', source: 'FFF', date: '2026-05-01' },
      ],
    },
    BRA: {
      es: [
        { title: 'Brasil inicia el camino al Hexa en el Mundial 2026', url: 'https://www.cbf.com.br', source: 'CBF', date: '2026-05-11' },
        { title: 'Grupo C: Brasil, Marruecos, Haití y Escocia', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Vinicius Jr. lidera la nueva oleada del fútbol brasileño', url: 'https://www.cbf.com.br', source: 'CBF', date: '2026-05-01' },
      ],
      en: [
        { title: 'Brazil begin their quest for a sixth World Cup title in 2026', url: 'https://www.cbf.com.br', source: 'CBF', date: '2026-05-11' },
        { title: 'Group C: Brazil, Morocco, Haiti and Scotland', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Vinicius Jr. leads the new wave of Brazilian football', url: 'https://www.cbf.com.br', source: 'CBF', date: '2026-05-01' },
      ],
    },
    ENG: {
      es: [
        { title: 'Tuchel da forma a su primera lista con Inglaterra', url: 'https://www.thefa.com', source: 'The FA', date: '2026-05-10' },
        { title: 'Grupo L: Inglaterra, Croacia, Ghana y Panamá', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Kane y Bellingham, dueto de lujo para los Three Lions', url: 'https://www.thefa.com', source: 'The FA', date: '2026-05-01' },
      ],
      en: [
        { title: 'Tuchel names his first England squad', url: 'https://www.thefa.com', source: 'The FA', date: '2026-05-10' },
        { title: 'Group L: England, Croatia, Ghana and Panama', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Kane and Bellingham: luxury duo for the Three Lions', url: 'https://www.thefa.com', source: 'The FA', date: '2026-05-01' },
      ],
    },
    GER: {
      es: [
        { title: 'Alemania, motivada tras el buen Euro 2024 en casa', url: 'https://www.dfb.de', source: 'DFB', date: '2026-05-09' },
        { title: 'Grupo E: Alemania, Curazao, Costa de Marfil y Ecuador', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Nagelsmann apuesta por una Mannschaft joven y ambiciosa', url: 'https://www.dfb.de', source: 'DFB', date: '2026-05-01' },
      ],
      en: [
        { title: 'Germany fired up after their strong home Euro 2024', url: 'https://www.dfb.de', source: 'DFB', date: '2026-05-09' },
        { title: 'Group E: Germany, Curaçao, Ivory Coast and Ecuador', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Nagelsmann backs a young and ambitious Mannschaft', url: 'https://www.dfb.de', source: 'DFB', date: '2026-05-01' },
      ],
    },
    POR: {
      es: [
        { title: 'Portugal presenta a su nueva generación bajo las órdenes de Martínez', url: 'https://www.fpf.pt', source: 'FPF', date: '2026-05-08' },
        { title: 'Grupo K: Portugal, RD Congo, Uzbekistán y Colombia', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Ronaldo aspira a su primer Mundial en América del Norte', url: 'https://www.fpf.pt', source: 'FPF', date: '2026-05-01' },
      ],
      en: [
        { title: 'Portugal showcase their new generation under Martínez', url: 'https://www.fpf.pt', source: 'FPF', date: '2026-05-08' },
        { title: 'Group K: Portugal, DR Congo, Uzbekistan and Colombia', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Ronaldo aims for his first World Cup on North American soil', url: 'https://www.fpf.pt', source: 'FPF', date: '2026-05-01' },
      ],
    },
    MEX: {
      es: [
        { title: 'México ilusiona en su propio mundial: debut ante Sudáfrica en el Azteca', url: 'https://www.femexfut.org.mx', source: 'FMF', date: '2026-05-07' },
        { title: 'Grupo A: México, Sudáfrica, Corea del Sur y Rep. Checa', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'El Tri presenta su convocatoria para el Mundial en casa', url: 'https://www.femexfut.org.mx', source: 'FMF', date: '2026-05-02' },
      ],
      en: [
        { title: 'Mexico thrill on home soil: opener against South Africa at the Azteca', url: 'https://www.femexfut.org.mx', source: 'FMF', date: '2026-05-07' },
        { title: 'Group A: Mexico, South Africa, South Korea and Czech Republic', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'El Tri name their squad for the home World Cup', url: 'https://www.femexfut.org.mx', source: 'FMF', date: '2026-05-02' },
      ],
    },
    USA: {
      es: [
        { title: 'Estados Unidos, co-anfitrión con grandes aspiraciones bajo Pochettino', url: 'https://www.ussoccer.com', source: 'US Soccer', date: '2026-05-06' },
        { title: 'Grupo D: EE. UU., Paraguay, Australia y Turquía', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Pulisic y Reyna lideran la nueva generación de la USMNT', url: 'https://www.ussoccer.com', source: 'US Soccer', date: '2026-05-01' },
      ],
      en: [
        { title: 'USA, co-hosts with high ambitions under Pochettino', url: 'https://www.ussoccer.com', source: 'US Soccer', date: '2026-05-06' },
        { title: 'Group D: USA, Paraguay, Australia and Turkey', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Pulisic and Reyna spearhead the new USMNT generation', url: 'https://www.ussoccer.com', source: 'US Soccer', date: '2026-05-01' },
      ],
    },
    CAN: {
      es: [
        { title: 'Canadá, co-anfitrión, busca su primera fase eliminatoria mundialista', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Grupo B: Canadá, Bosnia y Herz., Catar y Suiza', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Davies lidera a los Maple Leafs en el mayor evento deportivo del país', url: 'https://www.canadasoccer.com', source: 'Canada Soccer', date: '2026-05-01' },
      ],
      en: [
        { title: 'Canada, co-hosts, aim for their first knockout stage at a World Cup', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Group B: Canada, Bosnia & Herzegovina, Qatar and Switzerland', url: 'https://www.fifa.com', source: 'FIFA', date: '2026-05-05' },
        { title: 'Davies leads the Maple Leafs at the biggest sporting event in the country', url: 'https://www.canadasoccer.com', source: 'Canada Soccer', date: '2026-05-01' },
      ],
    },
  },
};
