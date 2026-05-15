export interface Player {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  club: string;
  captain?: boolean;
  thesportsdbId?: string;
  photoUrl?: string;
}

export interface Lineup {
  formation: string; // e.g. '4-2-3-1'
  startingXI: number[]; // Player numbers
}

import { squad as MEX, lineup as MEX_LINEUP } from './mex';
import { squad as RSA, lineup as RSA_LINEUP } from './rsa';
import { squad as KOR, lineup as KOR_LINEUP } from './kor';
import { squad as CZE, lineup as CZE_LINEUP } from './cze';
import { squad as CAN, lineup as CAN_LINEUP } from './can';
import { squad as SUI, lineup as SUI_LINEUP } from './sui';
import { squad as QAT, lineup as QAT_LINEUP } from './qat';
import { squad as BIH, lineup as BIH_LINEUP } from './bih';
import { squad as BRA, lineup as BRA_LINEUP } from './bra';
import { squad as MAR, lineup as MAR_LINEUP } from './mar';
import { squad as SCO, lineup as SCO_LINEUP } from './sco';
import { squad as HAI, lineup as HAI_LINEUP } from './hai';
import { squad as USA, lineup as USA_LINEUP } from './usa';
import { squad as PAR, lineup as PAR_LINEUP } from './par';
import { squad as AUS, lineup as AUS_LINEUP } from './aus';
import { squad as TUR, lineup as TUR_LINEUP } from './tur';
import { squad as GER, lineup as GER_LINEUP } from './ger';
import { squad as CUW, lineup as CUW_LINEUP } from './cuw';
import { squad as CIV, lineup as CIV_LINEUP } from './civ';
import { squad as ECU, lineup as ECU_LINEUP } from './ecu';
import { squad as NED, lineup as NED_LINEUP } from './ned';
import { squad as JPN, lineup as JPN_LINEUP } from './jpn';
import { squad as TUN, lineup as TUN_LINEUP } from './tun';
import { squad as SWE, lineup as SWE_LINEUP } from './swe';
import { squad as BEL, lineup as BEL_LINEUP } from './bel';
import { squad as EGY, lineup as EGY_LINEUP } from './egy';
import { squad as IRN, lineup as IRN_LINEUP } from './irn';
import { squad as NZL, lineup as NZL_LINEUP } from './nzl';
import { squad as ESP, lineup as ESP_LINEUP } from './esp';
import { squad as URU, lineup as URU_LINEUP } from './uru';
import { squad as KSA, lineup as KSA_LINEUP } from './ksa';
import { squad as CPV, lineup as CPV_LINEUP } from './cpv';
import { squad as FRA, lineup as FRA_LINEUP } from './fra';
import { squad as SEN, lineup as SEN_LINEUP } from './sen';
import { squad as NOR, lineup as NOR_LINEUP } from './nor';
import { squad as IRQ, lineup as IRQ_LINEUP } from './irq';
import { squad as ARG, lineup as ARG_LINEUP } from './arg';
import { squad as AUT, lineup as AUT_LINEUP } from './aut';
import { squad as ALG, lineup as ALG_LINEUP } from './alg';
import { squad as JOR, lineup as JOR_LINEUP } from './jor';
import { squad as POR, lineup as POR_LINEUP } from './por';
import { squad as COL, lineup as COL_LINEUP } from './col';
import { squad as UZB, lineup as UZB_LINEUP } from './uzb';
import { squad as COD, lineup as COD_LINEUP } from './cod';
import { squad as ENG, lineup as ENG_LINEUP } from './eng';
import { squad as CRO, lineup as CRO_LINEUP } from './cro';
import { squad as GHA, lineup as GHA_LINEUP } from './gha';
import { squad as PAN, lineup as PAN_LINEUP } from './pan';

export const SQUADS: Record<string, Player[]> = {
  MEX, RSA, KOR, CZE,
  CAN, SUI, QAT, BIH,
  BRA, MAR, SCO, HAI,
  USA, PAR, AUS, TUR,
  GER, CUW, CIV, ECU,
  NED, JPN, TUN, SWE,
  BEL, EGY, IRN, NZL,
  ESP, URU, KSA, CPV,
  FRA, SEN, NOR, IRQ,
  ARG, AUT, ALG, JOR,
  POR, COL, UZB, COD,
  ENG, CRO, GHA, PAN,
};

export const LINEUPS: Record<string, Lineup> = {
  JPN: JPN_LINEUP,
  MEX: MEX_LINEUP,
  BRA: BRA_LINEUP,
  USA: USA_LINEUP,
  GER: GER_LINEUP,
  ESP: ESP_LINEUP,
  FRA: FRA_LINEUP,
  ARG: ARG_LINEUP,
  ENG: ENG_LINEUP,
  NED: NED_LINEUP,
  POR: POR_LINEUP,
  BEL: BEL_LINEUP,
  CRO: CRO_LINEUP,
  URU: URU_LINEUP,
  COL: COL_LINEUP,
  MAR: MAR_LINEUP,
  SEN: SEN_LINEUP,
  RSA: RSA_LINEUP,
  KOR: KOR_LINEUP,
  CZE: CZE_LINEUP,
  CAN: CAN_LINEUP,
  SUI: SUI_LINEUP,
  QAT: QAT_LINEUP,
  BIH: BIH_LINEUP,
  SCO: SCO_LINEUP,
  HAI: HAI_LINEUP,
  PAR: PAR_LINEUP,
  AUS: AUS_LINEUP,
  TUR: TUR_LINEUP,
  CUW: CUW_LINEUP,
  CIV: CIV_LINEUP,
  ECU: ECU_LINEUP,
  TUN: TUN_LINEUP,
  SWE: SWE_LINEUP,
  EGY: EGY_LINEUP,
  IRN: IRN_LINEUP,
  NZL: NZL_LINEUP,
  KSA: KSA_LINEUP,
  CPV: CPV_LINEUP,
  NOR: NOR_LINEUP,
  IRQ: IRQ_LINEUP,
  AUT: AUT_LINEUP,
  ALG: ALG_LINEUP,
  JOR: JOR_LINEUP,
  UZB: UZB_LINEUP,
  COD: COD_LINEUP,
  GHA: GHA_LINEUP,
  PAN: PAN_LINEUP,
};

export const getSquad = (teamId: string): Player[] => SQUADS[teamId] ?? [];
export const getLineup = (teamId: string): Lineup | null => LINEUPS[teamId] ?? null;

export const OFFICIAL_SQUADS: string[] = ['BIH', 'SWE', 'FRA', 'NZL', 'JPN', 'BEL', 'HAI', 'ENG', 'CZE', 'BRA'];

export const isOfficialSquad = (teamId: string): boolean => OFFICIAL_SQUADS.includes(teamId);
