# IAESIR Protocol

1. [Installation Guide](#guide)
   1. [Dependencies](#dependencies)
   2. [Configuration](#configuration)
2. [Tests](#tests)
   1. [Initial test](#initialtest)
   2. [Thor voting token test](#thortest)
   3. [Airdrop test](#airdroptest)
   4. [Polls test](#pollstest)
   5. [Delegation signatures test](#signaturetests)
3. [Live](#live)
   1. [Deployment script](#deployment)
   2. [Interaction](#interaction)
      1. [Console](#console)
4. [Dapp](#dapp)

# Installation Guide <a name="guide"></a>

The Smart Contracts are deployed at the following addresses on the [**BNB Smart Chain**](https://bscscan.com/):

| Smart Contracts   | Address                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| THOR Voting Token | [0x469f138142Ba45Df006090718784538305F56D88](https://bscscan.com/address/0x469f138142Ba45Df006090718784538305F56D88#code) |
| THOR Poll         | [0xB6A0e51b5A981Dd504Cb86686E734Af8ab675f30](https://bscscan.com/address/0xB6A0e51b5A981Dd504Cb86686E734Af8ab675f30#code) |

## Dependencies <a name="dependencies"></a>

Install the dependencies and devDependencies.

```sh
npm install
# or
npm i
```

## Configuration <a name="configuration"></a>

Fill the [.env]() file with your api url key, private key and explorer key.

```sh
EXPLORER_KEY="XXXXX"

SEPOLIA_API_URL="https://eth-sepolia.g.alchemy.com/v2/XXXXX"
SEPOLIA_PRIVATE_KEY="XXXXX"

ETHEREUM_API_URL="https://eth-mainnet.g.alchemy.com/v2/v2/XXXXX"
ETHEREUM_PRIVATE_KEY="XXXXX"
```

- The `API_URL` enables you to connect to the blockchain through a node given by your provider, the best-known ones are [Infura](https://infura.io/) and [Alchemy](https://www.alchemy.com/) and you can get your api url key there.
- The `PRIVATE_KEY` is associated with your blockchain wallet, the most famous one is [Metamask](https://metamask.io/) and can be installed as a browser extension. From there after setting up your wallet you should be able to export your private key in _account details_.
- The `EXPLORER_KEY` allows you to verify contracts on [etherscan](https://etherscan.com/) so that anyone can interact with it without going through the console.

Now [hardhat.config.js](hardhat.config.js) should have these lines where it imports the _.env_ variables. The `module.exports` is best set as follow with your solidity version compiler.

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const EXPLORER_KEY = process.env.EXPLORER_KEY;

const SEPOLIA_API_URL = process.env.SEPOLIA_API_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

const ETHEREUM_API_URL = process.env.ETHEREUM_API_URL;
const ETHEREUM_PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // paths: {
  //   artifacts: './client/src/artifacts'
  // },
  networks: {
    sepolia: {
      url: SEPOLIA_API_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    ethereum: {
      url: ETHEREUM_API_URL,
      accounts: [ETHEREUM_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: EXPLORER_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 21,
  },
};
```

_\* Before deploying and using any network make sure you have MATIC in you wallet to pay for the transactions fees._

_\* If your [.env]() is empty comments the unnused lines in the config file to avoid importing errors._

# Tests <a name="tests"></a>

To run tests scripts, run one of these commands :

```sh
npx hardhat test .\test\<test_script>.js
# or
npx hardhat test
```

## Initial test <a name="initialtest"></a>

The first test ([beforeOverride](test/beforeOverride.js)) is an initial approach of the original ERC20Votes of Openzeppelin before realizing any personal overrides. The tests goes through **minting**, **transfer**, **delegation** and **get current and past voting power** in every way possible such as for example before and after a transfer is made.

The issue is that by default the token balance does not account for voting power to make transfer cheaper therefore it requires users to delegate to themselfs in order to activate checkpoints and have their voting power tracked. Enabling self-delegation automatically can be done by overriding [`_afterTokenTransfer`](contracts/ThorVotingToken.sol), however to avoid increasing the base gas cost of transfers it needs to be done only once by adding:

```js
if (delegates(to) == address(0)) {
  _delegate(to, to);
}
```

_\* Before running this test remove these top lines from `_afterTokenTransfer` in [ThorVotingToken.sol](contracts/ThorVotingToken.sol), then uncomment all tests lines._

## Thor voting token test <a name="thortest"></a>

The second test [afterTransferOverride.js](test/afterTransferOverride.js) is basically similar to the first except that it takes into account the override we made in `_afterTokenTransfer` and represent the version that we will use.

## Airdrop test <a name="airdroptest"></a>

The [airdrop](test/airdrop.js) script tests how the [ThorVotingToken](contracts/ThorVotingToken.sol) can be used to airdrop tokens to a list of addresses.

## Polls test <a name="pollstest"></a>

This [test script](test/polls.js) consider the voting token we've created and put to test the [poll](contracts/ThorPoll.sol) smart contract.

## Delegation signatures test <a name="signaturetests"></a>

The last test script [signatureDelegation.js](test/signatureDelegation.js) is also a demonstration of how the EIP712 digital delegation signature can be used to delegate to someone else offchain and having someone else pay the fees.

# Live <a name="live"></a>

## Deployment script <a name="deployment"></a>

To deploy locally you can just write `npx hardhat run scripts/<deploy_script>.js` or if you run a node:

```sh
npx hardhat node
npx hardhat run scripts/<deploy_script>.js --network localhost
# When wanting to test dapp
# run node with '--fork https://eth-mainnet.g.alchemy.com/v2/XXXXX'
# and script with 'local_deployment_test.js'
```

Check the logs to get the contracts addresses.

To deploy on a specific network like the _sepolia_ testnet for example you need to write the following command `npx hardhat run scripts/<deploy_script>.js --network sepolia`.

When deployed with `scripts/deploy.js` you can find your verified contract on the explorer of the chain used.

To manually verify a contract on a network scanner you can also run the following command : `npx hardhat verify –-network <NETWORK> <DEPLOYED_CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETER>` or if the arguments are saved in an [arguments.js]() file : `npx hardhat verify --constructor-args arguments.js <DEPLOYED_CONTRACT_ADDRESS>`.

## Interaction <a name="interaction"></a>

To interact with our newly deployed contract one could use the console but it is quite tedious and since our contracts are deployed we can directly interact with them in the explorer through their provided interface.

### Console <a name="console"></a>

If one would like to use the console istead, here is how it can be done.

_If done locally first run `npx hardhat node` in a separate console._

```sh
# In one terminal

PS C:\Users\user\IAESIR-Protocol> npx hardhat node # --fork https://eth-mainnet.g.alchemy.com/v2/XXXXX
```

```sh
# In a second terminal

PS C:\Users\user\IAESIR-Protocol> npx hardhat run scripts/<deploy_script> --network <network> # creates polls and move time

ThorToken deployed to 0x5FbDB2315678afecb367f032d93F642f64180aa3
ThorPoll deployed to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

PS C:\Users\user\IAESIR-Protocol> npx hardhat console --network <network>

Welcome to Node.js v18.9.0.
Type ".help" for more information.
> const [owner, user1, user2] = await ethers.getSigners();
undefined
>
# in one step
> const thorToken = await ethers.getContractAt("ThorVotingToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
undefined
> thorToken.address
'0x5FbDB2315678afecb367f032d93F642f64180aa3'
# in two steps
> const thorPoll = await (await ethers.getContractFactory("ThorPoll")).attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
undefined
> thorPoll.address
'0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
>
> await thorToken.getVotes(owner.address);
BigNumber { value: "60750000000000000000" }
>
> await thorPoll.pollsHistory(2);
[
  BigNumber { value: "2" },
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  'Suggestion 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  BigNumber { value: "7065500000000000000" },
  BigNumber { value: "100750000000000000000" },
  BigNumber { value: "50" },
  BigNumber { value: "1672340282" },
  BigNumber { value: "1672685882" },
  id: BigNumber { value: "2" },
  suggester: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  suggestion: 'Suggestion 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  votesFor: BigNumber { value: "7065500000000000000" },
  votesAgainst: BigNumber { value: "100750000000000000000" },
  atSnapshot: BigNumber { value: "50" },
  startAt: BigNumber { value: "1672340282" },
  finishAt: BigNumber { value: "1672685882" }
]
> # ...
```

# Dapp <a name="dapp"></a>

Before any Dapp deployment please read [this](client/README.md#dapp).
