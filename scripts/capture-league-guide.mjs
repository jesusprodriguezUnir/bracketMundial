import { chromium } from 'playwright';
import { exec } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  rootDir,
  DEV_URL,
  ensureDevServer,
  gotoView,
  sleep,
  applyLocaleAndTheme,
} from './lib/recording-utils.mjs';

const args = process.argv.slice(2);
const langIndex = args.indexOf('--lang');
const lang = langIndex >= 0 ? (args[langIndex + 1] ?? 'es') : 'es';
const outDir = join(rootDir, 'docs', lang === 'en' ? 'private-leagues-assets' : 'ligas-privadas-assets');

const content = lang === 'en'
  ? {
      leagueName: 'World Cup Demo League',
      ownerName: 'Peter',
      secondName: 'Bruno',
      thirdName: 'Lucy',
    }
  : {
      leagueName: 'Liga Demo Mundial',
      ownerName: 'Pedro',
      secondName: 'Bruno',
      thirdName: 'Lucia',
    };

function ensureOutDir() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
}

async function screenshotView(locator, fileName) {
  await locator.screenshot({
    path: join(outDir, fileName),
    animations: 'disabled',
  });
}

async function seedDemoParticipants(page) {
  await page.evaluate(({ secondName, thirdName }) => {
    const raw = localStorage.getItem('mundial-2026-leagues');
    if (!raw) throw new Error('No se encontró el estado persistido de ligas');

    const persisted = JSON.parse(raw);
    const league = persisted?.state?.leagues?.[0];
    const owner = league?.participants?.[0];
    if (!league || !owner) throw new Error('No se encontró la liga demo recién creada');

    const clone = (value) => structuredClone(value);
    const now = Date.now();

    owner.groupScores[0].scoreA = 2;
    owner.groupScores[0].scoreB = 1;
    owner.topScorer = { teamId: 'ARG', playerName: 'Julian Alvarez' };
    owner.mvp = { teamId: 'ARG', playerName: 'Lionel Messi' };

    const brunoGroup = clone(owner.groupScores);
    brunoGroup[0].scoreA = 1;
    brunoGroup[0].scoreB = 0;
    const luciaGroup = clone(owner.groupScores);
    luciaGroup[0].scoreA = 0;
    luciaGroup[0].scoreB = 0;

    league.participants = [
      owner,
      {
        id: 'p-demo-bruno',
        name: secondName,
        addedAt: now + 1,
        source: 'manual',
        groupScores: brunoGroup,
        knockoutScores: clone(owner.knockoutScores),
        topScorer: null,
        mvp: null,
      },
      {
        id: 'p-demo-lucia',
        name: thirdName,
        addedAt: now + 2,
        source: 'manual',
        groupScores: luciaGroup,
        knockoutScores: clone(owner.knockoutScores),
        topScorer: null,
        mvp: null,
      },
    ];

    localStorage.setItem('mundial-2026-leagues', JSON.stringify(persisted));
  }, { secondName: content.secondName, thirdName: content.thirdName });
}

async function captureGuideShots() {
  ensureOutDir();

  let server;
  let browser;

  try {
    server = await ensureDevServer();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1800 },
      deviceScaleFactor: 1.5,
    });
    const page = await context.newPage();

    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await applyLocaleAndTheme(page, { lang, theme: 'light' });
    await gotoView(page, 'league');
    await sleep(1200);

    const shell = page.locator('leagues-view .lg-v2-shell');
    await page.locator('.lg-v2-create-inline input').nth(0).fill(content.leagueName);
    await page.locator('.lg-v2-create-inline input').nth(1).fill(content.ownerName);
    await screenshotView(shell, '01-crear-liga.png');

    await page.locator('.lg-v2-create-inline .lg-v2-btn.primary').click();
    await sleep(1200);

    await seedDemoParticipants(page);
    await page.reload({ waitUntil: 'networkidle' });
    await gotoView(page, 'league');
    await sleep(1200);

    await screenshotView(shell, '02-lista-ligas.png');

    const joinCode = (await page.locator('.lg-v2-card .lg-v2-code').first().innerText()).trim();
    await page.locator('.lg-v2-card').first().click();
    await sleep(1200);
    await screenshotView(shell, '03-detalle-liga.png');

    await page.locator('.lg-v2-cta-row .lg-v2-btn.primary').first().click();
    await sleep(500);
    await screenshotView(shell, '04-compartir-pronosticos.png');

    await page.locator('.lg-btn-back').last().click();
    await sleep(300);
    await page.locator('.lg-v2-back').click();
    await sleep(800);

    await page.locator('.lg-v2-actions .lg-v2-btn').nth(1).click();
    await sleep(400);
    await page.locator('.lg-v2-modal input').fill(joinCode);
    await screenshotView(page.locator('.lg-v2-modal'), '05-unirme-con-codigo.png');

    await context.close();
  } finally {
    if (browser) await browser.close();
    if (server) await stopServer(server);
  }
}

function stopServer(server) {
  if (!server?.pid) return Promise.resolve();
  if (process.platform !== 'win32') {
    server.kill('SIGTERM');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    exec(`taskkill /pid ${server.pid} /T /F`, () => resolve());
  });
}

try {
  await captureGuideShots();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}