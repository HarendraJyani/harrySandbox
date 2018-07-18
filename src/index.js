import * as React from "react";
import * as ReactDOM from "react-dom";
import sha256 from "crypto-js/sha256";

function hashFromUrl() {
  if (!location.search) return;
  var res = location.search
    .substr(1)
    .split("&")
    .map(x => x.split("="))
    .find(([k, v]) => k === "hash");
  if (res) return res[1];
}
class UI extends React.Component {
  state = { hash: hashFromUrl() || "", amount: 30 };
  setHash = e => this.setState({ hash: e.target.value });
  showMore = () => this.setState({ amount: this.state.amount * 2 });
  render() {
    const { hash, amount } = this.state;
    const [current, ...previous] = getPreviousResults(hash, amount);
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Game hash</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <label>
                  First hash:{" "}
                  <input value={this.state.hash} onChange={this.setHash} />
                </label>
              </td>
              {hash && <Result {...current} />}
            </tr>
            {hash &&
              previous.map(result => (
                <tr key={result.hash}>
                  <td>
                    <pre>{result.hash}</pre>
                  </td>
                  <Result {...result} />
                </tr>
              ))}
          </tbody>
        </table>
        {hash && <button onClick={this.showMore}>Show more</button>}
      </div>
    );
  }
}
const Result = result => (
  <td style={{ background: result.color }}>{result.result}</td>
);

function getPreviousHash(gameHash) {
  return sha256(gameHash).toString();
}

function gameResultToColor(bet) {
  if (bet === 0) return "green";
  if (1 <= bet && bet <= 7) return "red";
  if (8 <= bet && bet <= 15) return "black";
}

const salt = "0000000000000000019ee980eb5c43e1e4e9d16bee8bb96d9ee691fa2c49c219";
function saltHash(hash) {
  return sha256(JSON.stringify([hash, salt])).toString();
}

function gameResultFromSeed(seed) {
  // warning: slightly biased because of modulo!
  const num = parseInt(seed.substr(0, 52 / 4), 16);
  return num % 15;
}

function getGameInformation(hash) {
  const seed = saltHash(hash),
    result = gameResultFromSeed(seed);
  return {
    result,
    hash,
    seed,
    color: gameResultToColor(result)
  };
}
function getPreviousResults(gameHash, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(getGameInformation(gameHash));
    gameHash = getPreviousHash(gameHash);
  }
  return results;
}

ReactDOM.render(<UI />, document.querySelector("#ui"));
