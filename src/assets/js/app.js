let container = document.querySelector('.container');

let pushToUITimer,
    timerArray = [],
    mergedPredictedPlace = [],
    trayCount = {
        whitePlayer: 1,
        blackPlayer: 1
    };

class Places {
    info = {
        rook: [[], []],
        knight: [[], []],
        bishop: [[], []],
        queen: [[]],
        king: [[]],
        ordPawn: [[], [], [], [], [], [], [], []]
    }
}

class Player {
    info = {
        pawnPlace: {
            rook: [{row: null, col: null}, {row: null, col: null}],
            knight: [{row: null, col: null}, {row: null, col: null}],
            bishop: [{row: null, col: null}, {row: null, col: null}],
            queen: [{row: null, col: null}],
            king: [{row: null, col: null}],
            ordPawn: [
                {row: null, col: null},
                {row: null, col: null},
                {row: null, col: null},
                {row: null, col: null},
                {row: null, col: null},
                {row: null, col: null},
                {row: null, col: null},
                {row: null, col: null}
            ]
        },
        predictedKingPlace: new Places().info,
        predictedPlace: new Places().info,
        allPossiblePlace: new Places().info,
        pathKingArr: new Places().info,
        overPawns: {
            rook: [false, false],
            knight: [false, false],
            bishop: [false, false],
            queen: [false],
            king: [false],
            ordPawn: [false, false, false, false, false, false, false, false]
        }
    }
}

let data = {
    activePawn: {
        allowPositions: [],
        color: null,
        type: null,
        pos: {row: null, col: null},
        num: null
    },
    black: function(a, b) {
      return {arithmeticOp: a-b, logicOp: a>=b}
    },
    white: function(a, b) {
        return {arithmeticOp: a+b, logicOp: a<=b}
    },
    isKingChecked: {white: false, black: false},
    kingCheckArr: {white: [], black: []},
    pathToKing: {white: [], black: []},
    curPawnPos: 7,
    validTarget: null,
    whitePlayer: new Player().info,
    blackPlayer: new Player().info,
    allowedMoves: {
        bishop: {
            isCrossAllowed: true
        },
        rook: {
            isPlusAllowed: true
        },
        queen: {
            isPlusAllowed: true,
            isCrossAllowed: true
        },
        knight: {
            isKnight: true
        },
        king: {
            isKing: true
        },
        ordPawn: {
            isOrdPawn: true
        }
    }
};

allPawnOnBoard();
possiblePlaceArr();
pathKingArr();

/********************************************* ********************************************
 *                                    EVENT HANDLERS                                     *
 ****************************************************************************************/

document.addEventListener('click', function (e) {

    // TODO: check and get the Target
    let target = checkAndGetTarget(e);

    if(isItCum(e)) {
        let finalPathArr = loopForRowColString(pathArray(target));

        movePawn({
            sourcePos: rowColToString(data.activePawn.pos),
            pawn: {
                type: data.activePawn.type,
                color: data.activePawn.color,
                num: data.activePawn.num
            },
            jumpingLines: finalPathArr
        });

        target.isTargetValid ? placePawnsOnTray(target) : -1;
        putAndPlacePawnInDOM(finalPathArr);

        removeCumClass('cum', true);
        updateMovesHandler();

        isKingCheck();

        kingCheckedArray(data.activePawn.color);
        kingCheckedArray(opposeColor(data.activePawn.color));
        addCheckedClass();

        possiblePlaceArr();

        pathKingArr();

    } else if(isItSameTarget(target)) {
        removeCumClass('cum', true);
        noActivePawn();
    } else {
        removeCumClass('cum', true);
        updateActivePawn(target);

        // TODO: perform operation on the Target
        if(target.isTargetValid) {
            target.validTarget.parentElement.classList.add('thisOne');
        }

        if(data.isKingChecked[target.targetColor]) {
            target.isTargetValid ? allowPosFn(target.targetType, target.pos, target.targetColor, target.num, false, true) : null;
            console.log('Your king is in danger, Secure it');
        } else {
            if(data.activePawn && !isTargetOnPathToKing(data.activePawn.pos, data.activePawn.color)) {
                target.isTargetValid ? allowPosFn(target.targetType, target.pos, target.targetColor, target.num, false, false) : null;
            } else {
                updatePathArrayToKing(target.pos, target.targetType, target.targetColor, target.num);
                target.isTargetValid ? allowPosFn(target.targetType, target.pos, target.targetColor, target.num, true, false) : null;
                // target.isTargetValid ? guardKingMoveFn(target.targetType, target.pos, target.targetColor) : null;
            }
        }

    }
});

/*****************************************************************************************
 *                                ACTUAL PAWN FUNCTIONS                                  *
 ****************************************************************************************/
// Checked King

function loopKingChecked(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].count; j++) {
            loopThroughPredictedPlaces(arr[i].name, color, j);
        }
    }
}

function isKingCheck() {
    let arr = [
        {name: 'rook', count: 2},
        {name: 'bishop', count: 2},
        {name: 'knight', count: 2},
        {name: 'queen', count: 1},
        {name: 'king', count: 1},
        {name: 'ordPawn', count: 8}
    ];
    data.kingCheckArr.white = [];
    data.kingCheckArr.black = [];
    loopKingChecked(arr, 'white');
    loopKingChecked(arr, 'black');
}

function kingCheckedArray(color) {
    let arr = data.kingCheckArr[color];
    for(let i = 0; i < arr.length; i++) {
        if(arr[i]) {
            data.isKingChecked[color] = true;
            return;
        }
    }
    data.isKingChecked[color] = false;
}

function loopThroughPredictedPlaces(pawnType, color, num) {
    let arr = data[`${color}Player`].predictedPlace[pawnType][num];
    let kingPlace = data[`${opposeColor(color)}Player`].pawnPlace.king[0];
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            if(arr[i][j].row === kingPlace.row && arr[i][j].col === kingPlace.col) {
                data.kingCheckArr[`${opposeColor(color)}`].push(true);
                return;
            }
        }
    }
    data.kingCheckArr[`${opposeColor(color)}`].push(false);
}

