const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("DeFAI Token get Votes", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployThorTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    maxSupply = 1500000; // without zeroes
    loop = 100;
    amount = maxSupply / loop;

    wallets = [];
    for (let i = 0; i < loop; i++) {
      // Get a new wallet
      wallet = ethers.Wallet.createRandom();
      // add the provider from Hardhat
      // wallet = wallet.connect(ethers.provider);
      wallets.push(wallet.address);
    }

    const ThorToken = await ethers.getContractFactory("ThorVotingToken");
    const thorToken = await ThorToken.deploy();

    return { thorToken, owner, wallets, amount };
  }

  describe("Airdrop tokens", function () {
    it("Should airdrop tokens", async function () {
      const { thorToken, wallets, amount } = await loadFixture(deployThorTokenFixture);

      await thorToken.airdrop(wallets, amount);

      let i = 0;
      do {
        expect(await thorToken.balanceOf(wallets[i])).to.equal(amount);
        i++;
      } while (i < wallets.length);
    });

    it("Should revert for exceeded supply", async function () {
      const { thorToken, wallets, amount } = await loadFixture(deployThorTokenFixture);

      await thorToken.airdrop(wallets, amount / 2);

      const maxSupply = await thorToken.MAX_SUPPLY();
      const totalSupply = await thorToken.totalSupply();
      const supplyLeft = maxSupply - totalSupply;

      loop = 100;
      amnt = (supplyLeft * 1.5) / loop; // so that max supply will be exceeded

      await expect(thorToken.airdrop(wallets, BigInt(amnt))).to.be.revertedWithCustomError(
        thorToken,
        "MaxSupplyReached"
      );
    });
  });
});
