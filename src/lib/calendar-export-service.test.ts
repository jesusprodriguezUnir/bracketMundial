import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import {
  getRows,
  groupRowsByDate,
  formatDayHeader,
  fileNameBase,
  exportCalendarExcel,
} from "./calendar-export-service";

/* --- getRows --- */

describe("calendar-export-service - getRows", () => {
  it("devuelve 72 filas para fase de grupos", () => {
    const rows = getRows("groups", "es");
    expect(rows).toHaveLength(72);
  });

  it("devuelve 32 filas para eliminatorias", () => {
    const rows = getRows("knockout", "es");
    expect(rows).toHaveLength(32);
  });

  it("devuelve 104 filas para calendario completo", () => {
    const rows = getRows("all", "es");
    expect(rows).toHaveLength(104);
  });

  it("ordena cronologicamente (fecha + hora)", () => {
    const rows = getRows("all", "es");
    for (let i = 1; i < rows.length; i++) {
      const prevKey = rows[i - 1].date + "T" + rows[i - 1].timeSpain;
      const currKey = rows[i].date + "T" + rows[i].timeSpain;
      expect(prevKey <= currKey).toBe(true);
    }
  });

  it("primer partido de grupo es Mexico vs Sudafrica (M1 en Grupo A)", () => {
    const rows = getRows("groups", "es");
    expect(rows[0].match).toContain("México");
    expect(rows[0].match).toContain("Sudáfrica");
    expect(rows[0].phase).toBe("GRUPO A");
    expect(rows[0].date).toBe("2026-06-11");
    expect(rows[0].timeSpain).toBe("21:00");
  });

  it("date es string ISO YYYY-MM-DD (no formateado)", () => {
    const rows = getRows("groups", "es");
    expect(rows[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("partidos de eliminatoria muestran POR DEFINIR como equipos (ES)", () => {
    const rows = getRows("knockout", "es");
    rows.forEach((r) => {
      expect(r.match).toBe("POR DEFINIR");
    });
  });

  it("partidos de eliminatoria muestran TBD como equipos (EN)", () => {
    const rows = getRows("knockout", "en");
    rows.forEach((r) => {
      expect(r.match).toBe("TBD");
    });
  });

  it("fases de eliminatoria tienen etiquetas de ronda correctas (ES)", () => {
    const rows = getRows("knockout", "es");
    const fases = new Set(rows.map((r) => r.phase));
    expect(fases.has("1/16")).toBe(true);
    expect(fases.has("Octavos")).toBe(true);
    expect(fases.has("Cuartos")).toBe(true);
    expect(fases.has("Semis")).toBe(true);
    expect(fases.has("3er puesto")).toBe(true);
    expect(fases.has("Final")).toBe(true);
  });

  it("fases de eliminatoria tienen etiquetas de ronda correctas (EN)", () => {
    const rows = getRows("knockout", "en");
    const fases = new Set(rows.map((r) => r.phase));
    expect(fases.has("R32")).toBe(true);
    expect(fases.has("R16")).toBe(true);
    expect(fases.has("QF")).toBe(true);
    expect(fases.has("SF")).toBe(true);
    expect(fases.has("3rd place")).toBe(true);
    expect(fases.has("Final")).toBe(true);
  });

  it("la final es el ultimo partido del calendario completo", () => {
    const rows = getRows("all", "es");
    const last = rows[rows.length - 1];
    expect(last.phase).toBe("Final");
    expect(last.date).toBe("2026-07-19");
  });

  it("los 12 grupos estan presentes", () => {
    const rows = getRows("groups", "es");
    const groups = new Set(rows.map((r) => r.phase));
    expect(groups.size).toBe(12);
    ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach((g) => {
      expect(groups.has("GRUPO " + g)).toBe(true);
    });
  });

  it("cada grupo tiene 6 partidos", () => {
    const rows = getRows("groups", "es");
    const counts = new Map<string, number>();
    rows.forEach((r) => counts.set(r.phase, (counts.get(r.phase) ?? 0) + 1));
    counts.forEach((n) => {
      expect(n).toBe(6);
    });
  });
});

/* --- groupRowsByDate --- */

describe("calendar-export-service - groupRowsByDate", () => {
  it("agrupa en orden cronologico", () => {
    const rows = getRows("groups", "es");
    const groups = groupRowsByDate(rows);
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i - 1].dateIso <= groups[i].dateIso).toBe(true);
    }
  });

  it("suma de filas en grupos = total de filas", () => {
    const rows = getRows("all", "es");
    const groups = groupRowsByDate(rows);
    const total = groups.reduce((s, g) => s + g.rows.length, 0);
    expect(total).toBe(rows.length);
  });

  it("primer grupo es 2026-06-11 (dia inaugural)", () => {
    const rows = getRows("groups", "es");
    const groups = groupRowsByDate(rows);
    expect(groups[0].dateIso).toBe("2026-06-11");
  });

  it("cada grupo tiene al menos 1 partido", () => {
    const rows = getRows("all", "es");
    groupRowsByDate(rows).forEach((g) => {
      expect(g.rows.length).toBeGreaterThan(0);
    });
  });
});

/* --- formatDayHeader --- */

describe("calendar-export-service - formatDayHeader", () => {
  it("ES: 2026-06-11 -> JUE · 11 JUN", () => {
    expect(formatDayHeader("2026-06-11", "es")).toBe("JUE · 11 JUN");
  });

  it("EN: 2026-06-11 -> THU · JUN 11", () => {
    expect(formatDayHeader("2026-06-11", "en")).toBe("THU · JUN 11");
  });

  it("ES: 2026-07-19 -> DOM · 19 JUL (dia de la final)", () => {
    expect(formatDayHeader("2026-07-19", "es")).toBe("DOM · 19 JUL");
  });

  it("EN: 2026-07-19 -> SUN · JUL 19", () => {
    expect(formatDayHeader("2026-07-19", "en")).toBe("SUN · JUL 19");
  });

  it("resultado es siempre mayusculas", () => {
    const result = formatDayHeader("2026-06-11", "es");
    expect(result).toBe(result.toUpperCase());
  });
});

/* --- fileNameBase --- */

describe("calendar-export-service - fileNameBase", () => {
  it("genera nombre correcto para completo en es", () => {
    expect(fileNameBase("all", "es")).toBe("bracketmundial-calendario-completo-2026");
  });

  it("genera nombre correcto para completo en en", () => {
    expect(fileNameBase("all", "en")).toBe("bracketmundial-schedule-completo-2026");
  });

  it("genera nombre correcto para grupos en es", () => {
    expect(fileNameBase("groups", "es")).toBe("bracketmundial-calendario-grupos-2026");
  });

  it("genera nombre correcto para grupos en en", () => {
    expect(fileNameBase("groups", "en")).toBe("bracketmundial-schedule-grupos-2026");
  });

  it("genera nombre correcto para eliminatorias en es", () => {
    expect(fileNameBase("knockout", "es")).toBe("bracketmundial-calendario-eliminatorias-2026");
  });

  it("genera nombre correcto para eliminatorias en en", () => {
    expect(fileNameBase("knockout", "en")).toBe("bracketmundial-schedule-eliminatorias-2026");
  });
});

/* --- exportCalendarExcel --- */

describe("calendar-export-service - exportCalendarExcel", () => {
  it("devuelve un Blob con MIME xlsx", async () => {
    const blob = await exportCalendarExcel("all", "es");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("genera Excel con al menos 76 filas para grupos (4 cabecera + N bandas + 72 datos)", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    // 4 header rows + at least 1 band + 72 data = 77 minimum
    expect(ws.actualRowCount).toBeGreaterThanOrEqual(77);
  });

  it("genera Excel con al menos 36 filas para eliminatorias (4 cabecera + N bandas + 32 datos)", async () => {
    const blob = await exportCalendarExcel("knockout", "en");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    expect(ws.actualRowCount).toBeGreaterThanOrEqual(36);
  });

  it("la fila de columnas (fila 4) tiene las 6 cabeceras en espanol", async () => {
    const blob = await exportCalendarExcel("all", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const headers = [1, 2, 3, 4, 5, 6].map((c) => ws.getRow(4).getCell(c).value);
    expect(headers).toEqual([
      "Fecha", "Hora", "Partido", "Fase / Ronda", "Sede", "Ciudad",
    ]);
  });

  it("la fila de columnas (fila 4) tiene las 6 cabeceras en ingles", async () => {
    const blob = await exportCalendarExcel("knockout", "en");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const headers = [1, 2, 3, 4, 5, 6].map((c) => ws.getRow(4).getCell(c).value);
    expect(headers).toEqual([
      "Date", "Time", "Match", "Phase / Round", "Venue", "City",
    ]);
  });

  it("fila 1 (titulo) tiene fondo naranja retro", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const titleFg = ((ws.getRow(1).getCell(1).fill) as ExcelJS.FillPattern).fgColor;
    expect(titleFg?.argb).toBe("E8541F");
  });

  it("fila 4 (cabecera columnas) tiene fondo amarillo retro y fuente negrita ink", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const hdr = ws.getRow(4).getCell(1);
    const fg = (hdr.fill as ExcelJS.FillPattern).fgColor;
    expect(fg?.argb).toBe("F0B021");
    expect(hdr.font!.bold).toBe(true);
    expect(hdr.font!.color!.argb).toBe("1A1933");
  });

  it("el Excel contiene el partido inaugural (Mexico vs Sudafrica)", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    let found = false;
    ws.eachRow((row) => {
      const matchCell = String(row.getCell(3).value ?? "");
      if (matchCell.includes("México") && matchCell.includes("Sudáfrica")) {
        found = true;
        expect(String(row.getCell(4).value)).toBe("GRUPO A");
      }
    });
    expect(found).toBe(true);
  });

  it("las filas de datos alternan colores paper y paper2", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const dataRowColors: string[] = [];
    ws.eachRow((row) => {
      const fg = ((row.getCell(1).fill) as ExcelJS.FillPattern).fgColor?.argb;
      if (fg === "ECDFC0" || fg === "E6D6B1") dataRowColors.push(fg);
    });
    expect(dataRowColors).toHaveLength(72);
    expect(dataRowColors[0]).toBe("ECDFC0"); // paper
    expect(dataRowColors[1]).toBe("E6D6B1"); // paper2
  });

  it("las bandas de dia tienen fondo azul retro", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const bandRows: ExcelJS.Row[] = [];
    ws.eachRow((row) => {
      const fg = ((row.getCell(1).fill) as ExcelJS.FillPattern).fgColor?.argb;
      if (fg === "22418C") bandRows.push(row);
    });
    expect(bandRows.length).toBeGreaterThan(0);
  });

  it("hoja Excel se llama segun la fase", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    expect(wb.getWorksheet("⚽ FASE DE GRUPOS")).toBeDefined();
  });

  it("hoja Excel en ingles para eliminatorias", async () => {
    const blob = await exportCalendarExcel("knockout", "en");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    expect(wb.getWorksheet("★ KNOCKOUT STAGE ★")).toBeDefined();
  });

  it("hoja Excel en espanol para calendario completo", async () => {
    const blob = await exportCalendarExcel("all", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    expect(wb.getWorksheet("Calendario")).toBeDefined();
  });
});
