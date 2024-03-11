import { BsCheckLg, BsXLg } from "react-icons/bs";

import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

export default function History(props) {
  const { pastPolls } = props;

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
        <small>Started at: {startDate}</small>
        <small>Finished at: {endDate}</small>
      </div>
    );
  };

  const HistoryPollGrid = () => {
    return (
      <Row xs={1} md={2} className="g-4">
        {Array.from(pastPolls).map((poll, idx) => (
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
                  <strong>
                    Has voted:{" "}
                    <span className="voteHover">{poll.hasVoted ? <BsCheckLg /> : <BsXLg />}</span>
                  </strong>
                </Card.Text>
                <Card.Text>
                  {!poll.hasVoted ? (
                    <div className="displayVote">
                      <strong>
                        <span className="voteHover">{poll.votesFor}</span> in favor
                      </strong>
                      <strong>
                        <span className="voteHover">{poll.votesAgainst}</span> against
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
      <h1>History</h1>
      {pastPolls.length ? <HistoryPollGrid /> : <div>There were no past votes</div>}
    </div>
  );
}
