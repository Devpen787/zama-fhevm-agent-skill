// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint32, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/*
    Validated narrow example:
    - encrypted yes/no vote input
    - encrypted tallies
    - admin-only finalization after deadline
    - actor-specific decrypt rights granted only at finalization
*/

contract ConfidentialVotingExample is ZamaEthereumConfig {
    address public immutable admin;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    bool public finalized;

    euint32 private encryptedYesVotes;
    euint32 private encryptedTotalVotes;

    mapping(address => bool) public eligibleVoters;
    mapping(address => bool) public hasSubmitted;

    error OnlyAdmin();
    error VotingClosed();
    error VotingStillOpen();
    error AlreadySubmitted();
    error NotEligibleVoter();
    error ElectorateLocked();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier duringWindow() {
        if (block.timestamp < startTime || block.timestamp > endTime) revert VotingClosed();
        _;
    }

    modifier afterWindow() {
        if (block.timestamp <= endTime) revert VotingStillOpen();
        _;
    }

    modifier onlyBeforeWindow() {
        if (block.timestamp >= startTime) revert ElectorateLocked();
        _;
    }

    constructor(address admin_, uint256 startTime_, uint256 endTime_, address[] memory initialEligibleVoters) {
        admin = admin_;
        startTime = startTime_;
        endTime = endTime_;

        encryptedYesVotes = FHE.asEuint32(0);
        encryptedTotalVotes = FHE.asEuint32(0);

        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedTotalVotes);

        for (uint256 i = 0; i < initialEligibleVoters.length; i++) {
            eligibleVoters[initialEligibleVoters[i]] = true;
        }
    }

    function submitVote(externalEbool encryptedVote, bytes calldata inputProof) external duringWindow {
        if (!eligibleVoters[msg.sender]) revert NotEligibleVoter();
        if (hasSubmitted[msg.sender]) revert AlreadySubmitted();

        ebool vote = FHE.fromExternal(encryptedVote, inputProof);
        euint32 voteAsCount = FHE.select(vote, FHE.asEuint32(1), FHE.asEuint32(0));

        encryptedYesVotes = FHE.add(encryptedYesVotes, voteAsCount);
        encryptedTotalVotes = FHE.add(encryptedTotalVotes, FHE.asEuint32(1));

        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedTotalVotes);

        hasSubmitted[msg.sender] = true;
    }

    function setEligibleVoter(address voter, bool allowed) external onlyAdmin onlyBeforeWindow {
        eligibleVoters[voter] = allowed;
    }

    function finalizeResult() external onlyAdmin afterWindow {
        FHE.allow(encryptedYesVotes, admin);
        FHE.allow(encryptedTotalVotes, admin);
        finalized = true;
    }

    function getEncryptedYesVotes() external view returns (euint32) {
        return encryptedYesVotes;
    }

    function getEncryptedTotalVotes() external view returns (euint32) {
        return encryptedTotalVotes;
    }

    function canAdminDecryptTallies() external view returns (bool) {
        return finalized;
    }
}
