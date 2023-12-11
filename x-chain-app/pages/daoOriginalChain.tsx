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

import TacoDAO from "../abis/dao/TacoDAO.json";

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

  const [proposalDataInfo, setProposalDataInfo] = useState<any>(["", ""]);

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
    const inputIDs = ["fetchDao__addressInput"];
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

    readContract({
      address: inputs[0] as `0x${string}`,
      abi: TacoDAO.abi,
      functionName: "seeTokenVoteAddress",
    }).then((result) => {
      console.log(result);
      setScNewChainMetadata(result);
      setChainData([chain.id.toString(), chain.name]);
      console.log(scNewChainMetadata);
    });
    
    
  };

  const makeProposal = async () => {
    const { chain, chains } = getNetwork();
    if (chain) {
      console.log("deploying on ", chain.name);
      console.log("", chain.nativeCurrency.symbol);
      console.log("", chain.id.toString());
    } else {
      console.log("desconected");
      return;
    }
    const inputIDs = [
      "makeProposal__titleInput",
      "makeProposal__descriptionInput",
      "makeProposal__typeOfProposalSelect",
      "makeProposal__tokenIdInput",
      "fetchDao__addressInput",
    ];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    console.log(inputs);
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill all the inputs", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    var isBinary = false;
    var inputNumOp = 0;
    //check "makeProposal__typeOfProposalSelect",
    if (inputs[3] === "multiple") {
      const inputOpAux = document.getElementById(
        "makeProposal__numberOfOptionsInput"
      ) as HTMLInputElement;
      console.log(inputOpAux.value);
      inputNumOp = parseInt(inputOpAux.value);
      isBinary = false;
    } else {
      console.log("binary");
      inputNumOp = 0;
      isBinary = true;
    }
    /*function makeProposal(
        string memory _name,
        string memory _description,
        bool _isBinary,
        uint256 numberOfOptions,
        uint256 _idNft */
    prepareWriteContract({
      address: inputs[4] as `0x${string}`,
      abi: TacoDAO.abi,
      functionName: "makeProposal",
      args: [inputs[0], inputs[1], isBinary, inputNumOp, inputs[3]],
      account: address,
    })
      .then((result) => {
        console.log(result);
        writeContract(result)
          .then((result) => {
            console.log(result);
            toast.success("Proposal created", {
              duration: 2000,
              position: "top-right",
            });
            setTxHashData([result, result]);
          })
          .catch((error) => {
            console.log(error);
            toast.error("Error while creating the proposal", {
              duration: 2000,
              position: "top-right",
            });
          });
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error while creating the proposal", {
          duration: 2000,
          position: "top-right",
        });
      });
  };

  const makeVote = async () => {
    const { chain, chains } = getNetwork();
    if (chain) {
      console.log("deploying on ", chain.name);
      console.log("", chain.nativeCurrency.symbol);
      console.log("", chain.id.toString());
    } else {
      console.log("desconected");
      return;
    }
    const inputIDs = [
      "vote__tokenIdInput",
      "vote__proposalIdInput",
      "vote__numberOfVoteInput",
      "fetchDao__addressInput",
    ];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    console.log(inputs);
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill all the inputs", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    prepareWriteContract({
      address: inputs[3] as `0x${string}`,
      abi: TacoDAO.abi,
      functionName: "vote",
      args: [inputs[1], inputs[2], inputs[0]],
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

  const seeVoteMetadata = async () => {
    const { chain, chains } = getNetwork();
    if (chain) {
      console.log("deploying on ", chain.name);
      console.log("", chain.nativeCurrency.symbol);
      console.log("", chain.id.toString());
    } else {
      console.log("desconected");
      return;
    }
    const inputIDs = ["seeVote__proposalIdInput", "fetchDao__addressInput"];
    const inputs = inputIDs.map((id) => {
      const input = document.getElementById(id) as HTMLInputElement;
      return input.value;
    });
    console.log(inputs);
    if (inputs.some((input) => input === "")) {
      toast.error("Please fill all the inputs", {
        duration: 2000,
        position: "top-right",
      });
      return;
    }
    readContract({
      address: inputs[1] as `0x${string}`,
      abi: TacoDAO.abi,
      functionName: "seeProposal",
      args: [inputs[0]],
    })
      .then((result) => {
        console.log(result);
        setProposalDataInfo(result);
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
            <title>X-Chain DAO (Original chain)</title>
            <meta
              content="Generated by @rainbow-me/create-rainbowkit"
              name="description"
            />
            <link href="/favicon.ico" rel="icon" />
          </Head>

          <header className={styles.header}>
            <HamburgerMenu numberBlocker={5} />
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
              <h1>DAO demo (Original Chain)</h1>
              <div className={styles.containerOutsideForm}>
                <h2>TacoDao Smart Contract Address</h2>
                <Input
                  placeholder="0x..."
                  backgroundColor={"white"}
                  id="fetchDao__addressInput"
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
                  Token Address:{" "}
                  <strong>
                    {scNewChainMetadata === "" ? "" : scNewChainMetadata}
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
                      See proposal data
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
                            id="makeProposal__tokenIdInput"
                          />
                        </div>
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
                          <Button size="sm" onClick={makeProposal}>
                            <p>Make Proposal</p>
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
                        <p>Number of vote</p>
                        <div>
                          <Input
                            placeholder="0"
                            backgroundColor={"white"}
                            size={"sm"}
                            style={{ width: "20vw" }}
                            id="vote__numberOfVoteInput"
                          />
                        </div>
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="sm" onClick={makeVote}>
                            <p>Vote</p>
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
                            id="seeVote__proposalIdInput"
                          />
                        </div>
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button size="sm" onClick={seeVoteMetadata}>
                            <p>See Vote</p>
                          </Button>
                        </div>
                        {proposalDataInfo &&
                        proposalDataInfo.id &&
                        proposalDataInfo.id.toString() !== "0" ? (
                          <>
                            <p>
                              Title: {""}
                              <strong>{proposalDataInfo.nameOfTaco}</strong>
                            </p>
                            <p>
                              Description: {""}
                              <strong>{proposalDataInfo.description}</strong>
                            </p>
                            <p>
                              Total of votes: {""}
                              <strong>
                                {proposalDataInfo.votes.toString()}
                              </strong>
                            </p>
                            {proposalDataInfo.passed ? (
                              <p>
                                Passed: {""}
                                <strong>Yes</strong>
                              </p>
                            ) : (
                              <p>
                                Passed: {""}
                                <strong>No</strong>
                              </p>
                            )}
                            {proposalDataInfo.executed ? (
                              <p>
                                Executed: {""}
                                <strong>Yes</strong>
                              </p>
                            ) : (
                              <p>
                                Executed: {""}
                                <strong>No</strong>
                              </p>
                            )}
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
