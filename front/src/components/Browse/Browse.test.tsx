import React from 'react';
import { render, screen } from '@testing-library/react';
import Browse from './Browse';

test('renders Browse component', () => {
    render(<Browse />);
    const linkElement = screen.getByText(/browse/i);
    expect(linkElement).toBeInTheDocument();
});