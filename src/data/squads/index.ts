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

import { squad as MEX } from './mex';
import { squad as RSA } from './rsa';
import { squad as KOR } from './kor';
import { squad as CZE } from './cze';
import { squad as CAN } from './can';
import { squad as SUI } from './sui';
import { squad as QAT } from './qat';
import { squad as BIH } from './bih';
import { squad as BRA } from './bra';
import { squad as MAR } from './mar';
import { squad as SCO } from './sco';
import { squad as HAI } from './hai';
import { squad as USA } from './usa';
import { squad as PAR } from './par';
import { squad as AUS } from './aus';
import { squad as TUR } from './tur';
import { squad as GER } from './ger';
import { squad as CUW } from './cuw';
import { squad as CIV } from './civ';
import { squad as ECU } from './ecu';
import { squad as NED } from './ned';
import { squad as JPN } from './jpn';
import { squad as TUN } from './tun';
import { squad as SWE } from './swe';
import { squad as BEL } from './bel';
import { squad as EGY } from './egy';
import { squad as IRN } from './irn';
import { squad as NZL } from './nzl';
import { squad as ESP } from './esp';
import { squad as URU } from './uru';
import { squad as KSA } from './ksa';
import { squad as CPV } from './cpv';
import { squad as FRA } from './fra';
import { squad as SEN } from './sen';
import { squad as NOR } from './nor';
import { squad as IRQ } from './irq';
import { squad as ARG } from './arg';
import { squad as AUT } from './aut';
import { squad as ALG } from './alg';
import { squad as JOR } from './jor';
import { squad as POR } from './por';
import { squad as COL } from './col';
import { squad as UZB } from './uzb';
import { squad as COD } from './cod';
import { squad as ENG } from './eng';
import { squad as CRO } from './cro';
import { squad as GHA } from './gha';
import { squad as PAN } from './pan';

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

export const getSquad = (teamId: string): Player[] => SQUADS[teamId] ?? [];

export const OFFICIAL_SQUADS: string[] = ['BIH', 'SWE', 'FRA', 'NZL', 'JPN'];

export const isOfficialSquad = (teamId: string): boolean => OFFICIAL_SQUADS.includes(teamId);
