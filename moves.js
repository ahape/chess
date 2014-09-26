/*jslint browser: true, devel: true, passfail: true, plusplus: true, sloppy: true, white: true */
/*global util, game, dom, ai */

// With `calculateMove()` we do the job of figuring out what can go where.
/**
 * Does all the logistics in figuring out moves.
 *
 * @args {Object} chessPiece the piece that needs move possibilities
 * @returns {Array} an array of [x,y] coordinates/possibilities
 */
function calculateMove(chessPiece) {
    var move,
        legalMoves  = [],
        pieceType   = chessPiece.pieceType, 
        xPos        = chessPiece.position.x,
        yPos        = chessPiece.position.y,
        team        = chessPiece.teamNumber, 
        moves       = chessPiece.moves,
        passant     = chessPiece.passant,
        
        // Here we create a flag telling us if we are dealing with
        // a pawn, because if so, special circumstances arise.
        pawnMode    = false,
        
        // This helper checks whether or not it is okay to move
        // the chesspiece on a desired square. If the opponent
        // has a piece on that square, this function returns true
        // but inserts the square coordinates into the legalMoves array.
        /**
         *@param {Number} x
         *@param {Number} y
         *@returns {Boolean} if the move is allowed or not.
         */
        illegalMove = function (x, y, noCapture) {
            return game.actives().some(function (e) {
                if (e.position.x === x && e.position.y === y) {
                    if (!noCapture && !pawnMode && e.teamNumber !== team) {
                        legalMoves.push([x, y]);
                    }
                    return true;
                }
                return false;
            });
        };    
    
    // How to move in any given direction. Each method pushes into legalMoves
    // all the potential squares on the board to move.
    move = {
        up: function (max) {
            var limit = (max && yPos - max >= 0 && yPos - max) || 0,
                x = xPos,
                y = yPos - 1 >= 0 ? yPos - 1 : yPos;

            while (y >= limit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                y--;
            }
        },
        right: function (max) {
            var limit = (max && xPos + max <= 7 && xPos + max) || 7,
                x = xPos + 1 <= 7 ? xPos + 1 : xPos,
                y = yPos;

            while (x <= limit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                x++;
            }
        },
        down: function (max) {
            var limit = (max && yPos + max <= 7 && yPos + max) || 7,
                x = xPos,
                y = yPos + 1 <= 7 ? yPos + 1 : yPos;

            while (y <= limit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                y++;
            }
        },
        left: function (max) {
            var limit = (max && xPos - max >= 0 && xPos - max) || 0,
                x = xPos - 1 >= 0 ? xPos - 1 : xPos,
                y = yPos;

            while (x >= limit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                x--;
            }
        },
        upRight: function (max) {
            var xLimit = (max && xPos + max <= 7 && xPos + max) || 7,
                yLimit = (max && yPos - max >= 0 && yPos - max) || 0,
                x = xPos + 1,
                y = yPos - 1;
            
            while (x <= xLimit && y >= yLimit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                x++;
                y--;
            }
        },
        downRight: function (max) {
            var xLimit = (max && xPos + max <= 7 && xPos + max) || 7,
                yLimit = (max && yPos + max <= 7 && yPos + max) || 7,
                x = xPos + 1,
                y = yPos + 1;
            
            while (x <= xLimit && y <= yLimit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                x++;
                y++;
            }
        },
        upLeft: function (max) {
            var xLimit = (max && xPos - max >= 0 && xPos - max) || 0,
                yLimit = (max && yPos - max >= 0 && yPos - max) || 0,
                x = xPos - 1,
                y = yPos - 1;

            while (x >= xLimit && y >= yLimit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                x--;
                y--;
            }
        },
        downLeft: function (max) {
            var xLimit = (max && xPos - max >= 0 && xPos - max) || 0,
                yLimit = (max && yPos + max <= 7 && yPos + max) || 7,
                x = xPos - 1,
                y = yPos + 1;
            
            while (x >= xLimit && y <= yLimit) {
                if (illegalMove(x, y)) {return;}
                legalMoves.push([x, y]);
                x--;
                y++;
            }
        },
        knightL: function () {
            var x = xPos, y = yPos,
                combos = [
                    [x + 1, y + 2],
                    [x + 1, y - 2],
                    [x - 1, y + 2],
                    [x - 1, y - 2],
                    [x + 2, y + 1],
                    [x + 2, y - 1],
                    [x - 2, y + 1],
                    [x - 2, y - 1]
                ];

            combos.forEach(function (coords, i) {
                if (coords[0] >= 0 && coords[0] <= 7 
                    && coords[1] >= 0 && coords[1] <= 7
                    && !illegalMove(coords[0], coords[1])) {
                    legalMoves.push([ coords[0], coords[1] ]);    
                }
            });
        },
        castle: function () {
            var queensideRook = game.find([0, yPos]),
                kingsideRook = game.find([7, yPos]);
            
            if (queensideRook 
                && !queensideRook.moves 
                && !illegalMove(xPos - 3, yPos, true)
                && !illegalMove(xPos - 2, yPos, true)
                && !illegalMove(xPos - 1, yPos, true)) {
                legalMoves.push([xPos - 2, yPos]);
            }
            if (kingsideRook 
                && !kingsideRook.moves 
                && !illegalMove(xPos + 2, yPos, true)
                && !illegalMove(xPos + 1, yPos, true)) {
                legalMoves.push([xPos +  2, yPos]);
            }
        }
    };

    // Now we figure out what piece we are dealing with, and how it can act.
    switch (pieceType) {
        case "Pawn":
            if (passant) {
                legalMoves.push(passant);        
            }
            if (team === 1) {
                if (moves === 0) {
                    pawnMode = true;
                    move.down(2);
                    pawnMode = false;
                }
                illegalMove(xPos - 1, yPos + 1);
                illegalMove(xPos + 1, yPos + 1);
                pawnMode = true;
                move.down(1);
            } else {
                if (moves === 0) {
                    pawnMode = true;
                    move.up(2);
                    pawnMode = false;
                }
                illegalMove(xPos - 1, yPos - 1);
                illegalMove(xPos + 1, yPos - 1);
                pawnMode = true;
                move.up(1);
            }
            break;
        case "Rook":
            move.up();
            move.right();
            move.down();
            move.left();
            break;
        case "Bishop":
            move.upRight();
            move.upLeft();
            move.downRight();
            move.downLeft();
            break;
        case "Knight":
            move.knightL();
            break;
        case "Queen":
            move.up();
            move.right();
            move.down();
            move.left();
            move.upRight();
            move.upLeft();
            move.downRight();
            move.downLeft();
            break;
        case "King":
            if (!moves) { move.castle(); }
            move.up(1);
            move.right(1);
            move.down(1);
            move.left(1);
            move.upRight(1);
            move.upLeft(1);
            move.downRight(1);
            move.downLeft(1);
            break;
        default:
            break;
    }
    
    // We return an array of all the possible moves for the piece given
    return legalMoves;
}

