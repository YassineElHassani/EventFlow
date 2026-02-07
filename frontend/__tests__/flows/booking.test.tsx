import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import eventsReducer from '@/store/slices/eventsSlice';
import reservationsReducer from '@/store/slices/reservationsSlice';
import usersReducer from '@/store/slices/usersSlice';
import EventDetailClient from '@/app/events/[id]/EventDetailClient';
import api from '@/lib/api';
import { EventStatus, type Event } from '@/lib/types';

/* Mock next/navigation */
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

/* Mock the API */
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockEvent: Event = {
  _id: 'evt123',
  title: 'Music Festival',
  description: 'A great festival.',
  date: '2026-06-15T18:00:00Z',
  location: 'Rabat',
  totalCapacity: 200,
  reservedSeats: 50,
  status: EventStatus.PUBLISHED,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function createStore(authState?) {
  return configureStore({
    reducer: {
      auth: authReducer,
      events: eventsReducer,
      reservations: reservationsReducer,
      users: usersReducer,
    },
    preloadedState: authState
      ? { auth: authState }
      : undefined,
  });
}

function renderWithStore(ui: React.ReactElement, storeOverride?) {
  const store = storeOverride || createStore();
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('Booking Flow — EventDetailClient', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('shows "Sign in to Book" when user is not logged in', () => {
    renderWithStore(<EventDetailClient event={mockEvent} />);
    expect(screen.getByText('Sign in to Book')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated user clicks book', async () => {
    renderWithStore(<EventDetailClient event={mockEvent} />);
    const button = screen.getByRole('button', { name: /sign in to book/i });
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('shows "Reserve Now" for authenticated participant', () => {
    const store = createStore({
      user: { id: 'u1', email: 'test@test.com', role: 'participant', fullName: 'Test' },
      token: 'fake-token',
      loading: false,
      error: null,
    });
    renderWithStore(<EventDetailClient event={mockEvent} />, store);
    expect(screen.getByText('Reserve Now')).toBeInTheDocument();
  });

  it('shows "Sold Out" when event is full', () => {
    const fullEvent = { ...mockEvent, reservedSeats: 200 };
    const store = createStore({
      user: { id: 'u1', email: 'test@test.com', role: 'participant', fullName: 'Test' },
      token: 'fake-token',
      loading: false,
      error: null,
    });
    renderWithStore(<EventDetailClient event={fullEvent} />, store);
    const button = screen.getByRole('button', { name: /sold out/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('shows seats availability progress', () => {
    renderWithStore(<EventDetailClient event={mockEvent} />);
    expect(screen.getByText('150 left')).toBeInTheDocument();
  });

  it('shows successful booking message on success', async () => {
    const mockApi = jest.mocked(api);
    mockApi.post.mockResolvedValueOnce({
      data: { success: true, message: 'Booked', data: { _id: 'r1', status: 'PENDING' } },
    });

    const store = createStore({
      user: { id: 'u1', email: 'test@test.com', role: 'participant', fullName: 'Test' },
      token: 'fake-token',
      loading: false,
      error: null,
    });
    renderWithStore(<EventDetailClient event={mockEvent} />, store);

    const button = screen.getByRole('button', { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/booked successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message on booking failure', async () => {
    const mockApi = jest.mocked(api);
    mockApi.post.mockRejectedValueOnce({
      response: { data: { message: 'Already booked' } },
    });

    const store = createStore({
      user: { id: 'u1', email: 'test@test.com', role: 'participant', fullName: 'Test' },
      token: 'fake-token',
      loading: false,
      error: null,
    });
    renderWithStore(<EventDetailClient event={mockEvent} />, store);

    const button = screen.getByRole('button', { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/already booked/i)).toBeInTheDocument();
    });
  });
});