function addCheckedClass() {
    if(data.isKingChecked.white) {
        let curPos = data.whitePlayer.pawnPlace.king[0];
        addCumClass(curPos, 'checkedKing', false);
    } else if(data.isKingChecked.black) {
        let curPos = data.blackPlayer.pawnPlace.king[0];
        addCumClass(curPos, 'checkedKing', false);
    } else {
        removeCumClass('checkedKing', false);
    }
}

// Placing Pawn On Tray

function placePawnsOnTray(pawn) {
    let pawnDOM = document.querySelector(`.cards__item[data-id="${rowColToString(pawn.pos)}"]`);
    pawnDOM.removeChild(pawnDOM.childNodes[pawnDOM.childNodes.length-1]);

    let pawnToMove = document.querySelector(`.pawn.${pawn.targetType}.${pawn.targetColor}.abs[data-color="${pawn.targetColor}"][data-no="${pawn.num}"]`);
    let trayPosEl = document.querySelector(`.checkBox.${pawn.targetColor}[data-check="${trayCount[`${pawn.targetColor}Player`]}"]`);

    data[`${pawn.targetColor}Player`].pawnPlace[pawn.targetType][pawn.num-1] = data[`${pawn.targetColor}Player`].allPossiblePlace[pawn.targetType][pawn.num-1] = data[`${pawn.targetColor}Player`].predictedKingPlace[pawn.targetType][pawn.num-1] = -1;
    data[`${pawn.targetColor}Player`].pathKingArr[pawn.targetType][pawn.num-1] = -1;
    data[`${pawn.targetColor}Player`].predictedPlace[pawn.targetType][pawn.num-1] = -1;
    data[`${pawn.targetColor}Player`].overPawns[pawn.targetType][pawn.num-1] = true;
    // console.log(data[`${pawn.targetColor}Player`].pawnPlace[pawn.targetType][pawn.num-1]);
    trayCount[`${pawn.targetColor}Player`]++;
    let dimensions = getCoordinates(trayPosEl);
    pawnToMove.style.top = `${dimensions.topEl}px`;
    pawnToMove.style.left = `${dimensions.leftEl}px`;
}

function putAndPlacePawnInDOM(arr) {
    let prevPlace = document.querySelector(`.cards__item[data-id="${rowColToString(data.activePawn.pos)}"]`);
    let nextPlace = document.querySelector(`.cards__item[data-id="${arr[arr.length-1]}"]`);
    nextPlace.appendChild(prevPlace.childNodes[prevPlace.childNodes.length-1]);

    let prevPlaceChildren = prevPlace.childNodes[prevPlace.childNodes.length-1];

    if(prevPlaceChildren.classList !== undefined) {
        if(prevPlaceChildren.classList.contains('pawn')) {
            prevPlace.removeChild(prevPlaceChildren);
        }
    }

    data[`${data.activePawn.color}Player`].pawnPlace[data.activePawn.type][data.activePawn.num-1] = {row: parseInt(nextPlace.dataset.row), col: parseInt(nextPlace.dataset.col)};
}

function pathArray(tar) {
    let allowPos = data.activePawn.allowPositions,
        prepArr,
        breakIt;
    for(let i = 0; i < allowPos.length; i++) {
        for(let j = 0; j < allowPos[i].length; j++) {
            prepArr = [];
            for(let k = 0; k < allowPos[i][j].length; k++) {
                prepArr.push(allowPos[i][j][k]);
                if(allowPos[i][j][k] !== null) {
                    if(allowPos[i][j][k].row === tar.pos.row && allowPos[i][j][k].col === tar.pos.col){
                        breakIt = true;
                        break;
                    }
                }
            }
            if(breakIt)
                break;
        }
        if(breakIt)
            break;
    }
    return prepArr;
}

function rowColToString(tar) {
    return `${tar.row}${tar.col}`;
}

function loopForRowColString(arr) {
    let finalStringArr = [];
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] !== null) {
            finalStringArr.push(rowColToString(arr[i]));
        }
    }
    return finalStringArr;
}

function isItCum(e) {
    return (e.path[0].classList.contains('cum') || e.path[1].classList.contains('cum') || e.path[0].classList.contains('cumOver') || e.path[1].classList.contains('cumOver'));
}

function isItSameTarget(tar) {
    return (tar !== undefined && tar.isTargetValid && tar.pos.row === data.activePawn.pos.row && tar.pos.col === data.activePawn.pos.col);
}

function checkAndGetTarget(e) {
    let isTargetValid = false,
        validTarget = null,
        targetColor = null,
        pos = {row: null, col: null},
        targetType = null,
        num = null;
    for(let i = 0; i < 2; i++) {
        if(e.path[i].classList !== undefined) {
            if(e.path[i].classList.contains('pawn')) {
                validTarget = e.path[i];
                targetType = validTarget.classList[1];
                targetColor = validTarget.dataset.color;
                num = validTarget.dataset.no;
                pos.row = parseInt(validTarget.parentElement.dataset.row);
                pos.col = parseInt(validTarget.parentElement.dataset.col);
                isTargetValid = e.path[i].classList.contains('pawn');
                break;
            }
            pos.row = parseInt(e.path[i].parentElement.dataset.row);
            pos.col = parseInt(e.path[i].parentElement.dataset.col);
        }
    }
    if(!isTargetValid) {
        for (let i = 0; i < e.path[0].childNodes.length; i++) {
            if (e.path[i].childNodes[i].classList !== undefined) {
                if (e.path[0].childNodes[i].classList.contains('pawn')) {
                    validTarget = e.path[0].childNodes[i];
                    targetType = validTarget.classList[1];
                    targetColor = validTarget.dataset.color;
                    num = validTarget.dataset.no;
                    pos.row = parseInt(validTarget.parentElement.dataset.row);
                    pos.col = parseInt(validTarget.parentElement.dataset.col);
                    isTargetValid = e.path[0].childNodes[i].classList.contains('pawn');
                    break;
                }
                pos.row = parseInt(e.path[0].childNodes[i].parentElement.dataset.row);
                pos.col = parseInt(e.path[0].childNodes[i].parentElement.dataset.col);
            }
        }
    }
    return {isTargetValid, validTarget, pos, targetType, targetColor, num}
}

