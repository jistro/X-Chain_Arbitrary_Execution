// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
                      ______                __
  ____ _____ ___     / ____/___ _____ ___  / /
 / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ / 
/ /_/ / / / / / /  / __/ / /_/ / / / / / /_/  
\__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   
/____/                                         
    _   __                     __          _                ______              _ __  __       
   / | / /__ _      __   _____/ /_  ____ _(_)___     ____  / __/ /_   _      __(_) /_/ /_      
  /  |/ / _ \ | /| / /  / ___/ __ \/ __ `/ / __ \   / __ \/ /_/ __/  | | /| / / / __/ __ \     
 / /|  /  __/ |/ |/ /  / /__/ / / / /_/ / / / / /  / / / / __/ /_    | |/ |/ / / /_/ / / /     
/_/ |_/\___/|__/|__/   \___/_/ /_/\__,_/_/_/ /_/  /_/ /_/_/  \__/    |__/|__/_/\__/_/ /_/      
  _________ _/ / /____ 
 / ___/ __ `/ / / ___/ 
/ /__/ /_/ / / (__  ) 
\___/\__,_/_/_/____/ 
 *  @title Treasury and Wraper for a gm Fam! chain - chain contract (CCIP)
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract is to get the new tokens from the new chain 
 *       and send it to the original chain if the user wants to, also
 *       the user can send albtraty calls using his tokens
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import { LinkTokenInterface } from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import { StringConverter } from "../utils/StringConverter.sol";

