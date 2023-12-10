// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

/**
                       ______                __
   ____ _____ ___     / ____/___ _____ ___  / /
  / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ / 
 / /_/ / / / / / /  / __/ / /_/ / / / / / /_/  
 \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   
/____/                                         
    _   __                     __          _                  ______ 
   / | / /__ _      __   _____/ /_  ____ _(_)___       ____  / __/ /_
  /  |/ / _ \ | /| / /  / ___/ __ \/ __ `/ / __ \     / __ \/ /_/ __/
 / /|  /  __/ |/ |/ /  / /__/ / / / /_/ / / / / /    / / / / __/ /_  
/_/ |_/\___/|__/|__/   \___/_/ /_/\__,_/_/_/ /_/    /_/ /_/_/  \__/  
 *  @title Treasury and Wraper for a gm Fam! chain - chain contract (CCIP)
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract is to get the new tokens from the new chain 
 *       and send it to the original chain if the user wants to
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import { StringConverter } from "../utils/StringConverter.sol";
import "@ava-labs/teleporter/ITeleporterMessenger.sol";
import { ReceiverNewSubnet } from "./ReceiverNewSubnet.sol";

contract GmFam is ERC721, ERC721Burnable, ERC721Royalty, AccessControl, StringConverter {
    error GmFam__YouAreNotTheOwner();
    error GmFam__YouMUSTWrapTheTokenFirst();
    error GmFam__TransferFailed();
    error GmFam__NotEnoughFunds();
    error GmFam__MaxSupplyReached();
    error GmFam__CantDecreaseMaxSupply();
    error GmFam__AccessDenied();
    error GmFam__OwnerMustSetTheOriginalSubnetReceiverContractAddres();
    error GmFam__OwnerMUSTSetUPTheReceiverContractFirst();
    error GmFam__ReceiverAddressAlreadySet();

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant TELEPORTER_ROLE = keccak256("TELEPORTER_ROLE");

    string URIPrefix;
    bool URIHasId;
    string URISuffix;
    address private owner;

    address private recieverContractAddress;
    bool private _isRecieverContractAddressSet = false;


    /// @notice destinationChainSelector set the destination chain
    address constant TELEPORTER_MESSENGER_CONTRACT_ADDRESS = 0x50A46AA7b2eCBe2B1AbB7df865B9A87f5eed8635;
    bytes32 immutable i_destinationBlockchainID;

    address public ReceiverContractAddress_OriginalSubnet;

    struct metadataTokenMint {
        address ownerOfToken;
        bool canMintToken;
        string signature;
    }

    mapping(uint256 => metadataTokenMint) internal mapTokenIdMint;

    modifier onlyOwner() {
        if (!hasRole(OWNER_ROLE, msg.sender)) {
            revert GmFam__AccessDenied();
        }
        _;
    }

    modifier onlyCCIP() {
        if (!hasRole(TELEPORTER_ROLE, msg.sender)) {
            revert GmFam__AccessDenied();
        }
        _;
    }

    ////-----░Constructor and setup functions░-----////
    constructor(
        address _initialOwner,
        bytes32 _destinationBlockchainID,
        string memory _nameOfToken,
        string memory _symbolOfToken,
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix,
        uint96 _feeNumerator
    ) ERC721(_nameOfToken, _symbolOfToken) {
        _grantRole(OWNER_ROLE, _initialOwner);
        owner = _initialOwner;

        i_destinationBlockchainID = _destinationBlockchainID;
        
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;

        /// @dev Sets the royalty fee for the contract
        ///      feeNumerator is in basis points (1/100 of a percent)
        ///      10000 = 100%
        ///      250 = 2.5%
        _setDefaultRoyalty(address(this), _feeNumerator);
    }

    function setReceiverAddress(address _receiverAddress) public onlyOwner {
        if (_isRecieverContractAddressSet) {
            revert GmFam__ReceiverAddressAlreadySet();
        }
        _grantRole(TELEPORTER_ROLE, _receiverAddress);
        recieverContractAddress = _receiverAddress;
        _isRecieverContractAddressSet = true;
    }

    function setOriginalSubnetReceiverContractAddres(address _OriginalSubnetReceiverContractAddres) public onlyOwner {
        ReceiverContractAddress_OriginalSubnet = _OriginalSubnetReceiverContractAddres;
    }

    ////-----░Receive function░-----////
    receive() external payable {}

    ////-----░Teleporter Reciever function░-----////
    function teleporterSetMint(uint256 _tokenId, address _owner,string memory _signature) public onlyCCIP {
        mapTokenIdMint[_tokenId] = metadataTokenMint(_owner, true, _signature);
    }

    ////-----░Public/Client functions░-----////

    /// @notice This function is used to mint the token in the new chain
    function safeMint(uint256 id, string memory _signature) public payable {
        if (!mapTokenIdMint[id].canMintToken) {
            revert GmFam__YouMUSTWrapTheTokenFirst();
        }
        if (mapTokenIdMint[id].ownerOfToken != msg.sender) {
            revert GmFam__YouAreNotTheOwner();
        }
        if (keccak256(abi.encodePacked(mapTokenIdMint[id].signature)) != keccak256(abi.encodePacked(_signature))) {
            revert GmFam__YouAreNotTheOwner();
        }
        _safeMint(msg.sender, id);
        mapTokenIdMint[id] = metadataTokenMint(address(0), false, "");
    }

    function seeIfCanMint(uint256 _tokenId) public view returns (bool) {
        return mapTokenIdMint[_tokenId].canMintToken;
    }    

    /// @notice This function burns the token and send the signal to the original chain
    function goBackToOriginalCollection(
        uint256 tokenID,
        string memory _signature
    ) public returns(uint256) {
        if (msg.sender != ownerOf(tokenID)) {
            revert GmFam__YouAreNotTheOwner();
        }

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
                uintToString(0),
                "="
            )
        );

        // all the logic to send the action on AVAX Teleporter
        uint256 messageId = ITeleporterMessenger(
                TELEPORTER_MESSENGER_CONTRACT_ADDRESS
        ).sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: i_destinationBlockchainID,
                destinationAddress: ReceiverContractAddress_OriginalSubnet,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: 3000000,
                allowedRelayerAddresses: new address[](0),
                message: abi.encodeWithSignature("teleporterSetMint(uint256,address,string)", dataToSend)
            })
        );

        _burn(tokenID);

        return messageId;
    }

    ////-----░Admin/DAO only functions░-----////
    function changeOwner(address newOwner) public onlyOwner {
        _grantRole(OWNER_ROLE, newOwner);
        _revokeRole(OWNER_ROLE, msg.sender);
        owner = newOwner;
    }

    function changeCreatorFees(uint96 _feeNumerator) public onlyOwner {
        _setDefaultRoyalty(address(this), _feeNumerator);
    }

    function changeBaseURI(string memory _URIPrefix, bool _URIHasId, string memory _URISuffix) public onlyOwner {
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;
    }

    ////░░░░░░Sensible functions░░░░░░////

    function transferEthFunds(address payable to, uint256 amount) public onlyOwner {
        if (address(this).balance < amount) {
            revert GmFam__NotEnoughFunds();
        }
        if (!payable(to).send(amount)) {
            revert GmFam__TransferFailed();
        }
    }

    //------------------------------------//
    //           Internal Functions       //
    //------------------------------------//
    function _baseURI() internal view virtual override returns (string memory) {
        return URIPrefix;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth) internal returns (address) {
        return _update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal {
        _increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (URIHasId) {
            return string.concat(string(abi.encodePacked(_baseURI(), Strings.toString(tokenId))), URISuffix);
        } else {
            return string.concat(_baseURI(), URISuffix);
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
        return (true, ReceiverContractAddress_OriginalSubnet, i_destinationBlockchainID);
    }
}