function updateActivePawn(target) {
    data.activePawn.color = target.targetColor;
    data.activePawn.pos = {row: target.pos.row, col: target.pos.col};
    data.activePawn.type =target.targetType;
    data.activePawn.allowPositions = [];
    target.isTargetValid ? data.activePawn.num = target.validTarget.dataset.no : -1;
}

function noActivePawn() {
    data.activePawn = {
        allowPositions: [],
        color: null,
        type: null,
        num: null,
        pos: {row: null, col: null},
    }
}

/*****************************************************************************************
 *                              ACTUAL POSITIONING FUNCTIONS                             *
 ****************************************************************************************/

function ordPawnMovement(curPos, color) {
    let loopCount = null,
        top = [],
        topLeft = [],
        topRight = [],
        topPossible = [],
        topLeftPossible = [],
        topRightPossible = [],
        topLeftKingPredictions = [],
        topRightKingPredictions = [];

    isOrdPawnOnStartPos(curPos, color) ? loopCount = 2 : loopCount = 1;

    for(let i = data[color](curPos.row, 1).arithmeticOp; data[color](i, data[color](curPos.row, loopCount).arithmeticOp).logicOp; i = data[color](i, 1).arithmeticOp) {
        if(i > 0 && i < 9) {
            if(!isPlaceBusy({row: i, col: curPos.col}).busy) {
                topPossible.push({row: i, col: curPos.col});
                top.push({row: i, col: curPos.col});
            }
            else
                break;
        }
    }

    let mulArr = [
        {check: curPos.row+1 < 9 && curPos.col+1 < 9, place: {row: curPos.row+1, col: curPos.col+1}, pos: topLeft, kingPredictions: topLeftKingPredictions, possible: topLeftPossible},
        {check: curPos.row+1 < 9 && curPos.col-1 > 0, place: {row: curPos.row+1, col: curPos.col-1}, pos: topRight, kingPredictions: topRightKingPredictions, possible: topRightPossible},
        {check: curPos.row-1 > 0 && curPos.col-1 > 0, place: {row: curPos.row-1, col: curPos.col-1}, pos: topLeft, kingPredictions: topLeftKingPredictions, possible: topLeftPossible},
        {check: curPos.row-1 > 0 && curPos.col+1 < 9, place: {row: curPos.row-1, col: curPos.col+1}, pos: topRight, kingPredictions: topRightKingPredictions, possible: topRightPossible}
    ];

    if(color === 'white') {
        ordPawnPush(mulArr[0], color);
        ordPawnPush(mulArr[1], color);
    } else if(color === 'black') {
        ordPawnPush(mulArr[2], color);
        ordPawnPush(mulArr[3], color);
    }

    return [{top, topLeft, topRight}, {topLeftKingPredictions, topRightKingPredictions}, {topPossible, topLeftPossible, topRightPossible}];
}

function ordPawnPush(place, color) {
    if(place.check) {
        let placeToCheck = place.place;
        place.kingPredictions.push(placeToCheck);
        if(isPlaceBusy(placeToCheck).busy) {
            if(isPlaceBusy(placeToCheck).color !== color) {
                place.possible.push(placeToCheck);
                place.pos.push(placeToCheck);
            }
        }
    }
}

function plus(curPos, color) {
    let rightPath = [],
        leftPath = [],
        topPath = [],
        bottomPath = [],
        rightPossible = [],
        leftPossible = [],
        topPossible = [],
        bottomPossible = [],
        rightKing = [],
        leftKing = [],
        topKing = [],
        bottomKing = [];

    // Towards the bottom
    for(let i = curPos.row+1; i < 9; i++){
        let curPlaceToCheck = {row: i, col: curPos.col};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                bottomPath.push(curPlaceToCheck);
                break;
            } else {
                bottomKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            bottomKing.push(curPlaceToCheck);
            bottomPath.push(curPlaceToCheck);
        }
    }
    for(let i = curPos.row+1; i < 9; i++){
        let curPlaceToCheck = {row: i, col: curPos.col};
        bottomPossible.push(curPlaceToCheck);
    }

    // Towards the top
    for(let i = curPos.row-1; i > 0; i--){
        let curPlaceToCheck = {row: i, col: curPos.col};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                topPath.push(curPlaceToCheck);
                break;
            } else {
                topKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            topKing.push(curPlaceToCheck);
            topPath.push(curPlaceToCheck);
        }
    }
    for(let i = curPos.row-1; i > 0; i--){
        let curPlaceToCheck = {row: i, col: curPos.col};
        topPossible.push(curPlaceToCheck);
    }

    // Towards the right
    for(let i = curPos.col+1; i < 9; i++) {
        let curPlaceToCheck = {row: curPos.row, col: i};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                rightPath.push(curPlaceToCheck);
                break;
            } else {
                rightKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            rightKing.push(curPlaceToCheck);
            rightPath.push(curPlaceToCheck);
        }
    }
    for(let i = curPos.col+1; i < 9; i++) {
        let curPlaceToCheck = {row: curPos.row, col: i};
        rightPossible.push(curPlaceToCheck);
    }

    // Towards the left
    for(let i = curPos.col-1; i > 0; i--) {
        let curPlaceToCheck = {row: curPos.row, col: i};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                leftPath.push(curPlaceToCheck);
                break;
            } else {
                leftKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            leftKing.push(curPlaceToCheck);
            leftPath.push(curPlaceToCheck);
        }
    }
    for(let i = curPos.col-1; i > 0; i--) {
        let curPlaceToCheck = {row: curPos.row, col: i};
        leftPossible.push(curPlaceToCheck);
    }

    // Towards the opposition area
    // for(let i = curPos.row+1)

    return [{topPath, bottomPath, rightPath, leftPath},
        {topKing, bottomKing, rightKing, leftKing},
        {topPossible, bottomPossible, rightPossible, leftPossible}];
}

