import { useLocalSearchParams, usePathname } from 'expo-router';
import { useMemo } from 'react';

export function useViviendaIdParam() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const pathname = usePathname();

  return useMemo(() => {
    const localId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (localId) {
      return localId;
    }

    const segments = pathname.split('/').filter(Boolean);
    const viviendaIndex = segments.findIndex((segment) => segment === 'vivienda');
    const idFromPath = viviendaIndex >= 0 ? segments[viviendaIndex + 1] : undefined;

    return idFromPath ? decodeURIComponent(idFromPath) : undefined;
  }, [params.id, pathname]);
}
