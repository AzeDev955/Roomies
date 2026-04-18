# Issue 274 - Modo oscuro

## Objetivo

Implementar soporte inicial de modo oscuro en el frontend de Roomies respetando los tokens existentes y permitiendo elegir entre preferencia del sistema, modo claro y modo oscuro.

## Cambios

- Se anadio una paleta oscura equivalente en `frontend/constants/theme.ts` junto con tipos de tema y un constructor `buildAppTheme`.
- Se creo `AppThemeProvider` con deteccion de preferencia del sistema, persistencia en `expo-secure-store` y sincronizacion del color de fondo de sistema.
- El layout raiz aplica el provider, ajusta el `StatusBar` y usa el fondo del tema activo durante la verificacion de sesion.
- Los componentes compartidos `CustomButton`, `CustomInput`, `Card`, `LoadingScreen` y los toast consumen el tema activo.
- Las pantallas de login, registro, selector de rol y perfil usan estilos tematizados.
- El perfil incorpora un selector manual de apariencia: Sistema, Claro y Oscuro.
- Las barras de tabs principales de casero, inquilino y detalle de vivienda consumen tokens dinamicos.

## Verificacion

- `npm test -- --runInBand`
- `npm run lint`
- `npx tsc --noEmit`

## Notas

El alcance migrado cubre el sistema de tema, componentes base y pantallas principales de entrada/perfil. Las pantallas funcionales con estilos propios quedan preparadas para migraciones incrementales reutilizando `AppThemeProvider` y `createStyles(theme)`.
