export { TEAMS_2026, MATCH_DAYS, generateGroupMatches } from './ucl-2027';

export const KNOCKOUT_BRACKET = {
  roundOf32: [
    { id: 'R32-01', prevMatchA: 'G-E-1', prevMatchB: 'G-3-1', side: 'left' },  // M74
    { id: 'R32-02', prevMatchA: 'G-I-1', prevMatchB: 'G-3-2', side: 'left' },  // M77
    { id: 'R32-03', prevMatchA: 'G-A-2', prevMatchB: 'G-B-2', side: 'left' },  // M73
    { id: 'R32-04', prevMatchA: 'G-F-1', prevMatchB: 'G-C-2', side: 'left' },  // M75
    { id: 'R32-05', prevMatchA: 'G-K-2', prevMatchB: 'G-L-2', side: 'left' },  // M83
    { id: 'R32-06', prevMatchA: 'G-H-1', prevMatchB: 'G-J-2', side: 'left' },  // M84
    { id: 'R32-07', prevMatchA: 'G-D-1', prevMatchB: 'G-3-3', side: 'left' },  // M81
    { id: 'R32-08', prevMatchA: 'G-G-1', prevMatchB: 'G-3-4', side: 'left' },  // M82
    { id: 'R32-09', prevMatchA: 'G-C-1', prevMatchB: 'G-F-2', side: 'right' }, // M76
    { id: 'R32-10', prevMatchA: 'G-E-2', prevMatchB: 'G-I-2', side: 'right' }, // M78
    { id: 'R32-11', prevMatchA: 'G-A-1', prevMatchB: 'G-3-5', side: 'right' }, // M79
    { id: 'R32-12', prevMatchA: 'G-L-1', prevMatchB: 'G-3-6', side: 'right' }, // M80
    { id: 'R32-13', prevMatchA: 'G-J-1', prevMatchB: 'G-H-2', side: 'right' }, // M86
    { id: 'R32-14', prevMatchA: 'G-D-2', prevMatchB: 'G-G-2', side: 'right' }, // M88
    { id: 'R32-15', prevMatchA: 'G-B-1', prevMatchB: 'G-3-7', side: 'right' }, // M85
    { id: 'R32-16', prevMatchA: 'G-K-1', prevMatchB: 'G-3-8', side: 'right' }, // M87
  ],
  roundOf16: [
    { id: 'R16-01', prevMatchA: 'R32-01', prevMatchB: 'R32-02', side: 'left' }, // M89
    { id: 'R16-02', prevMatchA: 'R32-03', prevMatchB: 'R32-04', side: 'left' }, // M90
    { id: 'R16-03', prevMatchA: 'R32-05', prevMatchB: 'R32-06', side: 'left' }, // M93
    { id: 'R16-04', prevMatchA: 'R32-07', prevMatchB: 'R32-08', side: 'left' }, // M94
    { id: 'R16-05', prevMatchA: 'R32-09', prevMatchB: 'R32-10', side: 'right' }, // M91
    { id: 'R16-06', prevMatchA: 'R32-11', prevMatchB: 'R32-12', side: 'right' }, // M92
    { id: 'R16-07', prevMatchA: 'R32-13', prevMatchB: 'R32-14', side: 'right' }, // M95
    { id: 'R16-08', prevMatchA: 'R32-15', prevMatchB: 'R32-16', side: 'right' }, // M96
  ],
  quarterfinals: [
    { id: 'QF-01', prevMatchA: 'R16-01', prevMatchB: 'R16-02', side: 'left' },
    { id: 'QF-02', prevMatchA: 'R16-03', prevMatchB: 'R16-04', side: 'left' },
    { id: 'QF-03', prevMatchA: 'R16-05', prevMatchB: 'R16-06', side: 'right' },
    { id: 'QF-04', prevMatchA: 'R16-07', prevMatchB: 'R16-08', side: 'right' },
  ],
  semifinals: [
    { id: 'SF-01', prevMatchA: 'QF-01', prevMatchB: 'QF-02', side: 'left' },
    { id: 'SF-02', prevMatchA: 'QF-03', prevMatchB: 'QF-04', side: 'right' },
  ],
  thirdPlace: { id: 'TP-01', prevMatchA: 'SF-01', prevMatchB: 'SF-02' },
  final: { id: 'FIN-01', prevMatchA: 'SF-01', prevMatchB: 'SF-02' },
};