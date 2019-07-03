const IMAGE_HEIGHT = 64;
const IMAGE_TOP_MARGIN = 5;
const IMAGE_BOTTOM_MARGIN = 5;
const SLOT_SEPARATOR_HEIGHT = 2;
const SLOT_HEIGHT = IMAGE_HEIGHT + IMAGE_TOP_MARGIN + IMAGE_BOTTOM_MARGIN + SLOT_SEPARATOR_HEIGHT; // how many pixels one slot image takes
const RUNTIME = 3000; // how long all slots spin before starting countdown
const SPINTIME = 200; // how long each slot spins at minimum
const ITEM_COUNT = 13; // item count in slots
const SLOT_SPEED = 15; // how many pixels per second slots roll
const DRAW_OFFSET = 0; // how much draw offset in slot display from top 
const WIN_CANVAS_WIDTH = 350;
const STATE_SPINNING = 1;
const STATE_SLOT1_STOP = 2;
const STATE_SLOT2_STOP = 3;
const STATE_SLOT3_STOP = 4;
const STATE_SLOT4_STOP = 5;
const STATE_SLOT5_STOP = 6;
const STATE_STOPPED = 7;
const STATE_RESULTS = 8;
const STATE_END = 9;
let GAME_DATA = 'data';
let USER_BALANCE = 1000;

$(function () {

    $.ajax({
        url: "./game-data.json",
        type: 'GET',
        dataType: 'json',
        success: function (data) {
//          console.log(data);
            $('#userBalance').val(USER_BALANCE);
            setGame(data);
        }, error: function (data) {
            console.log(data);
        }
    });

});

function setGame(data) {

    let game = new Game();

    let userBalance = USER_BALANCE;
    let lineNum = $('#lineNum').val();
    let betValue = $('#betValue').val();
    let betByLine = $('#betByLine').val();



    game.items = data.items;

    game.draw();

    $('canvas').attr('height', SLOT_HEIGHT * (ITEM_COUNT + 3));
    $('canvas').css('height', SLOT_HEIGHT * (ITEM_COUNT + 3));

    $('#winCanvas').attr('height', SLOT_HEIGHT * 3);
    $('#winCanvas').css('height', SLOT_HEIGHT * 3);
    $('#winCanvas').css('background', 'transparent');


    $('#play').click(function () {
        if ($(this).hasClass("active")) {
            game.winTemp = data[GAME_DATA]["win-template"];
            game.lineResult = data[GAME_DATA]["results"]["result"];
//            console.log(game.lineResult);
            USER_BALANCE = USER_BALANCE - ($('#betValue').val())
            $('#userBalance').val(USER_BALANCE);
            game.userBalance = USER_BALANCE;
            game.lineNum = $('#lineNum').val();
            game.betValue = $('#betValue').val();
            game.roll();
            $(this).toggleClass('active');
            $('#winningSum').val('');

            if (GAME_DATA == 'data') {
                GAME_DATA = 'data1';
            } else if (GAME_DATA == 'data1') {
                GAME_DATA = 'data2';
            } else if (GAME_DATA == 'data2') {
                GAME_DATA = 'data3';
            } else if (GAME_DATA == 'data3') {
                GAME_DATA = 'data';
            }
        }
    });
    $("#lineNum,#betByLine").change(function () {
        game.setPlayerSettings();
    })
}
class Game {
    constructor() {

        // reel canvases
        this.c1 = $('#canvas1');
        this.c2 = $('#canvas2');
        this.c3 = $('#canvas3');
        this.c4 = $('#canvas4');
        this.c5 = $('#canvas5');

        //set random offset for canvases
        this.offset1 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
        this.offset2 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
        this.offset3 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
        this.offset4 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
        this.offset5 = -parseInt(Math.random() * ITEM_COUNT) * SLOT_HEIGHT;
        this.speed1 = this.speed2 = this.speed3 = this.speed4 = this.speed5 = 0;
        this.lastUpdate = new Date();

        // Needed for CSS translates
        this.vendor =
                (/webkit/i).test(navigator.appVersion) ? '-webkit' :
                (/firefox/i).test(navigator.userAgent) ? '-moz' :
                (/msie/i).test(navigator.userAgent) ? 'ms' :
                'opera' in window ? '-o' : '';

        this.cssTransform = this.vendor + '-transform';
        this.has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())
        this.trnOpen = 'translate' + (this.has3d ? '3d(' : '(');
        this.trnClose = this.has3d ? ',0)' : ')';
        this.scaleOpen = 'scale' + (this.has3d ? '3d(' : '(');
        this.scaleClose = this.has3d ? ',0)' : ')';