function cross(curPos, color) {
    let rightBottomPath = [],
        leftBottomPath = [],
        rightTopPath = [],
        leftTopPath = [],
        rightBottomPossible = [],
        leftBottomPossible = [],
        rightTopPossible = [],
        leftTopPossible = [],
        rightBottomKing = [],
        leftBottomKing = [],
        rightTopKing = [],
        leftTopKing = [];

    // Towards Right Bottom
    for (let i = curPos.row+1, j = curPos.col+1; i < 9 && j < 9; i++, j++) {
        let curPlaceToCheck = {row: i, col: j};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                rightBottomPath.push(curPlaceToCheck);
                break;
            }
            else{
                rightBottomKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            rightBottomKing.push(curPlaceToCheck);
            rightBottomPath.push(curPlaceToCheck);
        }
    }

    for (let i = curPos.row+1, j = curPos.col+1; i < 9 && j < 9; i++, j++) {
        let curPlaceToCheck = {row: i, col: j};
        rightBottomPossible.push(curPlaceToCheck);
    }

    // Towards Right Top
    for (let i = curPos.row-1, j = curPos.col-1; i > 0 && j > 0; i--, j--) {
        let curPlaceToCheck = {row: i, col: j};
        if(isPlaceBusy(curPlaceToCheck).busy) {
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                leftTopPath.push(curPlaceToCheck);
                break;
            } else{
                leftTopKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            leftTopKing.push(curPlaceToCheck);
            leftTopPath.push(curPlaceToCheck);
        }
    }
    for (let i = curPos.row-1, j = curPos.col-1; i > 0 && j > 0; i--, j--) {
        let curPlaceToCheck = {row: i, col: j};
        leftTopPossible.push(curPlaceToCheck);
    }

    // Towards Left Bottom
    for (let i = curPos.row+1, j = curPos.col-1; i < 9 && j > 0; i++, j--) {
        let curPlaceToCheck = {row: i, col: j};
        if(isPlaceBusy(curPlaceToCheck).busy) {
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                leftBottomPath.push(curPlaceToCheck);
                break;
            } else{
                leftBottomKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            leftBottomKing.push(curPlaceToCheck);
            leftBottomPath.push(curPlaceToCheck);
        }
    }
    for (let i = curPos.row+1, j = curPos.col-1; i < 9 && j > 0; i++, j--) {
        let curPlaceToCheck = {row: i, col: j};
        leftBottomPossible.push(curPlaceToCheck);
    }

    // Towards Left Top
    for (let i = curPos.row-1, j = curPos.col+1; i > 0 && j < 9; i--, j++) {
        let curPlaceToCheck = {row: i, col: j};
        if(isPlaceBusy(curPlaceToCheck).busy) {
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                rightTopPath.push(curPlaceToCheck);
                break;
            } else{
                rightTopKing.push(curPlaceToCheck);
                break;
            }
        }
        else{
            rightTopKing.push(curPlaceToCheck);
            rightTopPath.push(curPlaceToCheck);
        }
    }
    for (let i = curPos.row-1, j = curPos.col+1; i > 0 && j < 9; i--, j++) {
        let curPlaceToCheck = {row: i, col: j};
        rightTopPossible.push(curPlaceToCheck);
    }

    return [{rightBottomPath, rightTopPath, leftBottomPath, leftTopPath},
        {rightBottomKing, rightTopKing, leftBottomKing, leftTopKing},
        {rightBottomPossible, rightTopPossible, leftBottomPossible, leftTopPossible}];
}

function knight(curPos, color) {
    let topLeft = [],
        topRight = [],
        rightTop = [],
        rightBottom = [],
        bottomRight = [],
        bottomLeft = [],
        leftBottom = [],
        leftTop = [],
        topLeftPossible = [],
        topRightPossible = [],
        rightTopPossible = [],
        rightBottomPossible = [],
        bottomRightPossible = [],
        bottomLeftPossible = [],
        leftBottomPossible = [],
        leftTopPossible = [];

    // TODO: Knight Overlap Checking for friendly or enemy pawns
    let arr = [
        {check: curPos.row-2 > 0 && curPos.col-1 > 0, actualPlace: {row: curPos.row-2, col: curPos.col-1}, color: color, arr: topLeft, possiblePlace: topLeftPossible},
        {check: curPos.row-2 > 0 && curPos.col+1 < 9, actualPlace: {row: curPos.row-2, col: curPos.col+1}, color: color, arr: topRight, possiblePlace: topRightPossible},
        {check: curPos.row-1 > 0 && curPos.col+2 < 9, actualPlace: {row: curPos.row-1, col: curPos.col+2}, color: color, arr: rightTop, possiblePlace: rightTopPossible},
        {check: curPos.row+1 < 9 && curPos.col+2 < 9, actualPlace: {row: curPos.row+1, col: curPos.col+2}, color: color, arr: rightBottom, possiblePlace: rightBottomPossible},
        {check: curPos.row+2 < 9 && curPos.col+1 < 9, actualPlace: {row: curPos.row+2, col: curPos.col+1}, color: color, arr: bottomRight, possiblePlace: bottomRightPossible},
        {check: curPos.row+2 < 9 && curPos.col-1 > 0, actualPlace: {row: curPos.row+2, col: curPos.col-1}, color: color, arr: bottomLeft, possiblePlace: bottomLeftPossible},
        {check: curPos.row+1 < 9 && curPos.col-2 > 0, actualPlace: {row: curPos.row+1, col: curPos.col-2}, color: color, arr: leftBottom, possiblePlace: leftBottomPossible},
        {check: curPos.row-1 > 0 && curPos.col-2 > 0, actualPlace: {row: curPos.row-1, col: curPos.col-2}, color: color, arr: leftTop, possiblePlace: leftTopPossible}
    ];
    knightLooping(arr, knight);
    return [
        {topLeft, topRight, rightTop, rightBottom, bottomRight, bottomLeft, leftBottom, leftTop},
        {topLeftPossible, topRightPossible, rightTopPossible, rightBottomPossible, bottomRightPossible, bottomLeftPossible, leftBottomPossible, leftTopPossible}
    ];
}

