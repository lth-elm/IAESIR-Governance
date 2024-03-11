// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IThorVotingToken {
    // function MAX_SUPPLY() external view returns (uint256);

    error MaxSupplyReached();

    /**
     * @notice Mint THR token to a wallet.
     * @dev Requirements: new THR tokens added to current supply mustn't exceed max supply.
     * @param to 'address' wallet to mint THR tokens.
     * @param amount 'uint256' amount of THR tokens to mint.
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Airdrop THR token to multiple wallets through mint.
     * @dev Requirements: new THR tokens added to current supply mustn't exceed max supply.
     * @param wallets 'address[]' list of the wallets to airdrop THR tokens.
     * @param amount 'uint256' amount of THR tokens to airdrop per wallet.
     */
    function airdrop(address[] calldata wallets, uint256 amount) external;
}
