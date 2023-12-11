// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

/**
                       ______                __
   ____ _____ ___     / ____/___ _____ ___  / /
  / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ / 
 / /_/ / / / / / /  / __/ / /_/ / / / / / /_/  
 \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   
/____/                                         
 *  @title Original Chain gm Fam! contract deployer
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract is used to deploy a gm Fam! contract
 *       and a Receiver contract for the original chain using
 *       chainlink's CCIP
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import { ReceiverNewChain } from "./ReceiverNewChain.sol";
import { GmFamWithCalls } from "./GmFamWithCalls.sol";


contract DeployerNewChain is Ownable {
    error CircuitBreaker();

    address routerCCIP;
    address linkTokenAddress;

    bool public breaker = false;

    constructor(
        address initialOwner, 
        address _routerCCIP, 
        address _linkTokenAddress
    ) Ownable(initialOwner) {
        routerCCIP = _routerCCIP;
        linkTokenAddress = _linkTokenAddress;
    }
    /**
     *  @notice this function deploys a new GmFam and a new ReceiverNewChain
     *  @param _initialOwner: the address of the owner of the contract
     *  @param _nameOfToken: the name of the token
     *  @param _symbolOfToken: the symbol of the token
     *  @param _URIPrefix: the prefix of the URI
     *  @param _URIHasId: if true the URI will have the id of the token, if false
     *  @param _URISuffix: the suffix of the URI
     *  @param _feeNumerator: the fee numerator
     *  @param _destinationChainSelector is the selector of the destination chain if you want to
     *                                   select the destination chain check the CCIP documentation
     *                                   https://docs.chain.link/ccip/supported-networks/testnet
     *  @return address of the GmFam and the ReceiverNewChain
     */
    function deploy(
        address _initialOwner,
        string memory _nameOfToken,
        string memory _symbolOfToken,
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix,
        uint96 _feeNumerator,
        uint64 _destinationChainSelector
    ) external returns (address, address) {
        if (breaker) {
            revert CircuitBreaker();
        }

            GmFamWithCalls gmFamContract = new GmFamWithCalls(
                routerCCIP,
                linkTokenAddress,
                address(this),
                _destinationChainSelector,
                _nameOfToken,
                _symbolOfToken,
                _URIPrefix,
                _URIHasId,
                _URISuffix,
                _feeNumerator
            );
            ReceiverNewChain receiverNewChain = new ReceiverNewChain(
                _initialOwner,
                routerCCIP, 
                payable(address(gmFamContract))
            );
            gmFamContract.setReceiverAddress(address(receiverNewChain));
            gmFamContract.changeOwner(_initialOwner);
            return (address(gmFamContract), address(receiverNewChain));
        
    }

    function changeRouterCCIPAddress(address _router) external onlyOwner {
        routerCCIP = _router;
    }

    function circuitBreaker() public onlyOwner {
        breaker = !breaker;
    }
}
