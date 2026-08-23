import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TicketCard from '../components/TicketCard.jsx';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { role: 'agente' } }),
}));

const mockTicket = {
  id: 1,
  title: 'Ticket de prueba',
  description: 'Descripción de prueba',
  status: 'abierto',
  category: 'bug',
  priority: 'alta',
  archived: 0,
  tags: ['urgente', 'backend'],
  client_id: 1,
  agent_id: 2,
  created_at: '2025-01-01T00:00:00Z',
};

afterEach(() => {
  cleanup();
});

describe('TicketCard', () => {
  it('renders the title', () => {
    render(<BrowserRouter><TicketCard ticket={mockTicket} agentName={null} selectedIds={new Set()} toggleSelect={() => {}} /></BrowserRouter>);
    expect(screen.getByText('Ticket de prueba')).toBeDefined();
  });

  it('renders the category chip', () => {
    render(<BrowserRouter><TicketCard ticket={mockTicket} agentName={null} selectedIds={new Set()} toggleSelect={() => {}} /></BrowserRouter>);
    expect(screen.getAllByText('Bug').length).toBeGreaterThanOrEqual(1);
  });

  it('renders tag chips', () => {
    render(<BrowserRouter><TicketCard ticket={mockTicket} agentName={null} selectedIds={new Set()} toggleSelect={() => {}} /></BrowserRouter>);
    expect(screen.getAllByText('urgente').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('backend').length).toBeGreaterThanOrEqual(1);
  });
});
