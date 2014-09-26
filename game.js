/*jslint browser: true, devel: true, passfail: true, plusplus: true, sloppy: true, white: true */
/*global util, ChessPiece, ai */

// We define our variable ahead of time, but since we cant do anything until dom.js loads,
// we also wait for the page to load.
var game;

util.addEventListener.call(window, "load", function () {
    
    /**
     *@returns {Array} An array of all active chesspieces.
     */
    function actives() {
        return game.team1.concat(game.team2).filter(function (p) {
            return !!p.active;
        });
    }
    
    // Finds ChessPiece by coordinates.
    /**
     *@param {Array|Function} task what to find out about the active game pieces.
     */
    function find(coords) {
        return actives().filter(function (p) {
            return p.position.x === coords[0] && p.position.y === coords[1];
        })[0];
    }
    
    // This pretty much kicks things off, all the pieces are created.
    game = {
        turn: 1,
        find: find,
        actives: actives,
        team1: [
            new ChessPiece("Pawn", 1, [0, 1]),
            new ChessPiece("Pawn", 1, [1, 1]),
            new ChessPiece("Pawn", 1, [2, 1]),
            new ChessPiece("Pawn", 1, [3, 1]),
            new ChessPiece("Pawn", 1, [4, 1]),
            new ChessPiece("Pawn", 1, [5, 1]),
            new ChessPiece("Pawn", 1, [6, 1]),
            new ChessPiece("Pawn", 1, [7, 1]),
            new ChessPiece("Rook", 1, [0, 0]),
            new ChessPiece("Knight", 1, [1, 0]),
            new ChessPiece("Bishop", 1, [2, 0]),
            new ChessPiece("Queen", 1, [3, 0]),
            new ChessPiece("King", 1, [4, 0]),
            new ChessPiece("Bishop", 1, [5, 0]),
            new ChessPiece("Knight", 1, [6, 0]),
            new ChessPiece("Rook", 1, [7, 0])
        ],
        team2: [
            new ChessPiece("Pawn", 2, [0, 6]),
            new ChessPiece("Pawn", 2, [1, 6]),
            new ChessPiece("Pawn", 2, [2, 6]),
            new ChessPiece("Pawn", 2, [3, 6]),
            new ChessPiece("Pawn", 2, [4, 6]),
            new ChessPiece("Pawn", 2, [5, 6]),
            new ChessPiece("Pawn", 2, [6, 6]),
            new ChessPiece("Pawn", 2, [7, 6]),
            new ChessPiece("Rook", 2, [0, 7]),
            new ChessPiece("Knight", 2, [1, 7]),
            new ChessPiece("Bishop", 2, [2, 7]),
            new ChessPiece("Queen", 2, [3, 7]),
            new ChessPiece("King", 2, [4, 7]),
            new ChessPiece("Bishop", 2, [5, 7]),
            new ChessPiece("Knight", 2, [6, 7]),
            new ChessPiece("Rook", 2, [7, 7])
        ]
    };
    
    // AI goes first.
    if (ai) {
        setTimeout(ai.move, 1000);
    }
    
});