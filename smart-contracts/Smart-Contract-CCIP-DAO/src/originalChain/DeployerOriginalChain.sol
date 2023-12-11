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
 *  @dev This contract is used to deploy a gm Fam! TreasuryAndWrapper 
 *       and a Receiver contract for the original chain using
 *       chainlink's CCIP
 */

import { TreasuryAndWrapperForDAO } from "./TreasuryAndWrapperForDAO.sol";
import { ReceiverOriginalChain } from "./ReceiverOriginalChain.sol";
import { ReceiverOriginalChainDAO } from "./ReceiverOriginalChainDAO.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeployerOriginalChain is Ownable {
    error DeployerOriginalChainGmFam__NotEnoughEthSentToPayForDeployment();
    error DeployerOriginalChainGmFam__PaymentFailed();
    error WithdrawFailed();
    error CircuitBreaker();

    /// @dev the address of the CCIP router to send and receive
    ///      calls from the other chain
    address routerCCIP;
    /// @notice the address of the LINK token
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
     *  @notice this function deploys a new TreasuryAndWrapper and a new ReceiverOriginalChain
     *         and returns the addresses of both contracts
     *  @param _initialOwner is the address of the owner of the contract
     *  @param _oldContract is the address of the old contract to migrate
     *  @param _costPerMint is the cost per mint in wei (set 0 if you want to mint for free)
     *  @param _maxTokens is the max amount of tokens that can be minted
     *  @param _destinationChainSelector is the selector of the destination chain if you want to
     *                                   select the destination chain check the CCIP documentation
     *                                   https://docs.chain.link/ccip/supported-networks/testnet
     *  @return the address of the TreasuryAndWrapper and the ReceiverOriginalChain
     */
    function deployContract(
        address _initialOwner,
        address _oldContract,
        uint256 _costPerMint,
        uint256 _maxTokens,
        uint64 _destinationChainSelector,
        address _daoAddress
    ) public returns (address, address, address) {
        if (breaker) {
            revert CircuitBreaker();
        }
        TreasuryAndWrapperForDAO treasuryAndWrapper = new TreasuryAndWrapperForDAO(
            routerCCIP,
            linkTokenAddress,
            address(this),
            _oldContract,
            _costPerMint,
            _maxTokens,
            _destinationChainSelector,
            _daoAddress
        );

        ReceiverOriginalChain receiverOriginalChain = new ReceiverOriginalChain(
            _initialOwner,
            routerCCIP,
            payable(address(treasuryAndWrapper))
        );

        ReceiverOriginalChainDAO receiverOriginalChainDAO = new ReceiverOriginalChainDAO(
            _initialOwner,
            routerCCIP,
            payable(address(treasuryAndWrapper))
        );

        treasuryAndWrapper.setReceiverAddress(
            address(receiverOriginalChain),
            address(receiverOriginalChainDAO)
        );
        treasuryAndWrapper.changeOwner(_initialOwner);
        return (
            address(treasuryAndWrapper), 
            address(receiverOriginalChain),
            address(receiverOriginalChainDAO)
        );
    }


    //----------------------------=ADMIN FUNCTIONS=----------------------------//
    function withdraw() public onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function circuitBreaker() public onlyOwner {
        breaker = !breaker;
    }
}
