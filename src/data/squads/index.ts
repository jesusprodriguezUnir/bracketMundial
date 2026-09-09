export interface Player {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  club: string;
  captain?: boolean;
  thesportsdbId?: string;
  photoUrl?: string;
  height?: string;
  weight?: string;
  foot?: string;
  birthDate?: string;
  birthPlace?: string;
  bio?: string | { es: string; en: string };
  caps?: number;
  goals?: number;
  special?: string;
}

export interface Lineup {
  formation: string; // e.g. '4-3-3'
  startingXI: number[]; // Player numbers
}

import { squad as AEK, lineup as AEK_LINEUP } from './aek';
import { squad as ARS, lineup as ARS_LINEUP } from './ars';
import { squad as ATL, lineup as ATL_LINEUP } from './atl';
import { squad as AVL, lineup as AVL_LINEUP } from './avl';
import { squad as BAR, lineup as BAR_LINEUP } from './bar';
import { squad as BAY, lineup as BAY_LINEUP } from './bay';
import { squad as BET, lineup as BET_LINEUP } from './bet';
import { squad as BOD, lineup as BOD_LINEUP } from './bod';
import { squad as BRU, lineup as BRU_LINEUP } from './bru';
import { squad as BVB, lineup as BVB_LINEUP } from './bvb';
import { squad as COM, lineup as COM_LINEUP } from './com';
import { squad as FCP, lineup as FCP_LINEUP } from './fcp';
import { squad as FEN, lineup as FEN_LINEUP } from './fen';
import { squad as FEY, lineup as FEY_LINEUP } from './fey';
import { squad as GAL, lineup as GAL_LINEUP } from './gal';
import { squad as INT, lineup as INT_LINEUP } from './int';
import { squad as LIL, lineup as LIL_LINEUP } from './lil';
import { squad as LIV, lineup as LIV_LINEUP } from './liv';
import { squad as LSK, lineup as LSK_LINEUP } from './lsk';
import { squad as MCI, lineup as MCI_LINEUP } from './mci';
import { squad as MUN, lineup as MUN_LINEUP } from './mun';
import { squad as NAP, lineup as NAP_LINEUP } from './nap';
import { squad as PSG, lineup as PSG_LINEUP } from './psg';
import { squad as PSV, lineup as PSV_LINEUP } from './psv';
import { squad as RBL, lineup as RBL_LINEUP } from './rbl';
import { squad as RCL, lineup as RCL_LINEUP } from './rcl';
import { squad as RMA, lineup as RMA_LINEUP } from './rma';
import { squad as ROM, lineup as ROM_LINEUP } from './rom';
import { squad as SAB, lineup as SAB_LINEUP } from './sab';
import { squad as SHK, lineup as SHK_LINEUP } from './shk';
import { squad as SLO, lineup as SLO_LINEUP } from './slo';
import { squad as SLP, lineup as SLP_LINEUP } from './slp';
import { squad as SPO, lineup as SPO_LINEUP } from './spo';
import { squad as VFB, lineup as VFB_LINEUP } from './vfb';
import { squad as VIK, lineup as VIK_LINEUP } from './vik';
import { squad as VIL, lineup as VIL_LINEUP } from './vil';

export const SQUADS: Record<string, Player[]> = {
  AEK,
  ARS,
  ATL,
  AVL,
  BAR,
  BAY,
  BET,
  BOD,
  BRU,
  BVB,
  COM,
  FCP,
  FEN,
  FEY,
  GAL,
  INT,
  LIL,
  LIV,
  LSK,
  MCI,
  MUN,
  NAP,
  PSG,
  PSV,
  RBL,
  RCL,
  RMA,
  ROM,
  SAB,
  SHK,
  SLO,
  SLP,
  SPO,
  VFB,
  VIK,
  VIL,
};

export const LINEUPS: Record<string, Lineup> = {
  AEK: AEK_LINEUP,
  ARS: ARS_LINEUP,
  ATL: ATL_LINEUP,
  AVL: AVL_LINEUP,
  BAR: BAR_LINEUP,
  BAY: BAY_LINEUP,
  BET: BET_LINEUP,
  BOD: BOD_LINEUP,
  BRU: BRU_LINEUP,
  BVB: BVB_LINEUP,
  COM: COM_LINEUP,
  FCP: FCP_LINEUP,
  FEN: FEN_LINEUP,
  FEY: FEY_LINEUP,
  GAL: GAL_LINEUP,
  INT: INT_LINEUP,
  LIL: LIL_LINEUP,
  LIV: LIV_LINEUP,
  LSK: LSK_LINEUP,
  MCI: MCI_LINEUP,
  MUN: MUN_LINEUP,
  NAP: NAP_LINEUP,
  PSG: PSG_LINEUP,
  PSV: PSV_LINEUP,
  RBL: RBL_LINEUP,
  RCL: RCL_LINEUP,
  RMA: RMA_LINEUP,
  ROM: ROM_LINEUP,
  SAB: SAB_LINEUP,
  SHK: SHK_LINEUP,
  SLO: SLO_LINEUP,
  SLP: SLP_LINEUP,
  SPO: SPO_LINEUP,
  VFB: VFB_LINEUP,
  VIK: VIK_LINEUP,
  VIL: VIL_LINEUP,
};

export const getSquad = (teamId: string): Player[] => SQUADS[teamId] ?? [];
export const getLineup = (teamId: string): Lineup | null => LINEUPS[teamId] ?? null;
export const OFFICIAL_SQUADS: string[] = Object.keys(SQUADS);
export const isOfficialSquad = (teamId: string): boolean => OFFICIAL_SQUADS.includes(teamId);
