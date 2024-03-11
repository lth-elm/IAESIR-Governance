const { mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("DeFAI Token get Votes", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployThorTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account2] = await ethers.getSigners();

    const ThorToken = await ethers.getContractFactory("ThorVotingToken");
    const thorToken = await ThorToken.deploy();
    // block 1 mined

    return { thorToken, owner, account2 };
  }

  describe("Mint tokens", function () {
    it("Should mint correct amount", async function () {
      const { thorToken, owner } = await loadFixture(deployThorTokenFixture);

      await thorToken.mint(owner.address, ethers.utils.parseEther("1330000"));
      expect(await thorToken.totalSupply()).to.equal(ethers.BigNumber.from("1330000000000000000000000"));
    });

    it("Should revert for exceeded supply", async function () {
      const { thorToken, owner, account2 } = await loadFixture(deployThorTokenFixture);

      await thorToken.mint(owner.address, ethers.utils.parseEther("1330000"));
      await thorToken.mint(account2.address, ethers.utils.parseEther("170000"));

      await expect(thorToken.mint(owner.address, 1)).to.be.revertedWithCustomError(thorToken, "MaxSupplyReached");
    });
  });

  describe("Get Votes", function () {
    it("Should return self delegated value", async function () {
      const { thorToken, owner } = await loadFixture(deployThorTokenFixture);

      // block 2 mined
      await mine();

      let currentBlockNumber = await ethers.provider.getBlockNumber(); // 2
      console.log(`current block number: ${currentBlockNumber}`);

      expect(await thorToken.balanceOf(owner.address)).to.equal(0);
      expect(await thorToken.getVotes(owner.address)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);

      // block 3 mined
      await thorToken.mint(owner.address, 100); // should call `_delegate` once in `_afterTokenTransfer`
      currentBlockNumber = await ethers.provider.getBlockNumber(); // 3
      console.log(`current block number: ${currentBlockNumber}`);

      expect(await thorToken.balanceOf(owner.address)).to.equal(100);

      expect(await thorToken.getVotes(owner.address)).to.equal(100);
      expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 1)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3

      // block 4 mined
      await mine();
      currentBlockNumber = await ethers.provider.getBlockNumber(); // 4
      console.log(`current block number: ${currentBlockNumber}`);
      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(100);
    });

    it("Should return correct votes after transfer", async function () {
      const { thorToken, owner, account2 } = await loadFixture(deployThorTokenFixture);

      // block 2 mined
      await thorToken.mint(owner.address, 100); // should call `_delegate` once in `_afterTokenTransfer`
      // block 3 mined
      await thorToken.transfer(account2.address, 40); // should call `_delegate` for receiver once in `_afterTokenTransfer`
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 4

      expect(await thorToken.getVotes(owner.address)).to.equal(60);
      expect(await thorToken.getPastVotes(owner.address, 1)).to.equal(0); // mint occurred in block 2 but getPastVotes needs us to be at block 3 to read block 2
      expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(100);

      // block 4 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 4
      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(60);
      expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(40);

      // block 5 mined
      await thorToken.transfer(account2.address, 20);
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 5
      expect(await thorToken.getVotes(owner.address)).to.equal(40); // take effect immediately
      expect(await thorToken.getVotes(account2.address)).to.equal(60); // delegate already called
      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(60);
      expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(40);
      expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(60); // will count the minus 20 at next block
      expect(await thorToken.getPastVotes(account2.address, 4)).to.equal(40); // will count the new 20 at next block
      // block 6 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 6
      expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(60);
      expect(await thorToken.getPastVotes(account2.address, 4)).to.equal(40);
      expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(40);
      expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(60);
    });

    it("Should delegate to someone else", async function () {
      const { thorToken, owner, account2 } = await loadFixture(deployThorTokenFixture);

      // block 2 mined
      await mine();
      // block 3 mined
      await thorToken.mint(owner.address, 300);
      // block 4 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 4

      expect(await thorToken.getVotes(owner.address)).to.equal(300);
      expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(300);

      // block 5 mined
      await thorToken.delegate(account2.address); // delegate to someone else (all)
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 5

      expect(await thorToken.getVotes(owner.address)).to.equal(0); // take effect immediately, lose all voting power after delegation
      expect(await thorToken.getVotes(account2.address)).to.equal(300); // take effect immediately, gain all voting power after receiving delegation

      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(300); // old delegation to self still valid
      expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(0); // don't collect old vote power not attributed

      expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(300); // transfer delegation occurred in block 5 but getPastVotes needs us to be at block 6 to read block 5
      expect(await thorToken.getPastVotes(account2.address, 4)).to.equal(0); // transfer delegation occurred in block 5 but getPastVotes needs us to be at block 6 to read block 5
      // block 6 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 6
      expect(await thorToken.balanceOf(owner.address)).to.equal(300);
      expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(0); // lose all voting power after delegation
      expect(await thorToken.balanceOf(account2.address)).to.equal(0);
      expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(300); // gain all voting power after receiving delegation

      // block 7 mined
      await thorToken.mint(owner.address, 45);
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 7

      expect(await thorToken.balanceOf(owner.address)).to.equal(345);
      expect(await thorToken.getVotes(owner.address)).to.equal(0); // continue to delegate voting power to `account2`
      expect(await thorToken.balanceOf(account2.address)).to.equal(0);
      expect(await thorToken.getVotes(account2.address)).to.equal(345); // continue to receive voting power delegated by `owner`

      // block 8 mined
      await thorToken.mint(account2.address, 5);
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 8
      expect(await thorToken.balanceOf(account2.address)).to.equal(5);
      expect(await thorToken.getVotes(account2.address)).to.equal(350); // 345 delegated + 5 own
    });

    it("Should delegate to someone else from the start", async function () {
      const { thorToken, owner, account2 } = await loadFixture(deployThorTokenFixture);

      // block 2 mined
      await thorToken.delegate(account2.address);
      // block 3 mined
      await thorToken.mint(owner.address, 300);
      // block 4 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 4

      // OWNER: balance = 300 but voting power = 0
      expect(await thorToken.balanceOf(owner.address)).to.equal(300);
      expect(await thorToken.getVotes(owner.address)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0);

      // ACCOUNT2: balance = 0 but voting power = 300
      expect(await thorToken.balanceOf(account2.address)).to.equal(0);
      expect(await thorToken.getVotes(account2.address)).to.equal(300);
      expect(await thorToken.getPastVotes(account2.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
      expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(300);

      // block 5 mined
      await thorToken.mint(account2.address, 5);
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 5
      expect(await thorToken.balanceOf(account2.address)).to.equal(5);
      expect(await thorToken.getVotes(account2.address)).to.equal(305); // 300 delegated + 5 own
    });

    it("Should recover voting power after delegating it", async function () {
      const { thorToken, owner, account2 } = await loadFixture(deployThorTokenFixture);

      // block 2 mined
      await thorToken.delegate(account2.address);
      // block 3 mined
      await thorToken.mint(owner.address, 300);
      // block 4 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 4

      // OWNER: balance = 300 but voting power = 0
      expect(await thorToken.balanceOf(owner.address)).to.equal(300);
      expect(await thorToken.getVotes(owner.address)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0);

      // ACCOUNT2: balance = 0 but voting power = 300
      expect(await thorToken.balanceOf(account2.address)).to.equal(0);
      expect(await thorToken.getVotes(account2.address)).to.equal(300);
      expect(await thorToken.getPastVotes(account2.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
      expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(300);

      // block 5 mined
      await thorToken.mint(account2.address, 5);
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 5
      expect(await thorToken.balanceOf(account2.address)).to.equal(5);
      expect(await thorToken.getVotes(account2.address)).to.equal(305); // 300 delegated + 5 own

      // block 6 mined
      await thorToken.delegate(owner.address);
      // block 7 mined
      await mine();
      console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // 7

      // OWNER: regain voting power
      expect(await thorToken.balanceOf(owner.address)).to.equal(300);
      expect(await thorToken.getVotes(owner.address)).to.equal(300);
      expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(0);
      expect(await thorToken.getPastVotes(owner.address, 6)).to.equal(300);

      // ACCOUNT2: lose delegated voting power
      expect(await thorToken.balanceOf(account2.address)).to.equal(5);
      expect(await thorToken.getVotes(account2.address)).to.equal(5);
      expect(await thorToken.getPastVotes(account2.address, 4)).to.equal(300);
      expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(305);
      expect(await thorToken.getPastVotes(account2.address, 6)).to.equal(5);
    });
  });
});
