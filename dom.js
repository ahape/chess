/*jslint browser: true, devel: true, passfail: true, plusplus: true, sloppy: true, white: true */
/*global util, ChessPiece, game */

// We create the `dom` variable, and wait until the page loads (to get access to all the elements) to
// give it value. This object is our primary means for talking to the DOM.
var dom;

util.addEventListener.call(window, "load", function() {
    
    dom = (function() {

        // `getBoardSquare` retrieves an HTMLElement by searching the DOM tree.
        /**
         *@param {Number} x
         *@param {Number} y
         *@returns {HTMLElement} the square at the specified xy coordinates.
         */
        function getBoardSquare(x, y) {
            var row = document.getElementsByTagName("TR")[y];
            return row.getElementsByTagName("TD")[x];
        }
        
        // For every possible move on the board, that <td> is marked with the 
        // "legal-move" class.
        /**
         *@param {Array} legalMoves all squares the selected piece can move to
         *@param {ChessPiece} chessPiece the chess piece that has been selected.
         */
        function mapLegalMoves(legalMoves, chessPiece) {
            
            // Hilight the selected piece.
            chessPiece.boardSquare.className = "selected";
            
            legalMoves.forEach(function (coords) {
                var potentialSquare = getBoardSquare(coords[0], coords[1]);
                potentialSquare.className = "legal-move";
                potentialSquare.onclick = function () {
                    chessPiece.move(
                        Number(potentialSquare.getAttribute("data-x")), 
                        Number(potentialSquare.getAttribute("data-y")));
                };               
            });
        }

        // Clear the board of mapped moves (legal-move class) and deselect all pieces.
        /**
         *@description changes the class of each board square that is an eligible move.
         */
        function clearBoardOfSelections() {
            var legalMoves = document.getElementsByClassName("legal-move"),
                selectedPiece = document.getElementsByClassName("selected"),
                both = Array.prototype.slice.call(legalMoves)
                        .concat(Array.prototype.slice.call(selectedPiece));
            
            if (both.length) {
                both.forEach(function (e) {
                    e.className = "";
                    e.onclick = null;
                });
                return true;
            }
            return false;
        }

        // `write` updates the scoreboard.
        /**
         *@param {String} action what kind of write request this is
         *@param {ChessPiece|null} chesspiece depends on action
         *@param {Array|ChessPiece} moveCoords depends on action
         */
        function write(action, chesspiece, moveCoords) {
            var from, to,
                span = document.createElement("SPAN"),
                score = dom.score[chesspiece.teamNumber];


            // We are creating the <span> for the next scoreboard message
            // and pre-loading it with the proper color, based on the team class.
            span.className = "team-" + chesspiece.teamNumber;

            switch (action) {

                case "move":
                    from = util.xyToChessCoords(moveCoords[0], moveCoords[1]);
                    to = util.xyToChessCoords(
                        chesspiece.position.x, chesspiece.position.y
                    );

                    span.innerHTML = "Moved " + chesspiece.pieceType + 
                                    " from " + from + " to " + to;
                    break;

                case "capture":
                    --score.innerHTML;
                    span.className = "team-" + chesspiece.opponent;
                    span.innerHTML = "Captured " + chesspiece.pieceType + "!";
                    break;
                    
                case "game-over":
                    span.innerHTML = "Gave over! This team has lost";
                    break; 
                    
                case "castle":
                    span.innerHTML = "Castled " + (chesspiece.position.x === 5  ?
                                    "Kingside" : "Queenside");
                    break;
                    
                case "promotion":
                    span.innerHTML = "Pawn promoted to Queen!";
                    break;
                case "check":
                case "checkmate":
                    span.className = "team-" + chesspiece.opponent;
                    span.innerHTML = action.charAt(0).toUpperCase() + 
                                    action.substring(1, action.length) + "...";
                    break;
                    
                default:
                    return;
            }
            
            dom.moves.appendChild(span);
            dom.moves.scrollTop += 25;
        }

        return {
            getBoardSquare: getBoardSquare,
            clearBoardOfSelections: clearBoardOfSelections,
            mapLegalMoves: mapLegalMoves,
            write: write,
            board: document.getElementById("chessboard"),
            score: document.getElementById("scores").children,
            moves: document.getElementById("moves-list")
        };
        
    }());
    
});