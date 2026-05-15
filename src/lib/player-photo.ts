import { PLAYER_PHOTOS } from '../data/player-photos';

export const hasPlayerPhoto = (teamId: string, n: number): boolean =>
  PLAYER_PHOTOS.has(`${teamId}-${n}`);

export const playerPhotoSrc = (teamId: string, n: number): string =>
  `${import.meta.env.BASE_URL}players/${teamId}/${n}.webp`;
