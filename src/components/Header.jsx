import { Col, Row } from "antd";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useContext, useEffect } from "react";
import ActiveStateContext from "./Context";

const Header = () => {
  useAccount({
    onConnect({ address, connector, isReconnected }) {
      setAddress(address);
      setIsConnected(true);
    },
    onDisconnect() {
      setAddress("");
      setIsConnected(false);
    },
  });

  const { setAddress, setIsConnected } = useContext(ActiveStateContext);
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
