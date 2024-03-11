// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./interfaces/IThorVotingToken.sol";

/**
 * @title THOR Voting Token
 * @author DeFAI
 * @notice Token with Voting Snapshots.
 * @dev ERC20 ownable token with Voting Snapshots using the Openzeppelin library
 * and automatically delegate tokens to oneself only if not done.
 */
contract ThorVotingToken is ERC20, Ownable, ERC20Permit, ERC20Votes, IThorVotingToken {
    uint256 public constant MAX_SUPPLY = 1_500_000 ether;

    constructor() ERC20("Thor", "THR") ERC20Permit("Thor") {}

    /**
     * @dev See {IThorVotingToken-mint}.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyReached();
        _mint(to, amount);
    }

    /**
     * @dev See {IThorVotingToken-airdrop}.
     */
    function airdrop(address[] calldata wallets, uint256 amount) external onlyOwner {
        uint256 i = 0;
        uint256 walletsLength = wallets.length;

        if (totalSupply() + (amount * walletsLength) > MAX_SUPPLY) {
            revert MaxSupplyReached();
        }

        do {
            _mint(wallets[i], amount);
            unchecked {
                ++i;
            }
        } while (i < walletsLength);
    }

    // ********** The following functions are overrides required by Solidity. **********

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        // Discution at:
        // https://forum.openzeppelin.com/t/self-delegation-in-erc20votes/17501/14
        //
        // Need to be customized so that it's also called when a transfer is made
        // if receiver `to` didn't delegate to himself beforehand.
        //
        // if(from == address(0) && to != address(0) && delegates(to) == address(0)) {
        //     _delegate(to, to);
        // }
        //
        // May be possible if overrides `_delegate` and keep track with a mapping
        // of whom already called delegate or not.
        //
        // Alternatively just check `delegates(to) == address(0)`.
        //
        if (delegates(to) == address(0)) {
            _delegate(to, to);
        }
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
