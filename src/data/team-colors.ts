import { UCL_CLUBS_DATA } from './ucl-clubs';

const UCL_COLORS: Record<string, [string, string]> = Object.fromEntries(
  Object.entries(UCL_CLUBS_DATA).map(([id, club]) => [id, club.colors])
);

export const TEAM_COLORS: Record<string, [string, string]> = {
  ...UCL_COLORS,
  // Grupo A
  MEX: ['#006847', '#CE1126'],
  RSA: ['#007749', '#FFB81C'],
  KOR: ['#C60C30', '#003478'],
  CZE: ['#D7141A', '#11457E'],
  // Grupo B
  CAN: ['#D52B1E', '#FFFFFF'],
  SUI: ['#D52B1E', '#FFFFFF'],
  QAT: ['#8A1538', '#FFFFFF'],
  BIH: ['#003893', '#FFCD00'],
  // Grupo C
  BRA: ['#009B3A', '#FEDF00'],
  MAR: ['#C1272D', '#006233'],
  SCO: ['#003876', '#FFFFFF'],
  HAI: ['#00209F', '#D21034'],
  // Grupo D
  USA: ['#002868', '#BF0A30'],
  PAR: ['#D52B1E', '#003398'],
  AUS: ['#00843D', '#FFCD00'],
  TUR: ['#E30A17', '#FFFFFF'],
  // Grupo E
  GER: ['#000000', '#DD0000'],
  CUW: ['#002B7F', '#F9E814'],
  CIV: ['#F77F00', '#009E60'],
  ECU: ['#FFD100', '#0033A0'],
  // Grupo F
  NED: ['#F36C21', '#FFFFFF'],
  JPN: ['#1B1464', '#D01012'],
  TUN: ['#E70013', '#FFFFFF'],
  SWE: ['#005B99', '#FECD00'],
  // Grupo G
  BEL: ['#D21034', '#FFCE00'],
  EGY: ['#C8102E', '#000000'],
  IRN: ['#239F40', '#FFFFFF'],
  NZL: ['#000000', '#FFFFFF'],
  // Grupo H
  ESP: ['#AA151B', '#F1BF00'],
  URU: ['#0033A0', '#FFFFFF'],
  KSA: ['#006C35', '#FFFFFF'],
  CPV: ['#003893', '#CE1126'],
  // Grupo I
  FRA: ['#002395', '#FFFFFF'],
  SEN: ['#00853F', '#FDEF42'],
  NOR: ['#BA0C2F', '#00205B'],
  IRQ: ['#CE1126', '#000000'],
  // Grupo J
  ARG: ['#75AADB', '#FFFFFF'],
  AUT: ['#ED2939', '#FFFFFF'],
  ALG: ['#006633', '#FFFFFF'],
  JOR: ['#CE1126', '#000000'],
  // Grupo K
  POR: ['#006600', '#D52B1E'],
  COL: ['#FFD100', '#003893'],
  UZB: ['#0099B5', '#CE1126'],
  COD: ['#0078D7', '#F7D618'],
  // Grupo L
  ENG: ['#FFFFFF', '#CE1124'],
  CRO: ['#D00000', '#FFFFFF'],
  GHA: ['#CE1126', '#FCD116'],
  PAN: ['#005293', '#D21034'],
};
