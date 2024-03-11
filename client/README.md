# Dapp <a name="dapp"></a>

When running dapp please consider these modifications wether you're runnig tests or not.

In [Protocol.js](client/src/Protocol.js) update the contract addresses (`thorContractAddress` and `pollContractAddress`) with the ones deployed in testnet, localhost or mainnet:

```js
const thorContractAddress = "XXXXX";
const pollContractAddress = "XXXXX";
```

Consider also this change under the `classifyPolls` function in the same file:

```js
const currentTimestamp = Math.ceil(Date.now() / 1000) + (1 + 3600 * 24) + 3600 * 24 * 30 + 3600 * 2; // !!! REMOVE WHEN GOING LIVE
// const currentTimestamp = Math.ceil(Date.now() / 1000); // ---> USE WHEN GOING LIVE
```

The timestamp for the localhost app is increased according the operations that occured in the [local_deployment_test](scripts/local_deployment_test.js) script.

Finally in [App.js](client/src/App.js) update the networks to take in charge and display the one(s) you need:

```js
const { chains, provider } = configureChains(
  [hardhat, sepolia, bscTestnet, bsc], // [bsc], // https://wagmi.sh/react/chains#wagmichains
  [publicProvider()]
);
```

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Complete with the following commands:

```shell
serve -s build
```

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Docker commands

```shell
docker build . -t app
docker run -p 8080:8080 -d app
```
