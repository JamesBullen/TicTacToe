const kernelMatrix = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
let currentGame;
let totalGames = localStorage.getItem(`totalGames`);
let playerTokens = [];
let gameActive = true;
const gameGrid = document.querySelector(`#game`);
const optionsArea = document.querySelector(`#options`);

// Creates object that'll store relevant game data and mutate its values as needed
class gamestate {
    constructor(gridSize, players, winCon, id=totalGames, board=null, turn=1) {
        this.id = id;
        this.gridSize = gridSize;
        this.spaces = this.gridSize * this.gridSize
        this.players = players
        this.winCon = winCon;
        this.gameboard = board;
        this.turn = turn;
    };
    
    // Fills an object array the coords of the selected game grid size, and assigns them as blank
    generateGrid() {
        if (this.gameboard == null) {
            let newGameboard = {};
        for (let row = 0; row < this.gridSize; row++) {
            for (let column = 0; column < this.gridSize; column++) {
                newGameboard[`${column},${row}`] = " ";
            }
        };
        this.gameboard = newGameboard;
        };
    };

    // Updates object array of what token is at which coord
    updateGrid(coord, token) {
        if (this.gameboard[coord] === " ") {
            this.gameboard[coord] = token;
            this.updatePageGrid(coord, token);
            return true;
        }
        return false;
    };

    // Updates visual grid to diaply newly placed tokens
    updatePageGrid(coord, token) {
        let gridSpace = document.getElementById(coord.join());
        gridSpace.innerText = token;
    };

    // Creates array of elements used to represent the gameboard
    generatePageGrid() {
        gameGrid.innerHTML = '';

        let toAppend = document.createElement(`div`);
        let tempRow = [];

        // Creates a new row for the game grid
        for (let gridRow = 0; gridRow < this.gridSize; gridRow++) {
            tempRow.push(`<div class=row>`)
            // Adds each column for the row
            for (let gridCol = 0; gridCol < this.gridSize; gridCol++) {
                // Checks if cell has already been filled and sets to active, can be expanded to auto disable used buttons
                let pressed = ""
                if (this.gameboard[`${gridCol},${gridRow}`] !== " ") {
                    pressed = "pressed"
                }
                tempRow.push(`<button onClick="nextMove(this.id)" class="cell col ${pressed}" id="${gridCol},${gridRow}">${this.gameboard[`${gridCol},${gridRow}`]}</button>`);
            };
            tempRow.push(`</div>`)
        };
        toAppend.innerHTML = tempRow.join(" ")
        gameGrid.append(toAppend);
    };

    // Checks after a token is placed if a game ending condition is met
    checkForWin(coord, token) {
        let spacesToCheck = [];

        // Creates array of surrounding coords with matching tokens
        for (let i = 0; i < kernelMatrix.length; i++) {
            let newCoord = (this.addCoord(this.textToCoord(coord), kernelMatrix[i])).join()
            if (this.gameboard[newCoord] == token) {
                spacesToCheck.push(kernelMatrix[i]);
            };
        };

        for (let i = 0; i < spacesToCheck.length; i++) {
            if (this.checkLine(coord, spacesToCheck[i], token)) {
                endGame(`${this.currentPlayer()} wins`);
                return;
            }
        };

        // Checks if should end in draw, determined by turns passed versus possible spaces
        if (this.turn >= this.spaces) {
            endGame(`Draw`);
            return;
        };

        // Incements turn counter and continues game
        this.turn++
        return;
    };

    // Returns true if a winning line length is now present in given direction, returns false if otherwise
    checkLine(start, direction, token) {
        let lineCount = this.checkDirection(start, direction, token);
        if (lineCount == this.winCon) {
            return true;
        }
        // If a win condition isnt met, it'll check the line in the oppersite direction next
        else if (this.checkDirection(start, this.mutateCoord(direction, [-1,-1]), token, lineCount) == this.winCon) {
            return true;
        }
        else {
            return false;
        }
    };

    // Recursively checks if cell in given direction has matching token, then check that cell until no match or loop equals win condition number
    checkDirection(start, direction, token, count=1) {
        if (count == this.winCon || !this.gameboard[start]) {
            return count;
        };

        let newCoord = this.addCoord(this.textToCoord(start), direction);
        if (this.gameboard[newCoord.join()] == token) {
            return this.checkDirection(newCoord.join(), direction, token, count +1);
        };

        return count;
    };

