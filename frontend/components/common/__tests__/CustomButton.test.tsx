import { fireEvent, render, screen } from '@testing-library/react-native';
import { CustomButton } from '../CustomButton';

describe('CustomButton', () => {
  it('renderiza el label y ejecuta onPress', () => {
    const onPress = jest.fn();

    render(<CustomButton label="Entrar" onPress={onPress} />);
    fireEvent.press(screen.getByText('Entrar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('expone label y estado accesible en carga', () => {
    render(<CustomButton label="Guardar" onPress={jest.fn()} loading />);

    const button = screen.getByLabelText('Guardar');

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
  });
});
