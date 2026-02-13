import { ErrorPopup } from '@/src/shared/common/error-popup';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

interface NetworkErrorContextValue {
  showNetworkError: () => void;
}

const NetworkErrorContext = createContext<NetworkErrorContextValue>({
  showNetworkError: () => {},
});

export function NetworkErrorProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showNetworkError = useCallback(() => setVisible(true), []);

  // queryClient를 여기서 생성해 onError에서 팝업을 트리거
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      queryCache: new QueryCache({
        onError: () => setVisible(true),
      }),
    });
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClientRef.current!.refetchQueries({ type: 'active' });
    setIsRefreshing(false);
    setVisible(false);
  };

  return (
    <NetworkErrorContext.Provider value={{ showNetworkError }}>
      <QueryClientProvider client={queryClientRef.current}>
        {children}
        <ErrorPopup
          visible={visible}
          type="NETWORK"
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onClose={() => setVisible(false)}
        />
      </QueryClientProvider>
    </NetworkErrorContext.Provider>
  );
}

export function useNetworkError() {
  return useContext(NetworkErrorContext);
}
