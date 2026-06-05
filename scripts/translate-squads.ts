import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const POS_LABEL: Record<string, string> = {
  GK: '// Porteros',
  DF: '// Defensores',
  MF: '// Volantes',
  FW: '// Delanteros'
};
const POS_ORDER: Record<string, number> = {
  GK: 0,
  DF: 1,
  MF: 2,
  FW: 3
};

function esc(s: string) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function emitSquadTs(code: string, players: any[], lineup: any, coachName?: string) {
  const sorted = [...players].sort(
    (a, b) => (POS_ORDER[a.position] ?? 3) - (POS_ORDER[b.position] ?? 3) || a.number - b.number,
  );

  let out = `import type { Player } from './index';\n\n`;
  if (coachName) out += `export const coach = '${esc(coachName)}';\n`;
  out += `export const squad: Player[] = [\n`;

  let lastPos = '';
  for (const p of sorted) {
    if (p.position !== lastPos) {
      out += `  ${POS_LABEL[p.position] ?? `// ${p.position}`}\n`;
      lastPos = p.position;
    }
    out += `  { number: ${p.number}, name: '${esc(p.name)}', position: '${p.position}', age: ${p.age}, club: '${esc(p.club)}'`;
    if (p.captain)         out += `, captain: true`;
    if (p.thesportsdbId)   out += `, thesportsdbId: '${esc(p.thesportsdbId)}'`;
    if (p.photoUrl)        out += `, photoUrl: '${esc(p.photoUrl)}'`;
    if (p.bio)             out += `, bio: ${JSON.stringify(p.bio)}`;
    if (p.caps !== undefined) out += `, caps: ${p.caps}`;
    if (p.goals !== undefined) out += `, goals: ${p.goals}`;
    if (p.special)         out += `, special: ${JSON.stringify(p.special)}`;
    out += ` },\n`;
  }
  out += `];\n\nexport const lineup = {\n  formation: '${esc(lineup.formation)}',\n  startingXI: [${lineup.startingXI.join(', ')}]\n};\n`;
  return out;
}

async function translateText(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || !json[0]) throw new Error("Invalid translation response structure");
  return json[0].map((s: any) => s[0]).join('');
}

async function run() {
  const args = process.argv.slice(2);
  const filterTeam = args[0] ? args[0].toUpperCase() : null;

  const squadsDir = join(process.cwd(), 'src', 'data', 'squads');
  const files = readdirSync(squadsDir).filter(f => /^[a-z]{3}\.ts$/.test(f));

  console.log(`\n🌍 starting translation run. FilterTeam: ${filterTeam || 'ALL'}`);

  for (const file of files) {
    const code = file.substring(0, 3).toUpperCase();
    if (filterTeam && code !== filterTeam) continue;

    console.log(`\n── ${code} ─────────────────────────────────────`);
    const filePath = join(squadsDir, file);

    // Dynamic import of the typescript squad file
    const modulePath = `../src/data/squads/${file}`;
    const module = await import(modulePath);
    const squad = module.squad;
    const lineup = module.lineup;
    const coachName = module.coach;

    let updatedCount = 0;
    const updatedPlayers = [];

    for (const player of squad) {
      if (player.bio && typeof player.bio === 'string') {
        const originalBio = player.bio;
        try {
          // Throttle to avoid hitting rate limits
          await new Promise(r => setTimeout(r, 200));
          const translated = await translateText(originalBio);
          updatedPlayers.push({
            ...player,
            bio: {
              es: translated,
              en: originalBio
            }
          });
          updatedCount++;
          console.log(`  [${code}] #${player.number} ${player.name}: translated to Spanish`);
        } catch (e: any) {
          console.error(`  ❌ Error translating #${player.number} ${player.name}: ${e.message}`);
          updatedPlayers.push(player);
        }
      } else {
        updatedPlayers.push(player);
      }
    }

    if (updatedCount > 0) {
      const output = emitSquadTs(code, updatedPlayers, lineup, coachName);
      writeFileSync(filePath, output, 'utf8');
      console.log(`  ✅ Saved ${updatedCount} translated bios to src/data/squads/${file}`);
    } else {
      console.log(`  No bios needed translation.`);
    }
  }

  console.log('\n🏁 Translation run completed successfully!');
}

run().catch(e => {
  console.error('❌ Script failed:', e);
  process.exit(1);
});
