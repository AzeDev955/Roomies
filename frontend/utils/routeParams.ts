type RouteParam = string | string[] | null | undefined;

export function getStringParam(param: RouteParam): string | undefined {
  const value = Array.isArray(param) ? param[0] : param;
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function parsePositiveIntParam(param: RouteParam): number | null {
  const value = getStringParam(param);

  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseJsonArrayParam<T>(param: RouteParam): T[] {
  const value = getStringParam(param);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
