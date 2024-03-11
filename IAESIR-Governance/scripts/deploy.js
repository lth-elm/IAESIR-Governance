// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { network } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const WAIT_BLOCK_CONFIRMATIONS = 6;

  const ThorToken = await hre.ethers.getContractFactory("ThorVotingToken");
  const thorToken = await ThorToken.deploy();
  console.log("ThorToken verification pending...");
  await thorToken.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
  console.log(`ThorToken deployed to ${thorToken.address} on ${network.name}`);

  console.log("Verifying ThorToken contract...");
  await hre.run(`verify:verify`, {
    address: thorToken.address,
    constructorArguments: [],
    contract: "contracts/ThorVotingToken.sol:ThorVotingToken",
  });

  const ThorPoll = await hre.ethers.getContractFactory("ThorPoll");
  const thorPoll = await ThorPoll.deploy(thorToken.address);
  console.log("ThorPoll dverification pending...");
  await thorPoll.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
  console.log(`ThorPoll deployed to ${thorPoll.address} on ${network.name}`);

  console.log("Verifying ThorPoll contract...");
  await hre.run(`verify:verify`, {
    address: thorPoll.address,
    constructorArguments: [thorToken.address],
    contract: "contracts/ThorPoll.sol:ThorPoll",
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
