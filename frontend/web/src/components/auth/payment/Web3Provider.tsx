'use client';
import { ReactNode } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { zksyncSepoliaTestnet } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const config = getDefaultConfig({
    appName: 'Area',
    projectId: "03179fe4d1fb7fe5f9a4b9a002428cfb" || 'undined',
    chains: [zksyncSepoliaTestnet],
    transports: {
      [zksyncSepoliaTestnet.id]: http(
        zksyncSepoliaTestnet.rpcUrls.default.http[0]
      ),
    },
    ssr: true,
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[zksyncSepoliaTestnet]}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
