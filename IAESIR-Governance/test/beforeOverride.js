const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

//
// Uncomment all lines below after removing overrides line
// in _afterTokenTransfer for tests with initial state.
//

// describe("Before Overrides DeFAI Token get Votes", function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshot in every test.
//   async function deployThorTokenFixture() {
//     // Contracts are deployed using the first signer/account by default
//     const [owner, account2] = await ethers.getSigners();

//     const ThorToken = await ethers.getContractFactory("ThorVotingToken");
//     const thorToken = await ThorToken.deploy();
//     // block 1 mined

//     return { thorToken, owner, account2 };
//   }

//   describe("Get Votes", function () {
//     it("Should return 0 as votes", async function () {
//       const { thorToken, owner, account2 } = await loadFixture(
//         deployThorTokenFixture
//       );

//       // block 2 mined
//       await mine();

//       let currentBlockNumber = await ethers.provider.getBlockNumber(); // 2
//       console.log(`current block number: ${currentBlockNumber}`);

//       expect(await thorToken.balanceOf(owner.address)).to.equal(0);
//       expect(await thorToken.getVotes(owner.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);

//       // block 3 mined
//       await thorToken.mint(owner.address, 100);
//       currentBlockNumber = await ethers.provider.getBlockNumber(); // 3
//       console.log(`current block number: ${currentBlockNumber}`);

//       expect(await thorToken.balanceOf(owner.address)).to.equal(100);
//       // Votes = 0 because `delegate` function wasn't called
//       expect(await thorToken.getVotes(owner.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);
//     });

//     it("Should return self delegated value", async function () {
//       const { thorToken, owner, account2 } = await loadFixture(
//         deployThorTokenFixture
//       );

//       // block 2 mined
//       await mine();

//       let currentBlockNumber = await ethers.provider.getBlockNumber(); // 2
//       console.log(`current block number: ${currentBlockNumber}`);

//       expect(await thorToken.balanceOf(owner.address)).to.equal(0);
//       expect(await thorToken.getVotes(owner.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);

//       // block 3 mined
//       await thorToken.mint(owner.address, 100);
//       currentBlockNumber = await ethers.provider.getBlockNumber(); // 3
//       console.log(`current block number: ${currentBlockNumber}`);

//       expect(await thorToken.balanceOf(owner.address)).to.equal(100);
//       // Votes = 0 because `delegate` function wasn't called
//       expect(await thorToken.getVotes(owner.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 1)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0);

//       // block 4 mined
//       await thorToken.delegate(owner.address);
//       currentBlockNumber = await ethers.provider.getBlockNumber(); // 4
//       console.log(`current block number: ${currentBlockNumber}`);

//       // console.log(await thorToken.getVotes(owner.address));
//       // console.log(await thorToken.getPastVotes(owner.address, 0));
//       // console.log(await thorToken.getPastVotes(owner.address, 1));
//       // console.log(await thorToken.getPastVotes(owner.address, 2));
//       // console.log(await thorToken.getPastVotes(owner.address, 3));
//       expect(await thorToken.getVotes(owner.address)).to.equal(100); // take effect immediately
//       expect(await thorToken.getPastVotes(owner.address, 0)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 1)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0); // delegation occurred in block 4 but getPastVotes needs us to be at block 5 to read block 4

//       // block 5 mined
//       await mine();
//       currentBlockNumber = await ethers.provider.getBlockNumber(); // 5
//       console.log(`current block number: ${currentBlockNumber}`);

//       // console.log(await thorToken.getPastVotes(owner.address, 3)); // 0
//       // console.log(await thorToken.getPastVotes(owner.address, 4)); // 100
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(100);

//       // block 6 mined
//       await thorToken.mint(owner.address, 300);
//       currentBlockNumber = await ethers.provider.getBlockNumber(); // 6
//       console.log(`current block number: ${currentBlockNumber}`);

