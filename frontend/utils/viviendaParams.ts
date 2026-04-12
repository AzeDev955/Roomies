type RouteParam = string | string[] | null | undefined;

function normalizeParam(param: RouteParam): string | undefined {
  const value = Array.isArray(param) ? param[0] : param;
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function decodePathSegment(segment: string | undefined): string | undefined {
  if (!segment) {
    return undefined;
  }

  try {
    return normalizeParam(decodeURIComponent(segment));
  } catch {
    return normalizeParam(segment);
  }
}

export function extractViviendaIdFromPath(pathname: string): string | undefined {
  const [pathWithoutQuery] = pathname.split(/[?#]/);
  const segments = pathWithoutQuery.split('/').filter(Boolean);
  const viviendaIndex = segments.findIndex((segment) => segment === 'vivienda');

  return viviendaIndex >= 0 ? decodePathSegment(segments[viviendaIndex + 1]) : undefined;
}

export function resolveViviendaIdParam(paramsId: RouteParam, pathname: string): string | undefined {
  return extractViviendaIdFromPath(pathname) ?? normalizeParam(paramsId);
}
