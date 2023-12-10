// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

/**
                         ______                __
     ____ _____ ___     / ____/___ _____ ___  / /
    / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ / 
   / /_/ / / / / / /  / __/ / /_/ / / / / / /_/  
   \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   
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
import { LinkTokenInterface } from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import { StringConverter } from "../utils/StringConverter.sol";
import { ReceiverOriginalChain } from "./ReceiverOriginalChain.sol";

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
    bytes32 public constant CHAINLINK_ROLE = keccak256("CHAINLINK_ROLE");

    uint256 costPerMint;
    uint256 maxTokens;
    address originalContractAddress;
    uint256 counter;
    address private owner;

    address private recieverContractAddress;
    bool private _isRecieverContractAddressSet = false;

    address immutable i_router;
    address immutable i_link;
    /// @notice destinationChainSelector set the destination chain
    uint64 immutable destinationChainSelector;

    address public NewChainReceiverContractAddress = address(0);

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
        if (!hasRole(CHAINLINK_ROLE, msg.sender)) {
            revert GmFamTreasuryAndWraper__AccessDenied();
        }
        _;
    }
    ////-----░Constructor and setup functions░-----////
    constructor(
        address _routerContractAddress,
        address _linkTokenAddress,
        address _initialOwner,
        address _oldContract,
        uint256 _costPerMint,
        uint256 _maxTokens,
        uint64 _destinationChainSelector
    ) {
        _grantRole(OWNER_ROLE, _initialOwner);
        owner = _initialOwner;

        i_router = _routerContractAddress;
        i_link = _linkTokenAddress;
        destinationChainSelector = _destinationChainSelector;

        LinkTokenInterface(i_link).approve(i_router, type(uint256).max);

        costPerMint = _costPerMint;
        maxTokens = _maxTokens;
        originalContractAddress = _oldContract;
    }

    function setReceiverAddress(address _receiverAddress) public onlyOwner {
        if (_isRecieverContractAddressSet) {
            revert GmFamTreasuryAndWraper__ReceiverAddressAlreadySet();
        }
        _grantRole(CHAINLINK_ROLE, _receiverAddress);
        recieverContractAddress = _receiverAddress;
        _isRecieverContractAddressSet = true;
    }

    function setNewChainReceiverContractAddress(address _NewChainReceiverContractAddress) public onlyOwner {
        NewChainReceiverContractAddress = _NewChainReceiverContractAddress;
    }

    ////-----░Receive function░-----////
    receive() external payable {}

    ////-----░CCIP Reciever function░-----////
    function ccipSetIdToUnwrap(uint256 _tokenId,address _owner, string memory _signature) public onlyCCIP {
        mapIdCanUnwrap[_tokenId] = metadataTokenMint(_owner, true, _signature);
    }

    ////-----░Public/Client functions░-----////

    /// @notice This function "wraps" the token and send the signal to the new chain
    function passMint(uint256 tokenID, string memory _signature) external payable {
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

        // all the logic to send the action on ccip
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(NewChainReceiverContractAddress),
            data: abi.encodeWithSignature("ccipSetMint(string)", dataToSend),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 1500_000, strict: false})),
            feeToken: i_link
        });

        uint256 fees = IRouterClient(i_router).getFee(destinationChainSelector, message);

        if (fees > LinkTokenInterface(i_link).balanceOf(address(this))) {
            revert GmFamTreasuryAndWraper__NotEnoughFunds();
        }

        LinkTokenInterface(i_link).approve(i_router, fees);

        /*bytes32 messageId = */IRouterClient(i_router).ccipSend(destinationChainSelector, message);

        counter++;
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

    function withdrawLinkFunds(address beneficiary) public onlyOwner {
        uint256 amount = IERC20(i_link).balanceOf(address(this));
        bool send = IERC20(i_link).transfer(beneficiary, amount);
        if (!send) revert GmFamTreasuryAndWraper__TransferFailed();
    }

    ////-----░View functions░-----////
    function seeOriginalContractAddress() public view returns (address) {
        return originalContractAddress;
    }
    function viewRecieverContractAddress() public view returns (address) {
        return recieverContractAddress;
    }
    function viewOwnerAddress() public view returns (address) {
        return owner;
    }

    function crossChainSolution() public pure returns (uint8) {
        return 1;
    }

    function crossChainSolutionVariables() public view returns (bool, address, uint64) {
        return (false, recieverContractAddress, destinationChainSelector);
    }
}