function king(curPos, color) {
    let topLeft = [],
        top = [],
        topRight = [],
        right = [],
        bottomRight = [],
        bottom = [],
        bottomLeft = [],
        left = [],
        topLeftKing = [],
        topKing = [],
        topRightKing = [],
        rightKing = [],
        bottomRightKing = [],
        bottomKing = [],
        bottomLeftKing = [],
        leftKing = [];

    let arr = [
        {check: curPos.row-1 > 0 && curPos.col-1 > 0, place: {row: curPos.row-1, col: curPos.col-1}, arr: topLeft, kingPredictedArr: topLeftKing},
        {check: curPos.row-1 > 0, place: {row: curPos.row-1, col: curPos.col}, arr: top, kingPredictedArr: topKing},
        {check: curPos.row-1 > 0 && curPos.col+1 < 9, place: {row: curPos.row-1, col: curPos.col+1}, arr: topRight, kingPredictedArr: topRightKing},
        {check: curPos.col+1 < 9, place: {row: curPos.row, col: curPos.col+1}, arr: right, kingPredictedArr: rightKing},
        {check: curPos.row+1 < 9 && curPos.col+1 < 9, place: {row: curPos.row+1, col: curPos.col+1}, arr: bottomRight, kingPredictedArr: bottomRightKing},
        {check: curPos.row+1 < 9, place: {row: curPos.row+1, col: curPos.col}, arr: bottom, kingPredictedArr: bottomKing},
        {check: curPos.row+1 < 9 && curPos.col-1 > 0, place: {row: curPos.row+1, col: curPos.col-1}, arr: bottomLeft, kingPredictedArr: bottomLeftKing},
        {check: curPos.col-1 > 0, place: {row: curPos.row, col: curPos.col-1}, arr: left, kingPredictedArr: leftKing},
    ];

    kingLooping(arr, color);
    return [{topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left}, {topLeftKing, topKing, topRightKing, rightKing, bottomRightKing, bottomKing, bottomLeftKing, leftKing}];
}

function allPossiblePlaces(pawnType, curPos, color, num) {
    data[`${color}Player`].allPossiblePlace[pawnType][num] = [];
    if(data.allowedMoves[pawnType].isCrossAllowed){
        let positions = cross(curPos, color);
        data[`${color}Player`].allPossiblePlace[pawnType][num].push(...Object.values(positions[2]));
    }
    if(data.allowedMoves[pawnType].isPlusAllowed){
        let positions = plus(curPos, color);
        data[`${color}Player`].allPossiblePlace[pawnType][num].push(...Object.values(positions[2]));
    }
    if(data.allowedMoves[pawnType].isKnight) {
        let positions = knight(curPos, color);
        data[`${color}Player`].allPossiblePlace[pawnType][num].push(...Object.values(positions[1]));
    }
    if(data.allowedMoves[pawnType].isOrdPawn) {
        let positions = ordPawnMovement(curPos, color);
        data[`${color}Player`].allPossiblePlace[pawnType][num].push(...Object.values(positions[2]));
    }
    if(data.allowedMoves[pawnType].isKing) {
        let positions = king(curPos, color);
        data[`${color}Player`].allPossiblePlace[pawnType][num].push(...Object.values(positions[0]));
    }
}

function loopPossiblePlaces(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].count; j++) {
            allPossiblePlaces(arr[i].name, data[`${color}Player`].pawnPlace[arr[i].name][j], color, j);
        }
    }
}

function possiblePlaceArr() {
    let arr = [
        {name: 'rook', count: 2},
        {name: 'bishop', count: 2},
        {name: 'knight', count: 2},
        {name: 'queen', count: 1},
        {name: 'king', count: 1},
        {name: 'ordPawn', count: 8}
    ];

    loopPossiblePlaces(arr, 'white');
    loopPossiblePlaces(arr, 'black');
}

function isTargetOnPathToKing(curPos, color) {
    if(color !== null) {
        for(let i = 0; i < data.pathToKing[color].length; i++) {
            for(let j = 0; j < data.pathToKing[color][i].length; j++) {
                if(curPos.row === data.pathToKing[color][i][j].row && curPos.col === data.pathToKing[color][i][j].col) {
                    return true;
                }
            }
        }
    }
    return false;
}

function updatePathArrayToKing(curPos, pawnType, color, num) {
    if(color !== null) {
        data[`${color}Player`].pathKingArr[pawnType][num-1] = [];
        let arr = data.pathToKing[color];
        for(let i = 0; i < arr.length; i++) {
            let arr1 = arr[i].slice(1, -1);
            for(let j = 0; j < arr1.length; j++) {
                if(curPos.row === arr1[j].row && curPos.col === arr1[j].col) {
                    data[`${color}Player`].pathKingArr[pawnType][num-1].push(arr[i]);
                    return;
                }
            }
        }
    }
}

function getThePathForGuardingKing(pawnType, curPos, color, num) {
    let place = data[`${color}Player`].allPossiblePlace[pawnType][num];
    let kingPlace = data[`${opposeColor(color)}Player`].pawnPlace.king[0];
    let desiredArr, breakIt = false;

    for(let i = 0; i < place.length; i++) {
        desiredArr = [];
        desiredArr.push(curPos);
        for(let j = 0; j < place[i].length; j++) {
            desiredArr.push(place[i][j]);
            if(place[i][j].row === kingPlace.row && place[i][j].col === kingPlace.col) {
                breakIt = true;
                filterPathToKing(desiredArr) ? data.pathToKing[opposeColor(color)].push(desiredArr) : -1;
                break;
            }
        }
        if(breakIt)
            break;
    }
}

