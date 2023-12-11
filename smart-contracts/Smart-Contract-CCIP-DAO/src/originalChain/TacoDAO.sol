// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


//taco tuesday
contract TacoDAO is Ownable {
    error TacoDAO__NotOwner();
    error TacoDAO__ProposalExpired();
    error TacoDAO__TheVotePeriodHasNotExpired();
    error TacoDAO__TheProposalHasNotPassed();
    error TacoDAO__TheProposalHasAlreadyBeenExecuted();
    error TacoDAO__TheProposalHasNotBeenExecuted();
    error TacoDAO__NotEnoughFunds();
    error TacoDAO__TransferFailed();

    uint256 constant public VOTE_DURATION = 60 seconds;

    address public admin;
    address public nftAddress;

    uint256 public proposalCount;

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
    }

    mapping(uint256 => Proposal) public proposals;
    
    modifier onlyHolder(uint256 _idNft) {
        if (msg.sender != ERC721(nftAddress).ownerOf(_idNft)) {
            revert TacoDAO__NotOwner();
        }
        _;
    }
    
    constructor(
        address _initialOwner,
        address _nftAddress
    ) Ownable(_initialOwner) {
        admin = msg.sender;
        nftAddress = _nftAddress;
    }


    function makeProposal(
        string memory _name,
        string memory _description,
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
                
                isBinary: _isBinary,
                numberOfOptions: 2,
                options: new uint256[](2),
                votes: 0,
                endDate: block.timestamp + VOTE_DURATION,
                executed: false,
                passed: false,
                optionVoted: 0
            });
        } else {
            proposals[proposalCount] = Proposal({
                id: proposalCount,
                nameOfTaco: _name,
                description: _description,
                
                isBinary: _isBinary,
                numberOfOptions: numberOfOptions,
                options: new uint256[](numberOfOptions),
                votes: 0,
                endDate: block.timestamp + VOTE_DURATION,
                executed: false,
                passed: false,
                optionVoted: 0
                
            });
        }
    }

    function vote(
        uint256 _idProposal, 
        uint _option,
        uint256 _idNft
    ) external onlyHolder(_idNft) {

        if (block.timestamp > proposals[_idProposal].endDate) {
            revert TacoDAO__ProposalExpired();
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
            revert TacoDAO__TheVotePeriodHasNotExpired();
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
            revert TacoDAO__TheProposalHasNotPassed();
        }

        if (proposals[_idProposal].executed) {
            revert TacoDAO__TheProposalHasAlreadyBeenExecuted();
        }
        
        proposals[_idProposal].executed = true;
    }


    function transferEthFunds(address payable to, uint256 amount) public onlyOwner {
        if (address(this).balance < amount) {
            revert TacoDAO__NotEnoughFunds();
        }
        if (!payable(to).send(amount)) {
            revert TacoDAO__TransferFailed();
        }
    }

    function seeProposal(uint256 _idProposal) external view returns (Proposal memory) {
        return proposals[_idProposal];
    }
    function seeTokenVoteAddress() external view returns (address) {
        return nftAddress;
    }
    
}
