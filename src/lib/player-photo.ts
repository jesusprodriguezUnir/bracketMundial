import { PLAYER_PHOTOS } from '../data/player-photos';

type PlayerPhotoCandidate = {
  number: number;
  photoUrl?: string;
};

export const hasPlayerPhoto = (teamId: string, n: number): boolean =>
  PLAYER_PHOTOS.has(`${teamId}-${n}`);

export const playerPhotoSrc = (teamId: string, n: number): string =>
  `${import.meta.env.BASE_URL}players/${teamId}/${n}.webp`;

export const resolvePlayerPhoto = (
  teamId: string,
  player?: PlayerPhotoCandidate | null,
): string | undefined => {
  if (!player) return undefined;
  if (hasPlayerPhoto(teamId, player.number)) {
    return playerPhotoSrc(teamId, player.number);
  }
  return player.photoUrl;
};
