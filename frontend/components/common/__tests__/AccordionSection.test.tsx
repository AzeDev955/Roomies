import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AccordionSection } from '../AccordionSection';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('AccordionSection', () => {
  it('muestra el contenido solo cuando esta expandido', () => {
    const onToggle = jest.fn();

    const { rerender } = render(
      <AccordionSection title="marzo 2026" expanded={false} onToggle={onToggle}>
        <Text>Factura cerrada</Text>
      </AccordionSection>,
    );

    expect(screen.queryByText('Factura cerrada')).toBeNull();

    rerender(
      <AccordionSection title="marzo 2026" expanded onToggle={onToggle}>
        <Text>Factura cerrada</Text>
      </AccordionSection>,
    );

    expect(screen.getByText('Factura cerrada')).toBeTruthy();
  });

  it('expone estado accesible y ejecuta onToggle', () => {
    const onToggle = jest.fn();

    render(
      <AccordionSection title="abril 2026" expanded={false} onToggle={onToggle}>
        <Text>Factura cerrada</Text>
      </AccordionSection>,
    );

    const button = screen.getByLabelText('Desplegar abril 2026');

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState).toEqual({ expanded: false });

    fireEvent.press(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
