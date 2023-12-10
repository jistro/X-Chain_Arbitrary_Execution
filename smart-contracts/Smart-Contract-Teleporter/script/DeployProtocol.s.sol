// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";

import { DeployerNewSubnet } from "../src/newSubnet/DeployerNewSubnet.sol";
import { DeployerOriginalSubnet } from "../src/originalSubnet/DeployerOriginalSubnet.sol";

contract DeployProtocol is Script {
    DeployerNewSubnet deployerNewSubnet;
    DeployerOriginalSubnet deployerOriginalSubnet;


    address adminAddress = 0xF11f8301C76F46733d855ac767BE741FFA9243Bd;

    function run() public {
        vm.startBroadcast(adminAddress);

        deployerNewSubnet = new DeployerNewSubnet(
            adminAddress
        );
        
        deployerOriginalSubnet = new DeployerOriginalSubnet(
            adminAddress
        );

        console2.log("deployer new subnet address: ", address(deployerNewSubnet));
        console2.log("deployer original subnet address: ", address(deployerOriginalSubnet));
    }
}