contract GmFamWithCalls is ERC721, ERC721Burnable, ERC721Royalty, AccessControl, StringConverter {
    error GmFamWithCalls__YouAreNotTheOwner();
    error GmFamWithCalls__YouMUSTWrapTheTokenFirst();
    error GmFamWithCalls__TransferFailed();
    error GmFamWithCalls__NotEnoughFunds();
    error GmFamWithCalls__MaxSupplyReached();
    error GmFamWithCalls__CantDecreaseMaxSupply();
    error GmFamWithCalls__AccessDenied();
    error GmFamWithCalls__OwnerMustSetTheOriginalChainReceiverContractAddres();
    error GmFamWithCalls__OwnerMUSTSetUPTheReceiverContractFirst();
    error GmFamWithCalls__ReceiverAddressAlreadySet();
    error GmFamWithCalls__FunctionBlackListed();
    error GmFamWithCalls__FunctionAlreadyWhiteListed();
    error GmFamWithCalls__FunctionAlreadyBlackListed();
    error GmFamWithCalls__FunctionNotWhiteListed();
    error GmFamWithCalls__FunctionIsWhiteListedButNotEnoughTime();
    error GmFamWithCalls__CantCallItself();
    error GmFamWithCalls__FunctionCanOnlyBeCalledByAllowedAddress();
    

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant CHAINLINK_ROLE = keccak256("CHAINLINK_ROLE");

    string URIPrefix;
    bool URIHasId;
    string URISuffix;
    address private owner;

    address private recieverContractAddress;
    bool private _isRecieverContractAddressSet = false;

    address immutable i_router;
    address immutable i_link;
    /// @notice destinationChainSelector set the destination chain
    uint64 immutable destinationChainSelector;

    address public OriginalChainReceiverContractAddress = address(0);

    struct metadataTokenMint {
        address ownerOfToken;
        bool canMintToken;
        string signature;
    }

    mapping(uint256 => metadataTokenMint) internal mapTokenIdMint;

    struct WhiteListedFunctionMetadata {
        uint256 timestampInclusion;
        address allowedAddress;
    }

    mapping(bytes => WhiteListedFunctionMetadata) whiteListedFunctions;

    mapping(bytes => bool) blackListedFunctions;


    modifier onlyOwner() {
        if (!hasRole(OWNER_ROLE, msg.sender)) {
            revert GmFamWithCalls__AccessDenied();
        }
        _;
    }

    modifier onlyCCIP() {
        if (!hasRole(CHAINLINK_ROLE, msg.sender)) {
            revert GmFamWithCalls__AccessDenied();
        }
        _;
    }

    ////-----░Constructor and setup functions░-----////
    constructor(
        address _routerContractAddress,
        address _linkTokenAddress,
        address _initialOwner,
        uint64 _destinationChainSelector,
        string memory _nameOfToken,
        string memory _symbolOfToken,
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix,
        uint96 _feeNumerator
    ) ERC721(_nameOfToken, _symbolOfToken) {
        _grantRole(OWNER_ROLE, _initialOwner);

        owner = _initialOwner;

        i_router = _routerContractAddress;
        i_link = _linkTokenAddress;
        destinationChainSelector = _destinationChainSelector;
        LinkTokenInterface(i_link).approve(i_router, type(uint256).max);

        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;

        /// @dev Sets the royalty fee for the contract
        ///      feeNumerator is in basis points (1/100 of a percent)
        ///      10000 = 100%
        ///      250 = 2.5%
        _setDefaultRoyalty(address(this), _feeNumerator);

        /// blackListedFunctions
        blackListedFunctions[hex"31c864e8"] = true; // safeMint(uint256)
        blackListedFunctions[hex"d512b996"] = true; // goBackToOriginalCollection(uint256)
        blackListedFunctions[hex"9356be01"] = true; // makeAlbitratyCalls(bytes,address)

    }


    function setReceiverAddress(address _receiverAddress) public onlyOwner {
        if (_isRecieverContractAddressSet) {
            revert GmFamWithCalls__ReceiverAddressAlreadySet();
        }
        _grantRole(CHAINLINK_ROLE, _receiverAddress);
        recieverContractAddress = _receiverAddress;
        _isRecieverContractAddressSet = true;
    }

    function setOriginalChainReceiverContractAddres(address _OriginalChainReceiverContractAddress) public onlyOwner {
        OriginalChainReceiverContractAddress = _OriginalChainReceiverContractAddress;
    }

    ////-----░Receive function░-----////
    receive() external payable {}

    ////-----░CCIP Reciever function░-----////
    function ccipSetMint(uint256 _tokenId, address _owner,string memory _signature) public onlyCCIP {
        mapTokenIdMint[_tokenId] = metadataTokenMint(_owner, true, _signature);
    }

    ////-----░Public/Client functions░-----////

    /// @notice This function is used to mint the token in the new chain
    function safeMint(uint256 id, string memory _signature) public payable {
        if (!mapTokenIdMint[id].canMintToken) {
            revert GmFamWithCalls__YouMUSTWrapTheTokenFirst();
        }
        if (mapTokenIdMint[id].ownerOfToken != msg.sender) {
            revert GmFamWithCalls__YouAreNotTheOwner();
        }
        if (keccak256(abi.encodePacked(mapTokenIdMint[id].signature)) != keccak256(abi.encodePacked(_signature))) {
            revert GmFamWithCalls__YouAreNotTheOwner();
        }
        _safeMint(msg.sender, id);
        mapTokenIdMint[id] = metadataTokenMint(address(0), false, "");
    }

    function seeIfCanMint(uint256 _tokenId) public view returns (bool) {
        return mapTokenIdMint[_tokenId].canMintToken;
    }    

    /// @notice This function burns the token and send the signal to the original chain
    function goBackToOriginalCollection(uint256 tokenId,string memory _signature) public {
        if (msg.sender != ownerOf(tokenId)) {
            revert GmFamWithCalls__YouAreNotTheOwner();
        }

        string memory dataToSend = string(
            abi.encodePacked(
                "=",
                addressToString(msg.sender),
                ",",
                uintToString(tokenId),
                "|",
                _signature,
                ",",
                addressToString(msg.sender),
                ",",
                "0",
                "="
            )
        );

        // all the logic to send the action on ccip
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(OriginalChainReceiverContractAddress),
            data: abi.encodeWithSignature("ccipSetIdToUnwrap(string)", dataToSend),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 600_000, strict: false})),
            feeToken: i_link
        });

        uint256 fees = IRouterClient(i_router).getFee(destinationChainSelector, message);

        if (fees > LinkTokenInterface(i_link).balanceOf(address(this))) {
            revert GmFamWithCalls__NotEnoughFunds();
        }

        LinkTokenInterface(i_link).approve(i_router, fees);

        /*bytes32 messageId = */IRouterClient(i_router).ccipSend(destinationChainSelector, message);

        _burn(tokenId);
    }

    function makeAlbitratyCalls(bytes memory _functionAndData, address _where, uint256 tokenID)
        public
        returns (bytes memory, bytes memory)
    {
        if (msg.sender != ownerOf(tokenID)) {
            revert();
        }
        if (address(this) == _where) {
            revert GmFamWithCalls__CantCallItself();
        }

        (bytes memory functionHash) = getFuntionHash(_functionAndData);
        if (blackListedFunctions[functionHash]) {
            revert GmFamWithCalls__FunctionBlackListed();
        }
        if (whiteListedFunctions[functionHash].timestampInclusion != 0) {
            if (whiteListedFunctions[functionHash].timestampInclusion + 86400 seconds > block.timestamp) {
                revert GmFamWithCalls__FunctionIsWhiteListedButNotEnoughTime();
            }
            if (whiteListedFunctions[functionHash].allowedAddress != _where) {
                revert GmFamWithCalls__FunctionNotWhiteListed();
            }
        } else {
            revert GmFamWithCalls__FunctionNotWhiteListed();
        }
        (bool success, bytes memory result) = _where.call(_functionAndData);
        require(success, "Function call failed");
        return (result, functionHash);
    }

    ////-----░Admin/DAO only functions░-----////

    function changeCreatorFees(uint96 _feeNumerator) public onlyOwner {
        _setDefaultRoyalty(address(this), _feeNumerator);
    }

    function changeBaseURI(string memory _URIPrefix, bool _URIHasId, string memory _URISuffix) public onlyOwner {
        URIPrefix = _URIPrefix;
        URIHasId = _URIHasId;
        URISuffix = _URISuffix;
    }

    ////░░░░░░Sensible functions░░░░░░////

    function changeOwner(address newOwner) public onlyOwner {
        _grantRole(OWNER_ROLE, newOwner);
        _revokeRole(OWNER_ROLE, msg.sender);
        owner = newOwner;
    }

    function transferEthFunds(address payable to, uint256 amount) public onlyOwner {
        if (address(this).balance < amount) {
            revert GmFamWithCalls__NotEnoughFunds();
        }
        if (!payable(to).send(amount)) {
            revert GmFamWithCalls__TransferFailed();
        }
    }

    function withdrawLinkFunds(address beneficiary) public onlyOwner {
        uint256 amount = IERC20(i_link).balanceOf(address(this));
        bool send = IERC20(i_link).transfer(beneficiary, amount);
        if (!send) revert GmFamWithCalls__TransferFailed();
    }

    function whiteListFunction(
        bytes memory _functionHash, 
        address _allowedAddress
    ) public onlyOwner {
        if (whiteListedFunctions[_functionHash].timestampInclusion != 0) {
            revert GmFamWithCalls__FunctionAlreadyWhiteListed();
        }
        whiteListedFunctions[_functionHash] = WhiteListedFunctionMetadata(
            block.timestamp, 
            _allowedAddress
        );
    }

    function blackListFunction(bytes memory _functionHash) public onlyOwner {
        if (blackListedFunctions[_functionHash]) {
            revert GmFamWithCalls__FunctionAlreadyBlackListed();
        }
        blackListedFunctions[_functionHash] = true;
    }

    ////---------░Internal o utils functions░---------////
    function _baseURI() internal view virtual override returns (string memory) {
        return URIPrefix;
    }

    function getFuntionHash(bytes memory _data) public pure returns (bytes memory) {
        bytes memory result = new bytes(4);

        result[0] = _data[0];
        result[1] = _data[1];
        result[2] = _data[2];
        result[3] = _data[3];

        return result;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721) {
        super._increaseBalance(account, value);
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
        return 1;
    }
    
    function crossChainSolutionVariables() public view returns (bool, address, uint64) {
        return (true, OriginalChainReceiverContractAddress, destinationChainSelector);
    }

    function seeIfFunctionIsWhiteListedAndWhen(
        bytes memory _functionHash
    ) public view returns (uint256, address) {
        return (
            whiteListedFunctions[_functionHash].timestampInclusion,
            whiteListedFunctions[_functionHash].allowedAddress
        );
    }

    function seeIfFunctionIsBlackListed(
        bytes memory _functionHash
    ) public view returns (bool) {
        return blackListedFunctions[_functionHash];
    }

    

    
}
