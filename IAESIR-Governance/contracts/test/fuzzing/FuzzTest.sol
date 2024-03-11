// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "../../ThorVotingToken.sol";
import "../../ThorPoll.sol";

contract TokenFuzzTest is ThorVotingToken {
    constructor() ThorVotingToken() {
        _mint(address(0x000091), 10 ether);
    }

    function echidna_test_owner() public view returns (bool) {
        return owner() == address(0x90001);
    }

    function echidna_test_constant_supply() public pure returns (bool) {
        return MAX_SUPPLY == 1_500_000 ether;
    }

    function echidna_test_balance() public view returns (bool) {
        return balanceOf(address(0x00091)) == 10 ether;
    }

    function echidna_test_votes_power() public view returns (bool) {
        return getVotes(address(0x00091)) == 10 ether;
    }
}
