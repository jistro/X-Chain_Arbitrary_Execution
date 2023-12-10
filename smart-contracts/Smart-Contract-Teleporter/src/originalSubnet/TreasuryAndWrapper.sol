// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

/**
                       ______                __    .
   ____ _____ ___     / ____/___ _____ ___  / /   / \
  / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ /   /  /
 / /_/ / / / / / /  / __/ / /_/ / / / / / /_/   /  / /\
 \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   /_ / /__\
/____/   
 _____                                     
|_   _| __ ___  __ _ ___ _   _ _ __ _   _  
  | || '__/ _ \/ _` / __| | | | '__| | | | 
  | || | |  __/ (_| \__ \ |_| | |  | |_| | 
  |_||_|  \___|\__,_|___/\__,_|_|   \__, | 
   / \   _ __   __| |               |___/  
  / _ \ | '_ \ / _` |                      
 / ___ \| | | | (_| |                      
/_/   \_\_|_|_|\__,_|                      
\ \      / / __ __ _ _ __  _ __   ___ _ __ 
 \ \ /\ / / '__/ _` | '_ \| '_ \ / _ \ '__|
  \ V  V /| | | (_| | |_) | |_) |  __/ |   
   \_/\_/ |_|  \__,_| .__/| .__/ \___|_|   
                    |_|   |_|              
 *  @title Treasury and Wraper for a gm Fam! chain - chain contract (CCIP)
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract has two main functions:
 *       1. "Wrap" a token from the original chain and send the 
 *          signal to the new chain
 *       2. "Unwrap" a token from the new chain and send it back
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import { StringConverter } from "../utils/StringConverter.sol";
import { ReceiverOriginalSubnet } from "./ReceiverOriginalSubnet.sol";
import "@ava-labs/teleporter/ITeleporterMessenger.sol";

contract TreasuryAndWrapper is AccessControl, StringConverter {
    error GmFamTreasuryAndWraper__YouAreNotTheOwner();
    error GmFamTreasuryAndWraper__YouMUSTPayForMint();
    error GmFamTreasuryAndWraper__TransferFailed();
    error GmFamTreasuryAndWraper__NotEnoughFunds();
    error GmFamTreasuryAndWraper__MaxSupplyReached();
    error GmFamTreasuryAndWraper__YouMUSTWrapTheTokenFirst();
    error GmFamTreasuryAndWraper__YouMUSTUnwrapTheTokenFirst();
    error GmFamTreasuryAndWraper__AccessDenied();
    error GmFamTreasuryAndWraper__OwnerMustSetTheNewChainReceiverContractAddress();
    error GmFamTreasuryAndWraper__OwnerMUSTSetUPTheReceiverContractFirst();
    error GmFamTreasuryAndWraper__ReceiverAddressAlreadySet();

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant TELEPORTER_ROLE = keccak256("TELEPORTER_ROLE");

    uint256 costPerMint;
    uint256 maxTokens;
    address originalContractAddress;
    uint256 counter;
    address private owner;

    address private recieverContractAddress;
    bool private _isRecieverContractAddressSet = false;

    address constant TELEPORTER_MESSENGER_CONTRACT_ADDRESS = 0x50A46AA7b2eCBe2B1AbB7df865B9A87f5eed8635;
    bytes32 immutable i_destinationBlockchainID;

    address public ReceiverContractAddress_NewSubnet = address(0);

    struct metadataTokenMint {
        address ownerOfToken;
        bool canMint;
        string signature;
    }

    mapping(uint256 => metadataTokenMint) internal mapIdCanUnwrap;

    modifier onlyOwner() {
        if (!hasRole(OWNER_ROLE, msg.sender)) {
            revert GmFamTreasuryAndWraper__AccessDenied();
        }
        _;
    }

    modifier onlyCCIP() {
        if (!hasRole(TELEPORTER_ROLE, msg.sender)) {
            revert GmFamTreasuryAndWraper__AccessDenied();
        }
        _;
    }
    ////-----░Constructor and setup functions░-----////
    //0xd7cdc6f08b167595d1577e24838113a88b1005b471a6c430d79c48b4c89cfc53
    constructor(
        address _initialOwner,
        address _oldContract,
        uint256 _costPerMint,
        uint256 _maxTokens,
        bytes32 _destinationBlockchainID
    ) {
        _grantRole(OWNER_ROLE, _initialOwner);
        owner = _initialOwner;

        i_destinationBlockchainID = _destinationBlockchainID;

        costPerMint = _costPerMint;
        maxTokens = _maxTokens;
        originalContractAddress = _oldContract;
    }

    function setReceiverAddress(address _receiverAddress) public onlyOwner {
        if (_isRecieverContractAddressSet) {
            revert GmFamTreasuryAndWraper__ReceiverAddressAlreadySet();
        }
        _grantRole(TELEPORTER_ROLE, _receiverAddress);
        recieverContractAddress = _receiverAddress;
        _isRecieverContractAddressSet = true;
    }

    function setNewSubnetReceiverContractAddress(address _NewSubnetReceiverContractAddress) public onlyOwner {
        ReceiverContractAddress_NewSubnet = _NewSubnetReceiverContractAddress;
    }

    ////-----░Receive function░-----////
    receive() external payable {}

    ////-----░Teleporter Reciever function░-----////
    function teleporterSetIdToUnwrap(uint256 _tokenId,address _owner, string memory _signature) public onlyCCIP {
        mapIdCanUnwrap[_tokenId] = metadataTokenMint(_owner, true, _signature);
    }

    ////-----░Public/Client functions░-----////

    /// @notice This function "wraps" the token and send the signal to the new chain
    function passMint(
        uint256 tokenID, 
        string memory _signature
    ) external payable returns (uint256) {
        if (counter >= maxTokens) {
            revert GmFamTreasuryAndWraper__MaxSupplyReached();
        }
        if (msg.value < costPerMint) {
            revert GmFamTreasuryAndWraper__YouMUSTPayForMint();
        }
        if (msg.sender != ERC721(originalContractAddress).ownerOf(tokenID)) {
            revert GmFamTreasuryAndWraper__YouAreNotTheOwner();
        }
        if (!payable(address(this)).send(msg.value)) {
            revert GmFamTreasuryAndWraper__TransferFailed();
        }

        ERC721(originalContractAddress).transferFrom(msg.sender, address(this), tokenID);

        string memory dataToSend = string(
            abi.encodePacked(
                "=",
                addressToString(msg.sender),
                ",",
                uintToString(tokenID),
                "|",
                _signature,
                ",",
                addressToString(msg.sender),
                ",",
                uintToString(msg.value),
                "="
            )
        );

        // all the logic to send the action on AVAX Teleporter
        uint256 messageId = ITeleporterMessenger(
                TELEPORTER_MESSENGER_CONTRACT_ADDRESS
        ).sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: i_destinationBlockchainID,
                destinationAddress: ReceiverContractAddress_NewSubnet,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: 3000000,
                allowedRelayerAddresses: new address[](0),
                message: abi.encodeWithSignature("teleporterSetMint(uint256,address,string)", dataToSend)
            })
        );

        // all the logic to send the action on AVAX Teleporter

        counter++;

        return messageId;
    }

    /// @notice This function "Unwrap" the token
    function withdrawMyToken(uint256 _tokenId, string memory _signature) public {
        if (!mapIdCanUnwrap[_tokenId].canMint) {
            revert GmFamTreasuryAndWraper__YouMUSTUnwrapTheTokenFirst();
        }
        if (mapIdCanUnwrap[_tokenId].ownerOfToken != msg.sender) {
            revert GmFamTreasuryAndWraper__YouAreNotTheOwner();
        }
        if (keccak256(abi.encodePacked(mapIdCanUnwrap[_tokenId].signature)) != keccak256(abi.encodePacked(_signature))) {
            revert GmFamTreasuryAndWraper__YouMUSTUnwrapTheTokenFirst();
        }
        ERC721(originalContractAddress).transferFrom(address(this), msg.sender, _tokenId);
        mapIdCanUnwrap[_tokenId] = metadataTokenMint(address(0), false, "");
    }

    function seeIfCanUnwrap(uint256 _tokenId) public view returns (bool) {
        return mapIdCanUnwrap[_tokenId].canMint;
    }


    ////-----░Admin/DAO only functions░-----////
    function changeOwner(address newOwner) public onlyOwner {
        _grantRole(OWNER_ROLE, newOwner);
        _revokeRole(OWNER_ROLE, msg.sender);
        owner = newOwner;
    }

    /// @notice This function set a new cost per mint by wei
    function changeCost(uint256 newCost) public onlyOwner {
        costPerMint = newCost;
    }

    /// @notice This function set a new max tokens
    function changeMaxTokens(uint256 newMaxTokens) public onlyOwner {
        maxTokens = newMaxTokens;
    }

    ////░░░░░░Sensible functions░░░░░░////

    function transferEthFunds(address payable beneficiary, uint256 amount) public onlyOwner {
        if (address(this).balance < amount) {
            revert GmFamTreasuryAndWraper__NotEnoughFunds();
        }
        if (!payable(beneficiary).send(amount)) {
            revert GmFamTreasuryAndWraper__TransferFailed();
        }
    }


    ////-----░View functions░-----////
    function viewRecieverContractAddress() public view returns (address) {
        return recieverContractAddress;
    }
    function viewOwnerAddress() public view returns (address) {
        return owner;
    }

    function crossChainSolution() public pure returns (uint8) {
        return 2;
    }
    
    function crossChainSolutionVariables() public view returns (bool, address, bytes32) {
        return (false, ReceiverContractAddress_NewSubnet, i_destinationBlockchainID);
    }

    function seeOriginalContractAddress() public view returns (address) {
        return originalContractAddress;
    }
}
