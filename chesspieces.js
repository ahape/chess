/*jslint browser: true, devel: true, passfail: true, plusplus: true, sloppy: true, white: true, nomen: true */
/*global util, game, calculateMove, dom, ai */


// With the ChessPiece constructor, we essentially want to create the pieces
// that represent the pieces in the UI. These pieces will contain all data
// of the piece. Read further.

/**
 *Creates a new chesspiece
 *@class
 *@args {string} piece The type of piece being created (e.g. "Pawn")
 *@args {number} team The team this piece belongs to
 *@args {array} coords A simple two element array of [x,y] coordinates
 */
var ChessPiece = function (piece, team, coords) {
    var self = this;
    
    this.id             = Math.random().toString(16).slice(2,-1);
    this.pieceType      = piece;
    this.teamNumber     = team;
    this.active         = true;
    this.opponent       = team > 1 ? 1 : 2;
    this.position       = { x: coords[0], y: coords[1] };
    
    // `this.boardSquare` holds the HTMLTableCellElement <td> that the chess-piece is placed on.
    this.boardSquare    = dom.getBoardSquare(coords[0], coords[1]);
    this.moves          = 0;
    
    // `squareText` is the innerHTML of `boardSquare`
    this.squareText     = "<span class='team-" + this.teamNumber + "'>" + 
                            this.pieceType + 
                          "</span>";
    
    // "en passant" is a peculiar move in chess, and goes against the basic structure of
    // this project, so some sort of flag must be created.
    if (this.pieceType === "Pawn") {
        this.passant = null;
    }
    
    // `callback()` is our callback when clicking on the piece (activate it for moving).
    this.callback = function () {
        var moves;
        
        if (game.turn === self.teamNumber && !dom.clearBoardOfSelections()) {
            moves = calculateMove(self);
            dom.mapLegalMoves(moves, self);
        }
        
    };
    
    util.addEventListener.call(this.boardSquare, "click", this.callback, false);
};

// Our first prototyped method is `move`, we pass in as arguments the X and Y
// coordinates of the position we are moving to, and since castling in chess goes
// against the basic structure of this project (two pieces move simultaneously for
// the same team) we must create a flag that gets passed in.
/**
 *@param {Number} x x is our move-to x coordinate
 *@param {Number} y y is our move-to y coordinate
 *@param {Boolean} castle castle is our flag to know whether or not the move-type is abnormal.
 */
ChessPiece.prototype.move = function (x, y, castle) {
    var p1, p2, passantMove, ref,
        
        // We check to see if where our piece is landing, there is an enemy piece residing.
        opponentPiece = game.find([x, y]),
        oldCoords = [this.position.x, this.position.y],
        action = castle ? "castle" : "move";
    
    // Remove all traces of the current <td> we are on.
    this.boardSquare.innerHTML = "";
    util.removeEventListener.call(this.boardSquare, "click", this.callback);
    game.turn = this.opponent;
    this.moves++;
    
    if (opponentPiece) {
        if (opponentPiece.pieceType === "King") { action = ""; }
        opponentPiece.captured();
    }
    
    // Update to the new coordinates.
    this.position.x = x;
    this.position.y = y;
    
    /*=========== checking if castle move is in play or playable ============*/
    
    // Here we do some inference. If the king has moved two spaces, whether or
    // not it is left (-x) or right (+x) then we know something is up, and 
    // the King is "castling". If that indeed be the case, we move the Rook too.
    if (this.pieceType === "King" && Math.abs(oldCoords[0] - x) === 2) {
        if (x > oldCoords[0]) {
            game.find([7, y]).move(5, y, true);
        } else {
            game.find([0, y]).move(3, y, true);
        }
        action = "";
    }
    
    /*================= checking if eligable for promotion ==================*/
    
    // If the pawn makes it across the board we promote it to a Queen. In real
    // chess you can promote your pawn to anything, this functionality will be
    // added later.
    if (this.pieceType === "Pawn" && (y === 0 || y === 7)) {
        this.pieceType = "Queen";
        this.squareText = this.squareText.replace("Pawn", this.pieceType);
        action = "promotion";
    }
    
    /*========= checking if passant is playable or has been played ==========*/
    
    if (this.passant && this.passant[0] === x) {
        ref = this.passant[1];
        game.find([ this.passant[0], ref + (ref === 5 ? -1 : 1) ]).captured();
    }
    game.actives().forEach(function (p) {
        if (p.passant) { p.passant = null; }
    });
    
    if (this.pieceType === "Pawn" && (Math.abs(oldCoords[1] - y) === 2)) {
        p1 = game.find([x - 1, y]);
        p2 = game.find([x + 1, y]);
        
        passantMove = [x, y === 4 ? 5 : 2];
        
        if (p1 && p1.teamNumber === this.opponent && p1.pieceType === "Pawn") {
            p1.passant = passantMove;
        }
        if (p2 && p2.teamNumber === this.opponent && p2.pieceType === "Pawn") {
            p2.passant = passantMove;
        }
    } 
    
    /*============================ end of checks ============================*/
    
    this.boardSquare = dom.getBoardSquare(x, y);
    this.boardSquare.innerHTML = this.squareText;
    util.addEventListener.call(this.boardSquare, "click", this.callback);
    
    dom.clearBoardOfSelections();
    
    // Register the action to the display/scoreboard.
    dom.write(action, this, oldCoords);
    
    check(this.opponent);
    
    // If the turn is now the AI's turn, we wait one second then move the AI piece.
    if (ai && !castle && game.turn === 1) {
        setTimeout(ai.move, 1000);
    }
};

// Our last prototyped method is the capture method. This method is called when a
// piece has been captured and is to be removed from the game.
ChessPiece.prototype.captured = function () {
    this.active = false;
    this.boardSquare.innerHTML = "";
    util.removeEventListener.call(this.boardSquare, "click", this.callback);
    
    dom.write("capture", this);
    
    // If the piece being captured is a King, then the game is over.
    if (this.pieceType === "King") {
        dom.write("game-over", this);
        
        game.turn = 0;
    }
};