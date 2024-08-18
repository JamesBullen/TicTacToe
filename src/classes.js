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
        gameGrid.innerHTML = ' ';

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
            }
        };

        // Checks if should end in draw, determined by turns passed versus possible spaces
        if (this.turn >= this.spaces) {
            endGame(`Draw`);
        };

        // Incements turn counter and continues game
        this.turn++;
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