    // Converts a text value into a two number array
    textToCoord(input) {
        return input.split(",").map((a) => Number(a));
    };
    
    // Multiplies one array by another
    mutateCoord(input, mutation) {
        return input.map((a,b) => a * mutation[b]);
    };

    // Adds together the value of two arrays
    addCoord(input, mutation) {
        return input.map((a,b) => a + mutation[b]);
    };

    // Determines which players token should be placed next, using the turn count
    currentPlayer() {
        let playersTurn = this.turn % Object.keys(this.players).length;
        if (playersTurn == 0) {
            playersTurn = Object.keys(this.players).length;
        };
        return this.players[playersTurn - 1];
    };
};

// Stripped version of Gamestate class to only store what's needed in local storage and prevent accidental value mutation
class gameRecord {
    constructor(gameboard, result) {
        this.gameboard = gameboard;
        this.result = result;
    };

    // Similair function to Class Gamestate's generatePageGrid fucntion
    generatePageGrid() {
        gameGrid.innerHTML = '';
        let gridSize = Math.sqrt(Object.keys(this.gameboard).length)
        let tempRow = [];

        // Creates a new row for the game grid
        for (let gridRow = 0; gridRow < gridSize; gridRow++) {
            tempRow.push(`<div class=row>`)
            // Adds each column for the row
            for (let gridCol = 0; gridCol < gridSize; gridCol++) {
                // Checks if cell has already filled, and sets to active
                let pressed = ""
                if (this.gameboard[`${gridCol},${gridRow}`] !== " ") {
                    pressed = "pressed"
                }
                tempRow.push(`<button disabled class="cell col ${pressed}" id="${gridCol},${gridRow}">${this.gameboard[`${gridCol},${gridRow}`]}</button>`);
            };
            tempRow.push(`</div>`)
        };
        gameGrid.innerHTML = tempRow.join("")
    };
};

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
};

// To be expanded, retires active game and saves game to pastGames in local storage
function quitGame() {
    endGame(`Never Finished`);
}