/**
 * Checks if there are any checks on the King.
 *
 * @param {Number} kingTeam kingTeam is the team of the King that needs defensive analysis.
 */
function check(kingTeam) {
	// Need to grab that teams king piece	
	var actives = game.actives(),
		king = actives.filter(function (cp) {
			return cp.pieceType === "King" && cp.teamNumber === kingTeam;
		}).pop(),

		// We grab his coords and then shake down the other team
		// for potential moves to those coordinates.
		kingLocation = [king.position.x, king.position.y],
		kingMoves = calculateMove(king),
		kingNoSafeMoves = false,
		threats = [],
		enemyMoves = [],
		enemyPieces = actives.filter(function (cp) {
			return cp.teamNumber !== kingTeam;
		}),
		checked = false,
        checkmate = false;
    
	// Now we need to figure out if this king is checkable
	// and if so, by which pieces?
	checked = !enemyPieces.every(function (cp) {
		var pieceMoves = calculateMove(cp);
		enemyMoves = enemyMoves.concat(pieceMoves);
		
		return pieceMoves.every(function (mv) {
			return kingMoves.every(function (kmv) {
				if (kmv[0] !== mv[0] || kmv[1] !== mv[1]) {
					return true;
				}
				threats.push(cp);
				return false;
			});
		});
	});
	
	if (checked) {	
		// TODO: Make checkmate functionality more robust. Things worth considering:
        // a. Need to account for if a piece can sacrifice itself to save the King from check.
        // b. Need to account for if a piece captures the piece checking the King.
        // c. Need to account for if a piece sacrifices itself but yet opens up another
        // path for a piece to capture the King.
        // d. Need to account for if the King castles.
	
		// First: is the king immobile/going to get attacked with any move?
		kingNoSafeMoves = kingMoves.every(function (kmv) {
			return enemyMoves.some(function (mv) {
				return mv[0] === kmv[0] && mv[1] === kmv[1];
			});
		});

		if (kingNoSafeMoves) {
			dom.write("checkmate", king);
		} else {
			dom.write("check", king);
		}
	}
}