//       expect(await thorToken.getVotes(owner.address)).to.equal(400);
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(100);
//       expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(100); // mint occurred in block 6 but getPastVotes needs us to be at block 7 to read block 6
//       // block 7 mined
//       await mine();
//       currentBlockNumber = await ethers.provider.getBlockNumber(); // 7
//       console.log(`current block number: ${currentBlockNumber}`);
//       expect(await thorToken.getPastVotes(owner.address, 6)).to.equal(400);
//       // console.log(await thorToken.getPastVotes(owner.address, 6)); // 400
//     });

//     it("Should return correct votes after transfer", async function () {
//       const { thorToken, owner, account2 } = await loadFixture(
//         deployThorTokenFixture
//       );

//       // block 2 mined
//       await thorToken.delegate(owner.address);
//       // block 3 mined
//       await thorToken.mint(owner.address, 100);
//       // block 4 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 4

//       expect(await thorToken.getVotes(owner.address)).to.equal(100);
//       expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(100);

//       // block 5 mined
//       await thorToken.transfer(account2.address, 50);
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 5

//       expect(await thorToken.balanceOf(owner.address)).to.equal(50);
//       expect(await thorToken.balanceOf(account2.address)).to.equal(50);

//       expect(await thorToken.getVotes(owner.address)).to.equal(50);
//       expect(await thorToken.getVotes(account2.address)).to.equal(0); // votes = 0 because `delegate` function wasn't called
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(100);
//       expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(100); // transfer occurred in block 5 but getPastVotes needs us to be at block 6 to read block 5
//       // block 6 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 6
//       expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(50);
//       expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(0); // votes = 0 because `delegate` function wasn't called

//       // block 7 mined
//       await thorToken.connect(account2).delegate(account2.address);
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 7

//       expect(await thorToken.getVotes(account2.address)).to.equal(50); // take effect immediately
//       expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(0); // votes = 0 because `delegate` wasn't called before that time
//       expect(await thorToken.getPastVotes(account2.address, 6)).to.equal(0); // votes = 0 because `delegate` wasn't called before that time
//       // block 8 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 8
//       expect(await thorToken.getPastVotes(account2.address, 7)).to.equal(50);

//       // block 9 mined
//       await thorToken.transfer(account2.address, 20);
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 9
//       expect(await thorToken.getVotes(owner.address)).to.equal(30); // take effect immediately
//       expect(await thorToken.getVotes(account2.address)).to.equal(70); // no need to call delegate again
//       expect(await thorToken.getPastVotes(owner.address, 7)).to.equal(50);
//       expect(await thorToken.getPastVotes(account2.address, 7)).to.equal(50);
//       expect(await thorToken.getPastVotes(owner.address, 8)).to.equal(50); // will count the minus 20 at next block
//       expect(await thorToken.getPastVotes(account2.address, 8)).to.equal(50); // will count the new 20 at next block
//       // block 10 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 10
//       expect(await thorToken.getPastVotes(owner.address, 8)).to.equal(50);
//       expect(await thorToken.getPastVotes(account2.address, 8)).to.equal(50);
//       expect(await thorToken.getPastVotes(owner.address, 9)).to.equal(30);
//       expect(await thorToken.getPastVotes(account2.address, 9)).to.equal(70);
//     });

//     it("Should delegate to someone else", async function () {
//       const { thorToken, owner, account2 } = await loadFixture(
//         deployThorTokenFixture
//       );

//       // block 2 mined
//       await thorToken.delegate(owner.address);
//       // block 3 mined
//       await thorToken.mint(owner.address, 300);
//       // block 4 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 4

//       expect(await thorToken.getVotes(owner.address)).to.equal(300);
//       expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(300);

//       // block 5 mined
//       await thorToken.delegate(account2.address); // delegate to someone else (all)
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 5

//       expect(await thorToken.getVotes(owner.address)).to.equal(0); // take effect immediately, lose all voting power after delegation
//       expect(await thorToken.getVotes(account2.address)).to.equal(300); // take effect immediately, gain all voting power after receiving delegation