function loopPathKing(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].count; j++) {
            getThePathForGuardingKing(arr[i].name, data[`${color}Player`].pawnPlace[arr[i].name][j], color, j);
        }
    }
}

function pathKingArr() {
    data.pathToKing.white = [];
    data.pathToKing.black= [];
    let arr = [
        {name: 'rook', count: 2},
        {name: 'bishop', count: 2},
        {name: 'knight', count: 2},
        {name: 'queen', count: 1},
        {name: 'king', count: 1},
        {name: 'ordPawn', count: 8}
    ];

    loopPathKing(arr, 'white');
    loopPathKing(arr, 'black');
}

function filterPathToKing(arr) {
    if(arr) {
        let betweenArr = arr.slice(1, -1);
        let count = 0;
        for(let i = 0; i < betweenArr.length; i++) {
            let place = document.querySelector(`.cards__item[data-row="${betweenArr[i].row}"][data-col="${betweenArr[i].col}"]`);
            if(place.childNodes[place.childNodes.length-1].classList) {
                if(place.childNodes[place.childNodes.length-1].classList.contains('pawn')) {
                    count++;
                }
            }
        }
        return count <= 1;
    }
    return false;
}

function kingLooping(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        kingPush(arr[i], color);
    }
}

function kingPush(place, color) {
    if(place.check) {
        let placeToCheck = place.place;
        place.kingPredictedArr.push(placeToCheck);

        if(isPlaceBusy(placeToCheck).busy) {
            if(isPlaceBusy(placeToCheck).color !== color) {
                if(!checkPredictedPlace(placeToCheck, color)) {
                    place.arr.push(placeToCheck);
                }
            }
        } else {
            if(!checkPredictedPlace(placeToCheck, color)) {
                place.arr.push(placeToCheck);
            }
        }
    }
}

function opposeColor(color) {
    let oppColor;
    color === 'white' ? oppColor = 'black': oppColor = 'white';
    return oppColor;
}

function checkPredictedPlace(pos, color) {
    mergedPredictedPlace = [];
    mergePredictedPlace(opposeColor(color));
    for(let i = 0; i < mergedPredictedPlace.length; i++) {
        if(pos.row === mergedPredictedPlace[i].row && pos.col === mergedPredictedPlace[i].col)
            return true;
    }
    return false;
}

function mergePredictedPlace(color) {
    let itemsArr = [
        'rook',
        'bishop',
        'knight',
        'queen',
        'king',
        'ordPawn'
    ];

    loopPredictedPlace(itemsArr, color);
}

function loopPredictedPlace(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        mergePredictedPlaceHandler(color, arr[i]);
    }
}

function mergePredictedPlaceHandler(color, type) {
    let playerData = data[`${color}Player`].predictedKingPlace[type];
    for(let i = 0; i < playerData.length; i++) {
        for(let j = 0; j < playerData[i].length; j++) {
            for(let k = 0; k < playerData[i][j].length; k++) {
                if(playerData[i][j][k] !== undefined) {
                    mergedPredictedPlace.push(playerData[i][j][k]);
                }
            }
        }
    }
}

function allowPosFn(pawnType, curPos, color, num, isItGuarding, isItChecked) {
    let commonObj = {
        isItGuarding: isItGuarding,
        pawnType: pawnType,
        curPos: curPos,
        color: color,
        num: num,
    };
    if(data.allowedMoves[pawnType].isCrossAllowed){
        let positions = cross(curPos, color);
        if(!isItChecked) {
            positionGuardedPawnForAllowPosFn({
                ...commonObj,
                positions: positions,
                fn: preparedUICross
            });
        } else {
            checkSavePathArray(positions, color)
        }
    }
    if(data.allowedMoves[pawnType].isPlusAllowed){
        let positions = plus(curPos, color);
        if(!isItChecked) {
            positionGuardedPawnForAllowPosFn({
                ...commonObj,
                positions: positions,
                fn: preparedUIPlus
            });
        } else {
            checkSavePathArray(positions, color)
        }
    }
    if(data.allowedMoves[pawnType].isKnight) {
        let positions = knight(curPos, color);
        if(!isItChecked) {
            positionGuardedPawnForAllowPosFn({
                ...commonObj,
                positions: positions,
                fn: preparedUIKnight
            });
        } else {
            checkSavePathArray(positions, color)
        }
    }
    if(data.allowedMoves[pawnType].isOrdPawn) {
        let positions = ordPawnMovement(curPos, color);
        if(!isItChecked) {
            positionGuardedPawnForAllowPosFn({
                ...commonObj,
                positions: positions,
                fn: preparedOrdPawn
            });
        } else {
            checkSavePathArray(positions, color)
        }
    }
    if(data.allowedMoves[pawnType].isKing) {
        let positions = king(curPos, color);
        data.activePawn.allowPositions.push(Object.values(positions[0]));
        preparedKing(positions[0]);
    }
}

function checkSavePathArray(positions, color) {
    let pos = [];
    pos.push(...Object.values(positions[0]));
    let desiredPos = [];
    let posArr = [];
    for(let i = 0; i < pos.length; i++) {
        for(let j = 0; j < pos[i].length; j++) {
            desiredPos.push(...checkIt(pos[i][j], color));
        }
    }
    posArr.push(desiredPos);
    data.activePawn.allowPositions.push(posArr);
    preparedUIFromArray(desiredPos);
}

function checkIt(pos, color) {
    let arr = data.pathToKing[color];
    let desiredArr = [];
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            if(pos.row === arr[i][j].row && pos.col === arr[i][j].col) {
                desiredArr.push(pos);
            }
        }
    }
    return desiredArr;
}

