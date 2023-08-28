import axios from "axios";
import { ethers, utils } from "ethers";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Header from "./Header";
import ActiveStateContext from "./Context";
import { SocialIcon } from "react-social-icons";
import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  Input,
  message,
  Modal,
  Result,
  Row,
  Select,
  Space,
} from "antd";
import "../App.css";
import { mainnet } from "viem/chains";
import { createPublicClient, createWalletClient, http, custom } from "viem";

const Home = () => {
  const { address, signer } = useContext(ActiveStateContext);
  const [messageApi, contextHolder] = message.useMessage();
  const domainabi = [
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
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });
  const walletClient = createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum),
  });
  const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
  const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
  const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
  const isMobile = window.innerWidth <= 400;
  const [isNextButtonActive, setIsNextButtonActive] = useState(true);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [domainList, setDomainList] = useState([]);
  const [domainSelectedFromList, setDomainSelectedFromList] = useState("");

  const [loaderText, setLoaderText] = useState("");
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [redirectionModalOpen, setRedirectionModalOpen] = useState(false);
  const [redirectUrlInputFieldStatus, setRedirectUrlInputFieldStatus] =
    useState("");
  const [redirectUrlValue, setRedirectUrlValue] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [successResultModalOpen, setSuccessResultModalOpen] = useState(false);

  useEffect(() => {
    if (address) {
      fetchAddressDomains();
    }
  }, [address]);

  useEffect(() => {
    if (domainSelectedFromList) {
      setIsNextButtonActive(false);
    } else {
      setIsNextButtonActive(true);
    }
  }, [domainSelectedFromList]);

  const domainSelectionComponent = () => {
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
              alignItems: "center",
              margin: "20px",
            }}
          >
            <Space wrap>
              <Select
                allowClear
                showSearch
                placeholder="Select your ENS name"
                options={newDomainList}
                onChange={handleSelection}
                optionFilterProp="children"
                style={{
                  width: 200,
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "").includes(input)
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
              />

              <Button
                icon={<ArrowRightOutlined />}
                onClick={handleRedirectOptionSubmission}
                size={"middle"}
                shape="round"
                type="primary"
              >
                Next
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

  const handleRedirectClick = () => {
    setOptionsModalOpen(false);
    setRedirectionModalOpen(true);
  };

  const handleRedirectOptionSubmission = () => {
    walletClient.writeContract({
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
      abi: domainabi,
      functionName: "setResolver",
      args: [
        utils.namehash("davidwachira.eth"),
        "0x53e42d7b919C72678996C3F3486F93E75946A47C",
      ],
      account: address,
    });
  };

  const handleSelection = (valueSelected) => {
    valueSelected
      ? setDomainSelectedFromList(valueSelected)
      : setDomainSelectedFromList("");
  };

  const showOptionSelectionModal = () => {
    setOptionsModalOpen(true);
  };

  function isUrl(string) {
    if (typeof string !== "string") {
      return false;
    }

    var match = string.match(protocolAndDomainRE);
    if (!match) {
      return false;
    }

    var everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
      return false;
    }

    if (
      localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)
    ) {
      return true;
    }

    return false;
  }

  return (
    <>
      {isMobile ? (
        <div
          style={{
            backgroundColor: "white",
            margin: 10,
            padding: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {contextHolder}
          <Header />
          <h1>Add utility to your ENS name</h1>
          <p className="subtitle">
            Maximize your web3 presence with your ENS domain
          </p>
          <p className="subtitle">
            Add utility to your .eth domain with ENSRedirect. Curate and
            showcase your web3 profile by seamlessly integrating videos and
            podcasts from your favorite social platforms, or easily redirect
            your domain to any website of your choice – all for free.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                marginTop: "20px",
                marginLeft: "30px",
              }}
            >
              {domainSelectionComponent()}
            </div>

            <>
              <p
                style={{
                  marginLeft: address ? 0 : 34,
                  fontSize: 21,
                  fontWeight: "bold",
                }}
              >
                Get in touch
              </p>
            </>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                }}
              >
                <SocialIcon
                  network="email"
                  url="mailto:team@ensredirect.xyz"
                  target="_blank"
                  style={{
                    height: 35,
                    width: 35,
                    marginRight: 5,
                    marginLeft: 10,
                    marginTop: 10,
                  }}
                />
                <p>team@ensredirect.xyz</p>
              </div>

              <div
                style={{
                  display: "flex",
                }}
              >
                <SocialIcon
                  network="twitter"
                  url="https://twitter.com/ensredirect"
                  target="_blank"
                  style={{
                    height: 35,
                    width: 35,
                    marginRight: 5,
                    marginLeft: 10,
                    marginTop: 10,
                  }}
                />
                <p>@ensredirect</p>
              </div>

              <div
                style={{
                  display: "flex",
                }}
              >
                <SocialIcon
                  network="github"
                  url="https://github.com/ENS-Redirect/ensredirect-v2-react"
                  target="_blank"
                  style={{
                    height: 35,
                    width: 35,
                    marginRight: 5,
                    marginLeft: 10,
                    marginTop: 10,
                  }}
                />
                <p>Github</p>
              </div>
            </div>
          </div>
          <Modal
            centered
            footer={null}
            title={"Select option to proceed:"}
            open={optionsModalOpen}
            onOk={() => setOptionsModalOpen(false)}
            onCancel={() => setOptionsModalOpen(false)}
          >
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Button
                  disabled={isNextButtonActive}
                  icon={<ArrowRightOutlined />}
                  onClick={handleRedirectClick}
                  size={"large"}
                  type="primary"
                  style={{
                    margin: "20px",
                    alignSelf: "center",
                    width: "250px",
                    textAlign: "left",
                  }}
                >
                  Redirect to any website
                </Button>
                <Button
                  disabled={isNextButtonActive}
                  icon={<ArrowRightOutlined />}
                  size={"large"}
                  type="primary"
                  style={{
                    marginBottom: "20px",
                    alignSelf: "center",
                    width: "250px",
                    textAlign: "left",
                  }}
                >
                  Generate your web3 profile
                </Button>
              </div>
            </Space>
          </Modal>
          <Modal
            centered
            open={redirectionModalOpen}
            footer={null}
            onCancel={() => setRedirectionModalOpen(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <p>
                Redirect <b>{domainSelectedFromList}</b> to{" "}
              </p>
            </div>

            <Row
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                margin: "10px",
                marginBottom: "30px",
              }}
            >
              <Col span={16}>
                <Input
                  style={{ height: "40px" }}
                  placeholder="Enter website url to redirect to"
                  status={redirectUrlInputFieldStatus}
                  value={redirectUrlValue}
                  onChange={(e) => {
                    const url = e.target.value;
                    setRedirectUrlValue(url);
                    if (url !== "" && !isUrl(url)) {
                      setRedirectUrlInputFieldStatus("error");
                    } else {
                      setRedirectUrlInputFieldStatus("");
                    }
                  }}
                />
              </Col>
              <Col offset={1} span={7}>
                <Button
                  icon={<ArrowRightOutlined />}
                  loading={buttonLoader}
                  size={"small"}
                  type="primary"
                  onClick={handleRedirectOptionSubmission}
                  style={{ height: "40px" }}
                >
                  Redirect
                </Button>
              </Col>
            </Row>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <p>{loaderText} </p>
            </div>
          </Modal>
          <Modal
            centered
            open={successResultModalOpen}
            footer={null}
            onCancel={() => setSuccessResultModalOpen(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Result
                status="success"
                title="Transaction Successful"
                subTitle='Test redirect by appending ".limo" on any browser e.g. ensredirect.eth.limo (Note: resolving the domain might take a few minutes,1st time only)'
                extra={[
                  <Button
                    type="primary"
                    href={`https://${domainSelectedFromList}.limo`}
                    target={"_blank"}
                  >
                    Test Redirect
                  </Button>,
                  <Button
                    type="primary"
                    target={"_blank"}
                    href={`https://etherscan.io/tx/${transactionHash}`}
                  >
                    View Etherscan
                  </Button>,
                ]}
              />
            </div>
          </Modal>
        </div>
      ) : (
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
          <h1>Add utility to your ENS name</h1>
          <p className="subtitle">
            Maximize your web3 presence with your ENS domain
          </p>
          <p className="subtitle">
            Add utility to your .eth domain with ENSRedirect. Curate and
            showcase your web3 profile by seamlessly integrating videos and
            podcasts from your favorite social platforms, or easily redirect
            your domain to any website of your choice – all for free.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                marginTop: "20px",
                marginLeft: "30px",
              }}
            >
              {domainSelectionComponent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
