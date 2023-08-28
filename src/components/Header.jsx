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

  const { setAddress, setIsConnected, setSigner } =
    useContext(ActiveStateContext);
  return (
    <>
      <Row justify="center" style={{ padding: "20px" }}>
        <Col span={5} offset={11} type="flex" align="middle">
          <ConnectButton
            showBalance={false}
            chainStatus={"none"}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </Col>
      </Row>
    </>
  );
};
export default Header;