function positionGuardedPawnForAllowPosFn(obj) {
    if(obj.isItGuarding) {
        let checkKingGuard = [],
            pos = [];
        checkKingGuard.push(...Object.values(obj.positions[0]));
        let position = getKingGuardPositions(checkKingGuard, obj.pawnType, obj.curPos, obj.color, obj.num);
        pos.push(position);
        console.log(pos);
        data.activePawn.allowPositions.push(pos);
        preparedUIFromArray(position);
    } else {
        data.activePawn.allowPositions.push(Object.values(obj.positions[0]));
        obj.fn(obj.positions[0]);
    }
}

function getKingGuardPositions(arr, pawnType, curPos, color, num) {
    let posArr = [];
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            if(isItMatching(pawnType, curPos, color, num) !== null) {
                posArr.push(isItMatching(pawnType, arr[i][j], color, num));
            }
        }
    }
    return posArr;
}

function isItMatching(pawnType, curPos, color, num) {
    let pathKingArr = data[`${color}Player`].pathKingArr[pawnType][num-1];
    for(let i = 0; i < pathKingArr.length; i++) {
        for(let j = 0; j < pathKingArr[i].length; j++) {
            if(curPos.row === pathKingArr[i][j].row && curPos.col === pathKingArr[i][j].col) {
                return curPos;
            }
        }
    }
    return null;
}

function knightLooping(arr) {
    for(let i = 0; i < arr.length; i++) {
        knightPush(arr[i]);
    }
}

function isOrdPawnOnStartPos(pos, color) {
    if(color === 'black')
        return (pos.row === 7);
    else if(color === 'white')
        return (pos.row === 2);
    return false;
}


function knightPush(place) {
    if(place.check) {
        let curPlaceToCheck = place.actualPlace;
        place.possiblePlace.push(curPlaceToCheck);
        if(isPlaceBusy(curPlaceToCheck).busy)
            isPlaceBusy(curPlaceToCheck).color !== place.color ? place.arr.push(curPlaceToCheck) : -1;
        else
            place.arr.push(curPlaceToCheck);
    }
}

/*****************************************************************************************
 *                             PREDICTED POSITIONING FUNCTIONS                           *
 ****************************************************************************************/

function updateMoves(type, no, color) {
    if(!data[`${color}Player`].overPawns[type][no]) {
        let curPos = data[`${color}Player`].pawnPlace[type][no];
        let positions = {};
        data[`${color}Player`].predictedKingPlace[type][no] = [];
        data[`${color}Player`].predictedPlace[type][no] = [];
        if(typeAllowance(type).isCross){
            positions = cross(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions[0]));
            data[`${color}Player`].predictedKingPlace[type][no].push(...Object.values(positions[1]));
        }
        if(typeAllowance(type).isPlus){
            positions = plus(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions[0]));
            data[`${color}Player`].predictedKingPlace[type][no].push(...Object.values(positions[1]));
        }
        if(typeAllowance(type).isKnight) {
            positions = knight(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions[0]));
            data[`${color}Player`].predictedKingPlace[type][no].push(...Object.values(positions[0]));
        }
        if(typeAllowance(type).isOrdPawn) {
            positions = ordPawnMovement(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions[0]));
            data[`${color}Player`].predictedKingPlace[type][no].push(...Object.values(positions[1]));
        }
        if(typeAllowance(type).isKing) {
            positions = king(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions[0]));
            data[`${color}Player`].predictedKingPlace[type][no].push(...Object.values(positions[1]));
        }
    }
}

function typeAllowance(type) {
    return {
        isCross: data.allowedMoves[type].isCrossAllowed,
        isPlus: data.allowedMoves[type].isPlusAllowed,
        isKnight: data.allowedMoves[type].isKnight,
        isOrdPawn: data.allowedMoves[type].isOrdPawn,
        isKing: data.allowedMoves[type].isKing
    };
}

function resetPredictedPlace(player) {
    data[player].predictedPlace = {
        rook: [[], []],
        knight: [[], []],
        bishop: [[], []],
        queen: [[]],
        king: [[]],
        ordPawn: [[], [], [], [], [], [], [], []]
    }
}

function loopUpdateMoves(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].count; j++) {
            updateMoves(arr[i].name, j, color);
        }
    }
}

function updateMovesHandler() {
    let arr = [
        {name: 'rook', count: 2},
        {name: 'bishop', count: 2},
        {name: 'knight', count: 2},
        {name: 'queen', count: 1},
        {name: 'king', count: 1},
        {name: 'ordPawn', count: 8}
    ];
    loopUpdateMoves(arr, 'black');
    loopUpdateMoves(arr, 'white');
}

/*****************************************************************************************
 *                                 DISPLAY UI FUNCTIONS                                  *
 ****************************************************************************************/

function preparedUIFromArray(posArr) {
    pushToUI(posArr);
}

function preparedUICross(posArr) {

    let mulPlaces = [
        posArr.rightTopPath,
        posArr.rightBottomPath,
        posArr.leftBottomPath,
        posArr.leftTopPath
    ];
    loopingFunctions(pushToUI, mulPlaces, false);
}

function preparedUIPlus(posArr) {

    let mulPlaces = [
        posArr.topPath,
        posArr.rightPath,
        posArr.bottomPath,
        posArr.leftPath
    ];
    loopingFunctions(pushToUI, mulPlaces, false);
}

function preparedOrdPawn(posArr) {

    let mulPlaces = [
        posArr.topLeft,
        posArr.top,
        posArr.topRight
    ];
    loopingFunctions(pushToUI, mulPlaces, false);
}

function preparedUIKnight(posArr) {

    let mulPlaces = [
        posArr.topLeft,
        posArr.topRight,
        posArr.rightTop,
        posArr.rightBottom,
        posArr.bottomRight,
        posArr.bottomLeft,
        posArr.leftBottom,
        posArr.leftTop
    ];

    loopingFunctions(pushToUI, mulPlaces, true);
}

