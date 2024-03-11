import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { useAccount, useSigner } from "wagmi";
// import { fetchBlockNumber } from "@wagmi/core";
import { ethers, utils } from "ethers";

import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";

import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Governance from "./pages/Governance";
import History from "./pages/History";
import Page404 from "./pages/Page404";
import NotConnected from "./components/NotConnected";

import thorAbi from "./abis/ThorVotingToken.json";
import pollAbi from "./abis/ThorPoll.json";

const thorContractABI = thorAbi.abi;
const pollContractABI = pollAbi.abi;
// const thorContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const pollContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const thorContractAddress = "0x469f138142Ba45Df006090718784538305F56D88";
const pollContractAddress = "0xB6A0e51b5A981Dd504Cb86686E734Af8ab675f30";

export default function Protocol() {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  // const [useThorContract, setThorContract] = useState();
  // const [isThorAdmin, setIsThorAdmin] = useState(false);
  const [totalSupply, setTotalSupply] = useState("0");
  const [thorBalance, setThorBalance] = useState("0");
  const [currentVotingPower, setCurrentVotingPower] = useState("0");

  const [usePollContract, setPollContract] = useState();
  const [isPollAdmin, setIsPollAdmin] = useState(false);
  // const [pollsHistory, setPollsHistory] = useState();

  const [pastPolls, setPastPolls] = useState([]);
  const [ongoingPolls, setOngoingPolls] = useState([]);
  const [incomingPolls, setIncomingPolls] = useState([]);

  const [showDialog, setShowDialog] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [mined, setMined] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    if (!signer) return;
    getContractData();
  }, [signer]);

  const getContractData = async () => {
    // console.log("CURRENT BLOCK NUMBER", await fetchBlockNumber());
    try {
      // ============= THOR CONTRACT =============
      const thorContract = new ethers.Contract(thorContractAddress, thorContractABI, signer);
      // setThorContract(thorContract);

      // const thorOwner = await thorContract.owner();
      // console.log("THOR CONTRACT OWNER", thorOwner);
      // setIsThorAdmin(thorOwner.toUpperCase() === address.toUpperCase());

      const getTotalSupply = await thorContract.totalSupply();
      const formatTotalSupply = utils.formatEther(getTotalSupply.sub(getTotalSupply.mod(1e14)));
      setTotalSupply(formatTotalSupply);

      const getThorBalance = await thorContract.balanceOf(address);
      const formatThorBalance = utils.formatEther(getThorBalance.sub(getThorBalance.mod(1e14)));
      setThorBalance(formatThorBalance);

      const getVotingPower = await thorContract.getVotes(address);
      const formatVotingPower = utils.formatEther(getVotingPower.sub(getVotingPower.mod(1e14)));
      setCurrentVotingPower(formatVotingPower);

      // console.log("TOTAL SUPPLY", getTotalSupply.toString());
      // console.log("THR BALANCE", getThorBalance.toString());
      // console.log("VOTING POWER", getVotingPower.toString());

      // ============= POLL CONTRACT =============

      const pollContract = new ethers.Contract(pollContractAddress, pollContractABI, signer);
      setPollContract(pollContract);

      const pollOwner = await pollContract.owner();
      // console.log("POLL CONTRACT OWNER", pollOwner);
      setIsPollAdmin(pollOwner.toUpperCase() === address.toUpperCase());
      // console.log("IS ADMIN", pollOwner.toUpperCase() === address.toUpperCase());

      // const getZeroPoll = await pollContract.pollsHistory(0);
      // const getFirstPoll = await pollContract.pollsHistory(1);
      // console.log("ZERO POLL", getZeroPoll);
      // console.log("FIRST POLL", getFirstPoll);

      const getHistory = await pollContract.getPollsHistory();
      // setPollsHistory(getHistory);
      // console.log("POLLS HISTORY", getHistory);

      // ============= SORT =============
      classifyPolls(getHistory, thorContract, pollContract);
    } catch (error) {
      console.log(error);
    }
  };

  const classifyPolls = async (getHistory, thorContract, pollContract) => {
    // const currentTimestamp = Math.ceil(Date.now() / 1000) + (1 + 3600 * 24) + 3600 * 24 * 30 + 3600 * 2; // !!!!!!!!!!!!! REMOVE WHEN GOING LIVE
    const currentTimestamp = Math.ceil(Date.now() / 1000); // -------> USE WHEN GOING LIVE
    const currentDate = new Date(currentTimestamp * 1000);
    console.log("CURRENT DATE:", currentDate);

    const past = [];
    const ongoing = [];
    const incoming = [];

    for (const element of getHistory) {
      const getPollVotingPower = await thorContract.getPastVotes(address, element.atSnapshot.toNumber());
      const formatPollVotingPower = utils.formatEther(getPollVotingPower.sub(getPollVotingPower.mod(1e14)));

      const formatPollVotesFor = utils.formatEther(element.votesFor.sub(element.votesFor.mod(1e14)));

      const formatPollVotesAgainst = utils.formatEther(element.votesAgainst.sub(element.votesAgainst.mod(1e14)));

      const poll = {
        id: element.id.toNumber(),
        suggester: element.suggester,
        suggestion: element.suggestion, // ethers.utils.parseBytes32String(element.suggestion), if suggestion is a bytes32
        votingPower: formatPollVotingPower,
        hasVoted: await pollContract.hasVotedForId(address, element.id.toNumber()),
        hasVotedFor: await pollContract.voteForId(address, element.id.toNumber()),
        votesFor: formatPollVotesFor,
        votesAgainst: formatPollVotesAgainst,
        atSnapshot: element.atSnapshot.toNumber(),
        startAt: element.startAt.toNumber(),
        finishAt: element.finishAt.toNumber(),
      };

      if (poll.finishAt < currentTimestamp) {
        past.push(poll);
      } else if (poll.startAt > currentTimestamp) {
        incoming.push(poll);
      } else if (poll.startAt < currentTimestamp && poll.finishAt > currentTimestamp) {
        ongoing.push(poll);
      }
    }
    past.shift();

    setPastPolls(past.reverse());
    setOngoingPolls(ongoing);
    setIncomingPolls(incoming);
    // console.log("PAST:", past);
    // console.log("ONGOIN:", ongoing);
    // console.log("INCOMING:", incoming);
  };

  function ConfirmDialog() {
    const handleClose = () => clearTransactionDialog();

    return (
      <Modal show={true} onHide={handleClose} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {mined && "Transaction Confirmed"}
            {!mined && !showSign && "Confirming Your Transaction..."}
            {!mined && showSign && "Please Sign to Confirm"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div style={{ textAlign: "left", padding: "0px 20px 20px 20px" }}>
            {mined && (
              <div>
                Your transaction has been confirmed and is on the blockchain.
                <br />
                <br />
                <a target="_blank" rel="noreferrer" href={`https://bscscan.com/tx/${transactionHash}`}>
                  View on Bscscan
                </a>
              </div>
            )}
            {!mined && !showSign && (
              <div>
                <p>Please wait while we confirm your transaction on the blockchain....</p>
              </div>
            )}
            {!mined && showSign && (
              <div>
                <p>Please sign to confirm your transaction.</p>
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", paddingBottom: "30px" }}>
            {!mined && (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button className="CloseModal" variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const clearTransactionDialog = () => {
    setShowDialog(false);
    setShowSign(false);
    setMined(false);
    setTransactionHash("");
  };

  return (
    <div className="Protocol">
      <NavBar isPollAdmin={isPollAdmin} />
      <div className="BodyProtocol">
        {isConnected ? (
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  totalSupply={totalSupply}
                  thorAddress={thorContractAddress}
                  thorBalance={thorBalance}
                  currentVotingPower={currentVotingPower}
                  pastPolls={pastPolls}
                  ongoingPolls={ongoingPolls}
                  incomingPolls={incomingPolls}
                />
              }
            />
            <Route
              path="/governance"
              element={
                <Governance
                  ongoingPolls={ongoingPolls}
                  incomingPolls={incomingPolls}
                  usePollContract={usePollContract}
                  getContractData={getContractData}
                  setShowDialog={setShowDialog}
                  setShowSign={setShowSign}
                  setMined={setMined}
                  setTransactionHash={setTransactionHash}
                  clearTransactionDialog={clearTransactionDialog}
                />
              }
            />
            <Route path="/history" element={<History pastPolls={pastPolls} />} />

            <Route path="*" element={<Page404 />} />

            {isPollAdmin ? (
              <Route
                path="/admin"
                element={
                  <Admin
                    usePollContract={usePollContract}
                    getContractData={getContractData}
                    setShowDialog={setShowDialog}
                    setShowSign={setShowSign}
                    setMined={setMined}
                    setTransactionHash={setTransactionHash}
                    clearTransactionDialog={clearTransactionDialog}
                  />
                }
              />
            ) : (
              <Route path="/admin" element={<Page404 />} />
            )}
          </Routes>
        ) : (
          <NotConnected />
        )}

        {showDialog && <ConfirmDialog />}
      </div>
    </div>
  );
}
