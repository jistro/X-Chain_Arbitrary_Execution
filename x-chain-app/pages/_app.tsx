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
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  base,
  zora,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider } from "@chakra-ui/react";

const amplify: Chain = {
  id: 78430,
  name: "Amplify Subnet Testnet",
  network: "Amplify Subnet Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Amplify",
    symbol: "AMP",
  },
  rpcUrls: {
    public: { http: ["https://subnets.avax.network/amplify/testnet/rpc"] },
    default: { http: ["https://subnets.avax.network/amplify/testnet/rpc"] }
  },
  blockExplorers: {
    etherscan: { name: 'Subnet explorer', url: 'https://subnets-test.avax.network/amplify' },
    default: { name: 'Subnet explorer', url: 'https://subnets-test.avax.network/amplify' },
  },
  testnet: true,
  iconUrl: "/iconAmplify.png", 
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    amplify,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
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
    </div>
  );
}

export default MyApp;
