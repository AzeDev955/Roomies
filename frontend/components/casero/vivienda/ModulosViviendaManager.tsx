import { Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useMemo, useState } from 'react';
import { useAppTheme } from '@/contexts/ThemeContext';
import api from '@/services/api';
import { createStyles } from '@/styles/casero/vivienda/detalle.styles';
import {
  ModulosVivienda,
  notificarModulosViviendaActualizados,
} from '@/utils/viviendaModules';

type ModuloViviendaKey = keyof ModulosVivienda;

type ViviendaConModulos = ModulosVivienda & {
  id: number;
};

type Props<T extends ViviendaConModulos> = {
  vivienda: T;
  onViviendaChange: (vivienda: T) => void;
};

const MODULOS_VIVIENDA: {
  key: ModuloViviendaKey;
  titulo: string;
  descripcion: string;
  icono: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'mod_limpieza',
    titulo: 'Limpieza y tareas',
    descripcion: 'Turnos, zonas y asignaciones de limpieza.',
    icono: 'sparkles-outline',
  },
  {
    key: 'mod_gastos',
    titulo: 'Gastos y finanzas',
    descripcion: 'Gastos compartidos, deudas, cobros y mensualidades.',
    icono: 'wallet-outline',
  },
  {
    key: 'mod_inventario',
    titulo: 'Inventario y assets',
    descripcion: 'Items, fotos y conformidad del inventario.',
    icono: 'albums-outline',
  },
];

export function ModulosViviendaManager<T extends ViviendaConModulos>({
  vivienda,
  onViviendaChange,
}: Props<T>) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [actualizandoModulo, setActualizandoModulo] = useState<ModuloViviendaKey | null>(null);

  const actualizarModulo = async (key: ModuloViviendaKey, value: boolean) => {
    if (actualizandoModulo) return;

    const anterior = vivienda;
    const viviendaOptimista = { ...vivienda, [key]: value };
    onViviendaChange(viviendaOptimista);
    setActualizandoModulo(key);

    try {
      const { data } = await api.patch<T>(`/viviendas/${vivienda.id}`, { [key]: value });
      onViviendaChange(data);
      notificarModulosViviendaActualizados({
        viviendaId: data.id,
        modulos: {
          mod_limpieza: data.mod_limpieza,
          mod_gastos: data.mod_gastos,
          mod_inventario: data.mod_inventario,
        },
      });
      Toast.show({ type: 'success', text1: 'Configuracion actualizada.' });
    } catch (err: any) {
      onViviendaChange(anterior);
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo actualizar el modulo.',
      });
    } finally {
      setActualizandoModulo(null);
    }
  };

  return (
    <View style={styles.modulosSection}>
      <View style={styles.sectionHeaderTextGroup}>
        <Text style={styles.seccionTitulo}>Modulos de la vivienda</Text>
        <Text style={styles.sectionDescription}>
          Activa solo las herramientas que quieres usar en esta casa.
        </Text>
      </View>

      <View style={styles.modulosList}>
        {MODULOS_VIVIENDA.map((modulo) => {
          const activo = vivienda[modulo.key];
          const actualizando = actualizandoModulo === modulo.key;
          const switchesBloqueados = actualizandoModulo !== null;

          return (
            <View key={modulo.key} style={styles.moduloCard}>
              <View style={styles.moduloIconBox}>
                <Ionicons name={modulo.icono} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.moduloBody}>
                <Text style={styles.moduloTitulo}>{modulo.titulo}</Text>
                <Text style={styles.moduloDescripcion}>{modulo.descripcion}</Text>
              </View>
              <Switch
                value={activo}
                disabled={switchesBloqueados}
                onValueChange={(value) => actualizarModulo(modulo.key, value)}
                trackColor={{
                  false: theme.colors.border,
                  true: switchesBloqueados ? theme.colors.successDisabled : theme.colors.success,
                }}
                thumbColor={switchesBloqueados ? theme.colors.surface2 : theme.colors.surface}
                ios_backgroundColor={theme.colors.border}
                accessibilityLabel={`${activo ? 'Desactivar' : 'Activar'} ${modulo.titulo}`}
              />
              {actualizando && <View style={styles.moduloUpdatingOverlay} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
