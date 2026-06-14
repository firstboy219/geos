import type { ReactNode } from 'react';

import { AlertProvider } from './AlertContext';
import { AuthProvider } from './AuthContext';
import { CrisisProvider } from './CrisisContext';
import { PasarProvider } from './PasarContext';
import { PortfolioProvider } from './PortfolioContext';

/**
 * Composes every app-wide context provider in one wrapper.
 * Auth is outermost so data providers can react to auth state.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CrisisProvider>
        <AlertProvider>
          <PasarProvider>
            <PortfolioProvider>{children}</PortfolioProvider>
          </PasarProvider>
        </AlertProvider>
      </CrisisProvider>
    </AuthProvider>
  );
}