        //game settings
        this.betValue = $('#betValue').val();
        this.lineNum = $('#lineNum').val();
        this.userBalance = USER_BALANCE;

    }

    draw() {
        let items = this.items;

        for (let i = 0; i < 5; i++) {
            let randItems = [...this.items].sort(function (a, b) {
                return 0.5 - Math.random()
            });
            let canvas = $('#canvas' + (i + 1))[0];
            this.drawCanvases(randItems, canvas);
        }

    }
    setPlayerSettings() {
        let betByLine = $('#betByLine').val();
        let lineNum = $('#lineNum').val();
        let betValue = betByLine * lineNum;

        $('#stars > li span').not(':first').removeClass('active');
        $('#betValue').val(betValue);
        for (let i = 0; i < lineNum; i++) {
            $('#stars > li:nth-child(' + (i + 1) + ') span').addClass('active');
        }

    }
}
Game.prototype.drawCanvases = function (images, canvas) {

//    console.log(images)
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < images.length; i++) {
        let asset = images[i];
        asset.img = new Image();
        asset.img.src = 'img/' + asset.path + '.png';
        asset.img.onload = () => {

            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.shadowBlur = 5;

            ctx.drawImage(asset.img, 3, i * SLOT_HEIGHT + IMAGE_TOP_MARGIN);
            ctx.drawImage(asset.img, 3, (i + ITEM_COUNT) * SLOT_HEIGHT + IMAGE_TOP_MARGIN);
            ctx.restore();
            ctx.fillRect(0, i * SLOT_HEIGHT, 70, SLOT_SEPARATOR_HEIGHT);
            ctx.fillRect(0, (i + ITEM_COUNT) * SLOT_HEIGHT, 70, SLOT_SEPARATOR_HEIGHT);
        }
    }

//    console.log(this)
}

Game.prototype.roll = function () {
    this.lastUpdate = new Date();
    this.speed1 = this.speed2 = this.speed3 = this.speed4 = this.speed5 = SLOT_SPEED;


    // Clear stop locations
    this.stopped1 = false;
    this.stopped2 = false;
    this.stopped3 = false;
    this.stopped4 = false;
    this.stopped5 = false;

    this.resetOffset = (ITEM_COUNT - 3) * SLOT_HEIGHT;
    this.setRandomResult();
    this.running = true;

    this.state = STATE_SPINNING;

    this.loop();


};

