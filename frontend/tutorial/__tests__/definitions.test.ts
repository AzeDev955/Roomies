import {
  buildCaseroTutorialSteps,
  buildInquilinoTutorialSteps,
} from '@/tutorial/definitions';

describe('tutorial definitions', () => {
  it('incluye cobros para casero cuando el modulo esta activo', () => {
    const steps = buildCaseroTutorialSteps({ hasGastos: true });

    expect(steps.some((step) => step.targetId === 'casero.cobros.main')).toBe(true);
    expect(steps.at(-1)?.targetId).toBe('perfil.tutorial');
  });

  it('omite cobros para casero cuando el modulo esta inactivo', () => {
    const steps = buildCaseroTutorialSteps({ hasGastos: false });

    expect(steps.some((step) => step.targetId === 'casero.cobros.main')).toBe(false);
  });

  it('adapta el tutorial del inquilino cuando aun no tiene vivienda', () => {
    const steps = buildInquilinoTutorialSteps({ hasVivienda: false, hasGastos: true });

    expect(steps.map((step) => step.targetId)).toEqual([
      'inquilino.inicio.main',
      'perfil.apariencia',
      'perfil.tutorial',
    ]);
  });

  it('incluye gastos para inquilino solo cuando procede', () => {
    const conGastos = buildInquilinoTutorialSteps({ hasVivienda: true, hasGastos: true });
    const sinGastos = buildInquilinoTutorialSteps({ hasVivienda: true, hasGastos: false });

    expect(conGastos.some((step) => step.targetId === 'inquilino.gastos.main')).toBe(true);
    expect(sinGastos.some((step) => step.targetId === 'inquilino.gastos.main')).toBe(false);
  });
});
