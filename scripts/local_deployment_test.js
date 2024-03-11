const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [owner, user1, user2] = await ethers.getSigners();

  let currentBlockNumber = await ethers.provider.getBlockNumber();

  const ThorToken = await hre.ethers.getContractFactory("ThorVotingToken");
  const thorToken = await ThorToken.deploy();
  await thorToken.deployed();

  const ThorPoll = await hre.ethers.getContractFactory("ThorPoll");
  const thorPoll = await ThorPoll.deploy(thorToken.address);
  await thorPoll.deployed();

  console.log(`ThorToken deployed to ${thorToken.address}`);
  console.log(`ThorPoll deployed to ${thorPoll.address}`);

  await thorToken.mint(owner.address, ethers.utils.parseEther("100.75"));
  await thorToken.mint(user2.address, ethers.utils.parseEther("7.0655"));

  // let suggestion1 = ethers.utils.formatBytes32String("Should we do suggestion 1 ?");
  // let suggestion2 = ethers.utils.formatBytes32String("Suggestion 2");
  // let suggestion3 = ethers.utils.formatBytes32String("Suggestion 3");
  // let suggestion4 = ethers.utils.formatBytes32String("Suggestion 4");

  let suggestion1 =
    "Should we do suggestion 1 ? Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  let suggestion2 = "Suggestion 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit";
  let suggestion3 = "Suggestion 3. Lorem ipsum dolor sit amet";
  let suggestion4 =
    "Suggestion 4. Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  await mine(60);
  await thorToken.transfer(user1.address, ethers.utils.parseEther("40"));
  await mine(60);

  let currentTime = await time.latest();

  // vote closed
  await thorPoll.createPoll(
    user1.address,
    suggestion1,
    currentBlockNumber + 99,
    currentTime + 3600,
    currentTime + 3600 * 24 * 7
  );

  // vote closed
  await thorPoll.createPoll(
    user2.address,
    suggestion2,
    currentBlockNumber + 50,
    currentTime + 3600 * 24,
    currentTime + 3600 * 24 * 5
  );
  await thorPoll.createPoll(
    user2.address,
    suggestion2,
    currentBlockNumber + 50,
    currentTime + 3600 * 24,
    currentTime + 3600 * 24 * 5
  );

  await time.increase(1 + 3600 * 24);

  // VOTE FOR PROPOSITION 1
  await thorPoll.vote(1, false);
  await thorPoll.connect(user1).vote(1, true);
  await thorPoll.connect(user2).vote(1, true);

  // VOTE FOR PROPOSITION 2
  await thorPoll.vote(2, false);
  await thorPoll.connect(user1).vote(2, true);
  await thorPoll.connect(user2).vote(2, true);

  await time.increase(3600 * 24 * 30);
  await mine(500);

  currentTime = await time.latest();

  // vote open
  await thorPoll.createPoll(
    owner.address,
    suggestion3,
    currentBlockNumber + 400,
    currentTime + 3600,
    currentTime + 3600 * 24 * 7
  );
  await thorPoll.createPoll(
    owner.address,
    suggestion3,
    currentBlockNumber + 400,
    currentTime + 3600,
    currentTime + 3600 * 24 * 7
  );
  await thorPoll.createPoll(
    owner.address,
    suggestion3,
    currentBlockNumber + 400,
    currentTime + 3600,
    currentTime + 3600 * 24 * 7
  );
  await thorPoll.createPoll(
    owner.address,
    suggestion3,
    currentBlockNumber + 400,
    currentTime + 3600,
    currentTime + 3600 * 24 * 7
  );

  // vote not yet open
  await thorPoll.createPoll(
    user2.address,
    suggestion4,
    currentBlockNumber + 550,
    currentTime + 3600 * 24,
    currentTime + 3600 * 24 * 5
  );

  await time.increase(3600 * 2);

  await thorPoll.connect(user2).vote(5, true);
  await thorPoll.connect(user1).vote(6, true);
  await thorPoll.connect(user2).vote(6, false);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
