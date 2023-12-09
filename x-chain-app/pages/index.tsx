import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/NFT.module.css";
import HamburgerMenu from "../components/hamburgerMenu";
import {
  Button,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { getNetwork } from "@wagmi/core";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import toast from "react-hot-toast";

import TreasuryAndWrapperCCIP from "../abis/ccip/TreasuryAndWrapperCCIP.json";
import ERC721 from "../abis/ERC721.json";

import { useAccount, useSignMessage } from "wagmi";

const Home: NextPage = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [chainData, setChainData] = useState<any>(["", ""]);

  const [scOriginalChainMetadata, setScOriginalChainMetadata] = useState<any>([
    "",
    "",
    "",
  ]);

  const [txHashData, setTxHashData] = useState<any>([""]);

  const { address, isConnected } = useAccount();

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: "gm wagmi frens",
  });

  const fetchTreasuryAndWrapperAddress = async () => {
    const { chain, chains } = getNetwork();
    if (chain) {
      console.log("deploying on ", chain.name);
      console.log("", chain.nativeCurrency.symbol);
      console.log("", chain.id.toString());
    } else {
      console.log("desconected");
      return;
    }
    const inputIDs = ["fetchTreasuryAndWrapperAddress__addressInput"];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill the address input", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    console.log(inputs);
    if (["78430", "78431", "78432"].includes(chain.id.toString())) {
      console.log("teleporter");
    } else {
      console.log("ccip");
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: TreasuryAndWrapperCCIP.abi,
        functionName: "crossChainSolution",
      })
        .then((result) => {
          console.log(result);
          if (result !== 1) {
            toast.error(
              `The address is not a Treasury and Wrapper Smart Contract`,
              {
                duration: 3000,
                position: "top-right",
              }
            );
            return;
          }
          readContract({
            address: inputs[0] as `0x${string}`,
            abi: TreasuryAndWrapperCCIP.abi,
            functionName: "seeOriginalContractAddress",
          }).then((result) => {
            console.log(result);
            var originalContractAddress = result;
            readContract({
              address: inputs[0] as `0x${string}`,
              abi: TreasuryAndWrapperCCIP.abi,
              functionName: "crossChainSolutionVariables",
            }).then((result) => {
              console.log(result);
              var idChainlink = (result as any[])[2];
              console.log(idChainlink);
              if (idChainlink !== 16015286601757825753) {
                setScOriginalChainMetadata([
                  originalContractAddress,
                  "Ethereum Sepolia",
                  "11155111",
                ]);
              } else {
                setScOriginalChainMetadata([
                  originalContractAddress,
                  "Avalanche Fuji",
                  "43113",
                ]);
              }
              setChainData([chain.id.toString(), chain.name]);
              console.log(scOriginalChainMetadata);
            });
          });
        })
        .catch((error) => {
          console.log(error);
          toast.error(
            `Error while fetching the Treasury and Wrapper Smart Contract address please check the address and try again`,
            {
              duration: 3000,
              position: "top-right",
            }
          );
          setScOriginalChainMetadata(["", "", ""]);
          setChainData(["", ""]);
        });
    }
  };

  const givePermission = async () => {
    const inputIDs = [
      "fetchTreasuryAndWrapperAddress__addressInput",
      "wrapNFT__tokenIdInput",
    ];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    console.log(inputs);

    //marcar cuando falta algun input
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill all the inputs", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    var srcAddress = inputs[0];
    var tokenId = inputs[1];
    console.log(srcAddress);

    readContract({
      address: inputs[0] as `0x${string}`,
      abi: TreasuryAndWrapperCCIP.abi,
      functionName: "seeOriginalContractAddress",
    })
      .then((data) => {
        prepareWriteContract({
          address: data as "0x${string}",
          abi: ERC721.abi,
          functionName: "approve",
          args: [srcAddress, tokenId],
          account: address,
        })
          .then((data) => {
            writeContract(data)
              .then((result) => {
                toast(`Hash: ${result.hash}`, {
                  duration: 3000,
                  position: "top-right",
                  style: {
                    wordWrap: "break-word",
                    wordBreak: "break-all",
                  },
                });
                toast.success("Permission granted", {
                  duration: 2000,
                  position: "top-right",
                });
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const makeSignMessage = () => {
    const inputIDs = ["wrapNFT__tokenIdInput"];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    if (inputs.some((input) => input === "")) {
      toast.error("Please fill the address input", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    const message = `ccipSetMint(uint256, address, string),${inputs[0]},${address},signature`;
    signMessage({ message });
  };

  const passMint = () => {
    const inputIDs = [
      "fetchTreasuryAndWrapperAddress__addressInput",
      "wrapNFT__tokenIdInput",
    ];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });

    if (inputs.some((input) => input === "")) {
      toast.error("Please fill the address input", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    if (!isSuccess) {
      toast.error("Please sign the message", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    readContract({
      address: inputs[0] as `0x${string}`,
      abi: TreasuryAndWrapperCCIP.abi,
      functionName: "seeOriginalContractAddress",
    }).then((result) => {
      console.log(result);
      readContract({
        address: result as `0x${string}`,
        abi: ERC721.abi,
        functionName: "getApproved",
        args: [inputs[1]],
      }).then((result) => {
        if (result !== inputs[0]) {
          toast.error(
            `The address is not the approved for the token #${inputs[1]}`,
            {
              duration: 3000,
              position: "top-right",
            }
          );
          return;
        }
      });
    });
    const { chain, chains } = getNetwork();
    var idChain = chain?.id.toString() ?? "";
    if (idChain === "") {
      toast.error("Please connect to a chain", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    if (["78430", "78431", "78432"].includes(idChain)) {
      console.log("teleporter");
    } else {
      prepareWriteContract({
        address: data as "0x${string}",
        abi: TreasuryAndWrapperCCIP.abi,
        functionName: "passMint",
        args: [inputs[1], data?.toString()],
        account: address,
      }).then((result) => {
        writeContract(result)
          .then((result) => {
            toast(`Hash: ${result.hash}`, {
              duration: 3000,
              position: "top-right",
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
              },
            });
            toast.success("Mint passed", {
              duration: 2000,
              position: "top-right",
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  };

  return (
    <>
      {isClient && (
        <div>
          <Head>
            <title>X-Chain NFT Wrapping</title>
            <meta
              content="Generated by @rainbow-me/create-rainbowkit"
              name="description"
            />
            <link href="/favicon.ico" rel="icon" />
          </Head>

          <header className={styles.header}>
            <HamburgerMenu numberBlocker={1} />
            <div
              style={{
                marginTop: "2.5vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <img src="./logoPrincipal.svg" />
            </div>
          </header>
          <div className={styles.container}>
            <main className={styles.main}>
              <h1>NFT Wrapping function (Original Chain)</h1>
              <div className={styles.containerOutsideForm}>
                <h2>Treasury and wrapper Smart Contract Address</h2>
                <Input
                  placeholder="0x..."
                  backgroundColor={"white"}
                  id="fetchTreasuryAndWrapperAddress__addressInput"
                />
                <Button size={"sm"} onClick={fetchTreasuryAndWrapperAddress}>
                  <p>Search</p>
                </Button>
              </div>
              <div className={styles.containerFormTop}>
                <h2>Debug information</h2>
                <br />
                <p>
                  Original SC:{" "}
                  <strong>
                    {scOriginalChainMetadata[0] === ""
                      ? ""
                      : scOriginalChainMetadata[0]}
                  </strong>
                </p>
                <p>
                  Original Chain: <strong>{chainData[1]}</strong>
                </p>
                <p>
                  Chain ID: <strong>{chainData[0]}</strong>
                </p>
                <p>
                  Destination Chain:{" "}
                  <strong>
                    {scOriginalChainMetadata[1] === ""
                      ? ""
                      : scOriginalChainMetadata[1]}
                  </strong>
                </p>
                <p>
                  Chain ID:{" "}
                  <strong>
                    {scOriginalChainMetadata[2] === ""
                      ? ""
                      : scOriginalChainMetadata[2]}
                  </strong>
                </p>
                <p>
                  Cross chain protocol:{" "}
                  <strong>
                    {["78430", "78431", "78432"].includes(chainData[0])
                      ? "Teleporter"
                      : ["43113"].includes(chainData[0])
                      ? "CCIP"
                      : ""}
                  </strong>
                </p>
              </div>
              <div className={styles.containerFormBottom}>
                <Tabs variant="unstyled">
                  <TabList>
                    <Tab
                      fontSize={"1.5vw"}
                      fontWeight={"bold"}
                      color={"#FBBB9E"}
                      bg={"#ff814b"}
                      _selected={{
                        color: "#16355C",
                        bg: "#FBBB9E",
                        fontWeight: "bold",
                      }}
                    >
                      NFT to Wrap
                    </Tab>
                    <Tab
                      fontSize={"1.5vw"}
                      fontWeight={"bold"}
                      color={"#FBBB9E"}
                      bg={"#ff814b"}
                      _selected={{
                        color: "#16355C",
                        bg: "#FBBB9E",
                        fontWeight: "bold",
                      }}
                    >
                      Retrieve NFT from new chain SC
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <div className={styles.containerFormBottom__form}>
                        <p>Token ID</p>
                        <div>
                          <Input
                            placeholder="0"
                            backgroundColor={"white"}
                            size={"sm"}
                            style={{ width: "20vw" }}
                            id="wrapNFT__tokenIdInput"
                          />
                        </div>
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="xs" onClick={givePermission}>
                            <p>Give autorization</p>
                          </Button>
                          <Button size="xs" onClick={makeSignMessage}>
                            <p>{isSuccess ? "signed!" : "Sign message"}</p>
                          </Button>
                          <Button
                            size="xs"
                            backgroundColor={"#ff814b"}
                            _hover={{ backgroundColor: "#bb5c34" }}
                            onClick={passMint}
                          >
                            <p>Wrap!</p>
                          </Button>
                        </div>
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <div className={styles.containerFormBottom__form}>
                        <p>Token ID</p>
                        <div>
                          <Input
                            placeholder="0"
                            backgroundColor={"white"}
                            size={"sm"}
                            style={{ width: "20vw" }}
                            id="unwrapNFT__tokenIdInput"
                          />
                        </div>
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="xs" onClick={makeSignMessage}>
                            <p>{isSuccess ? "signed!" : "Sign message"}</p>
                          </Button>
                          <Button
                            size="xs"
                            backgroundColor={"#ff814b"}
                            _hover={{ backgroundColor: "#bb5c34" }}
                          >
                            <p>Unwrap!</p>
                          </Button>
                        </div>
                      </div>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </div>
            </main>
          </div>
          <footer className={styles.footer}>
            <a
              href="https://rainbow.me"
              rel="noopener noreferrer"
              target="_blank"
            >
              Made with ❤️ by your frens at 🌈
            </a>
          </footer>
        </div>
      )}
    </>
  );
};

export default Home;
