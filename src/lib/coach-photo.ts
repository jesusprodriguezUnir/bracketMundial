import { COACH_PHOTOS } from '../data/coach-photos';

export const hasCoachPhoto = (teamId: string): boolean =>
  COACH_PHOTOS.has(teamId);

export const coachPhotoSrc = (teamId: string): string =>
  `${import.meta.env.BASE_URL}coaches/${teamId}.webp`;
