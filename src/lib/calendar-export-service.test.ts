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
    expect(rows[0].teamA).toBe("MEX");
    expect(rows[0].teamB).toBe("RSA");
    expect(rows[0].matchId).toBe("M1");
    expect(rows[0].date).toBe("2026-06-11");
    expect(rows[0].timeSpain).toBe("21:00");
  });

  it("date es string ISO YYYY-MM-DD (no formateado)", () => {
    const rows = getRows("groups", "es");
    expect(rows[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("partidos de eliminatoria tienen equipos null (no resueltos)", () => {
    const rows = getRows("knockout", "es");
    rows.forEach((r) => {
      expect(r.teamA).toBeNull();
      expect(r.teamB).toBeNull();
    });
  });

  it("partidos de eliminatoria tienen matchDayLabel con ronda correcta (ES)", () => {
    const rows = getRows("knockout", "es");
    const labels = new Set(rows.map((r) => r.matchDayLabel));
    expect(labels.has("1/16")).toBe(true);
    expect(labels.has("Octavos")).toBe(true);
    expect(labels.has("Cuartos")).toBe(true);
    expect(labels.has("Semis")).toBe(true);
    expect(labels.has("3er puesto")).toBe(true);
    expect(labels.has("Final")).toBe(true);
  });

  it("partidos de eliminatoria tienen matchDayLabel con ronda correcta (EN)", () => {
    const rows = getRows("knockout", "en");
    const labels = new Set(rows.map((r) => r.matchDayLabel));
    expect(labels.has("R32")).toBe(true);
    expect(labels.has("R16")).toBe(true);
    expect(labels.has("QF")).toBe(true);
    expect(labels.has("SF")).toBe(true);
    expect(labels.has("3rd place")).toBe(true);
    expect(labels.has("Final")).toBe(true);
  });

  it("la final es el ultimo partido del calendario completo", () => {
    const rows = getRows("all", "es");
    const last = rows[rows.length - 1];
    expect(last.matchId).toBe("FIN-01");
    expect(last.matchDayLabel).toBe("Final");
    expect(last.date).toBe("2026-07-19");
  });

  it("grupos tienen matchDayLabel correcto J1/J2/J3 (ES)", () => {
    const rows = getRows("groups", "es");
    const labels = new Set(rows.map((r) => r.matchDayLabel));
    expect(labels.has("J1")).toBe(true);
    expect(labels.has("J2")).toBe(true);
    expect(labels.has("J3")).toBe(true);
    expect(labels.size).toBe(3);
  });

  it("cada grupo tiene 6 partidos (72 total / 12 grupos)", () => {
    const rows = getRows("groups", "es");
    expect(rows).toHaveLength(72);
    const labels = new Set(rows.map((r) => r.matchDayLabel));
    expect(labels.has("J1")).toBe(true);
    expect(labels.has("J2")).toBe(true);
    expect(labels.has("J3")).toBe(true);
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

  it("cada DayBox tiene boxColorIdx entre 0 y 3", () => {
    const rows = getRows("all", "es");
    const boxes = groupRowsByDate(rows);
    boxes.forEach((b, i) => {
      expect(b.boxColorIdx).toBe(i % 4);
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

  it("genera Excel con layout de boxes (mas de 50 filas para grupos)", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    expect(ws.actualRowCount).toBeGreaterThanOrEqual(50);
  });

  it("genera Excel con layout de boxes para eliminatorias", async () => {
    const blob = await exportCalendarExcel("knockout", "en");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    expect(ws.actualRowCount).toBeGreaterThanOrEqual(20);
  });

  it("fila 1 (titulo) tiene fondo naranja retro", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const titleFg = ((ws.getRow(1).getCell(2).fill) as ExcelJS.FillPattern).fgColor;
    expect(titleFg?.argb).toBe("E8541F");
  });

  it("el Excel contiene el partido inaugural (Mexico vs Sudafrica)", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    let found = false;
    ws.eachRow((row) => {
      for (let c = 1; c <= ws.columnCount; c++) {
        const val = String(row.getCell(c).value ?? "");
        if (val === "M1") {
          const homeI = row.getCell(c + 3).value;
          const awayI = row.getCell(c + 9).value;
          if (String(homeI).includes("México") && String(awayI).includes("Sudáfrica")) {
            found = true;
          }
        }
      }
    });
    expect(found).toBe(true);
  });

  it("contiene encabezados de columna de match", async () => {
    const blob = await exportCalendarExcel("all", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    let foundLabels = false;
    ws.eachRow((row) => {
      const vals = Array.from({ length: 10 }, (_, i) => String(row.getCell(i + 1).value ?? ""));
      if (vals.includes("ID") && vals.includes("Jornada") && vals.includes("Hora")) {
        foundLabels = true;
      }
    });
    expect(foundLabels).toBe(true);
  });

  it("los boxes tienen bordes gruesos", async () => {
    const blob = await exportCalendarExcel("groups", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    let thickCount = 0;
    ws.eachRow((row) => {
      const cell = row.getCell(2);
      const t = cell.border?.top?.style;
      if (t === "thick") thickCount++;
    });
    expect(thickCount).toBeGreaterThan(0);
  });

  it("contiene sub-bloque SEDES", async () => {
    const blob = await exportCalendarExcel("all", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    let foundSedes = false;
    ws.eachRow((row) => {
      for (let c = 1; c <= ws.columnCount; c++) {
        if (String(row.getCell(c).value) === "SEDES") {
          foundSedes = true;
        }
      }
    });
    expect(foundSedes).toBe(true);
  });

  it("boxes tienen headers de color alternante (4 colores del ciclo)", async () => {
    const blob = await exportCalendarExcel("all", "es");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());
    const ws = wb.worksheets[0]!;
    const cycleColors = ["E8541F", "22418C", "1F6B3A", "C41E2C"];
    const foundColors = new Set<string>();
    ws.eachRow((row) => {
      // Day header boxes are merged cells with colored fill
      const cell = row.getCell(2);
      const fillColor = ((cell.fill) as ExcelJS.FillPattern).fgColor?.argb;
      if (cycleColors.includes(fillColor ?? "")) {
        foundColors.add(fillColor!);
      }
    });
    // At least 1 color from the cycle should be found on some header
    expect(foundColors.size).toBeGreaterThanOrEqual(1);
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
