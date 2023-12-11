// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { DigitalCherry } from "../src/examples/nft.sol";

contract DeployNFT is Script {
    DigitalCherry nft;

    address adminAddress = 0xF11f8301C76F46733d855ac767BE741FFA9243Bd;

    function run() public {
        vm.startBroadcast(adminAddress);
        if (block.chainid == 11155111){ //if is sepolia eth
            console2.log("deployin in ETH sepolia");
            nft = new DigitalCherry(adminAddress, "Ethereum cherrys", "ETHC");
        } else if (block.chainid ==  43113){ //if is fuji avax
            console2.log("deployin in AVAX fuji");
            nft = new DigitalCherry(adminAddress, "Avalanche cherrys", "AVAC");
        } else if (block.chainid == 421613){ // if is goerli arb 
            console2.log("deployin in ARB goerli");
            nft = new DigitalCherry(adminAddress, "Arbitrum cherrys", "ARBC");
        } else if (block.chainid == 80001){
            console2.log("deployin in MUMBAI matic");
            nft = new DigitalCherry(adminAddress, "Polygon cherrys", "POLYC");
        } else {
            console2.log("Error no chain id found");
            revert();
        }
        console2.log("nft address: ", address(nft));
        console2.log("deployin in chain ID: ", block.chainid);

        for (uint mintCycle = 0; mintCycle < 10; mintCycle++){
            nft.safeMint(0xcb9C3Ad82b9255b3AB86e774fcAE787428e4b173);
        }
    }
}