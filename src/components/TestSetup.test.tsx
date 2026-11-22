import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple component to test setup
const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;

describe('Frontend Setup', () => {
  it('should render component correctly', () => {
    render(<TestComponent text="Hello Vitest" />);
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });
});
