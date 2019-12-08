let container = document.querySelector('.container');

let pushToUITimer,
    timerArray = [],
    trayCount = {
        whitePlayer: 1,
        blackPlayer: 1
    };

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
        predictedPlace: {
            rook: [[], []],
            knight: [[], []],
            bishop: [[], []],
            queen: [[]],
            king: [[]],
            ordPawn: [[], [], [], [], [], [], [], []]
        },
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
    curPawnPos: 7,
    validTarget: null,
    whitePlayer: new Player().info,
    blackPlayer: new Player().info,
    allowedMoves: {
        bishop: {
            isCrossAllowed: true
        },
        rook: {
            isPlusAllowed: true,
            isCrossAllowed: false,
            isKnight: false,
            isOrdPawn: false
        },
        queen: {
            isPlusAllowed: true,
            isCrossAllowed: true,
            isKnight: false,
            isOrdPawn: false
        },
        knight: {
            isPlusAllowed: false,
            isCrossAllowed: false,
            isKnight: true,
            isOrdPawn: false
        },
        king: {
            isPlusAllowed: false,
            isCrossAllowed: false,
            isKnight: false,
            isOrdPawn: false
        },
        ordPawn: {
            isPlusAllowed: false,
            isCrossAllowed: false,
            isKnight: false,
            isOrdPawn: true
        }
    }
};

allPawnOnBoard();

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

        removeCumClass('cum');
        updateMovesHandler();

    } else if(isItSameTarget(target)) {
        console.log('How to do this in that manner');
    } else {
        removeCumClass('cum');
        updateActivePawn(target);

        // TODO: perform operation on the Target
        if(target.isTargetValid) {
            target.validTarget.parentElement.classList.add('thisOne');
        }

        target.isTargetValid ? allowPosFn(target.targetType, target.pos, target.targetColor) : null;
    }
});

/*****************************************************************************************
 *                                ACTUAL PAWN FUNCTIONS                                  *
 ****************************************************************************************/

function placePawnsOnTray(pawn) {
    let pawnDOM = document.querySelector(`.cards__item[data-id="${rowColToString(pawn.pos)}"]`);
    pawnDOM.removeChild(pawnDOM.childNodes[pawnDOM.childNodes.length-1]);

    let pawnToMove = document.querySelector(`.pawn.${pawn.targetType}.${pawn.targetColor}.abs[data-color="${pawn.targetColor}"][data-no="${pawn.num}"]`);
    let trayPosEl = document.querySelector(`.checkBox.${pawn.targetColor}[data-check="${trayCount[`${pawn.targetColor}Player`]}"]`);

    data[`${pawn.targetColor}Player`].pawnPlace[pawn.targetType][pawn.num-1] = -1;
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
    prevPlace.removeChild(prevPlace.childNodes[prevPlace.childNodes.length-1]);

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
                if(allowPos[i][j][k].row === tar.pos.row && allowPos[i][j][k].col === tar.pos.col){
                    breakIt = true;
                    break;
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
        finalStringArr.push(rowColToString(arr[i]));
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
        pos: {row: null, col: null},
    }
}

/*****************************************************************************************
 *                              ACTUAL POSITIONING FUNCTIONS                             *
 ****************************************************************************************/

function ordPawnMovement(curPos, color) {
    let top = [],
        topLeft = [],
        loopCount = null,
        topRight = [];

    isOrdPawnOnStartPos(curPos, color) ? loopCount = 2 : loopCount = 1;

    for(let i = data[color](curPos.row, 1).arithmeticOp; data[color](i, data[color](curPos.row, loopCount).arithmeticOp).logicOp; i = data[color](i, 1).arithmeticOp) {
        if(i > 0 && i < 9) {
            if(!isPlaceBusy({row: i, col: curPos.col}).busy)
                top.push({row: i, col: curPos.col});
            else
                break;
        }
    }

    let mulArr = [
        {check: curPos.row+1 < 9 && curPos.col+1 < 9, place: {row: curPos.row+1, col: curPos.col+1}, pos: topLeft},
        {check: curPos.row+1 < 9 && curPos.col-1 > 0, place: {row: curPos.row+1, col: curPos.col-1}, pos: topRight},
        {check: curPos.row-1 > 0 && curPos.col-1 > 0, place: {row: curPos.row-1, col: curPos.col-1}, pos: topLeft},
        {check: curPos.row-1 > 0 && curPos.col+1 < 9, place: {row: curPos.row-1, col: curPos.col+1}, pos: topRight}
    ];

    if(color === 'white') {
        ordPawnPush(mulArr[0], color);
        ordPawnPush(mulArr[1], color);
    } else if(color === 'black') {
        ordPawnPush(mulArr[2], color);
        ordPawnPush(mulArr[3], color);
    }

    return {top, topLeft, topRight};
}

