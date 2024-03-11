// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IThorPoll.sol";
import "./ThorVotingToken.sol";

/**
 * @title Voting Polls Smart Contract
 * @author DeFAI
 * @notice Voting polls smart contract associated with the Thor snapshot voting token.
 * @dev Ownable voting polls smart contract associated with the Thor snaphot voting token,
 * creation of polls by the owner and list all historical polls and votes.
 */
contract ThorPoll is Ownable, IThorPoll {
    ThorVotingToken public immutable VotingToken;

    /**
     * @dev List all historical `Poll`, see {IThorPoll-Poll}, must be called with index parameter to retrieve a specific poll.
     * See `getPollsHistory` to retrieve all polls at once.
     */
    Poll[] public pollsHistory;

    /**
     * @dev Return `true` or `false` depending if an address has voted for a specific poll.
     */
    mapping(address => mapping(uint256 => bool)) public hasVotedForId;

    /**
     * @dev Check ONLY if `hasVotedForId` return true. This one return vote side of an address for a specific poll.
     */
    mapping(address => mapping(uint256 => bool)) public voteForId;

    /**
     * @notice ThorPoll Constructor.
     * @dev Constructor for ThorPoll. Initialize `pollsHistory` with empty poll to increase index.
     * @param _votingToken 'address' .
     */
    constructor(ThorVotingToken _votingToken) {
        VotingToken = _votingToken;
        Poll memory emptyPoll = Poll({
            id: 0,
            suggester: address(0),
            suggestion: "",
            votesFor: 0,
            votesAgainst: 0,
            atSnapshot: 0,
            startAt: 0,
            finishAt: 0
        });
        pollsHistory.push(emptyPoll);
    }

    /**
     * @dev See {IThorPoll-createPoll}.
     */
    function createPoll(
        address _suggester,
        string memory _suggestion,
        uint256 blockNumberSnapshot,
        uint256 _startAt,
        uint256 _finishAt
    ) external onlyOwner {
        if (blockNumberSnapshot > block.number) revert LatePollSnapshot();
        if (block.timestamp > _startAt) revert PollEarlyOpen();
        if (_startAt >= _finishAt) revert PollEndVotesBeforeStart();

        Poll[] storage cached_pollsHistory = pollsHistory;
        uint256 index = cached_pollsHistory.length; // initialized with empty poll at index 0

        Poll memory newPoll = Poll({
            id: index,
            suggester: _suggester,
            suggestion: _suggestion,
            votesFor: 0,
            votesAgainst: 0,
            atSnapshot: blockNumberSnapshot,
            startAt: _startAt,
            finishAt: _finishAt
        });

        cached_pollsHistory.push(newPoll);
        emit PollCreated(index, _startAt, _finishAt, blockNumberSnapshot, _suggester, _suggestion);
    }

    /**
     * @dev See {IThorPoll-vote}.
     */
    function vote(uint256 id, bool isApproving) external {
        if (id == 0 || id >= pollsHistory.length) revert InvalidPollId();

        Poll storage poll = pollsHistory[id];

        if (poll.startAt > block.timestamp) revert PollNotOpenYet();
        if (poll.finishAt < block.timestamp) revert PollIsOver();
        if (hasVotedForId[msg.sender][id]) revert AlreadyVoted();

        hasVotedForId[msg.sender][id] = true;

        uint256 votingPower = VotingToken.getPastVotes(msg.sender, poll.atSnapshot);

        if (isApproving) {
            poll.votesFor += votingPower;
            voteForId[msg.sender][id] = isApproving;
        } else {
            poll.votesAgainst += votingPower;
        }

        emit Voted(id, msg.sender, isApproving, votingPower);
    }

    /**
     * @dev See {IThorPoll-getPollsHistory}.
     */
    function getPollsHistory() external view returns (Poll[] memory) {
        return pollsHistory;
    }
}
