import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/DAO.module.css";
import HamburgerMenu from "../components/hamburgerMenu";
import {
  Button,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { getNetwork } from "@wagmi/core";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import toast from "react-hot-toast";

import TreasuryAndWrapperForDAO from "../abis/dao/TreasuryAndWrapperForDAO.json";

import { useAccount, useSignMessage } from "wagmi";

const Home: NextPage = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [RollupVote, setRollupVote] = useState(false);
  const [MultipleVote, setMultipleVote] = useState(false);

  const [chainData, setChainData] = useState<any>(["", ""]);

  const [scOriginalChainMetadata, setScOriginalChainMetadata] = useState<any>([
    "",
    "",
    "",
  ]);

  const [txHashData, setTxHashData] = useState<any>(["none", ""]);

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
      toast.error(
        `The address is not a Treasury and Wrapper for DAO Smart Contract`,
        {
          duration: 3000,
          position: "top-right",
        }
      );
      return;
    } else {
      console.log("ccip");
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: TreasuryAndWrapperForDAO.abi,
        functionName: "crossChainSolution",
      })
        .then((result) => {
          console.log(result);
          // if diferent to 1 or 3
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
            abi: TreasuryAndWrapperForDAO.abi,
            functionName: "seeOriginalContractAddress",
          }).then((result) => {
            console.log(result);
            var originalContractAddress = result;
            readContract({
              address: inputs[0] as `0x${string}`,
              abi: TreasuryAndWrapperForDAO.abi,
              functionName: "crossChainSolutionVariables",
            }).then((result) => {
              console.log(result);
              var idChainlink = BigInt((result as any[])[2]);
              console.log("idchainlink--",idChainlink);
                if (idChainlink !== BigInt("426641194531640554287674730226785263383855284524")) {
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

  const delegateVote = async () => {
    const inputIDs = [
      "fetchTreasuryAndWrapperAddress__addressInput",
      "vote__tokenIdInput",
      "vote__proposalIdInput",
    ];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill the input", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    //function makeVote(uint256 proposalID, uint256 nftID)
    prepareWriteContract({
      address: inputs[0] as `0x${string}`,
      abi: TreasuryAndWrapperForDAO.abi,
      functionName: "makeVote",
      args: [inputs[2], inputs[1]],
      account: address,
    })
      .then((result) => {
        console.log(result);
        writeContract(result)
          .then((result) => {
            console.log(result);
            toast.success("Vote created", {
              duration: 2000,
              position: "top-right",
            });
            setTxHashData([result, result]);
          })
          .catch((error) => {
            console.log(error);
            toast.error("Error while creating the vote", {
              duration: 2000,
              position: "top-right",
            });
          });
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error while creating the vote", {
          duration: 2000,
          position: "top-right",
        });
      });
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
            <HamburgerMenu numberBlocker={4} />
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
              <h1>DAO demo (Make vote in Original Chain)</h1>
              <div className={styles.containerOutsideForm}>
                <h2>Treadury and Wrapper for DAO Smart Contract Address</h2>
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
                      color={"#29444D"}
                      bg={"#528899"}
                      _selected={{
                        color: "#16355C",
                        bg: "#AFF1FF",
                        fontWeight: "bold",
                      }}
                    >
                      Vote
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
                            id="vote__tokenIdInput"
                          />
                        </div>
                        <p>Proposal ID</p>
                        <div>
                          <Input
                            placeholder="0"
                            backgroundColor={"white"}
                            size={"sm"}
                            style={{ width: "20vw" }}
                            id="vote__proposalIdInput"
                          />
                        </div>
                        
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="sm"
                            onClick={delegateVote}
                          >
                            <p>Delegate Vote</p>
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
