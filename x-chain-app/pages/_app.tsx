import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Space_Mono } from "next/font/google";
import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  Chain,
  sepolia,
  avalancheFuji,
 
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from 'react-hot-toast';

const amplify: Chain = {
  id: 78430,
  name: "Amplify Subnet",
  network: "Amplify Subnet Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Amplify",
    symbol: "AMP",
  },
  rpcUrls: {
    public: { http: ["https://subnets.avax.network/amplify/testnet/rpc"] },
    default: { http: ["https://subnets.avax.network/amplify/testnet/rpc"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Subnet explorer",
      url: "https://subnets-test.avax.network/amplify",
    },
    default: {
      name: "Subnet explorer",
      url: "https://subnets-test.avax.network/amplify",
    },
  },
  testnet: true,
};

const bulletin: Chain = {
  id: 78431,
  name: "Bulletin Subnet",
  network: "Bulletin Subnet Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bulletin",
    symbol: "BLT",
  },
  rpcUrls: {
    public: { http: ["https://subnets.avax.network/bulletin/testnet/rpc"] },
    default: { http: ["https://subnets.avax.network/bulletin/testnet/rpc"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Subnet explorer",
      url: "https://subnets-test.avax.network/bulletin",
    },
    default: {
      name: "Subnet explorer",
      url: "https://subnets-test.avax.network/bulletin",
    },
  },
  testnet: true,
};

const conduit: Chain = {
  id: 78432,
  name: "Conduit Subnet",
  network: "Conduit Subnet Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Conduit",
    symbol: "CON",
  },
  rpcUrls: {
    public: { http: ["https://subnets.avax.network/conduit/testnet/rpc"] },
    default: { http: ["https://subnets.avax.network/conduit/testnet/rpc"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Subnet explorer",
      url: "https://subnets-test.avax.network/conduit",
    },
    default: {
      name: "Subnet explorer",
      url: "https://subnets-test.avax.network/conduit",
    },
  },
  testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    sepolia,
    avalancheFuji,
    { ...amplify, iconUrl: "/iconAmplify.png" },
    { ...bulletin, iconUrl: "/iconBulletin.png" },
    { ...conduit, iconUrl: "/iconConduit.png" },
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "X-Chain",
  projectId: process.env.NEXT_PUBLIC_ENABLE_PROJECT_ID ?? "",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const fonts = Space_Mono({
  subsets: ["latin-ext"],
  weight: "400",
  style: "normal",
});


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div {...pageProps} className={fonts.className}>
      <ChakraProvider>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            chains={chains}
            theme={lightTheme({
              accentColor: "white",
              accentColorForeground: "#16355C",
              fontStack: "system",
              borderRadius: "medium",
            })}
          >
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
      <Toaster />
    </div>
  );
}

export default MyApp;