// Removes game from storedGames and moves in pastGames
function endGame(outcome) {
    alert(outcome);
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

    setOptions('base');
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

function showMenu(close, open=null) {
    for (let i = 0; i < close.length; i++) {
        document.getElementById(close[i]).style.display = "none";
    };
    
    if (open) {
        for (let i = 0; i < open.length; i++) {
            if (open[i].includes('Field') || open[i].includes('game')){
                document.getElementById(open[i]).style.display = "grid";
            } else {
                document.getElementById(open[i]).style.display = "flex";
            };
        };
    };
};

// Adds to an array all inputed player tokens from menu
function getPlayerTokens(playerCount) {
    playerTokens = [];
    for (let i = 0; i < playerCount; i++) {
        playerTokens.push(document.getElementById(`player${i}`).value)
    };
    console.log(playerTokens)
}

function setPlayerMenu(playerCount) {
    let tempArray = []
    for (let i = 0; i < playerCount; i++) {
        tempArray.push(`<label for="player${i}">Player ${i + 1}'s Token</label><input type="text" id="player${i}" class>`)
    };
    document.getElementById('playerMenuField').innerHTML = tempArray.join("")
};

function setGameSelect() {
    let storedGames = JSON.parse(localStorage.getItem('storedGames'));
    let tempArray = []

    for (let i = 0; i < storedGames.length; i++) {
        tempArray.push(`<button class="row" onclick="loadGame(${i}), setOptions('base'), showMenu(['gameMenuField'],['game'])">${storedGames[i].gridSize}x${storedGames[i].gridSize}, ${storedGames[i].players.length} Players, ${storedGames[i].winCon} to win</button>`)
    };
    document.getElementById('gameMenuField').innerHTML = tempArray.join("");
}

function setGameRecords() {
    let pastGames = JSON.parse(localStorage.getItem('pastGames'));
    let tempArray = []

    for (let i = 0; i < pastGames.length; i++) {
        tempArray.push(`<button class="row" onclick="loadPastGame(${i})">Player ${pastGames[i].result}</button>`)
    };
    document.getElementById('pastMenuField').innerHTML = tempArray.join("");
};

function loadPastGame(index) {
    let pastGames = JSON.parse(localStorage.getItem('pastGames'));
    let tempObj = new gameRecord(pastGames[index].gameboard, pastGames[index].result)
    tempObj.generatePageGrid()
    showMenu(['pastMenuField'],['game'])
    setOptions('base')
}

function setOptions(menuType) {
    let noSaves = '';
    let noGames = '';
    let noRecords = '';

    if (menuType == 'base') {
        if (!currentGame) {
            noSaves = 'disabled';
        }
    if (localStorage.getItem('storedGames') == null || localStorage.getItem('storedGames') == '[]') {
            noGames = 'disabled';
        }
    if (localStorage.getItem('pastGames') == null) {
            noRecords ='disabled';
        };
    };
    
    // Generate buttons based on which menu is displayed, disables irrelevant buttons
    switch (menuType) {
        case "base":
            optionsArea.innerHTML = `<button class="option" onclick="setOptions('setup'), showMenu(['game'],['setupMenuField'])">New Game</button>
            <button class="option" onclick="saveGame()" ${noSaves}>Save Game</button>
            <button class="option" onclick="setGameSelect(), setOptions('games'), showMenu(['game'],['gameMenuField'])" ${noGames}>Load Game</button>
            <button class="option" onclick="setGameRecords(), setOptions('records'), showMenu(['game'],['pastMenuField'])" ${noRecords}>Past Game</button>`
            break;
        case "setup":
            optionsArea.innerHTML = `<button class="option" onclick="checkSetupInput(size.value, players.value, goal.value)">Next</button>
            <button class="option" onclick="setOptions('base'), showMenu(['setupMenuField'],['game'])">Cancel</button>`
            break;
        case "players":
            optionsArea.innerHTML = `<button class="option" onclick="checkPlayersInput(players.value)">Start Game</button>
            <button class="option" onclick="setOptions('setup'), showMenu(['playerMenuField'],['setupMenuField'])">Back</button>
            <button class="option" onclick="setOptions('base'), showMenu(['playerMenuField'],['game'])">Cancel</button>`
            break;
        case "games":
            optionsArea.innerHTML = `<button class="option" onclick="setOptions('base'), showMenu(['gameMenuField'],['game'])">Back</button>`
            break;
        case "records":
            optionsArea.innerHTML = `<button class="option" onclick="setOptions('base'), showMenu(['pastMenuField'],['game'])">Back</button>`
            break;
    };
};

// Checks inputted values wont create errors, and informs user what the issue is
function checkSetupInput(size, players, goal) {
    if (!size || !players || !goal) {
        alert(`All fields must be filled`);
        return
    };
    // Checks if input is specificly a number and positive
    if (!(size > 0) || !(players > 0) || !(goal > 0)) {
        alert(`All fields must be a positive number`)
        return
    };
    if (goal > (size * size)) {
        alert(`Win condition must not be larger than what's possible on the board`)
        return
    };
    if (players == 1) {
        alert(`You can't play by yourself now`)
        return
    };

    // If no issues are found, continue and execute following functions 
    setPlayerMenu(players)
    setOptions('players')
    showMenu(['setupMenuField'],['playerMenuField'])
};


// Checks input of player tokens so no repeats are present, preventing a bug
function checkPlayersInput(players) {
    getPlayerTokens(players);
    let uniques = new Set(playerTokens)
    if (uniques.size != playerTokens.length) {
        alert(`No duplicate character tokens are allowed ${uniques.size} ${playerTokens.length}`)
        return
    };
    newGame(document.getElementById('size').value, playerTokens, document.getElementById('goal').value)
    setOptions('base')
    showMenu(['playerMenuField'],['game'])
};

// Generates main menu buttons on start
setOptions('base');

// Adds 'pressed' class to buttons after being pressed to change button styling
const buttonList = document.querySelectorAll('.cell');
buttonList.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('pressed');
    });
})


// add comments
// reduce repeated code
// reorder functions
// remove alerts and replace with text in DOM
// add easter egg feature to demo
// add ai for singleplayer