// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

/**
                       ______                __    .
   ____ _____ ___     / ____/___ _____ ___  / /   / \
  / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ /   /  /
 / /_/ / / / / / /  / __/ / /_/ / / / / / /_/   /  / /\
 \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   /_ / /__\
/____/                                        
   ___          _                 
  / _ \___ ____(_)__ _  _____ ____
 / , _/ -_) __/ / -_) |/ / -_) __/
/_/|_|\__/\__/_/\__/|___/\__/_/                                               
 *  @title Original Chain gm Fam! contract deployer
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract is used to receive the calls from the original chain
 *       by chainlink's CCIP and send it to the gmFam contract
 */

import { GmFam } from "./GmFam.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@ava-labs/teleporter/ITeleporterReceiver.sol";
import { DecodeMsgSig } from "../utils/DecodeMsgSig.sol";

contract ReceiverNewSubnet is 
    ITeleporterReceiver, 
    DecodeMsgSig, 
    Ownable 
{
    error SetupAlreadyDone();
    error NotFullySetup();
    error NotSender();

    address constant TELEPORTER_MESSENGER_CONTRACT_ADDRESS = 0x50A46AA7b2eCBe2B1AbB7df865B9A87f5eed8635;

    GmFam gmFamContract;

    address TreasuryAndWrapper_OriginalChainAddress;
    bytes32 ChainId;

    bool isFullySetup = false;

    modifier onlyTeleporter(
        bytes32 originBlockchainID,
        address originSenderAddress
    ){
        if (msg.sender != TELEPORTER_MESSENGER_CONTRACT_ADDRESS) {
            revert();
        }
        if (originBlockchainID != ChainId) {
            revert();
        }
        if (originSenderAddress != TreasuryAndWrapper_OriginalChainAddress) {
            revert();
        }
        _;
    }

    constructor(
        address _initialOwner,
        address payable _gmFamAddress
    ) {
        gmFamContract = GmFam(_gmFamAddress);
        transferOwnership(_initialOwner);
    }

    function setupOriginalSubnetPointerData(
        address _TreasuryAndWrapperOriginalChainAddress,
        bytes32 _sourceChainId
    ) external onlyOwner {
        if(isFullySetup) {
            revert SetupAlreadyDone();
        }
        TreasuryAndWrapper_OriginalChainAddress = _TreasuryAndWrapperOriginalChainAddress;
        ChainId = _sourceChainId;
        isFullySetup = true;
    }

    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) public onlyTeleporter(originBlockchainID, originSenderAddress) {
        (
            string [] memory dataForVariables, 
            uint256 whereIsSignedMetadata
        ) = decodeSignatureMsgToString("=",",",message,2);
        
        address ownerOfToken = convertStringToAddress(dataForVariables[0]);
        
        (uint256 tokenId,) = convertStringToUint(dataForVariables[1]);
        
        gmFamContract.teleporterSetMint(
            tokenId, 
            ownerOfToken,
            dataForVariables[whereIsSignedMetadata]
        );
    }

    function seeWhoIsTheSender() public view returns(address, bytes32) {
        return (TreasuryAndWrapper_OriginalChainAddress, ChainId);
    }

    function isReceiverFullySetup() public view returns(bool) {
        return isFullySetup;
    }

    function seeOldSubnetPointerData() public view returns(address, bytes32) {
        return (TreasuryAndWrapper_OriginalChainAddress, ChainId);
    }
}