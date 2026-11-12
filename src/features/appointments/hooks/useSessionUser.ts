import { useEffect, useState } from 'react';
import { getSessionUser, type SessionUser } from '@/services/session';

export function useSessionUser(enabled: boolean): { user: SessionUser | null; isLoading: boolean } {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getSessionUser().then((result) => {
      if (!active) return;
      setUser(result);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { user, isLoading };
}
