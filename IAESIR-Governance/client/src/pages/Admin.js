import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

import { useState } from "react";

//document.getElementById("showRoyalties").innerHTML

export default function Admin(props) {
  const {
    usePollContract,
    getContractData,
    setShowDialog,
    setShowSign,
    setMined,
    setTransactionHash,
    clearTransactionDialog,
  } = props;

  const [suggester, setSuggester] = useState("0x0000000000000000000000000000000000000000");
  const [suggestion, setSuggestion] = useState("");
  const [blockNumber, setBlockNumber] = useState();
  const [startTimestamp, setStartTimestamp] = useState();
  const [endTimestamp, setEndTimestamp] = useState();

  const createPoll = async (id, isFavorable) => {
    console.log("Attempt create a poll");

    // console.log("Suggester: ", suggester);
    // console.log("Suggestion: ", suggestion);
    // console.log("Block Number: ", blockNumber);
    // console.log("Start Timestamp: ", startTimestamp);
    // console.log("End Timestamp: ", endTimestamp);

    setShowSign(true);
    setShowDialog(true);
    setMined(false);

    try {
      let transaction = await usePollContract.createPoll(
        suggester,
        suggestion,
        blockNumber,
        startTimestamp,
        endTimestamp
      );

      setShowSign(false);

      await transaction.wait();

      setMined(true);
      setTransactionHash(transaction.hash);

      console.log("Poll successfully created, transaction hash:", transaction.hash);

      await getContractData();
    } catch (error) {
      console.log(error);
      alert(error);
      clearTransactionDialog();
    }
  };

  return (
    <div>
      <h1>Admin</h1>
      <div className="pollCreation">
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="0xf3...2266"
            aria-label="Address"
            aria-describedby="basic-addon1"
            onChange={(e) => setSuggester(e.target.value)}
          />
          <InputGroup.Text>Suggester Address</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Should ... ?"
            aria-label="Suggestion"
            aria-describedby="basic-addon1"
            onChange={(e) => setSuggestion(e.target.value)}
          />
          <InputGroup.Text>Suggestion</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Block number: 37135665"
            aria-label="Snapshot"
            aria-describedby="basic-addon1"
            onChange={(e) => setBlockNumber(e.target.value)}
          />
          <InputGroup.Text>Snapshot</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <Form.Control
            type="number"
            placeholder="Timestamp: 1671714180"
            aria-label="start-timestamp"
            aria-describedby="basic-addon1"
            onChange={(e) => setStartTimestamp(e.target.value)}
          />
          <InputGroup.Text>Start</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <Form.Control
            type="number"
            placeholder="Timestamp: 1671723190"
            aria-label="end-timestamp"
            aria-describedby="basic-addon1"
            onChange={(e) => setEndTimestamp(e.target.value)}
          />
          <InputGroup.Text>End</InputGroup.Text>
        </InputGroup>

        <Button
          style={{
            backgroundColor: "#a511f0",
            border: "none",
            borderRadius: "10px",
          }}
          onClick={() => createPoll()}
        >
          Create Poll
        </Button>
      </div>
    </div>
  );
}