function ordPawnPush(place, color) {
    if(place.check) {
        let placeToCheck = place.place;
        if(isPlaceBusy(placeToCheck).busy) {
            if(isPlaceBusy(placeToCheck).color !== color)
                place.pos.push(placeToCheck);
        }
    }
}

function isOrdPawnOnStartPos(pos, color) {
    if(color === 'black')
        return (pos.row === 7);
    else if(color === 'white')
        return (pos.row === 2);
    return false;
}

function plus(curPos, color) {
    let rightPath = [],
        leftPath = [],
        topPath = [],
        bottomPath = [];

    // Towards the bottom
    for(let i = curPos.row+1; i < 9; i++){
        let curPlaceToCheck = {row: i, col: curPos.col};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                bottomPath.push(curPlaceToCheck);
                break;
            } else {
                break;
            }
        }
        else
            bottomPath.push(curPlaceToCheck);
    }

    // Towards the top
    for(let i = curPos.row-1; i > 0; i--){
        let curPlaceToCheck = {row: i, col: curPos.col};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                topPath.push(curPlaceToCheck);
                break;
            } else {
                break;
            }
        }
        else
            topPath.push(curPlaceToCheck);
    }

    // Towards the right
    for(let i = curPos.col+1; i < 9; i++) {
        let curPlaceToCheck = {row: curPos.row, col: i};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                rightPath.push(curPlaceToCheck);
                break;
            } else {
                break;
            }
        }
        else
            rightPath.push(curPlaceToCheck);
    }

    // Towards the left
    for(let i = curPos.col-1; i > 0; i--) {
        let curPlaceToCheck = {row: curPos.row, col: i};
        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                leftPath.push(curPlaceToCheck);
                break;
            } else {
                break;
            }
        }
        else
            leftPath.push(curPlaceToCheck);
    }

    // Towards the opposition area
    // for(let i = curPos.row+1)

    return {topPath, bottomPath, rightPath, leftPath};
}

function cross(curPos, color) {
    let rightBottomPath = [],
        leftBottomPath = [],
        rightTopPath = [],
        leftTopPath = [];
    // Towards Right Bottom
    for (let i = curPos.row+1, j = curPos.col+1; i < 9 && j < 9; i++, j++) {
        let curPlaceToCheck = {row: i, col: j};

        if(isPlaceBusy(curPlaceToCheck).busy){
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                rightBottomPath.push(curPlaceToCheck);
                break;
            }
            else
                break;
        }
        else
            rightBottomPath.push(curPlaceToCheck);
    }

    // Towards Right Top
    for (let i = curPos.row-1, j = curPos.col-1; i > 0 && j > 0; i--, j--) {
        let curPlaceToCheck = {row: i, col: j};

        if(isPlaceBusy(curPlaceToCheck).busy) {
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                leftTopPath.push(curPlaceToCheck);
                break;
            } else
                break;
        }
        else
            leftTopPath.push(curPlaceToCheck);
    }

    // Towards Left Bottom
    for (let i = curPos.row+1, j = curPos.col-1; i < 9 && j > 0; i++, j--) {
        let curPlaceToCheck = {row: i, col: j};

        if(isPlaceBusy(curPlaceToCheck).busy) {
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                leftBottomPath.push(curPlaceToCheck);
                break;
            } else
                break;
        }
        else
            leftBottomPath.push(curPlaceToCheck);
    }

    // Towards Left Top
    for (let i = curPos.row-1, j = curPos.col+1; i > 0 && j < 9; i--, j++) {
        let curPlaceToCheck = {row: i, col: j};

        if(isPlaceBusy(curPlaceToCheck).busy) {
            if(isPlaceBusy(curPlaceToCheck).color !== color) {
                rightTopPath.push(curPlaceToCheck);
                break;
            } else
                break;
        }
        else
            rightTopPath.push(curPlaceToCheck);
    }

    return {rightBottomPath, rightTopPath, leftBottomPath, leftTopPath};
}

