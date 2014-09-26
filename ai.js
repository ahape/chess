/*jslint browser: true, devel: true, passfail: true, plusplus: true, sloppy: true, white: true */
/*global util, ChessPiece, game, calculateMove */

// Right now the AI is operating at a super dumb level. It basically either moves randomly or goes
// for the first possible capture. It has no concept of aiming to capture the King, nor does it try
// and defend it's own King. Much more work needed to be done here.
var ai = (function (){
    
    function move() {
        var attacked, opponentPositions, pieces, chosenPiece, randomMove;
        
        // Obtains all the pieces than can actually move.
        pieces =
            game.team1.filter(function (p) {
                return !!p.active;
            })
            .map(function (p) {
                return { piece: p, moves: calculateMove(p) };
            })
            .filter(function (p_obj) {
                return !!p_obj.moves.length;
            });
        
        // Gets all the opponents positions.
        opponentPositions = 
            game.team2.filter(function (p) {
                return !!p.active;
            })
            .map(function (p) {
                return [p.position.x, p.position.y];
            });
        
        // Here we take the aggressive approach and see if we can capture a piece.
        pieces.some(function (p_obj) {
            return p_obj.moves.some(function (m) {
                var op = opponentPositions;
                
                if (!attacked) {
                    return op.some(function (p) {
                        if (m[0] === p[0] && m[1] === p[1]) {
                            p_obj.piece.move(m[0], m[1]);
                            return (attacked = true);
                        }
                        return false;
                    });
                }
                return false;
            });
        });
        
        // If we didn't capture a piece, then we resort to a random move.
        if (!attacked) {
            chosenPiece = pieces[util.random(pieces.length)];
            randomMove = chosenPiece.moves[util.random(chosenPiece.moves.length)];
            
            chosenPiece.piece.move(randomMove[0], randomMove[1]);
        }
    }
    
    return { move: move };

}());