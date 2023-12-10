// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.18;

import "@ava-labs/teleporter/ITeleporterReceiver.sol";

contract recever is ITeleporterReceiver {
    address constant teleporterMessengerContractAddress = 0x50A46AA7b2eCBe2B1AbB7df865B9A87f5eed8635;
    string public LastMessage;

    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) public {
        if (msg.sender != teleporterMessengerContractAddress) {
            revert();
        }
        LastMessage = abi.decode(message, (string));
    }
}