import axios from "axios";
import { utils } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Header from "./Header";
import ActiveStateContext from "./Context";
import React, { useContext, useEffect, useState } from "react";
import { Button, message, Select, Space, Steps, Input } from "antd";
import "../App.css";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { createPublicClient, http } from "viem";
import bg from "../bg.svg";
import nft from "../nft.svg";
import Web3 from "web3";
import "viem/window";
import { writeContract } from "@wagmi/core";
import { useEnsResolver } from "wagmi";

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

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  useEffect(() => {
    if (address) {
      fetchAddressDomains();
    }
  }, [address]);

  const [domainList, setDomainList] = useState([]);
  const [isStepOne, setIsStepOne] = useState(true);
  const [step, setStep] = useState(0);
  const [domainSelectedFromList, setDomainSelectedFromList] = useState({});
  const [networkSelectedFromList, setNetworkSelectedFromList] = useState({});
  const [nftAddress, setNftAddress] = useState("");
  const [resolverContractAddress, setResolverContractAddress] = useState(
    "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
  );
  const [resolverAddress, setResolverAddress] = useState("");
  const [isSetResolverButtonEnabled, setIsSetResolverButtonEnabled] =
    useState(true);

  const { data, isError, isLoading } = useEnsResolver({
    name: domainSelectedFromList,
  });

  const stepOneComponent = () => {
    const newDomainList = domainList.map((domain) => {
      let domainObject = {};
      domainObject["label"] = domain;
      domainObject["value"] = domain;
      return domainObject;
    });

    return (
      <div style={{ marginBottom: 40, marginTop: 20 }}>
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
              <Select
                style={{
                  alignSelf: "center",
                  width: "200px",
                }}
                placeholder="Select your ENS name"
                options={newDomainList}
                onChange={handleSelection}
              />
            </Space>
            <Space wrap>
              <Button
                size={"large"}
                type="primary"
                disabled={isSetResolverButtonEnabled}
                style={{
                  marginTop: "40px",
                  alignSelf: "center",
                  background: "#72DAF9",
                  color: "#1E2DB6",
                  display: "inline-block",
                }}
                onClick={handleConnect}
              >
                Set Resolver
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
      </div>
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
              <Select
                placeholder="Select your network"
                style={{
                  alignSelf: "center",
                  width: "200px",
                }}
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
            </Space>
            <Space wrap>
              <Input
                placeholder="Enter NFT address"
                style={{
                  color: "hsl(0, 0%, 50%)",
                  width: "200px",
                  marginTop: 20,
                }}
                onChange={setNftAddress}
              />
            </Space>

            <Space wrap>
              <Button
                size={"large"}
                type="primary"
                style={{
                  marginTop: "40px",
                  alignSelf: "center",
                  background: "#72DAF9",
                  color: "#1E2DB6",
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
    const resolve = data === "0x53e42d7b919C72678996C3F3486F93E75946A47C";
    if (!resolve) {
      writeContract({
        address: resolverContractAddress,
        abi: resolverAbi,
        functionName: "setResolver",
        args: [
          utils.namehash(domainSelectedFromList),
          "0x53e42d7b919C72678996C3F3486F93E75946A47C",
        ],
      })
        .then((transactionResponse) => {
          messageApi.open({
            type: "success",
            content: "Transaction submitted",
          });
          setStep(1);
          setIsStepOne(false);
        })
        .catch((error) => {
          messageApi.open({
            type: "error",
            content: "Transaction failed.",
          });
        });
    } else {
      setStep(1);
      setIsStepOne(false);
    }
  };

  const handleLinkage = () => {
    writeContract({
      address: "0x53e42d7b919C72678996C3F3486F93E75946A47C",
      abi: linkedContractAbi,
      functionName: "setLinkedContract",
      args: [
        domainSelectedFromList,
        networkSelectedFromList,
        nftAddress.target.value,
      ],
    })
      .then((transactionResponse) => {
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
      });
  };

  const handleSelection = (valueSelected) => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.REACT_APP_TRANSPORT_HTTP_URL)
    );
    web3.eth.ens.getOwner(valueSelected.value).then(function (address) {
      if (address === "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401") {
        setResolverContractAddress(address);
      }
    });

    setIsSetResolverButtonEnabled(false);

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
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          marginLeft: 100,
          marginRight: 100,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {contextHolder}
        <Header />
        <div style={{ background: "white", marginTop: 30, padding: 10 }}>
          <Steps
            current={step}
            labelPlacement="vertical"
            items={formSteps}
            style={{ marginTop: 40 }}
          />
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "#1E2DB6",
                padding: 10,
              }}
            >
              <h3>Add Utility to NFT Collections</h3>
              <img
                src={nft}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "contain",
                  padding: 10,
                }}
              />
              <p
                style={{
                  marginLeft: 30,
                  marginRight: 30,
                  color: "#58595B",
                  padding: 10,
                }}
              >
                Link your ENS Domain to any NFT Collection and provide holders
                with free wildcard sub-domains
              </p>
              {isStepOne ? stepOneComponent() : stepTwoComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
