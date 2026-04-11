import { fireEvent, render, screen } from '@testing-library/react-native';
import { CustomButton } from '../CustomButton';

describe('CustomButton', () => {
  it('renderiza el label y ejecuta onPress', () => {
    const onPress = jest.fn();

    render(<CustomButton label="Entrar" onPress={onPress} />);
    fireEvent.press(screen.getByText('Entrar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
