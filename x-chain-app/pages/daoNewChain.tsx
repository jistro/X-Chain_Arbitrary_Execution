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

import ForkTacoDAO from "../abis/dao/ForkTacoDAO.json";

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

  const [proposalDataInfo, setProposalDataInfo] = useState<any>(["none", ""]);

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
    console.log(inputs);
    if (["78430", "78431", "78432"].includes(chain.id.toString())) {
      console.log("teleporter");
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: ForkTacoDAO.abi,
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
            abi: ForkTacoDAO.abi,
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
        abi: ForkTacoDAO.abi,
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
            abi: ForkTacoDAO.abi,
            functionName: "crossChainSolutionVariables",
          }).then((result) => {
            console.log(result);
            var idChainlink = BigInt((result as any[])[2]);
            console.log("idchainlink--", idChainlink);
            if (
              idChainlink !==
              BigInt("426641194531640554287674730226785263383855284524")
            ) {
              setScNewChainMetadata(["Ethereum Sepolia", "11155111"]);
            } else {
              setScNewChainMetadata(["Avalanche Fuji", "43113"]);
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
      "makeProposal__rollupVoteSelect",
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
    var rollAnswer = false;
    var inputOp = 0;
    //check "makeProposal__rollupVoteSelect",
    if (inputs[2] === "yes") {
      const inputOpAux = document.getElementById(
        "makeProposal__originalChainProposalIDInput"
      ) as HTMLInputElement;
      console.log(inputOpAux.value);
      inputOp = parseInt(inputOpAux.value);
      rollAnswer = true;
    } else {
      console.log("no");
      inputOp = 0;
      rollAnswer = false;
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
    prepareWriteContract({
      address: inputs[5] as `0x${string}`,
      abi: ForkTacoDAO.abi,
      functionName: "makeProposal",
      args: [
        inputs[0],
        inputs[1],
        rollAnswer,
        inputOp,
        isBinary,
        inputNumOp,
        inputs[4],
      ],
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
      abi: ForkTacoDAO.abi,
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
      abi: ForkTacoDAO.abi,
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
            <title>X-Chain DAO (New chain)</title>
            <meta
              content="Generated by @rainbow-me/create-rainbowkit"
              name="description"
            />
            <link href="/favicon.ico" rel="icon" />
          </Head>

          <header className={styles.header}>
            <img src="./logoPrincipal.svg" />
            <div>
              <HamburgerMenu numberBlocker={3} />
            </div>
          </header>
          <div className={styles.container}>
            <main className={styles.main}>
              <h1>DAO demo (New Chain)</h1>
              <div className={styles.containerOutsideForm}>
                <h2>ForkTacoDao Smart Contract Address</h2>
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
                            {proposalDataInfo.isInTheOriginalChain && (
                              <p>
                                Original chain proposal ID: {""}
                                <strong>
                                  {proposalDataInfo.orignalChainProposalId.toString()}
                                </strong>
                              </p>
                            )}
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
          <p>
          Made with ❤️ by <a href="https://twitter.com/andrealbiac" target="_blank">@andrealbiac</a>, <a href="https://twitter.com/jistro" target="_blank">@jistro</a> and <a href="https://twitter.com/ariutokintumi" target="_blank">@ariutokintumi</a>
        </p>
          </footer>
        </div>
      )}
    </>
  );
};

export default Home;
