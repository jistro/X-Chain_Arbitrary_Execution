// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

/**
                       ______                __    .
   ____ _____ ___     / ____/___ _____ ___  / /   / \
  / __ `/ __ `__ \   / /_  / __ `/ __ `__ \/ /   /  /
 / /_/ / / / / / /  / __/ / /_/ / / / / / /_/   /  / /\
 \__, /_/ /_/ /_/  /_/    \__,_/_/ /_/ /_(_)   /_ / /__\
/____/                                        
 *  @title Original Chain gm Fam! contract deployer
 *  @author jistro.eth && Ariutokintumi.eth
 *  @dev This contract is used to deploy a gm Fam! contract
 *       and a Receiver contract for the original chain using
 *       chainlink's CCIP
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import { ReceiverNewSubnet } from "./ReceiverNewSubnet.sol";
import { GmFam } from "./GmFam.sol";
//import { GmFamWithCalls } from "./GmFamWithCalls.sol";


contract DeployerNewSubnet is Ownable {
    error CircuitBreaker();

    bool public breaker = false;

    constructor(
        address initialOwner
    ) {
        transferOwnership(initialOwner);
    }
    /**
     *  @notice this function deploys a new GmFam and a new ReceiverNewSubnet
     *  @param _initialOwner the address of the initial owner of the GmFam contract
     *  @param _nameOfToken the name of the token
     *  @param _symbolOfToken the symbol of the token
     *  @param _URIPrefix the prefix of the URI
     *  @param _URIHasId if true, the URI will have the token id at the end
     *  @param _URISuffix the suffix of the URI
     *  @param _feeNumerator the fee numerator
     *  @param _destinationBlockchainID the destination blockchain ID
     *  @return the address of the GmFam contract and the address of the ReceiverNewSubnet contract
     */
    function deploy(
        address _initialOwner,
        string memory _nameOfToken,
        string memory _symbolOfToken,
        string memory _URIPrefix,
        bool _URIHasId,
        string memory _URISuffix,
        uint96 _feeNumerator,
        bytes32 _destinationBlockchainID
    ) external returns (address, address) {
        if (breaker) {
            revert CircuitBreaker();
        }
            GmFam gmFamContract = new GmFam(
                address(this),
                _destinationBlockchainID,
                _nameOfToken,
                _symbolOfToken,
                _URIPrefix,
                _URIHasId,
                _URISuffix,
                _feeNumerator
            );
            ReceiverNewSubnet receiverNewSubnet = new ReceiverNewSubnet(
                _initialOwner,
                payable(address(gmFamContract))
            );
            gmFamContract.setReceiverAddress(address(receiverNewSubnet));
            gmFamContract.changeOwner(_initialOwner);
            return (address(gmFamContract), address(receiverNewSubnet));
        
    }


    function circuitBreaker() public onlyOwner {
        breaker = !breaker;
    }
}
