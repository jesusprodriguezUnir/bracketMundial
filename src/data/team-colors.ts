import { UCL_CLUBS_DATA } from './ucl-clubs';

const UCL_COLORS: Record<string, [string, string]> = Object.fromEntries(
  Object.entries(UCL_CLUBS_DATA).map(([id, club]) => [id, club.colors])
);

export const TEAM_COLORS: Record<string, [string, string]> = {
  ...UCL_COLORS,
};