function preparedKing(posArr) {

    let mulPlaces = [
        posArr.topLeft,
        posArr.top,
        posArr.topRight,
        posArr.right,
        posArr.bottomRight,
        posArr.bottom,
        posArr.bottomLeft,
        posArr.left,
    ];

    loopingFunctions(pushToUI, mulPlaces, true);
}

function pushToUI(places) {
    let c = 0;
    for (let i = 0; i <= places.length; i++) {
        pushToUITimer = setTimeout(function () {
            if(places[i] !== null) {
                addCumClass(places[i], 'cum', true);
            }
        }, 50 * c);
        timerArray.push(pushToUITimer);
        c++;
    }
}

/*****************************************************************************************
 *                                   UTILITY FUNCTIONS                                   *
 ****************************************************************************************/

// Moving Utility

function movePawn(args) {
    /*
        sourcePos: number,
        pawn: object,
        jumpingLines: array of numbers
    */
    let c = 0;
    let prepArr = [args.sourcePos, ...args.jumpingLines];
    moveFunctionality(prepArr, c, args.pawn);
}

function moveFunctionality(paths, c, pawn) {
    for(let i = 0; i < paths.length; i++) {
        setTimeout(function () {
            let nextPos = document.querySelector(`.cards__item[data-id="${paths[i]}"]`);
            let elToMove = document.querySelector(`.pawn.${pawn.type}.${pawn.color}.abs[data-color="${pawn.color}"][data-no="${pawn.num}"]`);
            let dimensions = getCoordinates(nextPos);

            elToMove.style.top = `${dimensions.topEl}px`;
            elToMove.style.left = `${dimensions.leftEl}px`;
        }, 80 * c);
        c++;
    }
}

function loopPawnOnBoard(arr, color) {
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].count; j++) {
            setPawnOnBoard({type: arr[i].type, color: color, num: j+1});
        }
    }
}

function allPawnOnBoard() {
    let itemsArr = [
        {type: 'rook', count: 2},
        {type: 'bishop', count: 2},
        {type: 'knight', count: 2},
        {type: 'queen', count: 1},
        {type: 'king', count: 1},
        {type: 'ordPawn', count: 8}
    ];
    loopPawnOnBoard(itemsArr, 'black');
    loopPawnOnBoard(itemsArr, 'white');
}

function setPawnOnBoard(pawn) {
    let place = document.querySelector(`.pawn.${pawn.type}.${pawn.color}.none[data-color="${pawn.color}"][data-no="${pawn.num}"]`);

    if(place !== null) {
        let dimensions = getCoordinates(place.parentElement);
        let elToMove = document.querySelector(`.pawn.${pawn.type}.${pawn.color}.abs[data-color="${pawn.color}"][data-no="${pawn.num}"]`);

        data[`${pawn.color}Player`].pawnPlace[pawn.type][pawn.num-1] = {row: parseInt(place.parentElement.dataset.row), col: parseInt(place.parentElement.dataset.col)};

        updateMoves(pawn.type, pawn.num-1, pawn.color);

        elToMove.style.top = `${dimensions.topEl}px`;
        elToMove.style.transform = `translate(-52.5%, -52.5%)`;
        elToMove.style.left = `${dimensions.leftEl}px`;
    }
}

function getCoordinates(el) {
    let coordsContainer = container.getBoundingClientRect(),
        topContainer = coordsContainer.top,
        leftContainer = coordsContainer.left;

    let coordsEl = el.getBoundingClientRect(),
        widthEl = coordsEl.width,
        heightEl = coordsEl.height,
        topEl = (coordsEl.top - topContainer) + heightEl/2,
        leftEl = (coordsEl.left - leftContainer) + widthEl/2;

    return {leftEl, topEl, widthEl, heightEl};
}

// Getting if place is free or not
function isPlaceBusy(place) {
    let actualElementAtPlace = document.querySelector(`.cards__item[data-row="${place.row}"][data-col="${place.col}"]`),
        busy = false,
        color = null;
    for(let i = 0; i < actualElementAtPlace.childNodes.length; i++) {
        if (actualElementAtPlace.childNodes[i].classList) {
            if(actualElementAtPlace.childNodes[i].classList.contains('pawn')) {
                busy = actualElementAtPlace.childNodes[i].classList.contains('pawn');
                color = actualElementAtPlace.childNodes[i].dataset.color;
            }
        }
    }
    return {busy, color};
}

// Looping one Function multiple times with different parameters
function loopingFunctions(fnName, arrParameter, isKnight) {
    let c = 0;
    for(let i = 0; i < arrParameter.length; i++) {
        if(isKnight) {
            pushToUITimer = setTimeout(function () {
                fnName(arrParameter[i]);
            }, 50 * c);
            timerArray.push(pushToUITimer);
            c++;
        } else {
            fnName(arrParameter[i]);
        }
    }
}

// Utilities to remove classes
function addCumClass(place, className, isCumOver) {
    if(place !== undefined) {
        let el = document.querySelector(`.cards__item[data-row="${place.row}"][data-col="${place.col}"]`);
        if(isCumOver) {
            if(el.childNodes[el.childNodes.length-1].classList) {
                if(el.childNodes[el.childNodes.length-1].classList.contains('pawn')) {
                    el.classList.add('cumOver');
                    return;
                }
            }
        }
        el.classList.add(className);
    }
}

function removeCumClass(className, cumOver) {
    removeArrayTimeout(timerArray);
    let el = document.querySelectorAll(`.cards__item`);
    el.forEach(cur => {
        if(cumOver) {
            cur.classList.remove('cumOver');
            cur.classList.remove('thisOne');
        }
        cur.classList.remove(className);
    })
}

function removeArrayTimeout(arr) {
    arr.forEach(cur => {
        clearTimeout(cur);
    })
}

//TODO: You can not move the pawn if it is guarding the king
