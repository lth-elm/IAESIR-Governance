const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Polls and Votes", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployThorTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2] = await ethers.getSigners();

    const ThorToken = await ethers.getContractFactory("ThorVotingToken");
    const thorToken = await ThorToken.deploy();
    // block 1 mined

    const ThorPoll = await ethers.getContractFactory("ThorPoll");
    const thorPoll = await ThorPoll.deploy(thorToken.address);
    // block 2 mined

    return { thorToken, thorPoll, owner, user1, user2 };
  }

  describe("Polls", function () {
    it("Should revert with specific errors when creating Poll", async function () {
      const { thorPoll, user1 } = await loadFixture(deployThorTokenFixture);

      // blocks 1 and 2 already mined in deployment
      // block 102 mined + 99 others
      await mine(100);

      // let currentBlockNumber = await ethers.provider.getBlockNumber(); // 102
      // console.log(`current block number: ${currentBlockNumber}`);

      let currentTime = await time.latest();

      let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");

      await expect(
        thorPoll.createPoll(
          user1.address,
          suggestion1,
          999, // revert because '999 <= current block + 103' is false
          currentTime + 3600,
          currentTime + 3600 * 24
        )
      ).to.be.revertedWithCustomError(thorPoll, "LatePollSnapshot");

      await expect(
        thorPoll.connect(user1).createPoll(user1.address, suggestion1, 99, currentTime + 3600, currentTime + 3600 * 24)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        thorPoll.createPoll(
          user1.address,
          suggestion1,
          99,
          currentTime - 3600, // revert because 'currentTime-3600' < currentTime
          currentTime + 3600 * 24
        )
      ).to.be.revertedWithCustomError(thorPoll, "PollEarlyOpen");

      await expect(
        thorPoll.createPoll(
          user1.address,
          suggestion1,
          99,
          currentTime + 3600 * 24,
          currentTime + 3600 // revert because  'currentTime+3600*24' >= 'currentTime+3600'
        )
      ).to.be.revertedWithCustomError(thorPoll, "PollEndVotesBeforeStart");
    });

    it("Should create multiple Polls", async function () {
      const { thorPoll, user1, user2 } = await loadFixture(deployThorTokenFixture);

      // blocks 1 and 2 already mined in deployment
      // block 102 mined + 99 others
      await mine(100);

      // let currentBlockNumber = await ethers.provider.getBlockNumber(); // 102
      // console.log(`current block number: ${currentBlockNumber}`);

      let currentTime = await time.latest();

      let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");
      let suggestion2 = ethers.utils.formatBytes32String("Suggestion 2");
      let suggestion3 = ethers.utils.formatBytes32String("Suggestion 3");

      await thorPoll.createPoll(user1.address, suggestion1, 99, currentTime + 3600, currentTime + 3600 * 24);

      await thorPoll.createPoll(user2.address, suggestion2, 50, currentTime + 3600 * 24, currentTime + 3600 * 24 * 7);

      await thorPoll.createPoll(user2.address, suggestion3, 105, currentTime + 3600, currentTime + 3600 * 24);
    });

    it("Should create Polls and retrieve valid data", async function () {
      const { thorPoll, user1, user2 } = await loadFixture(deployThorTokenFixture);

      // blocks 1 and 2 already mined in deployment
      // block 102 mined + 99 others
      await mine(100);

      // let currentBlockNumber = await ethers.provider.getBlockNumber(); // 102
      // console.log(`current block number: ${currentBlockNumber}`);

      let currentTime = await time.latest();

      let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");
      let suggestion2 = ethers.utils.formatBytes32String("Suggestion 2");

      await thorPoll.createPoll(user1.address, suggestion1, 99, currentTime + 3600, currentTime + 3600 * 24);

      await thorPoll.createPoll(user2.address, suggestion2, 50, currentTime + 3600 * 24, currentTime + 3600 * 24 * 7);

      await thorPoll.pollsHistory(0).then((r) => {
        expect(r.id).to.equal(0);
        expect(r.suggester).to.equal(ethers.constants.AddressZero);
        expect(r.suggestion).to.equal("");
        expect(r.votesFor).to.equal(0);
        expect(r.votesAgainst).to.equal(0);
        expect(r.atSnapshot).to.equal(0);
        expect(r.startAt).to.equal(0);
        expect(r.finishAt).to.equal(0);
      });

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.id).to.equal(1);
        expect(r.suggester).to.equal(user1.address);
      });

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.id).to.equal(2);
        expect(r.suggester).to.equal(user2.address);
        expect(r.suggestion).to.equal(suggestion2);
        expect(r.votesFor).to.equal(0);
        expect(r.votesAgainst).to.equal(0);
        expect(r.atSnapshot).to.equal(50);
        expect(r.startAt).to.equal(currentTime + 3600 * 24);
        expect(r.finishAt).to.equal(currentTime + 3600 * 24 * 7);
      });
    });
  });

  describe("Votes", function () {
    it("Should revert...", async function () {
      const { thorPoll, user1, user2 } = await loadFixture(deployThorTokenFixture);

      // blocks 1 and 2 already mined in deployment
      // block 102 mined + 99 others
      await mine(100);

      // let currentBlockNumber = await ethers.provider.getBlockNumber(); // 102
      // console.log(`current block number: ${currentBlockNumber}`);

      let currentTime = await time.latest();

      let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");

      await thorPoll.createPoll(user1.address, suggestion1, 99, currentTime + 3600, currentTime + 3600 * 24);

      await expect(thorPoll.connect(user2).vote(0, true)).to.be.revertedWithCustomError(thorPoll, "InvalidPollId");

      await expect(thorPoll.connect(user2).vote(2, true)).to.be.revertedWithCustomError(thorPoll, "InvalidPollId");

      await expect(thorPoll.connect(user2).vote(1, true)).to.be.revertedWithCustomError(thorPoll, "PollNotOpenYet");

      await time.increase(3601);

      await thorPoll.connect(user2).vote(1, true);

      await expect(thorPoll.connect(user2).vote(1, true)).to.be.revertedWithCustomError(thorPoll, "AlreadyVoted");

      await time.increase(1 + 3600 * 23);

      await expect(thorPoll.connect(user1).vote(1, true)).to.be.revertedWithCustomError(thorPoll, "PollIsOver");
    });

    it("Should vote and retrieve votes", async function () {
      const { thorToken, thorPoll, owner, user1, user2 } = await loadFixture(deployThorTokenFixture);

      await thorToken.mint(owner.address, 100);
      await thorToken.mint(user2.address, 7);

      await mine(60);

      await thorToken.transfer(user1.address, 40);

      await mine(60);

      let currentTime = await time.latest();

      let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");
      let suggestion2 = ethers.utils.formatBytes32String("Suggestion 2");

      await thorPoll.createPoll(user1.address, suggestion1, 99, currentTime + 3600, currentTime + 3600 * 24 * 7);

      await thorPoll.createPoll(user2.address, suggestion2, 50, currentTime + 3600 * 24, currentTime + 3600 * 24 * 5);

      await time.increase(1 + 3600 * 24);

      // VOTE FOR PROPOSITION 1

      await thorPoll.vote(1, false);

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.votesFor).to.equal(0);
        expect(r.votesAgainst).to.equal(60);
      });

      await thorPoll.connect(user1).vote(1, true);

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.votesFor).to.equal(40);
        expect(r.votesAgainst).to.equal(60);
      });

      await thorPoll.connect(user2).vote(1, true);

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.votesFor).to.equal(47);
        expect(r.votesAgainst).to.equal(60);
      });

      // VOTE FOR PROPOSITION 2

      await thorPoll.vote(2, false);

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.votesFor).to.equal(0);
        expect(r.votesAgainst).to.equal(100); // since snapshot at block 50 and transfer occured at block 60+
      });

      await thorPoll.connect(user1).vote(2, true);

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.votesFor).to.equal(0); // since snapshot at block 50 and transfer occured at block 60+
        expect(r.votesAgainst).to.equal(100);
      });

      await thorPoll.connect(user2).vote(2, true);

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.votesFor).to.equal(7);
        expect(r.votesAgainst).to.equal(100);
      });
    });

    it("Should vote through delegation and retrieve votes", async function () {
      const { thorToken, thorPoll, owner, user1, user2 } = await loadFixture(deployThorTokenFixture);

      await thorToken.mint(owner.address, 100);
      await thorToken.mint(user2.address, 7);

      await mine(60);

      await thorToken.delegate(user1.address);

      await mine(60);

      let currentTime = await time.latest();

      let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");
      let suggestion2 = ethers.utils.formatBytes32String("Suggestion 2");

      await thorPoll.createPoll(user1.address, suggestion1, 99, currentTime + 3600, currentTime + 3600 * 24 * 7);

      await thorPoll.createPoll(user2.address, suggestion2, 50, currentTime + 3600 * 24, currentTime + 3600 * 24 * 5);

      await time.increase(1 + 3600 * 24);

      // VOTE FOR PROPOSITION 1

      await thorPoll.vote(1, false);

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.votesFor).to.equal(0);
        expect(r.votesAgainst).to.equal(0); // since snapshot at block 99 and delegation occured at block 60+, 99-
      });

      await thorPoll.connect(user1).vote(1, true);

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.votesFor).to.equal(100);
        expect(r.votesAgainst).to.equal(0);
      });

      await thorPoll.connect(user2).vote(1, true);

      await thorPoll.pollsHistory(1).then((r) => {
        expect(r.votesFor).to.equal(107);
        expect(r.votesAgainst).to.equal(0);
      });

      // VOTE FOR PROPOSITION 2

      await thorPoll.vote(2, false);

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.votesFor).to.equal(0);
        expect(r.votesAgainst).to.equal(100); // since snapshot at block 50 and delegation occured at block 60+
      });

      await thorPoll.connect(user1).vote(2, true);

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.votesFor).to.equal(0); // since snapshot at block 50 and delegation occured at block 60+
        expect(r.votesAgainst).to.equal(100);
      });

      await thorPoll.connect(user2).vote(2, true);

      await thorPoll.pollsHistory(2).then((r) => {
        expect(r.votesFor).to.equal(7);
        expect(r.votesAgainst).to.equal(100);
      });
    });
  });
});
