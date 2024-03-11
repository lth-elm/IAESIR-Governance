import { BsHandThumbsUp, BsHandThumbsDown } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

export default function Governance(props) {
  const {
    ongoingPolls,
    incomingPolls,
    usePollContract,
    getContractData,
    setShowDialog,
    setShowSign,
    setMined,
    setTransactionHash,
    clearTransactionDialog,
  } = props;

  const SendVote = async (id, isFavorable) => {
    console.log("Attempt to vote for poll", id);
    console.log("Vote is favorable", isFavorable);

    setShowSign(true);
    setShowDialog(true);
    setMined(false);

    try {
      let transaction = await usePollContract.vote(id, isFavorable);

      setShowSign(false);

      await transaction.wait();

      setMined(true);
      setTransactionHash(transaction.hash);

      console.log("Successfully vote, transaction hash:", transaction.hash);

      await getContractData();
    } catch (error) {
      console.log(error);
      clearTransactionDialog();
    }
  };

  const DisplayDate = ({ s, e }) => {
    const start = new Date(s * 1000);
    const startDate =
      start.getDate() +
      "/" +
      (start.getMonth() + 1) +
      "/" +
      start.getFullYear() +
      " " +
      start.getHours() +
      ":" +
      start.getMinutes() +
      ":" +
      start.getSeconds();

    const end = new Date(e * 1000);
    const endDate =
      end.getDate() +
      "/" +
      (end.getMonth() + 1) +
      "/" +
      end.getFullYear() +
      " " +
      end.getHours() +
      ":" +
      end.getMinutes() +
      ":" +
      end.getSeconds();

    return (
      <div className="cardFooter">
        <small>Start at: {startDate}</small>
        <small>Finish at: {endDate}</small>
      </div>
    );
  };

  const IncomingPollGrid = () => {
    return (
      <Row xs={1} md={2} className="g-4">
        {Array.from(incomingPolls).map((poll, idx) => (
          <Col key={idx}>
            <Card>
              <Card.Body>
                <Card.Text>
                  <div className="cardHeader">
                    <small>#{poll.id}</small>
                    <small>Block snapshot {poll.atSnapshot}</small>
                  </div>
                </Card.Text>

                <Card.Header style={{ marginBottom: "1rem" }}>
                  <strong>{poll.suggestion}</strong>
                </Card.Header>

                <Card.Text>
                  <strong>
                    Voting power: <span className="voteHover">{poll.votingPower}</span>
                  </strong>
                </Card.Text>
              </Card.Body>
              <Card.Footer style={{ background: "#00003c" }}>
                <DisplayDate s={poll.startAt} e={poll.finishAt} />
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const OngoingPollGrid = () => {
    return (
      <Row xs={1} md={2} className="g-4">
        {Array.from(ongoingPolls).map((poll, idx) => (
          <Col key={idx}>
            <Card>
              <Card.Body>
                <Card.Text>
                  <div className="cardHeader">
                    <small>#{poll.id}</small>
                    <small>Block snapshot {poll.atSnapshot}</small>
                  </div>
                </Card.Text>

                <Card.Header style={{ marginBottom: "1rem" }}>
                  <strong>{poll.suggestion}</strong>
                </Card.Header>

                <Card.Text>
                  <strong>
                    Voting power: <span className="voteHover">{poll.votingPower}</span>
                  </strong>
                </Card.Text>

                <Card.Text>
                  {!poll.hasVoted ? (
                    <div className="sendVote">
                      <Button
                        style={{
                          backgroundColor: "#00003c",
                          border: "none",
                        }}
                        onClick={() => SendVote(poll.id, true)}
                      >
                        <BsHandThumbsUp />
                      </Button>
                      <Button
                        style={{
                          backgroundColor: "#00003c",
                          border: "none",
                        }}
                        onClick={() => SendVote(poll.id, false)}
                      >
                        <BsHandThumbsDown />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      disabled
                      style={{
                        backgroundColor: "#00003c",
                        border: "none",
                      }}
                    >
                      Vote submitted
                    </Button>
                  )}
                </Card.Text>

                <Card.Text>
                  {!poll.hasVoted ? (
                    <div className="displayVote">
                      <strong>
                        <span className="voteHover">{poll.votesFor}</span>
                      </strong>
                      <strong>
                        <span className="voteHover">{poll.votesAgainst}</span>
                      </strong>
                    </div>
                  ) : (
                    <div className="displayVote">
                      {poll.hasVotedFor ? (
                        <strong>
                          <span className="voteHover">{poll.votesFor} in favor</span>
                        </strong>
                      ) : (
                        <strong>
                          <span className="voteHover">{poll.votesFor}</span> in favor
                        </strong>
                      )}
                      {poll.hasVotedFor ? (
                        <strong>
                          <span className="voteHover">{poll.votesAgainst}</span> against
                        </strong>
                      ) : (
                        <strong>
                          <span className="voteHover">{poll.votesAgainst} against</span>
                        </strong>
                      )}
                    </div>
                  )}
                </Card.Text>
              </Card.Body>
              <Card.Footer style={{ background: "#00003c" }}>
                <DisplayDate s={poll.startAt} e={poll.finishAt} />
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div>
      <h1>Governance</h1>
      <div>
        <h2>Ongoing Votes</h2>
        {ongoingPolls.length ? <OngoingPollGrid /> : <div>There are no ongoing votes</div>}
        <h2>Incoming Votes</h2>
        {incomingPolls.length ? <IncomingPollGrid /> : <div>There are no incoming votes</div>}
      </div>
    </div>
  );
}