Game.prototype.setRandomResult = function ()
{
    this.result1 = parseInt(Math.random() * (this.items.length - 2));
    this.result2 = parseInt(Math.random() * (this.items.length - 2));
    this.result3 = parseInt(Math.random() * (this.items.length - 2));
    this.result4 = parseInt(Math.random() * (this.items.length - 2));
    this.result5 = parseInt(Math.random() * (this.items.length - 2));
};
window.requestAnimFrame = (function () {

    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback, element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
Game.prototype.loop = function () {
    var that = this;
    that.running = true;
    (function gameLoop() {
//        console.log('LOP!!!')
        that.update();
        that.animate();
        if (that.running) {
            requestAnimFrame(gameLoop);
//

        }
    })();
};
Game.prototype.animate = function () {
//console.log('amin');
    if (this.state >= STATE_RESULTS)
        return;

    // draw the spinning slots based on current state
    for (var i = 1; i <= 5; i++) {

        var stopped = 'stopped' + i;
        var speedp = 'speed' + i;
        var offsetp = 'offset' + i;
        var cp = 'c' + i;
        if (this[stopped] || this[speedp]) {

            if (this[stopped]) {
                this[speedp] = 0;
                this[offsetp] = 0;
                let canvas = $('#canvas' + (i))[0];
                this.drawCanvases(this.winTemp["item" + i], canvas)
                this[cp].css(this.cssTransform, this.trnOpen + '0px, ' + (this[offsetp] + DRAW_OFFSET) + 'px' + this.trnClose);
            } else {
                this[offsetp] += this[speedp];
                if (this[offsetp] + DRAW_OFFSET > 0) {
                    // reset back to beginning
                    this[offsetp] = -this.resetOffset + (SLOT_HEIGHT / 2) * 3 - DRAW_OFFSET;
                }
                this[cp].css(this.cssTransform, this.trnOpen + '0px, ' + (this[offsetp] + DRAW_OFFSET) + 'px' + this.trnClose);
            }

            // translate canvas location

        }
    }
};

Game.prototype.update = function () {

    var now = new Date();
    var that = this;
//    console.log('UPDATE!!!')
//     Check slot status and if spun long enough stop it on result
    function _check_slot(offset, result) {

        if (now - that.lastUpdate > SPINTIME) {
            var c = parseInt(Math.abs(offset / (SLOT_HEIGHT / 2))) % ITEM_COUNT;

            if (c == c) {

                if (result == 0) {
                    if (Math.abs(offset + (ITEM_COUNT * (SLOT_HEIGHT / 2))) < (SLOT_SPEED * 1.5)) {
                        return true; // done
                    }
                } else if (Math.abs(offset + (result * (SLOT_HEIGHT / 2))) < (SLOT_SPEED * 1.5)) {
                    return true; // done

                }
            }
        }
        return false;
    }
    if (now - that.lastUpdate > SPINTIME) {
//        console.log()
        switch (this.state) {

            case STATE_SPINNING: // all slots spinning
                if (now - this.lastUpdate > RUNTIME) {
                    this.state = STATE_SLOT1_STOP;
                    this.lastUpdate = now;
                }
                break;
            case STATE_SLOT1_STOP: // slot 1
                this.stopped1 = _check_slot(this.offset1, this.result1);
                if (this.stopped1) {
                    this.speed1 = 0;
                    this.state++; // advance to next slot
                    this.lastUpdate = now;
                    // play reel icon specific audio
                    var id = this.items[this.result1].id;

                }
                break;
            case STATE_SLOT2_STOP: // slot 1 stopped, slot 2
                this.stopped2 = _check_slot(this.offset2, this.result2);
                if (this.stopped2) {
                    this.speed2 = 0;
                    this.state++; // advance to next slot
                    this.lastUpdate = now;
                    // play reel icon specific audio
                    var id = this.items[this.result2].id;

                }
                break;
            case STATE_SLOT3_STOP: // slot 2 stopped, slot 3
                this.stopped3 = _check_slot(this.offset3, this.result3);
                if (this.stopped3) {
                    this.speed3 = 0;
                    this.state++;
                    // play reel icon specific audio
                    var id = this.items[this.result3].id;

                }
                break;
            case STATE_SLOT4_STOP: // slot 2 stopped, slot 3
                this.stopped4 = _check_slot(this.offset4, this.result4);
                if (this.stopped4) {
                    this.speed4 = 0;
                    this.state++;
                    // play reel icon specific audio
                    var id = this.items[this.result4].id;

                }
                break;
            case STATE_SLOT5_STOP: // slot 2 stopped, slot 3
                this.stopped5 = _check_slot(this.offset5, this.result5);
                if (this.stopped5) {
                    this.speed5 = 0;
                    this.state = STATE_STOPPED;
                    // play reel icon specific audio
                    var id = this.items[this.result5].id;

                }
                break;
            case STATE_STOPPED: // slots stopped, wait for 2 seconds
                if (now - this.lastUpdate > 2000) {
                    this.state = STATE_RESULTS;
                }
                break;
            case STATE_RESULTS: // check results
                this.checkWinLines();

                this.state = STATE_END;
                break;
            case STATE_END: // game ends
                this.running = false;
                break;
            default:
        }
    }
};

Game.prototype.checkWinLines = function ()
{
    const winLine = this.lineNum;
//    COLLECT RESULTS AND SET WINNING TEMPLATES
    let result = this.lineResult;
    let line_1 = result[0];
    let line_2 = result[0];
    let line_3 = result[0];
    let winArr = [];
    let multiplicator = 0;
//    console.log(result)
//    set arrays for first 3 lines
    for (let i = 0; i < result.length; i++) {
        if (winLine > i) {

            winArr.push(result[i]);
        }

    }

//    console.log(line_1);
    //    set arrays for all lines based on position first 3 rows 
    if (winLine > 3) {
        let line_4 = [];
        line_4.push(line_1[0], line_2[1], line_3[2], line_2[3], line_1[4]);
        winArr.push(line_4);
    }
    if (winLine > 4) {
        let line_5 = [];
        line_5.push(line_3[0], line_2[1], line_1[2], line_2[3], line_3[4]);

        winArr.push(line_5);
    }
    if (winLine > 5) {
        let line_6 = [];
        line_6.push(line_1[0], line_1[1], line_2[2], line_3[3], line_3[4]);

        winArr.push(line_6);
    }
    if (winLine > 6) {
        let line_7 = [];
        line_7.push(line_3[0], line_3[1], line_2[2], line_1[3], line_1[4]);

        winArr.push(line_7);
    }
    if (winLine > 7) {
        let line_8 = [];
        line_8.push(line_2[0], line_1[1], line_2[2], line_3[3], line_2[4]);

        winArr.push(line_8);
    }
    if (winLine > 8) {
        let line_9 = [];
        line_9.push(line_2[0], line_3[1], line_2[2], line_1[3], line_2[4]);

        winArr.push(line_9);
    }
    if (winLine > 9) {
        let line_10 = [];
        line_10.push(line_1[0], line_2[1], line_2[2], line_2[3], line_3[4]);
        winArr.push(line_10);
    }
    if (winLine > 10) {
        let line_11 = [];
        line_11.push(line_3[0], line_2[1], line_2[2], line_2[3], line_1[4]);
        winArr.push(line_11);
    }
    if (winLine > 11) {
        let line_12 = [];
        line_12.push(line_2[0], line_1[1], line_1[2], line_2[3], line_3[4]);
        winArr.push(line_12);
    }
    if (winLine > 12) {
        let line_13 = [];
        line_13.push(line_2[0], line_3[1], line_3[2], line_2[3], line_1[4]);
        winArr.push(line_13);
    }
    if (winLine > 13) {
        let line_14 = [];
        line_14.push(line_2[0], line_2[1], line_1[2], line_2[3], line_3[4]);
        winArr.push(line_14);
    }
    if (winLine > 14) {
        let line_15 = [];
        line_15.push(line_2[0], line_2[1], line_3[2], line_2[3], line_1[4]);
        winArr.push(line_15);
    }
    if (winLine > 15) {
        let line_16 = [];
        line_16.push(line_1[0], line_1[1], line_2[2], line_3[3], line_2[4]);
        winArr.push(line_16);
    }
    if (winLine > 16) {
        let line_17 = [];
        line_17.push(line_3[0], line_3[1], line_2[2], line_1[3], line_2[4]);
        winArr.push(line_17);
    }
    if (winLine > 17) {
        let line_18 = [];
        line_18.push(line_2[0], line_1[1], line_2[2], line_3[3], line_3[4]);
        winArr.push(line_18);
    }
    if (winLine > 18) {
        let line_19 = [];
        line_19.push(line_2[0], line_3[1], line_2[2], line_1[3], line_1[4]);
        winArr.push(line_19);
    }
    if (winLine > 19) {
        let line_20 = [];
        line_20.push(line_1[0], line_1[1], line_1[2], line_2[3], line_3[4]);
        winArr.push(line_20);
    }

    let winResult = {};
//    console.log('OVO!!!!');
//    console.log(winArr);
    for (let i = 0; i < winArr.length; i++) {

        for (let y = 0; y < winArr[i].length; y++) {
            if (winArr[i][y] === winArr[i][y + 1]) {

                let wl = 'winline_' + (i + 1);

                if (winResult[wl]) {
                    if (winResult[wl]['temp2']) {
                        winResult[wl]['temp2'][winArr[i][y]] += 1;
                    } else if (winResult[wl]['temp1']) {
                        if (winArr[i][y] == winArr[i][y - 1]) {
                            winResult[wl]['temp1'][winArr[i][y]] += 1;
                        } else {
                            winResult[wl]['temp2'] = {};
                            winResult[wl]['temp2'][winArr[i][y]] = 2;
                        }

                    }
                } else {
                    winResult[wl] = {};
                    winResult[wl]['temp1'] = {};
                    winResult[wl]['temp1'][winArr[i][y]] = 2;

                }

            }
        }
    }

// calculate highest win for each line and set value of win
    let winnings = {};
    this.multiplicator = multiplicator;
    let winSum = 0;
    let lines = this.lineNum;
    let items = this.items;
//    console.log(this)
//    console.log(winResult)
    for (let i = 1; i <= lines; i++) {
        if (winResult['winline_' + i]) {

            if (!winResult['winline_' + i]['temp2']) {
                let temp = winResult['winline_' + i]['temp1'];
                let sign = Object.keys(temp);
                let num = Object.values(temp);
                let objSign = items.find(obj => obj.id == sign);

                //calculate win amount and create win object
                if (objSign.hasOwnProperty(num)) {
                    let win;
                    let lineValue = parseFloat(objSign[num]);
                    let currBalance = parseFloat(this.userBalance);
                    let betByLine = parseFloat(this.betValue / lines);

                    win = parseFloat(lineValue * betByLine).toFixed(2);
                    winSum += win;

                    winnings['winline_' + i] = {};
                    winnings['winline_' + i][objSign.id] = num[0];
                    winnings['winline_' + i]['value'] = lineValue;
                    winnings['winline_' + i]['amount'] = win;
                }

            } else {
                //for lines with two win, check wich one is bigger and calculate win amount 
                let temp = winResult['winline_' + i]['temp1'];
                let sign = Object.keys(temp);
                let num = Object.values(temp);
                let objSign = items.find(obj => obj.id == sign);

                let temp2 = winResult['winline_' + i]['temp2'];
                let sign2 = Object.keys(temp2);
                let num2 = Object.values(temp2);
                let objSign2 = items.find(obj => obj.id == sign2);

                if (objSign.hasOwnProperty(num) && objSign2.hasOwnProperty(num2)) {
                    value1 = objSign[num];
                    value2 = objSign2[num2];
                } else {
                    if (objSign.hasOwnProperty(num)) {
                        value1 = objSign[num];
                        value2 = 0;
                    } else if (objSign2.hasOwnProperty(num2)) {
                        value1 = 0;
                        value2 = objSign2[num2];
                    } else {
                        value1 = 0;
                        value2 = 0;
                    }
                }
                if (value1 > 0 || value2 > 0) {
                    if (value1 > value2) {

                        let win;
                        let lineValue = parseFloat(objSign[num]);
                        let betByLine = parseFloat(this.betValue / lines);

                        win = parseFloat(lineValue * betByLine).toFixed(2);
                        winSum += win;

                        winnings['winline_' + i] = {};
                        winnings['winline_' + i][objSign.id] = num[0];
                        winnings['winline_' + i]['value'] = lineValue;
                        winnings['winline_' + i]['amount'] = win;

                    } else {

                        let win;
                        let lineValue = parseFloat(objSign2[num]);
                        let betByLine = parseFloat(this.betValue / lines);

                        win = parseFloat(lineValue * betByLine).toFixed(2);
                        winSum += win;

                        winnings['winline_' + i] = {};
                        winnings['winline_' + i][objSign.id] = num[0];
                        winnings['winline_' + i]['value'] = lineValue;
                        winnings['winline_' + i]['amount'] = win;

                    }
                }
            }
        }


    }
    let betByLine = parseInt(this.betValue / lines);
    let currBalance = this.userBalance;
    let newBalance = parseFloat(currBalance) + parseFloat(winSum) + (multiplicator * betByLine);
//    console.log(newBalance+' * '+currBalance+'**'+winSum);
    this.userBalance = parseFloat(newBalance).toFixed(1);
    this.winSum = parseFloat(winSum + multiplicator * betByLine).toFixed(1);
    this.winLines = winnings;
    this.animateWin();
};

Game.prototype.animateWin = function () {
    function _drawWinLines(lines) {

        switch (lines) {

            case 'winline_1' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT / 2);
                ctx.lineTo(345, SLOT_HEIGHT / 2);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;

            case 'winline_2' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(345, SLOT_HEIGHT * 1.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_3' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 2.5);
                ctx.lineTo(345, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;

            case 'winline_4' :

                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH / 2, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT / 2);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_5' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH / 2, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_6' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_7' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT / 2);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_8' :

                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT / 2);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_9' :

                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 0.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_10' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 0.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 1.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_11' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 2.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 1.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 0.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_12' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 1.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.5, SLOT_HEIGHT * 0.5);


                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_13' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 1.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.5, SLOT_HEIGHT * 2.5);


                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 0.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_14' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 1.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.5, SLOT_HEIGHT * 0.5);


                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_15' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.5, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 0.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_16' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 0.5);

                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 2.5);


                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 1.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_17' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 1.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_18' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_19' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.1, SLOT_HEIGHT * 1.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.3, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.7, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 0.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;
            case 'winline_20' :
                var c = $("#winCanvas")[0];
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, 450, 3 * SLOT_HEIGHT);
                ctx.beginPath();
                ctx.moveTo(5, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.5, SLOT_HEIGHT * 0.5);
                ctx.lineTo(WIN_CANVAS_WIDTH * 0.9, SLOT_HEIGHT * 2.5);
                ctx.lineTo(WIN_CANVAS_WIDTH - 5, SLOT_HEIGHT * 2.5);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "red";
                ctx.stroke();

                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);
                $("#winCanvas").fadeIn(500);
                $("#winCanvas").fadeOut(500);

                break;


            default:



        }
    }
//    console.log(this);
    let winLines = Object.keys(this.winLines);
    let balance = this.userBalance;
    let win = this.winSum;
    if (winLines.length > 0) {
        function slowLoop(count, interval, callback) {
            let i = 0;
            next();
            function next() {
                if (callback(i) !== false) {
                    if (++i < count) {
                        setTimeout(next, interval);
                    } else {
                        $('#userBalance').val(balance);
                        $('#winningSum').val(win);
                        $('#play').toggleClass('active');

                    }
                }
            }

        }

        slowLoop(3, 2000, function (i) {
            _drawWinLines(winLines[i]);
        });
    } else {
        $('#userBalance').val(balance);
        $('#winningSum').val(0);
        $('#play').toggleClass('active');
    }



}