//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(300); // old delegation to self still valid
//       expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(0); // don't collect old vote power not attributed

//       expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(300); // transfer delegation occurred in block 5 but getPastVotes needs us to be at block 6 to read block 5
//       expect(await thorToken.getPastVotes(account2.address, 4)).to.equal(0); // transfer delegation occurred in block 5 but getPastVotes needs us to be at block 6 to read block 5
//       // block 6 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 6
//       expect(await thorToken.balanceOf(owner.address)).to.equal(300);
//       expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(0); // lose all voting power after delegation
//       expect(await thorToken.balanceOf(account2.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(300); // gain all voting power after receiving delegation

//       // block 7 mined
//       await thorToken.mint(owner.address, 45);
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 7

//       expect(await thorToken.balanceOf(owner.address)).to.equal(345);
//       expect(await thorToken.getVotes(owner.address)).to.equal(0); // continue to delegate voting power to `account2`
//       expect(await thorToken.balanceOf(account2.address)).to.equal(0);
//       expect(await thorToken.getVotes(account2.address)).to.equal(345); // continue to receive voting power delegated by `owner`
//     });

//     it("Should delegate to someone else from the start", async function () {
//       const { thorToken, owner, account2 } = await loadFixture(
//         deployThorTokenFixture
//       );

//       // block 2 mined
//       await thorToken.delegate(account2.address);
//       // block 3 mined
//       await thorToken.mint(owner.address, 300);
//       // block 4 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 4

//       // OWNER: balance = 300 but voting power = 0
//       expect(await thorToken.balanceOf(owner.address)).to.equal(300);
//       expect(await thorToken.getVotes(owner.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0);

//       // ACCOUNT2: balance = 0 but voting power = 300
//       expect(await thorToken.balanceOf(account2.address)).to.equal(0);
//       expect(await thorToken.getVotes(account2.address)).to.equal(300);
//       expect(await thorToken.getPastVotes(account2.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
//       expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(300);
//     });

//     it("Should recover voting power after delegating it", async function () {
//       const { thorToken, owner, account2 } = await loadFixture(
//         deployThorTokenFixture
//       );

//       // block 2 mined
//       await thorToken.delegate(account2.address);
//       // block 3 mined
//       await thorToken.mint(owner.address, 300);
//       // block 4 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 4

//       // OWNER: balance = 300 but voting power = 0
//       expect(await thorToken.balanceOf(owner.address)).to.equal(300);
//       expect(await thorToken.getVotes(owner.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 2)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 3)).to.equal(0);

//       // ACCOUNT2: balance = 0 but voting power = 300
//       expect(await thorToken.balanceOf(account2.address)).to.equal(0);
//       expect(await thorToken.getVotes(account2.address)).to.equal(300);
//       expect(await thorToken.getPastVotes(account2.address, 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
//       expect(await thorToken.getPastVotes(account2.address, 3)).to.equal(300);

//       // block 5 mined
//       await thorToken.delegate(owner.address);
//       // block 6 mined
//       await mine();
//       console.log(
//         `current block number: ${await ethers.provider.getBlockNumber()}`
//       ); // 6

//       // OWNER: regain voting power
//       expect(await thorToken.balanceOf(owner.address)).to.equal(300);
//       expect(await thorToken.getVotes(owner.address)).to.equal(300);
//       expect(await thorToken.getPastVotes(owner.address, 4)).to.equal(0);
//       expect(await thorToken.getPastVotes(owner.address, 5)).to.equal(300);

//       // ACCOUNT2: lose delegated voting power
//       expect(await thorToken.balanceOf(account2.address)).to.equal(0);
//       expect(await thorToken.getVotes(account2.address)).to.equal(0);
//       expect(await thorToken.getPastVotes(account2.address, 4)).to.equal(300);
//       expect(await thorToken.getPastVotes(account2.address, 5)).to.equal(0);
//     });
//   });
// });
