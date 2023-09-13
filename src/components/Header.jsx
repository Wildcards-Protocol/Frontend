import { Row } from "antd";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useContext, useEffect } from "react";
import ActiveStateContext from "./Context";
import { useAccount, useWalletClient } from "wagmi";

const Header = () => {
  useAccount({
    onConnect({ address, connector, isReconnected }) {
      //console.log("Connected " + address);
      setAddress(address);
      setIsConnected(true);
    },
    onDisconnect() {
      //console.log("Disconnected ");
      setAddress("");
      setIsConnected(false);
    },
  });

  const { data: signer } = useWalletClient();

  const { setAddress, setIsConnected, setSigner } =
    useContext(ActiveStateContext);
  useEffect(() => {
    setSigner(signer);
  }, [signer]);
  return (
    <>
      <Row justify="end" style={{ padding: "20px" }}>
        <ConnectButton
          showBalance={false}
          chainStatus={"none"}
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </Row>
    </>
  );
};
export default Header;
