import Button from "react-bootstrap/Button";

import fox from "../images/MetaMask-Fox.png";

export default function Dashboard(props) {
  const { totalSupply, thorAddress, thorBalance, currentVotingPower, pastPolls, ongoingPolls, incomingPolls } = props;

  const addTHRToken = async () => {
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: thorAddress, // The address that the token is at.
            symbol: "THR", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
            image: "https://iaesirfinance.com/wp-content/uploads/2023/04/WhatsApp-Image-2023-03-27-at-10.505454.png", // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log("Logo added to wallet");
      } else {
        console.log("Logo not added to wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard">
        <div className="supplyBalance">
          <p>
            <span className="text">Total supply</span> <br />
            {totalSupply} / 1,500,000
          </p>
          <p>
            <span className="text">My Balance</span> <br />
            {thorBalance} THR <br />
            <br />
            <Button variant="custom" onClick={() => addTHRToken()}>
              Add Token <img src={fox} width="7%" alt="Metamask Fox logo" />
            </Button>
          </p>
          <p>
            <span className="text">My Voting Power</span> <br />
            {currentVotingPower}
          </p>
        </div>

        <hr />

        <div className="pollsCounter">
          <p className="past">
            <span className="text">Past Polls</span> <br /> {pastPolls.length}
          </p>
          <p>
            <span className="text">Ongoing Polls</span> <br /> {ongoingPolls.length}
          </p>
          <p className="incoming">
            <span className="text">Incoming Polls</span> <br /> {incomingPolls.length}
          </p>
        </div>
        <p>
          <span className="text">Total</span> <br />
          {pastPolls.length + ongoingPolls.length + incomingPolls.length}
        </p>
      </div>
    </div>
  );
}
