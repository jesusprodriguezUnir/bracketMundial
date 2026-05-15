import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Bloque de anuncio Google AdSense.
 * Usa Light DOM (no Shadow DOM) para que el script de AdSense pueda
 * detectar el elemento <ins class="adsbygoogle"> en el documento.
 */
@customElement('ad-block')
export class AdBlock extends LitElement {
  // Sin Shadow DOM: los nodos se insertan directamente en el light DOM
  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Evitar duplicados si el componente se reconecta
    if (this.querySelector('ins.adsbygoogle')) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.cssText = 'display:block;text-align:center;';
    ins.dataset['adClient'] = 'ca-pub-8196395794772309';
    ins.dataset['adSlot'] = '5275853927';
    ins.dataset['adFormat'] = 'auto';
    ins.dataset['fullWidthResponsive'] = 'true';
    this.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_e) {
      // AdSense puede lanzar si el script no está disponible en desarrollo
    }
  }
}
