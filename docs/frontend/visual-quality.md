# Calidad visual obligatoria

Esta guia resume los patrones minimos que deben respetar las PRs de frontend en Roomies.

## Tokens

- `frontend/constants/theme.ts` es la unica fuente de colores, radios, espaciados, sombras y tamanos tipograficos.
- No se anaden hexadecimales en pantallas, componentes o estilos. Si aparece un color nuevo, primero se justifica y se incorpora a `Theme.colors`.
- Los tints semanticos usan `Theme.colors.primaryLight`, `successLight`, `warningLight`, `dangerLight` o el color base con alpha (`Theme.colors.primary + '18'`) cuando el estado necesita una intensidad puntual.
- Los textos de estado sobre tints usan `successText`, `warningText` o `dangerText` para mantener contraste consistente.
- Los valores dinamicos como `opacity`, `scale`, `shadowOpacity` o porcentajes de layout pueden seguir siendo numeros locales cuando representan comportamiento, no sistema visual.

## Componentes

- Los CTAs primarios usan `CustomButton` siempre que no haya una necesidad especifica de layout.
- Las tarjetas interactivas usan `Card` con `onPress` y `accessibilityLabel`.
- Inputs reutilizables usan `CustomInput`, con placeholder en `Theme.colors.textMuted` y labels visibles.
- Los componentes heredados de Expo solo se conservan si consumen `Theme` y no introducen paletas paralelas.

## Accesibilidad

- Todo `Pressable` o `TouchableOpacity` accionable declara `accessibilityRole`.
- Las acciones sin texto suficiente declaran `accessibilityLabel`; los selectores declaran `accessibilityState.selected`.
- Las acciones bloqueadas o en carga declaran `accessibilityState.disabled` y, si aplica, `busy`.
- El color no puede ser el unico indicador de estado: debe haber texto, icono o copy visible que explique la accion.
- Los botones mantienen un objetivo tactil minimo de 44 pt; los CTAs principales usan `minHeight: 52`.

## Copy y feedback

- El copy de errores debe decir que paso y como continuar, sin placeholders tecnicos.
- Preferimos Toast para errores no destructivos y confirmaciones breves.
- `Alert.alert` queda reservado para confirmaciones nativas destructivas o decisiones bloqueantes donde el sistema operativo aporta claridad.
- Los textos de UI y documentacion deben guardarse en UTF-8 y revisarse para evitar mojibake.

