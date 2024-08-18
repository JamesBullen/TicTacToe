// Checks inputted values wont create errors, and informs user what the issue is
function checkSetupInput(size, players, goal) {
    gameSettings = [size, players, goal];

    if (!size || !players || !goal) {
        showMessage(`All fields must be filled`);
        return
    };
    // Checks if input is specificly a number and positive
    if (!(size > 0) || !(players > 0) || !(goal > 0)) {
        showMessage(`All fields must be a positive number`)
        return
    };
    if (goal > (size * size)) {
        showMessage(`Win condition must not be larger than what's possible on the board`)
        return
    };
    if (players == 1) {
        showMessage(`You can't play by yourself now`)
        return
    };

    // If no issues are found, continue to next menu
    showPlayerMenu(players);

    return true;
};


// Checks input of player tokens so no repeats are present, preventing a bug
function checkPlayersInput() {
    getPlayerTokens();

    let uniques = new Set(playerTokens)
    if (uniques.size != playerTokens.length) {
        showMessage(`No duplicate character tokens are allowed`)
        return
    };

    newGame(gameSettings[0], gameSettings[2]);

    return true;
};