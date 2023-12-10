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
 *  @dev This contract is used to deploy a gm Fam! TreasuryAndWrapper 
 *       and a Receiver contract for the original chain using
 *       chainlink's CCIP
 */

import { TreasuryAndWrapper } from "./TreasuryAndWrapper.sol";
import { ReceiverOriginalSubnet } from "./ReceiverOriginalSubnet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeployerOriginalSubnet is Ownable {
    error DeployerOriginalChainGmFam__NotEnoughEthSentToPayForDeployment();
    error DeployerOriginalChainGmFam__PaymentFailed();
    error WithdrawFailed();
    error CircuitBreaker();

    bool public breaker = false;
    
    constructor(
        address _initialOwner
    ) {
        transferOwnership(_initialOwner);
    }

    /**
     *  @notice this function deploys a new TreasuryAndWrapper and a new ReceiverOriginalChain
     *         and returns the addresses of both contracts
     *  @param _initialOwner is the address of the owner of the contract
     *  @param _oldContract is the address of the old contract to migrate
     *  @param _costPerMint is the cost per mint in wei (set 0 if you want to mint for free)
     *  @param _maxTokens is the max amount of tokens that can be minted
     *  @param _destinationBlockchainID is the id of the destination blockchain
     *  @return the address of the TreasuryAndWrapper and the ReceiverOriginalChain
     */
    function deployContract(
        address _initialOwner,
        address _oldContract,
        uint256 _costPerMint,
        uint256 _maxTokens,
        bytes32 _destinationBlockchainID
    ) public payable returns (address, address) {
        if (breaker) {
            revert CircuitBreaker();
        }
        if (msg.value < 0.02 ether) {
            revert DeployerOriginalChainGmFam__NotEnoughEthSentToPayForDeployment();
        }
        if (payable(address(this)).send(msg.value)) {
            revert DeployerOriginalChainGmFam__PaymentFailed();
        }
        TreasuryAndWrapper treasuryAndWrapper = new TreasuryAndWrapper(
            address(this),
            _oldContract,
            _costPerMint,
            _maxTokens,
            _destinationBlockchainID
        );

        ReceiverOriginalSubnet receiverOriginalSubnet = new ReceiverOriginalSubnet(
            _initialOwner,
            payable(address(treasuryAndWrapper))
        );

        treasuryAndWrapper.setReceiverAddress(address(receiverOriginalSubnet));
        treasuryAndWrapper.changeOwner(_initialOwner);
        return (address(treasuryAndWrapper), address(receiverOriginalSubnet));
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
