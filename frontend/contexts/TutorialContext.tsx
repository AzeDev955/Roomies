import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { usePathname, useRouter } from 'expo-router';
import api from '@/services/api';
import { obtenerToken } from '@/services/auth.service';
import { useAppTheme } from '@/contexts/ThemeContext';
import { DefaultAppTheme, type AppTheme } from '@/constants/theme';
import {
  TUTORIAL_VERSION,
  type TutorialRole,
  type TutorialStep,
} from '@/tutorial/definitions';

const TUTORIAL_STATE_KEY = `roomies.tutorial.${TUTORIAL_VERSION}`;
const HIGHLIGHT_PADDING = 12;
const CARD_MAX_WIDTH = 380;

type TargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TutorialStorage = Record<string, 'completed' | 'skipped'>;

type TutorialSession = {
  role: TutorialRole;
  steps: TutorialStep[];
  index: number;
  source: 'auto' | 'manual';
};

type TutorialAuth = {
  id: number;
  rol: TutorialRole;
};

type TutorialContextValue = {
  registerTarget: (id: string, rect: TargetRect) => void;
  unregisterTarget: (id: string) => void;
  setRoleTutorialSteps: (role: TutorialRole, steps: TutorialStep[]) => void;
  startRoleTutorial: (role: TutorialRole) => boolean;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

function getTutorialPreferenceKey(auth: TutorialAuth) {
  return `${auth.id}:${auth.rol}:${TUTORIAL_VERSION}`;
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const [session, setSession] = useState<TutorialSession | null>(null);
  const [targets, setTargets] = useState<Record<string, TargetRect>>({});
  const [roleSteps, setRoleSteps] = useState<Record<TutorialRole, TutorialStep[]>>({
    CASERO: [],
    INQUILINO: [],
  });
  const [preferences, setPreferences] = useState<TutorialStorage>({});
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [auth, setAuth] = useState<TutorialAuth | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const autoStartedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPreferences = async () => {
      try {
        const raw = await SecureStore.getItemAsync(TUTORIAL_STATE_KEY);
        if (!mounted) return;
        setPreferences(raw ? (JSON.parse(raw) as TutorialStorage) : {});
      } catch {
        if (mounted) {
          setPreferences({});
        }
      } finally {
        if (mounted) {
          setPreferencesLoaded(true);
        }
      }
    };

    void loadPreferences();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAuth = async () => {
      try {
        const token = await obtenerToken();
        if (!token) {
          if (mounted) {
            setAuth(null);
          }
          return;
        }

        const { data } = await api.get<{ id: number; rol: TutorialRole }>('/auth/me');
        if (mounted) {
          setAuth({ id: data.id, rol: data.rol });
        }
      } catch {
        if (mounted) {
          setAuth(null);
        }
      } finally {
        if (mounted) {
          setAuthLoaded(true);
        }
      }
    };

    void loadAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const registerTarget = useCallback((id: string, rect: TargetRect) => {
    setTargets((current) => {
      const previous = current[id];
      if (
        previous &&
        previous.x === rect.x &&
        previous.y === rect.y &&
        previous.width === rect.width &&
        previous.height === rect.height
      ) {
        return current;
      }

      return { ...current, [id]: rect };
    });
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    setTargets((current) => {
      if (!(id in current)) {
        return current;
      }

      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const setRoleTutorialSteps = useCallback((role: TutorialRole, steps: TutorialStep[]) => {
    setRoleSteps((current) => {
      const previous = current[role];
      const nextSignature = steps.map((step) => step.id).join('|');
      const previousSignature = previous.map((step) => step.id).join('|');

      if (nextSignature === previousSignature) {
        return current;
      }

      return { ...current, [role]: steps };
    });
  }, []);

  const persistPreference = useCallback(async (nextStatus: 'completed' | 'skipped') => {
    if (!auth) {
      setSession(null);
      return;
    }

    const nextPreferences = {
      ...preferences,
      [getTutorialPreferenceKey(auth)]: nextStatus,
    };

    setPreferences(nextPreferences);
    setSession(null);
    await SecureStore.setItemAsync(TUTORIAL_STATE_KEY, JSON.stringify(nextPreferences));
  }, [auth, preferences]);

  const startRoleTutorial = useCallback((role: TutorialRole) => {
    const steps = roleSteps[role];
    if (!steps || steps.length === 0) {
      return false;
    }

    setSession({
      role,
      steps,
      index: 0,
      source: 'manual',
    });
    return true;
  }, [roleSteps]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const currentStep = session.steps[session.index];
    if (pathname !== currentStep.route) {
      router.replace(currentStep.route as never);
    }
  }, [pathname, router, session]);

  useEffect(() => {
    if (!authLoaded || !preferencesLoaded || session || !auth) {
      return;
    }

    const availableSteps = roleSteps[auth.rol];
    if (!availableSteps || availableSteps.length === 0) {
      return;
    }

    const preferenceKey = getTutorialPreferenceKey(auth);
    if (preferences[preferenceKey]) {
      return;
    }

    if (autoStartedKeyRef.current === preferenceKey) {
      return;
    }

    autoStartedKeyRef.current = preferenceKey;
    setSession({
      role: auth.rol,
      steps: availableSteps,
      index: 0,
      source: 'auto',
    });
  }, [auth, authLoaded, preferences, preferencesLoaded, roleSteps, session]);

  const value = useMemo<TutorialContextValue>(() => ({
    registerTarget,
    unregisterTarget,
    setRoleTutorialSteps,
    startRoleTutorial,
  }), [registerTarget, setRoleTutorialSteps, startRoleTutorial, unregisterTarget]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay
        auth={auth}
        preferencesLoaded={preferencesLoaded}
        session={session}
        setSession={setSession}
        targets={targets}
        onComplete={() => void persistPreference('completed')}
        onSkip={() => void persistPreference('skipped')}
        theme={theme}
      />
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const value = useContext(TutorialContext);

  if (!value) {
    return {
      registerTarget: () => undefined,
      unregisterTarget: () => undefined,
      setRoleTutorialSteps: () => undefined,
      startRoleTutorial: () => false,
    };
  }

  return value;
}

export function useTutorialTarget(id: string) {
  const { registerTarget, unregisterTarget } = useTutorial();
  const targetRef = useRef<View | null>(null);

  const measure = useCallback(() => {
    requestAnimationFrame(() => {
      targetRef.current?.measureInWindow((x, y, width, height) => {
        if (!width || !height) {
          return;
        }

        registerTarget(id, { x, y, width, height });
      });
    });
  }, [id, registerTarget]);

  useEffect(() => () => unregisterTarget(id), [id, unregisterTarget]);

  return {
    ref: targetRef,
    onLayout: measure,
  };
}

function TutorialOverlay({
  auth,
  preferencesLoaded,
  session,
  setSession,
  targets,
  onComplete,
  onSkip,
  theme,
}: {
  auth: TutorialAuth | null;
  preferencesLoaded: boolean;
  session: TutorialSession | null;
  setSession: (session: TutorialSession | null | ((current: TutorialSession | null) => TutorialSession | null)) => void;
  targets: Record<string, TargetRect>;
  onComplete: () => void;
  onSkip: () => void;
  theme: AppTheme;
}) {
  const { width, height } = useWindowDimensions();

  if (!auth || !preferencesLoaded || !session) {
    return null;
  }

  const currentStep = session.steps[session.index];
  const currentTarget = targets[currentStep.targetId];
  const isLastStep = session.index === session.steps.length - 1;
  const overlayStyles = createOverlayStyles(theme);
  const highlight = currentTarget
    ? {
        top: Math.max(currentTarget.y - HIGHLIGHT_PADDING, 0),
        left: Math.max(currentTarget.x - HIGHLIGHT_PADDING, 0),
        width: Math.min(currentTarget.width + HIGHLIGHT_PADDING * 2, width),
        height: Math.min(currentTarget.height + HIGHLIGHT_PADDING * 2, height),
      }
    : null;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        index: Math.min(current.index + 1, current.steps.length - 1),
      };
    });
  };

  const previousStep = () => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        index: Math.max(current.index - 1, 0),
      };
    });
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      onRequestClose={onSkip}
    >
      <View style={overlayStyles.root}>
        {highlight ? (
          <>
            <View style={[overlayStyles.dim, { top: 0, left: 0, right: 0, height: highlight.top }]} />
            <View
              style={[
                overlayStyles.dim,
                {
                  top: highlight.top,
                  left: 0,
                  width: highlight.left,
                  height: highlight.height,
                },
              ]}
            />
            <View
              style={[
                overlayStyles.dim,
                {
                  top: highlight.top,
                  left: highlight.left + highlight.width,
                  right: 0,
                  height: highlight.height,
                },
              ]}
            />
            <View
              style={[
                overlayStyles.dim,
                {
                  top: highlight.top + highlight.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                overlayStyles.highlight,
                {
                  top: highlight.top,
                  left: highlight.left,
                  width: highlight.width,
                  height: highlight.height,
                },
              ]}
            />
          </>
        ) : (
          <View style={[overlayStyles.dim, StyleSheet.absoluteFillObject]} />
        )}

        <View style={overlayStyles.cardContainer} pointerEvents="box-none">
          <View style={overlayStyles.card}>
            <View style={overlayStyles.cardHeader}>
              <Text style={overlayStyles.stepCounter}>
                Paso {session.index + 1} de {session.steps.length}
              </Text>
              <Pressable
                style={({ pressed }) => [overlayStyles.skipButton, pressed && overlayStyles.pressed]}
                onPress={onSkip}
              >
                <Text style={overlayStyles.skipText}>Saltar</Text>
              </Pressable>
            </View>

            <Text style={overlayStyles.title}>{currentStep.title}</Text>
            <Text style={overlayStyles.description}>{currentStep.description}</Text>

            {!highlight && (
              <Text style={overlayStyles.helperText}>
                Estamos preparando el foco visual de este paso.
              </Text>
            )}

            <View style={overlayStyles.actions}>
              {session.index > 0 ? (
                <Pressable
                  style={({ pressed }) => [overlayStyles.secondaryButton, pressed && overlayStyles.pressed]}
                  onPress={previousStep}
                >
                  <Text style={overlayStyles.secondaryButtonText}>Atras</Text>
                </Pressable>
              ) : (
                <View style={overlayStyles.actionsSpacer} />
              )}

              <Pressable
                style={({ pressed }) => [overlayStyles.primaryButton, pressed && overlayStyles.pressed]}
                onPress={nextStep}
              >
                <Text style={overlayStyles.primaryButtonText}>
                  {isLastStep ? 'Finalizar' : 'Siguiente'}
                </Text>
              </Pressable>
            </View>

            {session.source === 'auto' && (
              <Text style={overlayStyles.footerText}>
                Este recorrido se abre una sola vez por usuario, pero podras repetirlo desde perfil.
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createOverlayStyles = (theme: AppTheme = DefaultAppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    dim: {
      position: 'absolute',
      backgroundColor: theme.colors.overlay,
    },
    highlight: {
      position: 'absolute',
      borderRadius: theme.radius.xl,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: 'transparent',
    },
    cardContainer: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.xl,
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX_WIDTH,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.isDark ? 0.35 : 0.16,
      shadowRadius: 18,
      elevation: 12,
      gap: theme.spacing.base,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepCounter: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.label,
      fontWeight: '700',
    },
    skipButton: {
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface2,
    },
    skipText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.label,
      fontWeight: '700',
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontWeight: '700',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body,
      lineHeight: 22,
    },
    helperText: {
      color: theme.colors.textTertiary,
      fontSize: theme.typography.caption,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    actionsSpacer: {
      flex: 1,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface2,
      paddingHorizontal: theme.spacing.base,
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontSize: theme.typography.label,
      fontWeight: '700',
    },
    primaryButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.base,
    },
    primaryButtonText: {
      color: theme.colors.surface,
      fontSize: theme.typography.label,
      fontWeight: '700',
    },
    footerText: {
      color: theme.colors.textTertiary,
      fontSize: theme.typography.caption,
      lineHeight: 18,
    },
    pressed: {
      opacity: 0.8,
    },
  });
