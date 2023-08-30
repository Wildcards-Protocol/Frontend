import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, goerli } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import "./index.css";
import React, { useState } from "react";
import ActiveStateContext from "./components/Context";
import Home from "./components/Home";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Wildcards",
  projectId: process.env.REACT_APP_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const App = () => {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(null);
  const context = {
    isConnected,
    setIsConnected,
    address,
    setAddress,
  };

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <ActiveStateContext.Provider value={context}>
          <Home />
        </ActiveStateContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;
