var possibleCombinationSum = function (arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount; i++) {
        var combinationSum = 0;
        for (var j = 0; j < listSize; j++) {
            if (i & (1 << j)) { combinationSum += arr[j]; }
        }
        if (n === combinationSum) { return true; }
    }
    return false;
};
const Stars = (props) => {
    return (
        <div className="col-5">
            {_.range(props.numberOfStars).map(i =>
                <i key={i} className="fa fa-star"></i>
            )}
        </div>
    );
};

const Button = (props) => {
    let button;
    switch (props.answerIsCorrect) {
        case true:
            button =
                <button className="btn btn-success"
                    onClick={props.acceptAnswer}
                    disabled={props.doneStatus}>
                    <i className="fa fa-check"></i>
                </button>;
            break;
        case false:
            button =
                <button className="btn btn-danger"
                    disabled={props.doneStatus}>
                    <i className="fa fa-times"></i>
                </button>;
            break;
        default:
            button =
                <button className="btn"
                    onClick={props.checkAnswer}
                    disabled={props.selectedNumbers.length === 0 || props.doneStatus}>
                    =
    	  </button>;
            break;
    }
    return (
        <div className="col-2 text-center">
            {button}
            <br /><br />
            <button className="btn btn-warning btn-sm" onClick={props.redraw}
                disabled={props.redraws === 0 || props.doneStatus}>
                <i className="fas fa-sync"></i>
                <strong className="space"> {props.redraws}</strong>
            </button>
        </div>
    );
};

const Answer = (props) => {
    return (
        <div className="col-5">
            {props.selectedNumbers.map((number, i) =>
                <span key={i} onClick={() => props.unselectNumber(number)}>{number}</span>
            )}
        </div>
    );
};

const Numbers = (props) => {
    const numberClassName = (number) => {
        if (props.usedNumbers.indexOf(number) >= 0) {
            return 'used';
        }
        if (props.selectedNumbers.indexOf(number) >= 0) {
            return 'selected';
        }
    };
    return (
        <div className="card text-center">
            <div>
                {Numbers.list.map((number, i) =>
                    <span key={i}
                          className={numberClassName(number)}
                          onClick={() => props.selectNumber(number)}>
                        {number}
                    </span>
                )}
            </div>
        </div>
    );
};


const Timer = (props) => {
    return (
        <div id="myTimer" className="text-center">
            <strong>{props.seconds}</strong> seconds remaining!
 	 </div>);
};

const DoneFrame = (props) => {
    return (
        <div className="text-center">
            <h2 className={props.doneStatus === 'You Win! Awesome! :)' ?
                "gameWin" : "gameLose"}>
                <strong>{props.doneStatus}</strong>
            </h2>
            <button className="btn btn-secondary" onClick={props.resetGame}>
                Play Again?
      </button>
        </div>
    );
};

class Game extends React.Component {
    static randomNumber = () => Math.floor(Math.random() * 9) + 1;
    static initialState = () => ({
        gameStart: false,
        selectedNumbers: [],
        randomNumberOfStars: Game.randomNumber(),
        usedNumbers: [],
        answerIsCorrect: null,
        redraws: 5,
        doneStatus: null,
        seconds: 30
    });
    constructor() {
        super();
        this.state = Game.initialState();
        this.timer = 0;
        Numbers.list = _.range(1, 10);
    }
    resetGame = () => { this.setState(Game.initialState()) };
    stopTimer = () => {
        clearInterval(this.timer);
        this.timer = 0;
    };
    startTimer = () => {
        if (this.timer == 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    };
    countDown = () => {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        this.setState({
            seconds: seconds,
        });
        if (this.state.seconds === 0) {
            this.stopTimer();
            this.timeUp();
        }
        if (this.state.doneStatus) {
            this.stopTimer();
        }
    };
    timeUp = () => {
        this.setState({
            doneStatus: "Time's Up!",
        });
    }
    selectNumber = (clickedNumber) => {
        if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
            return;
        }
        if (!this.state.gameStart) {
            this.setState(prevState => ({
                gameStart: true
            }));
            this.startTimer();
        }
        this.setState(prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
        }));
    };
    unselectNumber = (clickedNumber) => {
        this.setState(prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.filter(number => number !== clickedNumber)
        }));
    };
    checkAnswer = () => {
        this.setState(prevState => ({
            answerIsCorrect: prevState.randomNumberOfStars ===
            prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
        }))
    };
    acceptAnswer = () => {
        if (this.state.answerIsCorrect) {
            this.setState(prevState => ({
                usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
                selectedNumbers: [],
                answerIsCorrect: null,
                randomNumberOfStars: Game.randomNumber(),
            }), this.updateDoneStatus);
        }
    };
    redraw = () => {
        if (this.state.redraws === 0) {
            return;
        }
        this.setState(prevState => ({
            selectedNumbers: [],
            answerIsCorrect: null,
            randomNumberOfStars: Game.randomNumber(),
            redraws: prevState.redraws - 1,
        }), this.updateDoneStatus)
    };
    possibleSolutionsExist = ({ randomNumberOfStars, usedNumbers }) => {
        const possibleNumbers = _.range(1, 10).filter(
            number => usedNumbers.indexOf(number) === -1);
        return possibleCombinationSum(possibleNumbers, randomNumberOfStars);
    };
    updateDoneStatus = () => {
        this.setState(prevState => {
            if (prevState.usedNumbers.length === 9) {
                return { doneStatus: 'You Win! Awesome! :)' };
            }
            if (prevState.redraws === 0 && !this.possibleSolutionsExist(prevState)) {
                return { doneStatus: 'Game Over! :(' };
            }
        });
    };
    render() {
        const {
    	selectedNumbers,
            randomNumberOfStars,
            usedNumbers,
            answerIsCorrect,
            redraws,
            doneStatus,
            gameStart,
            seconds
    } = this.state;
        return (
            <div className="container">
                <h3>Play Nine</h3>
                <hr />
                <div className="row">
                    <Stars numberOfStars={randomNumberOfStars} />
                    <Button selectedNumbers={selectedNumbers}
                        checkAnswer={this.checkAnswer}
                        answerIsCorrect={answerIsCorrect}
                        acceptAnswer={this.acceptAnswer}
                        redraw={this.redraw}
                        redraws={redraws}
                        doneStatus={doneStatus} />
                    <Answer selectedNumbers={selectedNumbers}
                        unselectNumber={this.unselectNumber} />
                </div>
                <br />
                {doneStatus ?
                    <DoneFrame doneStatus={doneStatus}
                        resetGame={this.resetGame}
                        stopTimer={this.stopTimer} /> :
                    <Numbers selectedNumbers={selectedNumbers}
                        selectNumber={this.selectNumber}
                        usedNumbers={usedNumbers}
                        gameStart={gameStart} />
                }
                {gameStart ?
                    (doneStatus ?
                        <div></div> :
                        <Timer seconds={seconds} />) :
                    <div></div>}
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <Game />
            </div>
        );
    }
}

ReactDOM.render(<App />, mountNode);