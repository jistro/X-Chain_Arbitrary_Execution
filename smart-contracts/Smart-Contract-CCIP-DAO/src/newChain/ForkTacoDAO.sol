// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { LinkTokenInterface } from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import { StringConverter } from "../utils/StringConverter.sol";

//taco tuesday
contract ForkTacoDAO is Ownable, StringConverter {
    error ForkTacoDao__NotOwner();
    error ForkTacoDao__ProposalExpired();
    error ForkTacoDao__TheVotePeriodHasNotExpired();
    error ForkTacoDao__TheProposalHasNotPassed();
    error ForkTacoDao__TheProposalHasAlreadyBeenExecuted();
    error ForkTacoDao__TheProposalHasNotBeenExecuted();
    error ForkTacoDao__NotEnoughFunds();
    error ForkTacoDao__TransferFailed();

    uint256 constant public VOTE_DURATION = 60 seconds;

    address public admin;
    address public nftAddress;

    uint256 public proposalCount;

    address immutable i_router;
    address immutable i_link;
    /// @notice destinationChainSelector set the destination chain
    uint64 immutable destinationChainSelector;

    address public OriginalChain_ReceiverContractAddress;

    struct Proposal {
        uint256 id;
        string nameOfTaco;
        string description;
        
        bool isBinary;
        uint256 numberOfOptions;
        uint256 [] options;
        uint256 votes;
        uint256 endDate;
        bool executed;
        bool passed;
        uint256 optionVoted;
        
        bool isInTheOriginalChain;
        uint256 orignalChainProposalId;

    }

    mapping(uint256 => Proposal) public proposals;
    
    modifier onlyHolder(uint256 _idNft) {
        if (msg.sender != ERC721(nftAddress).ownerOf(_idNft)) {
            revert ForkTacoDao__NotOwner();
        }
        _;
    }
    
    constructor(
        address _initialOwner,
        address _nftAddress,
        address _i_router,
        address _i_link,
        uint64 _destinationChainSelector
    ) Ownable(_initialOwner) {
        admin = msg.sender;
        nftAddress = _nftAddress;
        i_router = _i_router;
        i_link = _i_link;
        destinationChainSelector = _destinationChainSelector;
    }

    

    function makeProposal(
        string memory _name,
        string memory _description,
        bool _isInTheOriginalChain,
        uint256 _idProposalInTheOriginalChain,
        bool _isBinary,
        uint256 numberOfOptions,
        uint256 _idNft
    ) external onlyHolder(_idNft) {

        proposalCount++;

        if (_isBinary) {
            proposals[proposalCount] = Proposal({
                id: proposalCount,
                nameOfTaco: _name,
                description: _description,
                orignalChainProposalId: _idProposalInTheOriginalChain,
                isBinary: _isBinary,
                numberOfOptions: 2,
                options: new uint256[](2),
                votes: 0,
                endDate: block.timestamp + VOTE_DURATION,
                executed: false,
                passed: false,
                optionVoted: 0,
                isInTheOriginalChain: _isInTheOriginalChain
               
            });
        } else {
            proposals[proposalCount] = Proposal({
                id: proposalCount,
                nameOfTaco: _name,
                description: _description,
                orignalChainProposalId: _idProposalInTheOriginalChain,
                isBinary: _isBinary,
                numberOfOptions: numberOfOptions,
                options: new uint256[](numberOfOptions),
                votes: 0,
                endDate: block.timestamp + VOTE_DURATION,
                executed: false,
                passed: false,
                optionVoted: 0,
                isInTheOriginalChain: _isInTheOriginalChain
                
            });
        }
    }

    function vote(
        uint256 _idProposal, 
        uint _option,
        uint256 _idNft
    ) external onlyHolder(_idNft) {

        if (block.timestamp > proposals[_idProposal].endDate) {
            revert ForkTacoDao__ProposalExpired();
        // all the logic to send the action on ccip
        }

        if (proposals[_idProposal].isBinary) {
            if (_option == 0) {
                proposals[_idProposal].options[0] += 1;
            } else {
                proposals[_idProposal].options[1] += 1;
            }
        } else {
            if (_option <= proposals[_idProposal].numberOfOptions) {
                proposals[_idProposal].options[_option-1] += 1;
            } else {
                revert();
            }
        }

        proposals[_idProposal].votes += 1;

    }

    function closeVoteForProposal(uint256 _idProposal) external {
        if (block.timestamp < proposals[_idProposal].endDate) {
            revert ForkTacoDao__TheVotePeriodHasNotExpired();
        }

        uint256 max = 0;

        if (proposals[_idProposal].isBinary) {
            if (proposals[_idProposal].options[0] > proposals[_idProposal].options[1]) {
                max = 0;
            } else {
                max = 1;
            }
        } else {
            for (uint256 i = 0; i < proposals[_idProposal].numberOfOptions; i++) {
                if (proposals[_idProposal].options[i] > max) {
                    max = i;
                }
            }
        }

        proposals[_idProposal].optionVoted = max;

        proposals[_idProposal].passed = true;
    }

    function executeProposal(uint256 _idProposal) external {
        if (!proposals[_idProposal].passed) {
            revert ForkTacoDao__TheProposalHasNotPassed();
        }

        if (proposals[_idProposal].executed) {
            revert ForkTacoDao__TheProposalHasAlreadyBeenExecuted();
        }

        if (proposals[_idProposal].isInTheOriginalChain) {
            string memory dataToSend = string(
                abi.encodePacked(
                    "=",
                    uintToString(proposals[_idProposal].optionVoted),
                    ",",
                    uintToString(proposals[_idProposal].orignalChainProposalId),
                    "|",
                    "0xSignature",
                    ",",
                    addressToString(address(this)),
                    ",",
                    "0",
                    "="
                )
            );
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(OriginalChain_ReceiverContractAddress),
                data: abi.encodeWithSignature("ccipSetIdToUnwrap(string)", dataToSend),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 500_000, strict: false})),
                feeToken: i_link
            });

            uint256 fees = IRouterClient(i_router).getFee(destinationChainSelector, message);

            if (fees > LinkTokenInterface(i_link).balanceOf(address(this))) {
                revert ForkTacoDao__NotEnoughFunds();
            }

            LinkTokenInterface(i_link).approve(i_router, fees);

            /*bytes32 messageId = */IRouterClient(i_router).ccipSend(destinationChainSelector, message);
        } 
        
        proposals[_idProposal].executed = true;
    }


    function transferEthFunds(address payable to, uint256 amount) public onlyOwner {
        if (address(this).balance < amount) {
            revert ForkTacoDao__NotEnoughFunds();
        }
        if (!payable(to).send(amount)) {
            revert ForkTacoDao__TransferFailed();
        }
    }

    function withdrawLinkFunds(address beneficiary) public onlyOwner {
        uint256 amount = IERC20(i_link).balanceOf(address(this));
        bool send = IERC20(i_link).transfer(beneficiary, amount);
        if (!send) revert ForkTacoDao__TransferFailed();
    }

    function seeProposal(uint256 _idProposal) public view returns (Proposal memory) {
        return proposals[_idProposal];
    }
    
    function crossChainSolution() public pure returns (uint8) {
        return 1;
    }

    function crossChainSolutionVariables() public view returns (bool, address, uint64) {
        return (true, OriginalChain_ReceiverContractAddress, destinationChainSelector);
    }

    function setOriginalChain_ReceiverContractAddress(address _originalChain_ReceiverContractAddress) external onlyOwner {
        OriginalChain_ReceiverContractAddress = _originalChain_ReceiverContractAddress;
    }

    function seeTokenVoteAddress() external view returns (address) {
        return nftAddress;
    }

    
}
