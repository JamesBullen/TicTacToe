function setOptions() {
    // Sets up if button should be disabled or not
    let noSaves = '';
    let noGames = '';
    let noRecords = '';

    if (!currentGame) {
        noSaves = 'disabled';
    }
    if (localStorage.getItem('storedGames') == null || localStorage.getItem('storedGames') == '[]') {
            noGames = 'disabled';
        }
    if (localStorage.getItem('pastGames') == null) {
            noRecords ='disabled';
    };
    
    // Generate buttons based on which menu is displayed, disables irrelevant buttons
    optionsArea.innerHTML = `<button class="option" onclick="showSetupMenu()">New Game</button>
    <button class="option" onclick="saveGame()" ${noSaves}>Save Game</button>
    <button class="option" onclick="showGameSelect()" ${noGames}>Load Game</button>
    <button class="option" onclick="showGameRecords()" ${noRecords}>Past Game</button>`
};

function showSetupMenu() {
    const modalInputs = [
        {
            label: 'size',
            text: 'Board Size'
        },
        {
            label: 'players',
            text: 'Number of Players'
        },
        {
            label: 'goal',
            text: 'In a Row to Win'
        }
    ];

    const modalButtons = [
        {
            label: 'Next',
            onclick: modal => {
                if (checkSetupInput(size.value, players.value, goal.value)) {
                    document.body.removeChild(modal);
                };
            },
            triggerClose: false
        },
        {
            label: 'Cancel',
            onclick: modal => {},
            triggerClose: true
        }
    ];

    showModal('Game Options','', modalInputs, modalButtons, true);
};

function showPlayerMenu(playerCount) {
    let modalInputs = []
    for (let i = 0; i < playerCount; i++) {
        modalInputs.push({label: `player${i}`, text: `Player ${i +1}`})
    };

    const modalButtons = [
        {
            label: 'Start',
            onclick: modal => {
                if (checkPlayersInput()) {
                    document.body.removeChild(modal);
                };
            },
            triggerClose: false
        },
        {
            label: 'Back',
            onclick: modal => {
                showSetupMenu();
            },
            triggerClose: true
        },
        {
            label: 'Cancel',
            onclick: modal => {},
            triggerClose: true
        }
    ];

    showModal('Player Tokens','', modalInputs, modalButtons, true);
};

function showGameSelect() {
    let storedGames = JSON.parse(localStorage.getItem('storedGames'));
    let tempArray = []

    for (let i = 0; i < storedGames.length; i++) {
        tempArray.push(`${storedGames[i].gridSize}x${storedGames[i].gridSize}, ${storedGames[i].players.length} Players, ${storedGames[i].winCon} to win <button class="row" onclick="loadGame(${i}), setOptions('base'), showMenu(['gameMenuField'],['game'])">Select</button><br>`)
    };

    showModal('Game Select', tempArray.join())
}

function showGameRecords() {
    let pastGames = JSON.parse(localStorage.getItem('pastGames'));
    let tempArray = []

    for (let i = 0; i < pastGames.length; i++) {
        tempArray.push(`<button class="row onclick="loadPastGame(${i})">Player ${pastGames[i].result}</button>`)
    };
    
    showModal('Game Select', tempArray.join())
};