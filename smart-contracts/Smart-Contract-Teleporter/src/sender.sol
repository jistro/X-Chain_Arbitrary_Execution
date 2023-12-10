// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.18;

import "@ava-labs/teleporter/ITeleporterMessenger.sol";

contract sender {
    address constant teleporterMessengerContractAddress = 0x50A46AA7b2eCBe2B1AbB7df865B9A87f5eed8635;
    
    function sendMessages(
        address _to,
        string memory _message
    ) public returns(uint256 messageId) {
        return  
            ITeleporterMessenger(
                teleporterMessengerContractAddress
            ).sendCrossChainMessage(
                TeleporterMessageInput({
                    destinationBlockchainID: 0xd7cdc6f08b167595d1577e24838113a88b1005b471a6c430d79c48b4c89cfc53,
                    destinationAddress: _to,
                    feeInfo: TeleporterFeeInfo({
                        feeTokenAddress: address(0),
                        amount: 0
                    }),
                    requiredGasLimit: 1000000,
                    allowedRelayerAddresses: new address[](0),
                    message: abi.encode(_message)
                })
            );
    }
}