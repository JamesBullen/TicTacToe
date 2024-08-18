const kernelMatrix = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
let currentGame;
let totalGames = localStorage.getItem(`totalGames`);
let gameSettings = []
let playerTokens = [];
let gameActive = true;
const gameGrid = document.querySelector(`#game`);
const optionsArea = document.querySelector(`#options`);

// Creates a new game, calls all relevant functions and sets relevant variables
function newGame(size, goal) {
    // Check to see if doesn't exist in local storage to prevent error
    if (totalGames == NaN) {
        totalGames = 0
    };
    if (currentGame) {
        saveGame();
    };
    
    // Inciments turn counter, creates new game, sets it as the active game, generates its visuals, saves new game to local storage, and allows for button inputs
    totalGames++
    const madeGame = new gamestate(size, playerTokens, goal)
    currentGame = madeGame;
    currentGame.generateGrid();
    currentGame.generatePageGrid();
    saveGame();
    gameActive = true;

    setToPressed();
};

function saveGame() {
    storedGames = JSON.parse(localStorage.getItem('storedGames'));

    if (storedGames && currentGame) {
        let currentIndex = storedGames.findIndex(a => a.id === currentGame.id)
        if (currentIndex == -1) {
            storedGames.push(currentGame);
        } else {
            storedGames[currentIndex] = currentGame;
        };
        localStorage.setItem('storedGames', JSON.stringify(storedGames));
    } else {
        localStorage.setItem('storedGames', JSON.stringify([currentGame]));
    };

    localStorage.setItem('totalGames', totalGames);
}

function loadGame(selectedGame) {
    if (currentGame) {
        saveGame();
    } else {
        storedGames = JSON.parse(localStorage.getItem('storedGames'));
    };
    let temp = storedGames[selectedGame]
    currentGame = new gamestate(temp.gridSize, temp.players, temp.winCon, temp.id, temp.gameboard, temp.turn);
    currentGame.generatePageGrid();
    gameActive = true;

    setToPressed();
};

// To be expanded, retires active game and saves game to pastGames in local storage
function quitGame() {
    endGame(`Never Finished`);
}

// Removes game from storedGames and moves in pastGames
function endGame(outcome) {
    showMessage(outcome);
    
    let pastGames = JSON.parse(localStorage.getItem('pastGames'));
    if (!pastGames) {
        pastGames = [];
    }
    pastGames.push(new gameRecord(currentGame.gameboard, outcome));
    localStorage.setItem('pastGames', JSON.stringify(pastGames));

    storedGames = JSON.parse(localStorage.getItem('storedGames'));
    let currentIndex = storedGames.findIndex(a => a.id === currentGame.id)
    storedGames.splice(currentIndex, 1);
    localStorage.setItem('storedGames', JSON.stringify(storedGames));

    setOptions();
    gameActive = false;
};

function nextMove(selectedSpace) {
    if (gameActive) {
        const checkMove= currentGame.updateGrid(currentGame.textToCoord(selectedSpace), currentGame.currentPlayer());
        if (!checkMove) {
            alert("Not a valid space");
            return;
        };
    currentGame.checkForWin(selectedSpace, currentGame.currentPlayer());
    };
};

// Sets cell of demo game to a letter, so spells 'Tic Tac Toe' when filled
function demoMove(cellID) {
    switch(cellID) {
        case "1":
            document.getElementById(cellID).innerText = "T";
            break;
        case "2":
            document.getElementById(cellID).innerText = "i";
            break;
        case "3":
            document.getElementById(cellID).innerText = "c";
            break;
        case "4":
            document.getElementById(cellID).innerText = "T";
            break;
        case "5":
            document.getElementById(cellID).innerText = "a";
            break;
        case "6":
            document.getElementById(cellID).innerText = "c";
            break;
        case "7":
            document.getElementById(cellID).innerText = "T";
            break;
        case "8":
            document.getElementById(cellID).innerText = "o";
            break;
        case "9":
            document.getElementById(cellID).innerText = "e";
            break;
    };
};

// Adds to an array all inputed player tokens from menu
function getPlayerTokens() {
    playerTokens = [];
    for (let i = 0; i < gameSettings[1]; i++) {
        playerTokens.push(document.getElementById(`player${i}`).value)
    };
}

function loadPastGame(index) {
    let pastGames = JSON.parse(localStorage.getItem('pastGames'));
    let tempObj = new gameRecord(pastGames[index].gameboard, pastGames[index].result)
    tempObj.generatePageGrid()
    showMenu(['pastMenuField'],['game'])
    setOptions();
}

// Adds 'pressed' class to buttons after being pressed to change button styling
function setToPressed() {
    const buttonList = document.querySelectorAll('.cell');
    buttonList.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('pressed');
        });
    });
}

// Generates main menu buttons on start
setOptions();
setToPressed();


// add more comments
// reduce repeated code
// reorder functions
// add easter egg feature to demo
// add ai for singleplayer