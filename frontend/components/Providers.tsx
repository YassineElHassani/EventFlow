'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/index';
import { useEffect } from 'react';
import { hydrate } from '@/store/slices/authSlice';

function AuthHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrate());
  }, []);
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}
