const JOIN_PARAM = 'join';

export function buildInviteUrl(code: string): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(JOIN_PARAM, code);
  return url.toString();
}

export function extractJoinCode(): string | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get(JOIN_PARAM);
  if (!code) return null;
  params.delete(JOIN_PARAM);
  const search = params.toString();
  const newUrl = window.location.pathname + (search ? '?' + search : '') + window.location.hash;
  history.replaceState(null, '', newUrl);
  return code;
}
