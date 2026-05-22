import { toJpeg } from 'html-to-image';

const EXPORT_WIDTH_PX = 794;
const EXPORT_PIXEL_RATIO = 1.25;
const EXPORT_JPEG_QUALITY = 0.72;

// ── perf helpers ──

const PERF_HEADER = '[pdf]';

function perfStart(): number {
  return performance.now();
}

function perfEnd(label: string, start: number): void {
  console.log(`${PERF_HEADER} ${label}: ${(performance.now() - start).toFixed(0)}ms`);
}

// ── image loading helpers ──

async function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
  await Promise.allSettled(
    imgs.map(img =>
      img.complete ? Promise.resolve() : img.decode().catch(() => {})
    )
  );
}

/**
 * Collect every unique external image URL referenced in the DOM tree
 * – both <img src> and inline style background-image:url(...).
 */
function collectUniqueImageUrls(root: HTMLElement): string[] {
  const urls = new Set<string>();

  for (const img of root.querySelectorAll<HTMLImageElement>('img')) {
    const src = img.getAttribute('src') || '';
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      urls.add(src);
    }
  }

  for (const el of root.querySelectorAll<HTMLElement>('[style]')) {
    const style = el.getAttribute('style') || '';
    const re = /background-image\s*:\s*url\(['"]?\s*([^'")\s]+)\s*['"]?\s*\)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(style)) !== null) {
      if (m[1] && !m[1].startsWith('data:')) {
        urls.add(m[1]);
      }
    }
  }

  return Array.from(urls);
}

/** Load an image URL and return its data-URL representation, or null on failure. */
function imageUrlToDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d')!.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Pre-load every external image found in the clone and replace its
 * occurrences with inline data-URLs so html-to-image never hits the
 * network or cache per-section.
 */
async function preEmbedImages(clone: HTMLElement): Promise<void> {
  const t0 = perfStart();
  const uniqueUrls = collectUniqueImageUrls(clone);
  if (uniqueUrls.length === 0) return;

  const urlMap = new Map<string, string>();

  await Promise.allSettled(
    uniqueUrls.map(async (url) => {
      const dataUrl = await imageUrlToDataUrl(url);
      if (dataUrl) urlMap.set(url, dataUrl);
    })
  );

  if (urlMap.size === 0) return;

  // Replace <img src>
  for (const img of clone.querySelectorAll<HTMLImageElement>('img')) {
    const dataUrl = urlMap.get(img.getAttribute('src') || '');
    if (dataUrl) img.src = dataUrl;
  }

  // Replace background-image in inline styles
  for (const el of clone.querySelectorAll<HTMLElement>('[style]')) {
    const style = el.getAttribute('style') || '';
    let newStyle = style;
    let changed = false;
    for (const [url, dataUrl] of urlMap) {
      const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(
        `background-image\\s*:\\s*url\\(['"]?\\s*${escaped}\\s*['"]?\\s*\\)`,
        'gi'
      );
      if (re.test(newStyle)) {
        newStyle = newStyle.replace(re, `background-image:url('${dataUrl}')`);
        changed = true;
      }
    }
    if (changed) el.setAttribute('style', newStyle);
  }

  perfEnd('pre-embed images', t0);
}

// ── clone & capture ──

async function prepareGuideCloneForExport(
  shadowRoot: ShadowRoot,
  source: HTMLElement
): Promise<{ host: HTMLDivElement; clone: HTMLElement }> {
  const t0 = perfStart();

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

  perfEnd('clone + attach', t0);
  return { host, clone };
}

async function sectionToJpeg(
  el: HTMLElement,
  bgColor: string
): Promise<{ imgData: string; pxW: number; pxH: number }> {
  const pxW = EXPORT_WIDTH_PX;
  const pxH = el.scrollHeight || el.offsetHeight || 1122;

  const imgData = await toJpeg(el, {
    pixelRatio: EXPORT_PIXEL_RATIO,
    quality: EXPORT_JPEG_QUALITY,
    skipFonts: true,
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
  const totalT0 = perfStart();
  const { jsPDF } = await import('jspdf');

  // Force-load lazy images so they appear in the captures
  const lazyImgs = Array.from(
    shadowRoot.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
  );
  for (const img of lazyImgs) img.removeAttribute('loading');

  await document.fonts.ready;

  const guideDoc = shadowRoot.querySelector<HTMLElement>('.guide-document');
  if (!guideDoc) throw new Error('guide-document not found in shadow root');

  const paperColor =
    getComputedStyle(guideDoc).getPropertyValue('--paper').trim() ||
    getComputedStyle(document.body).backgroundColor ||
    '#ecdfc0';

  const { host, clone } = await prepareGuideCloneForExport(shadowRoot, guideDoc);

  try {
    // ── Pre-embed: convert all external URLs to inline data-URLs ──
    await preEmbedImages(clone);

    // Wait for the data-URL images to decode before capturing
    const tImg = perfStart();
    await waitForImages(clone);
    perfEnd('wait decode after pre-embed', tImg);

    const sections = Array.from(clone.querySelectorAll<HTMLElement>('.page'));
    if (sections.length === 0) throw new Error('No printable pages found in guide-view');

    const A4_W_MM = 210;

    // ── Capture all sections sequentially ──
    const captures: { imgData: string; mmH: number }[] = [];
    const tCap = perfStart();
    for (let i = 0; i < sections.length; i++) {
      onProgress?.(i, sections.length);
      const section = sections[i];
      const { imgData, pxW, pxH } = await sectionToJpeg(section, paperColor);
      const mmH = Math.ceil((pxH / pxW) * A4_W_MM);
      captures.push({ imgData, mmH });
    }
    onProgress?.(sections.length, sections.length);
    perfEnd(`capture ×${sections.length}`, tCap);

    // ── Assemble PDF ──
    const tPdf = perfStart();
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

    perfEnd('PDF assembly', tPdf);
    perfEnd('TOTAL export', totalT0);

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
