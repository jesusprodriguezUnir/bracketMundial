export interface Player {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  club: string;
  captain?: boolean;
  thesportsdbId?: string;
  photoUrl?: string;
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
import { squad as ALG, lineup as ALG_LINEUP } from './alg';
import { squad as ARG, lineup as ARG_LINEUP } from './arg';
import { squad as ARS, lineup as ARS_LINEUP } from './ars';
import { squad as ATL, lineup as ATL_LINEUP } from './atl';
import { squad as AUS, lineup as AUS_LINEUP } from './aus';
import { squad as AUT, lineup as AUT_LINEUP } from './aut';
import { squad as AVL, lineup as AVL_LINEUP } from './avl';
import { squad as BAR, lineup as BAR_LINEUP } from './bar';
import { squad as BAY, lineup as BAY_LINEUP } from './bay';
import { squad as BEL, lineup as BEL_LINEUP } from './bel';
import { squad as BET, lineup as BET_LINEUP } from './bet';
import { squad as BIH, lineup as BIH_LINEUP } from './bih';
import { squad as BOD, lineup as BOD_LINEUP } from './bod';
import { squad as BRA, lineup as BRA_LINEUP } from './bra';
import { squad as BRU, lineup as BRU_LINEUP } from './bru';
import { squad as BVB, lineup as BVB_LINEUP } from './bvb';
import { squad as CAN, lineup as CAN_LINEUP } from './can';
import { squad as CIV, lineup as CIV_LINEUP } from './civ';
import { squad as COD, lineup as COD_LINEUP } from './cod';
import { squad as COL, lineup as COL_LINEUP } from './col';
import { squad as COM, lineup as COM_LINEUP } from './com';
import { squad as CPV, lineup as CPV_LINEUP } from './cpv';
import { squad as CRO, lineup as CRO_LINEUP } from './cro';
import { squad as CUW, lineup as CUW_LINEUP } from './cuw';
import { squad as CZE, lineup as CZE_LINEUP } from './cze';
import { squad as ECU, lineup as ECU_LINEUP } from './ecu';
import { squad as EGY, lineup as EGY_LINEUP } from './egy';
import { squad as ENG, lineup as ENG_LINEUP } from './eng';
import { squad as ESP, lineup as ESP_LINEUP } from './esp';
import { squad as FCP, lineup as FCP_LINEUP } from './fcp';
import { squad as FEN, lineup as FEN_LINEUP } from './fen';
import { squad as FEY, lineup as FEY_LINEUP } from './fey';
import { squad as FRA, lineup as FRA_LINEUP } from './fra';
import { squad as GAL, lineup as GAL_LINEUP } from './gal';
import { squad as GER, lineup as GER_LINEUP } from './ger';
import { squad as GHA, lineup as GHA_LINEUP } from './gha';
import { squad as HAI, lineup as HAI_LINEUP } from './hai';
import { squad as INT, lineup as INT_LINEUP } from './int';
import { squad as IRN, lineup as IRN_LINEUP } from './irn';
import { squad as IRQ, lineup as IRQ_LINEUP } from './irq';
import { squad as JOR, lineup as JOR_LINEUP } from './jor';
import { squad as JPN, lineup as JPN_LINEUP } from './jpn';
import { squad as KOR, lineup as KOR_LINEUP } from './kor';
import { squad as KSA, lineup as KSA_LINEUP } from './ksa';
import { squad as LIL, lineup as LIL_LINEUP } from './lil';
import { squad as LIV, lineup as LIV_LINEUP } from './liv';
import { squad as LSK, lineup as LSK_LINEUP } from './lsk';
import { squad as MAR, lineup as MAR_LINEUP } from './mar';
import { squad as MCI, lineup as MCI_LINEUP } from './mci';
import { squad as MEX, lineup as MEX_LINEUP } from './mex';
import { squad as MUN, lineup as MUN_LINEUP } from './mun';
import { squad as NAP, lineup as NAP_LINEUP } from './nap';
import { squad as NED, lineup as NED_LINEUP } from './ned';
import { squad as NOR, lineup as NOR_LINEUP } from './nor';
import { squad as NZL, lineup as NZL_LINEUP } from './nzl';
import { squad as PAN, lineup as PAN_LINEUP } from './pan';
import { squad as PAR, lineup as PAR_LINEUP } from './par';
import { squad as POR, lineup as POR_LINEUP } from './por';
import { squad as PSG, lineup as PSG_LINEUP } from './psg';
import { squad as PSV, lineup as PSV_LINEUP } from './psv';
import { squad as QAT, lineup as QAT_LINEUP } from './qat';
import { squad as RBL, lineup as RBL_LINEUP } from './rbl';
import { squad as RCL, lineup as RCL_LINEUP } from './rcl';
import { squad as RMA, lineup as RMA_LINEUP } from './rma';
import { squad as ROM, lineup as ROM_LINEUP } from './rom';
import { squad as RSA, lineup as RSA_LINEUP } from './rsa';
import { squad as SAB, lineup as SAB_LINEUP } from './sab';
import { squad as SCO, lineup as SCO_LINEUP } from './sco';
import { squad as SEN, lineup as SEN_LINEUP } from './sen';
import { squad as SHK, lineup as SHK_LINEUP } from './shk';
import { squad as SLO, lineup as SLO_LINEUP } from './slo';
import { squad as SLP, lineup as SLP_LINEUP } from './slp';
import { squad as SPO, lineup as SPO_LINEUP } from './spo';
import { squad as SUI, lineup as SUI_LINEUP } from './sui';
import { squad as SWE, lineup as SWE_LINEUP } from './swe';
import { squad as TUN, lineup as TUN_LINEUP } from './tun';
import { squad as TUR, lineup as TUR_LINEUP } from './tur';
import { squad as URU, lineup as URU_LINEUP } from './uru';
import { squad as USA, lineup as USA_LINEUP } from './usa';
import { squad as UZB, lineup as UZB_LINEUP } from './uzb';
import { squad as VFB, lineup as VFB_LINEUP } from './vfb';
import { squad as VIK, lineup as VIK_LINEUP } from './vik';
import { squad as VIL, lineup as VIL_LINEUP } from './vil';

export const SQUADS: Record<string, Player[]> = {
  AEK,
  ALG,
  ARG,
  ARS,
  ATL,
  AUS,
  AUT,
  AVL,
  BAR,
  BAY,
  BEL,
  BET,
  BIH,
  BOD,
  BRA,
  BRU,
  BVB,
  CAN,
  CIV,
  COD,
  COL,
  COM,
  CPV,
  CRO,
  CUW,
  CZE,
  ECU,
  EGY,
  ENG,
  ESP,
  FCP,
  FEN,
  FEY,
  FRA,
  GAL,
  GER,
  GHA,
  HAI,
  INT,
  IRN,
  IRQ,
  JOR,
  JPN,
  KOR,
  KSA,
  LIL,
  LIV,
  LSK,
  MAR,
  MCI,
  MEX,
  MUN,
  NAP,
  NED,
  NOR,
  NZL,
  PAN,
  PAR,
  POR,
  PSG,
  PSV,
  QAT,
  RBL,
  RCL,
  RMA,
  ROM,
  RSA,
  SAB,
  SCO,
  SEN,
  SHK,
  SLO,
  SLP,
  SPO,
  SUI,
  SWE,
  TUN,
  TUR,
  URU,
  USA,
  UZB,
  VFB,
  VIK,
  VIL,
};

export const LINEUPS: Record<string, Lineup> = {
  AEK: AEK_LINEUP,
  ALG: ALG_LINEUP,
  ARG: ARG_LINEUP,
  ARS: ARS_LINEUP,
  ATL: ATL_LINEUP,
  AUS: AUS_LINEUP,
  AUT: AUT_LINEUP,
  AVL: AVL_LINEUP,
  BAR: BAR_LINEUP,
  BAY: BAY_LINEUP,
  BEL: BEL_LINEUP,
  BET: BET_LINEUP,
  BIH: BIH_LINEUP,
  BOD: BOD_LINEUP,
  BRA: BRA_LINEUP,
  BRU: BRU_LINEUP,
  BVB: BVB_LINEUP,
  CAN: CAN_LINEUP,
  CIV: CIV_LINEUP,
  COD: COD_LINEUP,
  COL: COL_LINEUP,
  COM: COM_LINEUP,
  CPV: CPV_LINEUP,
  CRO: CRO_LINEUP,
  CUW: CUW_LINEUP,
  CZE: CZE_LINEUP,
  ECU: ECU_LINEUP,
  EGY: EGY_LINEUP,
  ENG: ENG_LINEUP,
  ESP: ESP_LINEUP,
  FCP: FCP_LINEUP,
  FEN: FEN_LINEUP,
  FEY: FEY_LINEUP,
  FRA: FRA_LINEUP,
  GAL: GAL_LINEUP,
  GER: GER_LINEUP,
  GHA: GHA_LINEUP,
  HAI: HAI_LINEUP,
  INT: INT_LINEUP,
  IRN: IRN_LINEUP,
  IRQ: IRQ_LINEUP,
  JOR: JOR_LINEUP,
  JPN: JPN_LINEUP,
  KOR: KOR_LINEUP,
  KSA: KSA_LINEUP,
  LIL: LIL_LINEUP,
  LIV: LIV_LINEUP,
  LSK: LSK_LINEUP,
  MAR: MAR_LINEUP,
  MCI: MCI_LINEUP,
  MEX: MEX_LINEUP,
  MUN: MUN_LINEUP,
  NAP: NAP_LINEUP,
  NED: NED_LINEUP,
  NOR: NOR_LINEUP,
  NZL: NZL_LINEUP,
  PAN: PAN_LINEUP,
  PAR: PAR_LINEUP,
  POR: POR_LINEUP,
  PSG: PSG_LINEUP,
  PSV: PSV_LINEUP,
  QAT: QAT_LINEUP,
  RBL: RBL_LINEUP,
  RCL: RCL_LINEUP,
  RMA: RMA_LINEUP,
  ROM: ROM_LINEUP,
  RSA: RSA_LINEUP,
  SAB: SAB_LINEUP,
  SCO: SCO_LINEUP,
  SEN: SEN_LINEUP,
  SHK: SHK_LINEUP,
  SLO: SLO_LINEUP,
  SLP: SLP_LINEUP,
  SPO: SPO_LINEUP,
  SUI: SUI_LINEUP,
  SWE: SWE_LINEUP,
  TUN: TUN_LINEUP,
  TUR: TUR_LINEUP,
  URU: URU_LINEUP,
  USA: USA_LINEUP,
  UZB: UZB_LINEUP,
  VFB: VFB_LINEUP,
  VIK: VIK_LINEUP,
  VIL: VIL_LINEUP,
};

export const getSquad = (teamId: string): Player[] => SQUADS[teamId] ?? [];
export const getLineup = (teamId: string): Lineup | null => LINEUPS[teamId] ?? null;
export const OFFICIAL_SQUADS: string[] = Object.keys(SQUADS);
export const isOfficialSquad = (teamId: string): boolean => OFFICIAL_SQUADS.includes(teamId);
