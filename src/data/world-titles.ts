import { UCL_TITLES } from './ucl-clubs';

/** Número de títulos de Champions League por club o Copa del Mundo por selección. */
export const WORLD_TITLES: Record<string, number> = {
  ...UCL_TITLES,
  BRA: 5,
  GER: 4,
  ARG: 3,
  FRA: 2,
  URU: 2,
  ENG: 1,
  ESP: 1,
};
