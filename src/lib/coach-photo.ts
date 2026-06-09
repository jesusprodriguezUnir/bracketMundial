import { COACH_PHOTOS } from '../data/coach-photos';

type CoachPhotoCandidate = {
  photoUrl?: string;
};

export const hasCoachPhoto = (teamId: string): boolean =>
  COACH_PHOTOS.has(teamId);

export const coachPhotoSrc = (teamId: string): string =>
  `${import.meta.env?.BASE_URL ?? '/'}coaches/${teamId}.webp`;

export const resolveCoachPhoto = (
  teamId: string,
  coach?: CoachPhotoCandidate | null,
): string | undefined => {
  if (hasCoachPhoto(teamId)) {
    return coachPhotoSrc(teamId);
  }
  return coach?.photoUrl;
};
