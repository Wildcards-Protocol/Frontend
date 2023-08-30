import axios from "axios";
import { utils } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Header from "./Header";
import ActiveStateContext from "./Context";
import React, { useContext, useState } from "react";
import { Button, message, Space, Steps, Input } from "antd";
import "../App.css";
import { mainnet } from "viem/chains";
import { createWalletClient, custom } from "viem";
import Select from "react-select";

const Home = () => {
  const { address } = useContext(ActiveStateContext);
  const [messageApi, contextHolder] = message.useMessage();
  const resolverAbi = [
    {
      constant: false,
      inputs: [
        {
          internalType: "bytes32",
          name: "node",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "resolver",
          type: "address",
        },
      ],
      name: "setResolver",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const linkedContractAbi = [
    {
      inputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "NFTchainId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "nftaddr",
          type: "address",
        },
      ],
      name: "setLinkedContract",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const walletClient = createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum),
  });
  const isMobile = window.innerWidth <= 400;
  const [domainList, setDomainList] = useState([]);
  const [isStepOne, setIsStepOne] = useState(true);
  const [step, setStep] = useState(0);
  const [domainSelectedFromList, setDomainSelectedFromList] = useState({});
  const [networkSelectedFromList, setNetworkSelectedFromList] = useState({});
  const [nftAddress, setNftAddress] = useState("");

  const stepOneComponent = () => {
    const newDomainList = domainList.map((domain) => {
      let domainObject = {};
      domainObject["label"] = domain;
      domainObject["value"] = domain;
      return domainObject;
    });

    return (
      <>
        {address ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "20px",
            }}
          >
            <Space wrap>
              <div
                style={{
                  width: "400px",
                  marginTop: "40px",
                }}
              >
                <Select
                  placeholder="Select your ENS name"
                  options={newDomainList}
                  onChange={handleSelection}
                  styles={{
                    width: 200,
                  }}
                />
              </div>
            </Space>
            <Space wrap>
              <div
                style={{
                  width: "400px",
                  marginTop: "40px",
                }}
              >
                <Select
                  placeholder="Select your network"
                  options={[
                    {
                      value: 1,
                      label: "Ethereum",
                    },
                    {
                      value: 10,
                      label: "Optimism",
                    },
                  ]}
                  onChange={setNetworkSelectedFromList}
                />
              </div>
            </Space>
            <Space wrap>
              <Button
                size={"large"}
                type="primary"
                style={{
                  marginTop: "40px",
                  alignSelf: "center",
                  width: "250px",
                }}
                onClick={handleConnect}
              >
                Connect
              </Button>
            </Space>
          </div>
        ) : (
          <ConnectButton
            showBalance={false}
            chainStatus={"none"}
            label={"Get Started"}
          />
        )}
      </>
    );
  };

  const stepTwoComponent = () => {
    return (
      <>
        {address ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "20px",
            }}
          >
            <Space wrap>
              <div
                style={{
                  width: "400px",
                  marginTop: "40px",
                }}
              >
                <Input
                  placeholder="Enter NFT address"
                  onChange={setNftAddress}
                />
              </div>
            </Space>

            <Space wrap>
              <Button
                size={"large"}
                type="primary"
                style={{
                  marginTop: "40px",
                  alignSelf: "center",
                  width: "250px",
                }}
                onClick={handleLinkage}
              >
                Link
              </Button>
            </Space>
          </div>
        ) : (
          <ConnectButton
            showBalance={false}
            chainStatus={"none"}
            label={"Get Started"}
          />
        )}
      </>
    );
  };

  const fetchAddressDomains = () => {
    axios
      .get(
        `https://us-central1-matic-services.cloudfunctions.net/domainlist?address=${address}`
      )
      .then((response) => {
        setDomainList(response.data);
      });
  };

  const handleConnect = () => {
    walletClient
      .writeContract({
        address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        abi: resolverAbi,
        functionName: "setResolver",
        args: [
          utils.namehash(domainSelectedFromList.value),
          "0x53e42d7b919C72678996C3F3486F93E75946A47C",
        ],
        account: address,
      })
      .then((transactionResponse) => {
        console.log("Transaction response is " + transactionResponse);
        messageApi.open({
          type: "success",
          content: "Transaction successful",
        });
        setStep(1);
        setIsStepOne(false);
      })
      .catch((error) => {
        messageApi.open({
          type: "error",
          content: "Transaction failed.",
        });
        console.log("Transaction response ERROR is " + error);
      });
  };

  const handleLinkage = () => {
    walletClient
      .writeContract({
        address: "0x53e42d7b919C72678996C3F3486F93E75946A47C",
        abi: linkedContractAbi,
        functionName: "setLinkedContract",
        args: [
          domainSelectedFromList.value,
          networkSelectedFromList.value,
          nftAddress.target.value,
        ],
        account: address,
      })
      .then((transactionResponse) => {
        console.log("Transaction response is " + transactionResponse);
        messageApi.open({
          type: "success",
          content: "Transaction successful",
        });
        setStep(0);
        setIsStepOne(true);
      })
      .catch((error) => {
        messageApi.open({
          type: "error",
          content: "Transaction failed.",
        });
        console.log("Transaction response ERROR is " + error);
      });
  };

  const handleSelection = (valueSelected) => {
    valueSelected
      ? setDomainSelectedFromList(valueSelected)
      : setDomainSelectedFromList("");
  };

  const formSteps = [
    {
      title: "Step 1",
    },
    {
      title: "Step 2",
    },
  ];

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          margin: 50,
          padding: 70,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {contextHolder}
        <Header />
        <>
          <Steps
            current={step}
            labelPlacement="vertical"
            items={formSteps}
            style={{ margin: 40 }}
          />
        </>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginLeft: "30px",
            }}
          >
            {isStepOne ? stepOneComponent() : stepTwoComponent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
