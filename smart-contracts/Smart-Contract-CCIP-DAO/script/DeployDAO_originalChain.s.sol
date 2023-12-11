// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { TacoDAO } from "../src/originalChain/TacoDAO.sol";

contract DeployDAO_originalChain is Script {
    TacoDAO dao;

    address adminAddress = 0xF11f8301C76F46733d855ac767BE741FFA9243Bd;

    function run() public {
        vm.startBroadcast(adminAddress);
        
        dao = new TacoDAO(
            0xcb9C3Ad82b9255b3AB86e774fcAE787428e4b173,
            0x85CA85c9b182a7e4ce0A1F975E5bbBB389e5A640
        );
        console2.log("deployed DAO at address: ", address(dao));
    }
}