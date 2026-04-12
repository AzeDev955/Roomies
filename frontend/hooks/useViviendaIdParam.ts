import { useLocalSearchParams, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { resolveViviendaIdParam } from '@/utils/viviendaParams';

export function useViviendaIdParam() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const pathname = usePathname();

  return useMemo(() => {
    return resolveViviendaIdParam(params.id, pathname);
  }, [params.id, pathname]);
}
