// Bundled fallback news — shown when the external feed is unavailable (offline, unconfigured URL).
// Update this file with a few representative items so the tab is never blank.
// For weekly fresh content, configure FEED_URL in src/lib/news-service.ts.

import type { NewsItem } from '../../lib/news-service';

interface NewsFeed {
  updatedAt: string;
  items: Record<string, NewsItem[]>;
}

export const NEWS_SEED: NewsFeed = {
  updatedAt: '2026-05-15',
  items: {
    ESP: [
      {
        title: {
          es: 'España defiende el título de Europa en el Mundial 2026',
          en: 'Spain defends European crown at the 2026 World Cup',
        },
        url: 'https://www.fifa.com',
        source: 'FIFA',
        date: '2026-05-14',
      },
      {
        title: {
          es: 'La Roja convoca a Yamal y Pedri para el grupo H',
          en: 'La Roja calls up Yamal and Pedri for Group H',
        },
        url: 'https://www.rfef.es',
        source: 'RFEF',
        date: '2026-05-10',
      },
    ],
    ARG: [
      {
        title: {
          es: 'Argentina busca el bicampeonato con Messi como bandera',
          en: 'Argentina chase back-to-back titles with Messi leading the way',
        },
        url: 'https://www.fifa.com',
        source: 'FIFA',
        date: '2026-05-13',
      },
    ],
    FRA: [
      {
        title: {
          es: 'Francia presenta su lista definitiva: Mbappé capitán',
          en: 'France unveil their final squad: Mbappé as captain',
        },
        url: 'https://www.fff.fr',
        source: 'FFF',
        date: '2026-05-12',
      },
    ],
    BRA: [
      {
        title: {
          es: 'Brasil inicia el camino al Hexa en el Mundial 2026',
          en: 'Brazil begin their quest for a sixth World Cup title in 2026',
        },
        url: 'https://www.cbf.com.br',
        source: 'CBF',
        date: '2026-05-11',
      },
    ],
    ENG: [
      {
        title: {
          es: 'Tuchel da forma a su primera lista con Inglaterra',
          en: 'Tuchel names his first England squad',
        },
        url: 'https://www.thefa.com',
        source: 'The FA',
        date: '2026-05-10',
      },
    ],
    GER: [
      {
        title: {
          es: 'Alemania, motivada tras el buen Euro 2024 en casa',
          en: 'Germany fired up after their strong home Euro 2024',
        },
        url: 'https://www.dfb.de',
        source: 'DFB',
        date: '2026-05-09',
      },
    ],
    POR: [
      {
        title: {
          es: 'Portugal presenta a su nueva generación bajo las órdenes de Martínez',
          en: 'Portugal showcase their new generation under Martínez',
        },
        url: 'https://www.fpf.pt',
        source: 'FPF',
        date: '2026-05-08',
      },
    ],
    MEX: [
      {
        title: {
          es: 'México ilusiona en su propio mundial: debut ante Sudáfrica en el Azteca',
          en: 'Mexico thrill on home soil: opener against South Africa at the Azteca',
        },
        url: 'https://www.femexfut.org.mx',
        source: 'FMF',
        date: '2026-05-07',
      },
    ],
    USA: [
      {
        title: {
          es: 'Estados Unidos, co-anfitrión con grandes aspiraciones bajo Pochettino',
          en: 'USA, co-hosts with high ambitions under Pochettino',
        },
        url: 'https://www.ussoccer.com',
        source: 'US Soccer',
        date: '2026-05-06',
      },
    ],
  },
};
