const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

async function getDelegationSignature(thorToken, signer, delegateeAddress, expiry, nonce) {
  const [name, chainId] = await Promise.all([
    thorToken.name(),
    signer.getChainId(),
    // ethers.provider.getNetwork(),
  ]);

  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name: name,
        version: "1",
        chainId: chainId,
        verifyingContract: thorToken.address,
      },
      {
        // EIP712Domain: [
        //   { name: 'name', type: 'string' },
        //   { name: 'chainId', type: 'uint256' },
        //   { name: 'verifyingContract', type: 'address' },
        // ],
        Delegation: [
          {
            name: "delegatee",
            type: "address",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "expiry",
            type: "uint256",
          },
        ],
      },
      {
        delegatee: delegateeAddress,
        nonce: nonce,
        expiry: expiry,
      }
    )
  );
}

describe("Signature Delegation", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployThorTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, signer, delegatee] = await ethers.getSigners();
    const initialBlockNumber = await ethers.provider.getBlockNumber();

    const ThorToken = await ethers.getContractFactory("ThorVotingToken");
    const thorToken = await ThorToken.deploy();
    // block 1 mined

    return { thorToken, owner, signer, delegatee, initialBlockNumber };
  }

  it("Should delegate with signature", async function () {
    const { thorToken, signer, delegatee, initialBlockNumber } = await loadFixture(deployThorTokenFixture);

    const expiry = (await time.latest()) + 3600;
    const nonce = await thorToken.nonces(signer.address);

    // signer call this function and share `v`, `r` and `s` with governor application for gasless delegation
    const { v, r, s } = await getDelegationSignature(thorToken, signer, delegatee.address, expiry, nonce);

    // block 2 mined
    await thorToken.delegateBySig(delegatee.address, nonce, expiry, v, r, s);
    // block 3 mined
    await thorToken.mint(signer.address, 300);
    // block 4 mined
    await mine();
    console.log(`current block number: ${await ethers.provider.getBlockNumber()}`); // initialBlockNumber + 4

    // balance = 300 but voting power = 0
    expect(await thorToken.balanceOf(signer.address)).to.equal(300);
    expect(await thorToken.getVotes(signer.address)).to.equal(0);
    expect(await thorToken.getPastVotes(signer.address, initialBlockNumber + 2)).to.equal(0);
    expect(await thorToken.getPastVotes(signer.address, initialBlockNumber + 3)).to.equal(0);

    // balance = 0 but voting power = 300
    expect(await thorToken.balanceOf(delegatee.address)).to.equal(0);
    expect(await thorToken.getVotes(delegatee.address)).to.equal(300);
    expect(await thorToken.getPastVotes(delegatee.address, initialBlockNumber + 2)).to.equal(0); // mint occurred in block 3 but getPastVotes needs us to be at block 4 to read block 3
    expect(await thorToken.getPastVotes(delegatee.address, initialBlockNumber + 3)).to.equal(300);
  });
});
