// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

/**
                       ______                __
   ____ _____ ___     / ____/___ _____ ___  / /
  / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ / 
 / /_/ / / / / / /  / __/ / /_/ / / / / / /_/  
 \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   
/____/                                         
   ___          _                 
  / _ \___ ____(_)__ _  _____ ____
 / , _/ -_) __/ / -_) |/ / -_) __/
/_/|_|\__/\__/_/\__/|___/\__/_/                                                    
 *  @title Original Chain gm Fam! contract deployer
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract is used to receive the calls from the other chain
 *       by chainlink's CCIP and send it to the TreasuryAndWrapper contract
 */

import { TreasuryAndWrapper } from "./TreasuryAndWrapper.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import { DecodeMsgSig } from "../utils/DecodeMsgSig.sol";

contract ReceiverOriginalChain is CCIPReceiver, DecodeMsgSig, Ownable {
    error SetupAlreadyDone();
    error NotFullySetup();
    error NotSender();

    TreasuryAndWrapper TreasuryAndWrapperContract;

    address GmFamNewChainAddress;
    uint64 sourceChainId;
    bool isFullySetup = false;

    modifier checkIfIsSenderIsGmFam(
        address _sender, 
        uint64 _chainId
    ) {
        if(_sender != GmFamNewChainAddress || _chainId != sourceChainId) {
            revert NotSender();
        }
        _;
    }

    constructor(
        address _initialOwner,
        address _router, 
        address payable _treasuryAddress
    ) CCIPReceiver(_router) Ownable(_initialOwner) {
        TreasuryAndWrapperContract = TreasuryAndWrapper(_treasuryAddress);
    }

    function setupGmFamAddressNewChain(
        address _senderGmFamAddressNewChain,
        uint64 _sourceChainId
    ) external onlyOwner {
        if(isFullySetup) {
            revert SetupAlreadyDone();
        }
        GmFamNewChainAddress = _senderGmFamAddressNewChain;
        sourceChainId = _sourceChainId;
        isFullySetup = true;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) 
        internal 
        checkIfIsSenderIsGmFam(
            abi.decode(message.sender, (address)),
            message.sourceChainSelector
        )
        override 
    {
        (
            string [] memory dataForVariables, 
            uint256 whereIsSignedMetadata
        ) = decodeSignatureMsgToString("=",",",message.data,2);
        
        
        address ownerOfToken = convertStringToAddress(dataForVariables[0]);
        
        (uint256 tokenId,) = convertStringToUint(dataForVariables[1]);

        TreasuryAndWrapperContract.ccipSetIdToUnwrap(
            tokenId, 
            ownerOfToken,
            dataForVariables[whereIsSignedMetadata]
        );
    }


    function isReceiverFullySetup() public view returns(bool, address, uint64) {
        return (isFullySetup, GmFamNewChainAddress, sourceChainId);
    }
}