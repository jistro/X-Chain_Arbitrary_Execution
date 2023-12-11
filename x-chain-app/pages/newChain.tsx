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

import GmFamCCIP from "../abis/ccip/GmFamCCIP.json";
import GmFamTeleporter from "../abis/teleporter/GmFamTeleporter.json";

import { useAccount, useSignMessage } from "wagmi";

const Home: NextPage = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [chainData, setChainData] = useState<any>(["", ""]);

  const [scNewChainMetadata, setScNewChainMetadata] = useState<any>([
    "",
    "",
    "",
  ]);

  const [txHashData, setTxHashData] = useState<any>(["none", ""]);

  const { address, isConnected } = useAccount();

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: "gm wagmi frens",
  });

  const fetchGmFamAddress = async () => {
    const { chain, chains } = getNetwork();
    if (chain) {
      console.log("deploying on ", chain.name);
      console.log("", chain.nativeCurrency.symbol);
      console.log("", chain.id.toString());
    } else {
      console.log("desconected");
      return;
    }
    const inputIDs = ["fetchGmFamAddress__addressInput"];
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
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: GmFamTeleporter.abi,
        functionName: "crossChainSolution",
      })
        .then((result) => {
          console.log(result);
          if (result !== 2) {
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
            abi: GmFamTeleporter.abi,
            functionName: "crossChainSolutionVariables",
          }).then((result) => {
            console.log(result);
            var idTeleporter = (result as any[])[2].toString(16);
            console.log(idTeleporter);
            if (
              idTeleporter ===
              "ea70d815f0232f5419dabafe36c964ffe5c22d17ac367b60b556ab3e17a36458"
            ) {
              setScNewChainMetadata(["Amplify Subnet", "78430"]);
            } else if (
              idTeleporter ===
              "d7cdc6f08b167595d1577e24838113a88b1005b471a6c430d79c48b4c89cfc53"
            ) {
              setScNewChainMetadata(["Bulletin Subnet Testnet", "78431"]);
            } else {
              setScNewChainMetadata(["Conduit Subnet Testnet", "78432"]);
            }
            setChainData([chain.id.toString(), chain.name]);
            console.log(scNewChainMetadata);
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
          setScNewChainMetadata(["", ""]);
          setChainData(["", ""]);
        });
    } else {
      console.log("ccip");
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: GmFamCCIP.abi,
        functionName: "crossChainSolution",
      })
        .then((result) => {
          console.log(result);
          // if not 1 or 3, not a ccip
          if (result !== 1 && result !== 3) {
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
            abi: GmFamCCIP.abi,
            functionName: "crossChainSolutionVariables",
          }).then((result) => {
            console.log(result);
            var idChainlink = BigInt((result as any[])[2]);
            console.log("idchainlink--",idChainlink);
              if (idChainlink !== BigInt("426641194531640554287674730226785263383855284524")) {
                setScNewChainMetadata([
                "Ethereum Sepolia",
                "11155111",
              ]);
            } else {
              setScNewChainMetadata([
                "Avalanche Fuji",
                "43113",
              ]);
            }
            setChainData([chain.id.toString(), chain.name]);
            console.log(scNewChainMetadata);
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
          setScNewChainMetadata(["", ""]);
          setChainData(["", ""]);
        });
    }
  };

  const makeSignMessage = () => {
    const inputIDs = ["NFT__tokenIdInput"];
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

    const functionName = ["78430", "78431", "78432"].includes(chainData[0])
      ? "teleporterSetMint"
      : ["43113", "11155111"].includes(chainData[0])
      ? "ccipSetMint"
      : "";

    if (functionName === "") {
      toast.error("Please connect to a chain", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    const message = `${functionName}(uint256, address, string),${inputs[0]},${address},signature`;
    signMessage({ message });
  };

  const makeSignMessageGoBack = () => {
    const inputIDs = ["goBackNFT__tokenIdInput"];
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

    const functionName = ["78430", "78431", "78432"].includes(chainData[0])
      ? "teleporterIdToUnwrap"
      : ["43113", "11155111"].includes(chainData[0])
      ? "ccipSetIdToUnwrap"
      : "";

    if (functionName === "") {
      toast.error("Please connect to a chain", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    const message = `${functionName}(uint256, address, string),${inputs[0]},${address},signature`;
    signMessage({ message });
  };

  const safeMint = () => {
    const inputIDs = ["fetchGmFamAddress__addressInput", "NFT__tokenIdInput"];
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
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: GmFamTeleporter.abi,
        functionName: "seeIfCanMint",
        args: [inputs[1]],
      }).then((result) => {
        console.log(result);
        if (!result) {
          toast.error(
            "You can't mint, please check the tokenId or if you wrapped, check the CCIP explorer",
            {
              duration: 4000,
              position: "top-right",
            }
          );
          return;
        }
      });

      if (data === undefined) {
        return;
      } else {
        var dataSigned = data.toString();
      }
      prepareWriteContract({
        address: inputs[0] as "0x${string}",
        abi: GmFamTeleporter.abi,
        functionName: "safeMint",
        args: [inputs[1], dataSigned],
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
    } else {
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: GmFamCCIP.abi,
        functionName: "seeIfCanMint",
        args: [inputs[1]],
      }).then((result) => {
        console.log(result);
        if (!result) {
          toast.error(
            "You can't mint, please check the tokenId or if you wrapped, check the CCIP explorer",
            {
              duration: 4000,
              position: "top-right",
            }
          );
          return;
        }
      });

      if (data === undefined) {
        return;
      } else {
        var dataSigned = data.toString();
      }
      prepareWriteContract({
        address: inputs[0] as "0x${string}",
        abi: GmFamCCIP.abi,
        functionName: "safeMint",
        args: [inputs[1], dataSigned],
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

  const goBack = () => {
    const inputIDs = [
      "fetchGmFamAddress__addressInput",
      "goBackNFT__tokenIdInput",
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
      if (data === undefined) {
        return;
      } else {
        var dataSigned = data.toString();
      }
      prepareWriteContract({
        address: inputs[0] as "0x${string}",
        abi: GmFamTeleporter.abi,
        functionName: "goBackToOriginalCollection",
        args: [inputs[1], dataSigned],
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

    } else {
      if (data === undefined) {
        return;
      } else {
        var dataSigned = data.toString();
      }
      prepareWriteContract({
        address: inputs[0] as "0x${string}",
        abi: GmFamCCIP.abi,
        functionName: "goBackToOriginalCollection",
        args: [inputs[1], dataSigned],
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
            setTxHashData(["ccip", result.hash]);
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
            <HamburgerMenu numberBlocker={2} />
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
              <h1>NFT Unwrapping function </h1>
              <h1>(New Chain)</h1>
              <div className={styles.containerOutsideForm}>
                <h2>gm Fam! Smart Contract Address</h2>
                <Input
                  placeholder="0x..."
                  backgroundColor={"white"}
                  id="fetchGmFamAddress__addressInput"
                />
                <Button size={"sm"} onClick={fetchGmFamAddress}>
                  <p>Search</p>
                </Button>
              </div>
              <div className={styles.containerFormTop}>
                <h2>Debug information</h2>
                <br />
                <p>
                  Current chain: <strong>{chainData[1]}</strong>
                </p>
                <p>
                  Current chain ID: <strong>{chainData[0]}</strong>
                </p>
                <p>
                  Original Chain:{" "}
                  <strong>
                    {scNewChainMetadata[0] === "" ? "" : scNewChainMetadata[0]}
                  </strong>
                </p>
                <p>
                  Destination/Original Chain ID:{" "}
                  <strong>
                    {scNewChainMetadata[1] === "" ? "" : scNewChainMetadata[1]}
                  </strong>
                </p>
                <p>
                  Cross chain protocol:{" "}
                  <strong>
                    {["78430", "78431", "78432"].includes(chainData[0])
                      ? "Teleporter"
                      : ["43113", "11155111"].includes(chainData[0])
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
                      Mint wrapped NFT
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
                      Go back to original chain/collection
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
                            id="NFT__tokenIdInput"
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
                            onClick={safeMint}
                          >
                            <p>Mint!</p>
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
                            id="goBackNFT__tokenIdInput"
                          />
                        </div>
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="xs" onClick={makeSignMessageGoBack}>
                            <p>{isSuccess ? "signed!" : "Sign message"}</p>
                          </Button>
                          <Button
                            size="xs"
                            backgroundColor={"#ff814b"}
                            _hover={{ backgroundColor: "#bb5c34" }}
                            onClick={goBack}
                          >
                            <p>Go back!</p>
                          </Button>
                        </div>
                        {txHashData[0] !== "none" ? (
                          <>
                            <p>
                              <strong>Hash: </strong>
                              {txHashData[1]}
                            </p>
                            <p>
                              Please go to the following link to see the
                              transaction using the hash:
                            </p>
                            <a
                              href={`https://ccip.chain.link/`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <strong> {`https://ccip.chain.link/`}</strong>
                            </a>
                            <br />
                            <Button
                              size="xs"
                              colorScheme="red"
                              style={{ marginTop: "1vw" }}
                              onClick={() => setTxHashData(["none", ""])}
                            >
                              <p>Close</p>
                            </Button>
                          </>
                        ) : (
                          <></>
                        )}
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
