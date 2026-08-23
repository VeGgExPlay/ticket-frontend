import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IosCheckbox from '../components/IosCheckbox.jsx';

describe('IosCheckbox', () => {
  it('renders and toggles onChange', () => {
    const handleChange = vi.fn();
    render(<IosCheckbox checked={false} onChange={handleChange} />);
    const input = screen.getByRole('checkbox');
    expect(input.checked).toBe(false);
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
