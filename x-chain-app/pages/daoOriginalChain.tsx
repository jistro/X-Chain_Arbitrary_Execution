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

import GmFamCCIP from "../abis/ccip/GmFamCCIP.json";
import GmFamTeleporter from "../abis/teleporter/GmFamTeleporter.json";

import { useAccount, useSignMessage } from "wagmi";

const Home: NextPage = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [RollupVote, setRollupVote] = useState(false);
  const [MultipleVote, setMultipleVote] = useState(false);

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
            abi: GmFamCCIP.abi,
            functionName: "crossChainSolutionVariables",
          }).then((result) => {
            console.log(result);
            var idChainlink = (result as any[])[2];
            console.log(idChainlink);
            if (idChainlink !== 16015286601757825753) {
              setScNewChainMetadata(["Avalanche Fuji", "43113"]);
            } else {
              setScNewChainMetadata(["Ethereum Sepolia", "11155111"]);
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
            <HamburgerMenu numberBlocker={3} />
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
                      color={"#29444D"}
                      bg={"#528899"}
                      _selected={{
                        color: "#16355C",
                        bg: "#AFF1FF",
                        fontWeight: "bold",
                      }}
                    >
                      Make a proposal
                    </Tab>
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
                        <p>Title of the proposal</p>
                        <div>
                          <Input
                            placeholder=""
                            backgroundColor={"white"}
                            size={"sm"}
                            id="makeProposal__titleInput"
                          />
                        </div>
                        <p>Description of the proposal</p>
                        <div>
                          <Input
                            placeholder="This proposal is about..."
                            backgroundColor={"white"}
                            size={"sm"}
                            id="makeProposal__descriptionInput"
                          />
                        </div>
                        <p>Rollup vote (New -&gt; Original chain)</p>
                        <Select
                          size={"sm"}
                          backgroundColor={"white"}
                          id="makeProposal__rollupVoteSelect"
                          onChange={(e) => {
                            console.log(e.target.value);
                            //setRollupVote  setTypeOfProposal
                            if (e.target.value === "yes") {
                              setRollupVote(true);
                            } else {
                              setRollupVote(false);
                            }
                            console.log(RollupVote);
                          }}
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </Select>
                        {RollupVote && (
                          <>
                            <p>Original chain proposal ID</p>
                            <div>
                              <Input
                                placeholder="0"
                                backgroundColor={"white"}
                                size={"sm"}
                                id="makeProposal__originalChainProposalIDInput"
                                style={{ width: "20vw" }}
                              />
                            </div>
                          </>
                        )}
                        <p> Type of proposal</p>
                        <Select
                          size={"sm"}
                          backgroundColor={"white"}
                          id="makeProposal__typeOfProposalSelect"
                          onChange={(e) => {
                            console.log(e.target.value);
                            //setRollupVote  setTypeOfProposal
                            if (e.target.value === "binary") {
                              setMultipleVote(false);
                            } else {
                              setMultipleVote(true);
                            }
                            console.log(MultipleVote);
                          }}
                        >
                          <option value="binary">Binary</option>
                          <option value="multiple">Multiple</option>
                        </Select>
                        {MultipleVote && (
                          <>
                            <p>Number of options</p>
                            <div>
                              <Input
                                placeholder="0"
                                backgroundColor={"white"}
                                size={"sm"}
                                id="makeProposal__numberOfOptionsInput"
                                style={{ width: "20vw" }}
                              />
                            </div>
                          </>
                        )}

                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="sm">
                            <p>Make Proposal</p>
                          </Button>
                        </div>
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <div className={styles.containerFormBottom__form}>
                        <p>Proposal ID</p>
                        <div>
                          <Input
                            placeholder="0"
                            backgroundColor={"white"}
                            size={"sm"}
                            style={{ width: "20vw" }}
                            id="goBackNFT__tokenIdInput"
                          />
                        </div>
                        <p>Number of vote</p>
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
                          <Button size="sm">
                            <p>Vote</p>
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
