import { toJpeg } from 'html-to-image';

const EXPORT_WIDTH_PX = 794;
const EXPORT_PIXEL_RATIO = 1.25;
const EXPORT_JPEG_QUALITY = 0.72;

/** Wait for all <img> elements inside a node to fully decode. */
async function waitForSectionImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
  await Promise.allSettled(
    imgs.map(img =>
      img.complete ? Promise.resolve() : img.decode().catch(() => {})
    )
  );
}

async function prepareGuideCloneForExport(
  shadowRoot: ShadowRoot,
  source: HTMLElement
): Promise<{ host: HTMLDivElement; clone: HTMLElement }> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-20000px';
  host.style.top = '0';
  host.style.width = `${EXPORT_WIDTH_PX}px`;
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-1';

  const clone = source.cloneNode(true) as HTMLElement;
  clone.classList.add('pdf-exporting');
  clone.style.width = `${EXPORT_WIDTH_PX}px`;
  clone.style.maxWidth = `${EXPORT_WIDTH_PX}px`;
  clone.style.boxSizing = 'border-box';

  host.appendChild(clone);
  shadowRoot.appendChild(host);

  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  await waitForSectionImages(clone);

  return { host, clone };
}

/** Capture an element as a JPEG data URL.
 *  Captures at a fixed A4-like width so all pages keep the same scale and
 *  the PDF stays lighter than viewport-sized screenshots.
 */
async function sectionToJpeg(
  el: HTMLElement,
  bgColor: string
): Promise<{ imgData: string; pxW: number; pxH: number }> {
  const pxW = EXPORT_WIDTH_PX;
  const pxH = el.scrollHeight || el.offsetHeight || 1122;

  const imgData = await toJpeg(el, {
    pixelRatio: EXPORT_PIXEL_RATIO,
    quality: EXPORT_JPEG_QUALITY,
    cacheBust: true,
    skipFonts: true,   // avoid cross-origin SecurityError from Google Fonts CORS
    backgroundColor: bgColor,
    width: pxW,
    height: pxH,
    style: {
      width: `${pxW}px`,
      transform: 'none',
      animation: 'none',
    },
  });

  return { imgData, pxW, pxH };
}

function getGuidePdfFilename(locale: string): string {
  const baseName = locale === 'en' ? 'world-cup-2026-guide' : 'guia-mundial-2026';
  return `${baseName}-${locale}.pdf`;
}

/**
 * Generate a multi-page PDF from the rendered guide-view shadow DOM.
 * Each section (.cover-page, .team-sheet, .prediction-page) is an A4-sized
 * .page element that already carries its own running header and footer.
 *
 * @param shadowRoot  Shadow root of the <guide-view> element.
 * @param onProgress  Optional callback invoked with (current, total) after each page capture.
 */
export async function exportGuidePdf(
  shadowRoot: ShadowRoot,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');

  // Force-load lazy images so they appear in the captures
  const lazyImgs = Array.from(
    shadowRoot.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
  );
  for (const img of lazyImgs) img.removeAttribute('loading');

  await document.fonts.ready;

  const guideDoc = shadowRoot.querySelector<HTMLElement>('.guide-document');
  if (!guideDoc) throw new Error('guide-document not found in shadow root');

  // Resolve the paper background colour from the shadow root (respects dark mode).
  // Section elements themselves are transparent; the body provides the background
  // in normal rendering, but html-to-image captures elements in isolation.
  const paperColor =
    getComputedStyle(guideDoc).getPropertyValue('--paper').trim() ||
    getComputedStyle(document.body).backgroundColor ||
    '#ecdfc0';

  const { host, clone } = await prepareGuideCloneForExport(shadowRoot, guideDoc);

  try {
    const sections = Array.from(clone.querySelectorAll<HTMLElement>('.page'));
    if (sections.length === 0) throw new Error('No printable pages found in guide-view');

    const A4_W_MM = 210;

    // --- Capture all sections sequentially ---
    const captures: { imgData: string; mmH: number }[] = [];
    for (let i = 0; i < sections.length; i++) {
      onProgress?.(i, sections.length);
      const section = sections[i];
      const { imgData, pxW, pxH } = await sectionToJpeg(section, paperColor);
      // Scale height proportionally using the same width seen on screen.
      const mmH = Math.ceil((pxH / pxW) * A4_W_MM);
      captures.push({ imgData, mmH });
    }
    onProgress?.(sections.length, sections.length);

    // --- Assemble PDF with variable page heights ---
    const first = captures[0];
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [A4_W_MM, first.mmH],
      compress: true,
    });
    doc.addImage(first.imgData, 'JPEG', 0, 0, A4_W_MM, first.mmH, undefined, 'MEDIUM');

    for (let i = 1; i < captures.length; i++) {
      const { imgData, mmH } = captures[i];
      doc.addPage([A4_W_MM, mmH]);
      doc.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, mmH, undefined, 'MEDIUM');
    }

    return doc.output('blob');
  } finally {
    host.remove();
  }
}

/**
 * Trigger a browser download of the generated guide PDF.
 *
 * @param shadowRoot  Shadow root of the <guide-view> element.
 * @param locale      'es' or 'en' — used for the file name.
 * @param onProgress  Optional progress callback.
 */
export async function triggerGuidePdfDownload(
  shadowRoot: ShadowRoot,
  locale: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const blob = await exportGuidePdf(shadowRoot, onProgress);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getGuidePdfFilename(locale);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