function knight(curPos, color) {
    let topLeft = [],
        topRight = [],
        rightTop = [],
        rightBottom = [],
        bottomRight = [],
        bottomLeft = [],
        leftBottom = [],
        leftTop = [];

    // TODO: Knight Overlap Checking for friendly or enemy pawns
    let arr = [
        {check: curPos.row-2 > 0 && curPos.col-1 > 0, actualPlace: {row: curPos.row-2, col: curPos.col-1}, color: color, arr: topLeft},
        {check: curPos.row-2 > 0 && curPos.col+1 < 9, actualPlace: {row: curPos.row-2, col: curPos.col+1}, color: color, arr: topRight},
        {check: curPos.row-1 > 0 && curPos.col+2 < 9, actualPlace: {row: curPos.row-1, col: curPos.col+2}, color: color, arr: rightTop},
        {check: curPos.row+1 < 9 && curPos.col+2 < 9, actualPlace: {row: curPos.row+1, col: curPos.col+2}, color: color, arr: rightBottom},
        {check: curPos.row+2 < 9 && curPos.col+1 < 9, actualPlace: {row: curPos.row+2, col: curPos.col+1}, color: color, arr: bottomRight},
        {check: curPos.row+2 < 9 && curPos.col-1 > 0, actualPlace: {row: curPos.row+2, col: curPos.col-1}, color: color, arr: bottomLeft},
        {check: curPos.row+1 < 9 && curPos.col-2 > 0, actualPlace: {row: curPos.row+1, col: curPos.col-2}, color: color, arr: leftBottom},
        {check: curPos.row-1 > 0 && curPos.col-2 > 0, actualPlace: {row: curPos.row-1, col: curPos.col-2}, color: color, arr: leftTop}
    ];
    knightLooping(arr, knight);
    return {topLeft, topRight, rightTop, rightBottom, bottomRight, bottomLeft, leftBottom, leftTop};
}

function knightLooping(arr) {
    for(let i = 0; i < arr.length; i++) {
        knightPush(arr[i]);
    }
}

function knightPush(place) {
    if(place.check) {
        let curPlaceToCheck = place.actualPlace;
        if(isPlaceBusy(curPlaceToCheck).busy)
            isPlaceBusy(curPlaceToCheck).color !== place.color ? place.arr.push(curPlaceToCheck) : -1;
        else
            place.arr.push(curPlaceToCheck);
    }
}

// TODO: Optimize this function to predict the pawn places

function allowPosFn(pawnType, curPos, color) {
    if(data.allowedMoves[pawnType].isCrossAllowed){
        let positions = cross(curPos, color);
        data.activePawn.allowPositions.push(Object.values(positions));
        preparedUICross(positions);
    }
    if(data.allowedMoves[pawnType].isPlusAllowed){
        let positions = plus(curPos, color);
        data.activePawn.allowPositions.push(Object.values(positions));
        preparedUIPlus(positions);
    }
    if(data.allowedMoves[pawnType].isKnight) {
        let positions = knight(curPos, color);
        data.activePawn.allowPositions.push(Object.values(positions));
        preparedUIKnight(positions);
    }
    if(data.allowedMoves[pawnType].isOrdPawn) {
        let positions = ordPawnMovement(curPos, color);
        data.activePawn.allowPositions.push(Object.values(positions));
        preparedOrdPawn(positions)
    }
}

/*****************************************************************************************
 *                             PREDICTED POSITIONING FUNCTIONS                           *
 ****************************************************************************************/

function updateMoves(type, no, color) {
    if(!data[`${color}Player`].overPawns[type][no]) {
        let curPos = data[`${color}Player`].pawnPlace[type][no];
        let positions = {};
        data[`${color}Player`].predictedPlace[type][no] = [];
        if(typeAllowance(type).isCross){
            positions = cross(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions));
        }
        if(typeAllowance(type).isPlus){
            positions = plus(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions));
        }
        if(typeAllowance(type).isKnight) {
            positions = knight(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions));
        }
        if(typeAllowance(type).isOrdPawn) {
            positions = ordPawnMovement(curPos, color);
            data[`${color}Player`].predictedPlace[type][no].push(...Object.values(positions));
        }
    }
}

function typeAllowance(type) {
    return {isCross: data.allowedMoves[type].isCrossAllowed, isPlus: data.allowedMoves[type].isPlusAllowed, isKnight: data.allowedMoves[type].isKnight, isOrdPawn: data.allowedMoves[type].isOrdPawn};
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

function pushToUI(places) {
    let c = 0;
    for (let i = 0; i <= places.length; i++) {
        pushToUITimer = setTimeout(function () {
            addCumClass(places[i], 'cum');
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
function addCumClass(place, className) {
    if(place !== undefined) {
        let el = document.querySelector(`.cards__item[data-row="${place.row}"][data-col="${place.col}"]`);
        if(el.childNodes[el.childNodes.length-1].classList) {
            if(el.childNodes[el.childNodes.length-1].classList.contains('pawn')) {
                el.classList.add('cumOver');
                return;
            }
        }
        el.classList.add(className);
    }
}

function removeCumClass(className) {
    removeArrayTimeout(timerArray);
    let el = document.querySelectorAll(`.cards__item`);
    el.forEach(cur => {
        cur.classList.remove('cumOver');
        cur.classList.remove('thisOne');
        cur.classList.remove(className);
    })
}

function removeArrayTimeout(arr) {
    arr.forEach(cur => {
        clearTimeout(cur);
    })
}

//TODO: You can not move the pawn if it is guarding the king