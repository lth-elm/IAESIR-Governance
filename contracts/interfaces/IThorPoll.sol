// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IThorPoll {
    struct Poll {
        uint256 id; // automatically increment
        address suggester; // address of the one who thought of the suggestion
        string suggestion;
        uint256 votesFor; // getPastVotes
        uint256 votesAgainst; // getPastVotes
        uint256 atSnapshot; // blockNumber
        uint256 startAt; // timestamp
        uint256 finishAt; // timestamp
    }

    /**
     * @dev Emitted when a poll is created
     */
    event PollCreated(
        uint256 indexed id,
        uint256 indexed startAt,
        uint256 indexed finishAt,
        uint256 atSnapshot,
        address suggester,
        string suggestion
    );

    /**
     * @dev Emitted when an address vote for a specific poll
     */
    event Voted(uint256 indexed id, address indexed voter, bool indexed isApproving, uint256 votingPower);

    error LatePollSnapshot(); // Block number for snapshot need to be lower or equal than current timestamp
    error PollEarlyOpen(); // Votes cannot open before the current timestamp
    error PollEndVotesBeforeStart(); // End of votes cannot happen before opening

    error InvalidPollId(); // Id poll doesn't exist
    error PollNotOpenYet(); // Votes period not open yet
    error PollIsOver(); // Votes period is over
    error AlreadyVoted(); // Caller has already voted

    /**
     * @notice Poll creation.
     * @dev Create a poll with both side votes initialized to 0.
     *
     * Requirements:
     *
     * - snapshot block number must be lower then current block number.
     * - opening timestamp `_startAt` must be higher or equal than current timestamp.
     * - closing timestamp `_finishAt` must be higher than opening timestamp `_startAt`.
     *
     * Emits a {PollCreated} event.
     *
     * @param _suggester 'address' of the one who thought of the suggestion.
     * @param _suggestion 'string' of the suggestion.
     * @param blockNumberSnapshot 'uint256' related to the block number to consider for the voting token snapshot.
     * @param _startAt 'uint256' timestamp related to the opening of the poll.
     * @param _finishAt 'uint256' timestamp related to the closing of the poll.
     */
    function createPoll(
        address _suggester,
        string memory _suggestion,
        uint256 blockNumberSnapshot,
        uint256 _startAt,
        uint256 _finishAt
    ) external;

    /**
     * @notice Vote.
     * @dev Vote for a specific poll with THR token voting power.
     *
     * Requirements:
     *
     * - `id` of a poll must exist.
     * - current timestamp must higher or equal than the opening timestamp of the poll.
     * - current timestamp must lower than the closing timestamp of the poll.
     * - caller cannot vote twice.
     *
     * Emits a {Voted} event.
     *
     * @param id 'uint256' id of a poll.
     * @param isApproving 'boolean' of the vote side.
     */
    function vote(uint256 id, bool isApproving) external;

    /**
     * @return all historical `Poll` at once.
     */
    function getPollsHistory() external view returns (Poll[] memory);
}
