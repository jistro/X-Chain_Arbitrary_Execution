// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { DeployerNewChain } from "../src/newChain/DeployerNewChain.sol";

contract gmFamScriptNewChain is Script {
    DeployerNewChain deployerNewChain;

    /* remember that every address of cciop and token changes in every chain
     check https://docs.chain.link/ccip/supported-networks for more info  */

    address adminAddress = 0xF11f8301C76F46733d855ac767BE741FFA9243Bd;
    address routerCCIP = address(0);
    address linkTokenAddress = address(0);


    function run() public {
        vm.startBroadcast(adminAddress);
        if (block.chainid == 11155111){ //if is sepolia eth
            console2.log("deployin in ETH sepolia");
            routerCCIP = 0xD0daae2231E9CB96b94C8512223533293C3693Bf;
            linkTokenAddress = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
        } else if (block.chainid ==  43113){ //if is fuji avax
            console2.log("deployin in AVAX fuji");
            routerCCIP = 0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8;
            linkTokenAddress = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846;
        } else if (block.chainid == 421613){ // if is goerli arb 
            console2.log("deployin in ARB goerli");
            routerCCIP = 0x88E492127709447A5ABEFdaB8788a15B4567589E;
            linkTokenAddress = 0xd14838A68E8AFBAdE5efb411d5871ea0011AFd28;
        } else if (block.chainid == 80001){
            console2.log("deployin in MUMBAI matic");
            routerCCIP = 0x70499c328e1E2a3c41108bd3730F6670a44595D1;
            linkTokenAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
        } else {
            console2.log("Error no chain id found");
            revert();
        }

        // deployer for CCIP in the new chain
        deployerNewChain = new DeployerNewChain(
            adminAddress,
            routerCCIP,
            linkTokenAddress
        );

        (address GmFam, address Receiver)= deployerNewChain.deploy(
            0xcb9C3Ad82b9255b3AB86e774fcAE787428e4b173,
            "FUJI Cherrys",
            "FCH",
            "ipfs://QmWx3cFwFGAxd43AutywbqykKFDcvuvo8zG75Z7rKbzTPr/",
            true,
            ".json",
            100,
            16015286601757825753
        );

        console2.log("GmFam: ", GmFam);
        console2.log("Receiver: ", Receiver);


        
        
    }
}

