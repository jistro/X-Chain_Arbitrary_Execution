import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/NFT.module.css";
import HamburgerMenu from "../components/hamburgerMenu";
import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Stack,
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
import TreasuryAndWrapperTeleporter from "../abis/teleporter/TreasuryAndWrapperTeleporter.json";

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

  const [txHashData, setTxHashData] = useState<any>(["none", ""]);

  const [ownerOfTokenList, setOwnerOfTokenList] = useState<any>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [ownerOfTokenListTreasury, setOwnerOfTokenListTreasury] = useState<any>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [value, setValue] = useState("");

  const [valueRetrieve, setValueRetrieve] = useState("");

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
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: TreasuryAndWrapperTeleporter.abi,
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
            abi: TreasuryAndWrapperTeleporter.abi,
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
              //var idTeleporter = (result as any[])[2];
              //convert to hex string
              var idTeleporter = (result as any[])[2].toString(16);
              console.log("id: --", idTeleporter);

              if (
                idTeleporter ===
                "ea70d815f0232f5419dabafe36c964ffe5c22d17ac367b60b556ab3e17a36458"
              ) {
                setScOriginalChainMetadata([
                  originalContractAddress,
                  "Amplify Subnet",
                  "78430",
                ]);
              } else if (
                idTeleporter ===
                "d7cdc6f08b167595d1577e24838113a88b1005b471a6c430d79c48b4c89cfc53"
              ) {
                setScOriginalChainMetadata([
                  originalContractAddress,
                  "Bulletin Subnet Testnet",
                  "78431",
                ]);
              } else {
                setScOriginalChainMetadata([
                  originalContractAddress,
                  "Conduit Subnet Testnet",
                  "78432",
                ]);
              }
              console.log("--------------------------------------------");
              const fetchOwnerOfTokens = async () => {
                for (let i = 0; i < 10; i++) {
                  try {
                    const result = await readContract({
                      address: originalContractAddress as `0x${string}`,
                      abi: ERC721.abi,
                      functionName: "ownerOf",
                      args: [i],
                      account: address,
                    });
                    console.log(i);
                    console.log(result);
                    if (result === address) {
                      console.log("owner");
                      ///agregar si i es owner pon true en la lista OwnerOfTokenList[i] = true
                      ownerOfTokenList[i] = true;
                      console.log(ownerOfTokenList);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              };

              const fetchOwnerOfTokensContract = async () => {
                for (let i = 0; i < 10; i++) {
                  try {
                    const result = await readContract({
                      address: originalContractAddress as `0x${string}`,
                      abi: ERC721.abi,
                      functionName: "ownerOf",
                      args: [i],
                      account: address,
                    });
                    console.log(i);
                    console.log(result);
                    if (result === inputs[0]) {
                      console.log("owner");
                      ///agregar si i es owner pon true en la lista OwnerOfTokenList[i] = true
                      ownerOfTokenListTreasury[i] = true;
                      console.log(ownerOfTokenList);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              };

              fetchOwnerOfTokens();
              fetchOwnerOfTokensContract();
              setOwnerOfTokenList(ownerOfTokenList);
              setOwnerOfTokenListTreasury(ownerOfTokenListTreasury);
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
    } else {
      console.log("ccip");
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: TreasuryAndWrapperCCIP.abi,
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
              console.log("idchainlink--", result);

              var idChainlink = BigInt((result as any[])[2]);
              console.log("idchainlink--", idChainlink);
              if (
                idChainlink !==
                BigInt("426641194531640554287674730226785263383855284524")
              ) {
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

              console.log("--------------------------------------------");
              const fetchOwnerOfTokens = async () => {
                for (let i = 0; i < 10; i++) {
                  try {
                    const result = await readContract({
                      address: originalContractAddress as `0x${string}`,
                      abi: ERC721.abi,
                      functionName: "ownerOf",
                      args: [i],
                      account: address,
                    });
                    console.log(i);
                    console.log(result);
                    if (result === address) {
                      console.log("owner");
                      ///agregar si i es owner pon true en la lista OwnerOfTokenList[i] = true
                      ownerOfTokenList[i] = true;
                      console.log(ownerOfTokenList);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              };

              const fetchOwnerOfTokensContract = async () => {
                for (let i = 0; i < 10; i++) {
                  try {
                    const result = await readContract({
                      address: originalContractAddress as `0x${string}`,
                      abi: ERC721.abi,
                      functionName: "ownerOf",
                      args: [i],
                      account: address,
                    });
                    console.log(i);
                    console.log(result);
                    if (result === inputs[0]) {
                      console.log("owner");
                      ///agregar si i es owner pon true en la lista OwnerOfTokenList[i] = true
                      ownerOfTokenListTreasury[i] = true;
                      console.log(ownerOfTokenList);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              };

              fetchOwnerOfTokens();
              fetchOwnerOfTokensContract();
              setOwnerOfTokenList(ownerOfTokenList);
              setOwnerOfTokenListTreasury(ownerOfTokenListTreasury);
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
          setOwnerOfTokenList([]);
          setChainData(["", ""]);
        });
    }
  };

  const givePermission = async () => {
    console.log(value);
    const inputIDs = ["fetchTreasuryAndWrapperAddress__addressInput"];
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
    var tokenId = value;
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
    const inputIDs = value;

    if (inputIDs === "") {
      toast.error("Please select NFT", {
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
    const message = `${functionName}(uint256, address, string),${inputIDs},${address},signature`;
    signMessage({ message });
  };

  const passMint = () => {
    console.log(value);
    const inputIDs = [
      "fetchTreasuryAndWrapperAddress__addressInput"
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
    console.log(inputs[0]);
    ///make value a number
    const tokenID = Number(value);

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
      console.log("teleporter---");
      readContract({
        address: inputs[0] as `0x${string}`,
        abi: TreasuryAndWrapperTeleporter.abi,
        functionName: "seeOriginalContractAddress",
      }).then((result) => {
        console.log(result);
        readContract({
          address: result as `0x${string}`,
          abi: ERC721.abi,
          functionName: "getApproved",
            args: [tokenID],
        }).then((result) => {
          if (result !== inputs[0]) {
            toast.error(
              `The address is not the approved for the token #${tokenID}`,
              {
                duration: 3000,
                position: "top-right",
              }
            );
            return;
          }
        });
      });

      if (data === undefined) {
        return;
      } else {
        var dataSigned = data.toString();
      }
      prepareWriteContract({
        address: inputs[0] as "0x${string}",
        abi: TreasuryAndWrapperTeleporter.abi,
        functionName: "passMint",
        args: [tokenID, dataSigned],
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
        abi: TreasuryAndWrapperCCIP.abi,
        functionName: "seeOriginalContractAddress",
      }).then((result) => {
        console.log(result);
        readContract({
          address: result as `0x${string}`,
          abi: ERC721.abi,
          functionName: "getApproved",
          args: [tokenID],
        }).then((result) => {
          if (result !== inputs[0]) {
            toast.error(
              `The address is not the approved for the token #${tokenID}`,
              {
                duration: 3000,
                position: "top-right",
              }
            );
            return;
          }
        });
      });

      if (data === undefined) {
        return;
      } else {
        var dataSigned = data.toString();
      }
      prepareWriteContract({
        address: inputs[0] as "0x${string}",
        abi: TreasuryAndWrapperCCIP.abi,
        functionName: "passMint",
        args: [tokenID, dataSigned],
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

  const makeSignMessageWithdrawMyToken = () => {
    console.log(valueRetrieve);
    
    if (valueRetrieve === "") {
      toast.error("Please select NFT", {
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

    const message = `${functionName}(uint256, address, string),${valueRetrieve},${address},signature`;
    signMessage({ message });
  };

  const withdrawMyToken = () => {
    console.log(valueRetrieve);
    const inputIDs = [
      "fetchTreasuryAndWrapperAddress__addressInput"
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
    const tokenID = Number(valueRetrieve);
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
        abi: TreasuryAndWrapperTeleporter.abi,
        functionName: "seeIfCanUnwrap",
        args: [tokenID],
      }).then((result) => {
        console.log(result);
        if (!result) {
          toast.error(
            "You can't mint, please check the tokenId or wait for the teleporter to finish the process",
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
        abi: TreasuryAndWrapperTeleporter.abi,
        functionName: "withdrawMyToken",
        args: [tokenID, dataSigned],
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
            toast.success("Unwrap passed", {
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
        abi: TreasuryAndWrapperCCIP.abi,
        functionName: "seeIfCanUnwrap",
        args: [tokenID],
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
        abi: TreasuryAndWrapperCCIP.abi,
        functionName: "withdrawMyToken",
        args: [tokenID, dataSigned],
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
            toast.success("Unwrap passed", {
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
            <img src="./logoPrincipal.svg" />
            <div>
              <HamburgerMenu numberBlocker={1} />
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
                        <RadioGroup
                          onChange={setValue}
                          value={value}
                          className={styles.containerFormBottom__formRadioGroup}
                        >
                          {ownerOfTokenList.map((value: any, index: number) => {
                            if (value) {
                              return (
                                <div>
                                  <img
                                    src={`https://ipfs.io/ipfs/Qmbnmyv2ZwgnmX8E7qs26LAXv77xp8wpMqULUXEy2xJBGn/${index}.jpg`}
                                    width="100"
                                  />
                                  <p>{`Mighty Mouse #${index}`}</p>
                                  <Radio key={index} value={index.toString()} />
                                </div>
                              );
                            }
                          })}
                        </RadioGroup>

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
                    <TabPanel>
                      <div className={styles.containerFormBottom__form}>

                      <RadioGroup
                          onChange={setValueRetrieve}
                          value={valueRetrieve}
                          className={styles.containerFormBottom__formRadioGroup}
                        >
                          {ownerOfTokenListTreasury.map((value: any, index: number) => {
                            if (value) {
                              return (
                                <div>
                                  <img
                                    src={`https://ipfs.io/ipfs/Qmbnmyv2ZwgnmX8E7qs26LAXv77xp8wpMqULUXEy2xJBGn/${index}.jpg`}
                                    width="100"
                                  />
                                  <p>{`Mighty Mouse #${index}`}</p>
                                  <Radio key={index} value={index.toString()} />
                                </div>
                              );
                            }
                          })}
                        </RadioGroup>
                        <div
                          className={
                            styles.containerFormBottom__form__ButtonContainer
                          }
                        >
                          <Button
                            size="xs"
                            onClick={makeSignMessageWithdrawMyToken}
                          >
                            <p>{isSuccess ? "signed!" : "Sign message"}</p>
                          </Button>
                          <Button
                            size="xs"
                            backgroundColor={"#ff814b"}
                            _hover={{ backgroundColor: "#bb5c34" }}
                            onClick={withdrawMyToken}
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
            <p>
              Made with ❤️ by{" "}
              <a href="https://twitter.com/andrealbiac" target="_blank">
                @andrealbiac
              </a>
              ,{" "}
              <a href="https://twitter.com/jistro" target="_blank">
                @jistro
              </a>{" "}
              and{" "}
              <a href="https://twitter.com/ariutokintumi" target="_blank">
                @ariutokintumi
              </a>
            </p>
          </footer>
        </div>
      )}
    </>
  );
};

export default Home;
