import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('capture-only portrait flow', () => {
  it('offers the guided camera without an image upload input', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Begin my GlowCheck/i }));
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Ari' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '24' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to camera/i }));

    expect(screen.getByRole('button', { name: /Enable camera/i })).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).not.toBeInTheDocument();
    expect(screen.getByText('Camera only')).toBeInTheDocument();
  });
});
