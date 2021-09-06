//#region var/const declarations;
var lastNames = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen"]
// Header
var btnLoadTeam = document.getElementById("head-team");
var btnLoadMatch = document.getElementById("head-match");
var btnSave = document.getElementById("head-save");
var btnExport = document.getElementById("head-export");
var lblLoadTeam = document.getElementById("lbl-head-team");
var lblLoadMatch = document.getElementById("lbl-head-match");
// Time
var clockMain = document.getElementById("clock-main");
var clockPlay = document.getElementById("clock-play");
var clockPer = document.getElementById("period");
var clockKickOff = document.getElementById("kick-off");
var clockBreak = document.getElementById("break");
var clockPause = document.getElementById("pause");
var clockStop = document.getElementById("stoppage");
var secondsM = 0;
var minutesM = 0;
var secondsP = 0;
var minutesP = 0;
var IntervalM;
var IntervalP;
// Team
var txtHome = document.getElementById("home")
var txtAway = document.getElementById("away")
var txtHScore = document.getElementById("score-h")
var txtAScore = document.getElementById("score-a")
var btnP1 = document.getElementById("btn1");
var btnP2 = document.getElementById("btn2");
var btnP3 = document.getElementById("btn3");
var btnP4 = document.getElementById("btn4");
var btnP5 = document.getElementById("btn5");
var btnP6 = document.getElementById("btn6");
var btnP7 = document.getElementById("btn7");
var btnP8 = document.getElementById("btn8");
var btnP9 = document.getElementById("btn9");
var btnP10 = document.getElementById("btn10");
var btnP11 = document.getElementById("btn11");
var btnP12 = document.getElementById("btn12");
var btnP13 = document.getElementById("btn13");
var btnP14 = document.getElementById("btn14");
var btnP15 = document.getElementById("btn15");
var btnP16 = document.getElementById("btn16");
var btnGH = document.getElementById("goal-h");
var btnGA = document.getElementById("goal-a");
//Analysis
var tblAnl = document.getElementById("tbl-anl");

// Helper
const arrSum = arr => arr.reduce((a,b) => a + b, 0);
//#endregion

//#region  INITIALIZATION
//#region  Initialize Dictionaries
var struct_general = {  // Generic Container
    "nplay": 5,
    "nsub": 11,
    "per_lbl": ["1H", "2H", "ET1", "ET2"],
    "nper": 4,
    "per_time": [20, 20, 5, 5]
};
var struct_time = { // Time Container
    "period": clockPer.innerHTML,
    "clock_main": clockMain.innerHTML,
    "clock_play": clockMain.innerHTML,
    "kickofftgl": 0,
    "pausetgl": 0,
    "stoptgl": 0
}
var struct_match = { // Match Information Container
    "date": [00, 00, 00], // YYYY-MM-DD
    "location": "Stadium",
    "competition": "Competition",
    "stage": "Stage",
    "kickoff": [00, 00], // 00h:00
    "score": [0, 0], // Home, Away
    "teams": ["Home Team", "Away Team"],
    "initials": ["HOME", "AWAY"]
}
var struct_team = { // Team Information Container
    "name": "Team",
    "tgl_home": 1,
    "players": []
}
for(var i = 0; i<(struct_general["nplay"] + struct_general["nsub"]); i++) {
    var pinfo = {
        "pid": i+1,
        "nfirst": "Player",
        "nlast": lastNames[i],
        "pno": i+1,
        "position": "",
        "selected": 0,
        "active": 0,
        "tplay": 0,
        "trest": 0
    }
    if (i<struct_general["nplay"]) {
        pinfo.active = 1;
    }
    struct_team["players"].push(pinfo)
}
//#endregion
//#region Initialize Tables
var tbl_match = {
    "index": [1],
    "period": ["0"],
    "min_run": ["00"],
    "sec_run": ["00"],
    "min_eff": ["00"],
    "sec_eff": ["00"],
    "result": ["1-2-1"],
    "player_no1": [-1],
    "last_name1": [""],
    "player_no2": [-1],
    "last_name2": [""],
}
for (var i = 0; i<struct_general["nplay"]; i++) {
    var timeMain = parseClock(struct_time["clock_main"],0);
    var timePlay = parseClock(struct_time["clock_play"],1);
    tbl_match["index"].push(i+2);
    tbl_match["period"].push(struct_time["period"]);
    tbl_match["min_run"].push(timeMain[0]);
    tbl_match["sec_run"].push(timeMain[1]);
    tbl_match["min_eff"].push(timePlay[0]);
    tbl_match["sec_eff"].push(timePlay[1]);
    tbl_match["result"].push("lineup");
    tbl_match["player_no1"].push(struct_team["players"][i]["pno"]);
    tbl_match["last_name1"].push(struct_team["players"][i]["nlast"]);
    tbl_match["player_no2"].push(-1);
    tbl_match["last_name2"].push("");
}
var tbl_period = {
    "Rotations": [],
    "Play Time": [],
    "Rest Time": [],
    "W/R Ratio": [],
    "% Total Time": []
}
for (i=0; i<struct_general.nper; i++) {
    tbl_period.Rotations.push([])
    tbl_period["Play Time"].push([])
    tbl_period["Rest Time"].push([])
    tbl_period["W/R Ratio"].push([])
    tbl_period["% Total Time"].push([])
    for (p=0; p<(struct_general.nplay+struct_general.nsub); p++) {
        tbl_period.Rotations[i].push(0)
        tbl_period["Play Time"][i].push(0)
        tbl_period["Rest Time"][i].push(0)
        tbl_period["W/R Ratio"][i].push(1.00)
        tbl_period["% Total Time"][i].push(0)
    }
}
//#endregion
//#endregion

//#region Clock Functions
clockKickOff.onclick = function() {
    if (struct_time.period < struct_general.nper) {
        struct_time["period"]++;
        clockPer.innerHTML = struct_time["period"];

        for (p=0; p<struct_general.nplay+struct_general.nsub; p++) {
            if (struct_team.players[p].active==1) {
                tbl_period.Rotations[struct_time.period-1][p] = 1;
            } else {
                tbl_period.Rotations[struct_time.period-1][p] = 0;
            }
            struct_team.players[p].tplay = 0;
            struct_team.players[p].trest = 0;
        }
        updateLiveVis();

        clearInterval(IntervalM);
        clearInterval(IntervalP);
        IntervalM = setInterval(startMain, 1000);
        IntervalP = setInterval(startPlay, 1000);

        // Update Match Table
        updateTime();
        var timeMain = parseClock(struct_time["clock_main"],0);
        var timePlay = parseClock(struct_time["clock_play"],1);
        tbl_match["index"].push(tbl_match["index"].length + 1)
        tbl_match["period"].push(struct_time["period"]);
        tbl_match["min_run"].push(timeMain[0]);
        tbl_match["sec_run"].push(timeMain[1]);
        tbl_match["min_eff"].push(timePlay[0]);
        tbl_match["sec_eff"].push(timePlay[1]);
        tbl_match["result"].push("kick off");
        tbl_match["player_no1"].push(-1);
        tbl_match["last_name1"].push("");
        tbl_match["player_no2"].push(-1);
        tbl_match["last_name2"].push("");

        // Toggles
        struct_time["kickofftgl"] = 1;
        // Button Enables
        buttonEnable(clockKickOff, false)
        buttonEnable(clockBreak, true)
        buttonEnable(clockPause, true)
        buttonEnable(clockStop, true)
        buttonEnable(btnLoadTeam, false)
        buttonEnable(btnLoadMatch, false)
        buttonEnable(btnSave, false)
        buttonEnable(btnExport, false)
        toggleMatch(true)
        togglePlayers(true)
        // Button Aesthetics
        clockPer.classList.remove('break');
        clockMain.classList.remove('break');
        clockPlay.classList.remove('break');
        lblLoadTeam.classList.add('break');
        lblLoadMatch.classList.add('break');
    }
}
clockBreak.onclick = function() {
    clearInterval(IntervalM);
    clearInterval(IntervalP);

    // Update Match Table
    updateTime();
    var timeMain = parseClock(struct_time["clock_main"],0);
    var timePlay = parseClock(struct_time["clock_play"],1);
    tbl_match["index"].push(tbl_match["index"].length + 1)
    tbl_match["period"].push(struct_time["period"]);
    tbl_match["min_run"].push(timeMain[0]);
    tbl_match["sec_run"].push(timeMain[1]);
    tbl_match["min_eff"].push(timePlay[0]);
    tbl_match["sec_eff"].push(timePlay[1]);
    tbl_match["result"].push("break");
    tbl_match["player_no1"].push(-1);
    tbl_match["last_name1"].push("");
    tbl_match["player_no2"].push(-1);
    tbl_match["last_name2"].push("");

    minutesM = "0";
    secondsM = "0";
    displayClock(clockMain, minutesM, secondsM, 0, struct_time.period)

    minutesP = "0";
    secondsP = "0";
    displayClock(clockPlay, minutesP, secondsP, 1, struct_time.period)

    // Toggles
    struct_time["kickofftgl"] = 0;
    struct_time["pausetgl"] = 0;
    struct_time["stoptgl"] = 0;
    // Button Enables
    buttonEnable(clockKickOff, true)
    buttonEnable(clockBreak, false)
    buttonEnable(clockPause, false)
    buttonEnable(clockStop, false)
    buttonEnable(btnSave, true)
    buttonEnable(btnExport, true)
    toggleMatch(false)
    // Button Aesthetics
    clockPer.classList.add('break');
    clockMain.classList.add('break');
    clockPlay.classList.add('break');
    clockPause.classList.remove('toggle');
    clockStop.classList.remove('toggle');
    clockMain.classList.remove('pause');
    clockPlay.classList.remove('pause');
}
clockPause.onclick = function() {
    if(struct_time["pausetgl"]==0){
        clearInterval(IntervalM);
        clearInterval(IntervalP);
        
        struct_time["pausetgl"] = 1;

        buttonEnable(clockStop, false);
        buttonEnable(btnSave, true)
        
        clockPause.classList.add('toggle');
        clockMain.classList.add('pause');
        clockPlay.classList.add('pause');
    } else {
        IntervalM = setInterval(startMain, 1000);
        IntervalP = setInterval(startPlay, 1000);
        
        struct_time["pausetgl"] = 0;
        
        buttonEnable(btnLoadTeam, false)
        buttonEnable(btnLoadMatch, false)
        buttonEnable(clockStop, true)
        buttonEnable(btnSave, false)
        
        clockPause.classList.remove('toggle');
        clockMain.classList.remove('pause');
        clockPlay.classList.remove('pause');
        lblLoadTeam.classList.add('break');
        lblLoadMatch.classList.add('break');
    }
}
clockStop.onclick = function() {
    if(struct_time["stoptgl"]==0){
        clearInterval(IntervalP);
        struct_time["stoptgl"] = 1;

        buttonEnable(clockPause, false)
        
        clockStop.classList.add('toggle');
        clockPlay.classList.add('pause');
    } else {
        IntervalP = setInterval(startPlay, 1000);
        struct_time["stoptgl"] = 0;

        buttonEnable(clockPause, true)
        
        clockStop.classList.remove('toggle');
        clockPlay.classList.remove('pause');
    }
}
function startMain() {
    secondsM++;
    
    if (secondsM > 59) {
        minutesM++;
        secondsM = 0;
    }

    displayClock(clockMain, minutesM, secondsM, 0, struct_time.period-1)
}
function startPlay() {
    secondsP++;
    
    if (secondsP > 59) {
        minutesP++;
        secondsP = 0;
    }
    for (i=0; i<struct_team.players.length; i++) {
        if (struct_team.players[i].active==1) {
            struct_team.players[i].tplay++;
            tbl_period["Play Time"][struct_time.period-1][i]++;
        } else {
            struct_team.players[i].trest++;
            tbl_period["Rest Time"][struct_time.period-1][i]++;
        }
        updateWRPer(i)
    }
    updateLiveVis()
    updateAnlUITable()

    displayClock(clockPlay, minutesP, secondsP, 1, struct_time.period-1)
}
function displayClock(clockTxt, minutes, seconds, mode, per) {
    if (per < struct_general.nper) {
        // mode: 0 - Main Clock, 1 - Play Clock
        if (mode==0) {
            var minutesTxt = parseInt(minutes)
            var secondsTxt = parseInt(seconds)
            if(minutes<=9){
                minutesTxt = "0" + parseInt(minutes)
            }
            if(seconds<=9){
                secondsTxt = "0" + parseInt(seconds)
            }
            clockTxt.innerHTML = minutesTxt + ":" + secondsTxt;
        } else {
            var secondsTotal = 60*struct_general.per_time[per] - (parseInt(seconds) + 60*parseInt(minutes))
            if (secondsTotal>=0) {
                clockTxt.innerHTML = setClock(secondsTotal)
            } else {
                var minutesTxt = Math.ceil(secondsTotal/60);
                var secondsTxt = Math.abs(secondsTotal - 60*minutesTxt);
                if (minutesTxt>-10) {
                    minutesTxt = "-0" + Math.abs(minutesTxt);
                }
                if (secondsTxt<10) {
                    secondsTxt = "0" + secondsTxt;
                }
                clockTxt.innerHTML = minutesTxt + ":" + secondsTxt
            }
        }
    } else {
        clockTxt.innerHTML = "--:--"
    }
}
function parseClock(clockTxt, mode) {
    // 0: Main Clock, 1: Play Clock
    if (mode==0) {
        clockArr = clockTxt.split(":");
        minutes = clockArr[0];
        seconds = clockArr[1];
    } else {
        clockArr = clockTxt.split(":");
        secondsTotal = 60*struct_general.per_time[struct_time.period-1] - (60*parseInt(clockArr[0]) + parseInt(clockArr[1]));
        minutes = Math.floor(secondsTotal/60);
        seconds = secondsTotal - 60*minutes;
        if (minutes<=9) {
            minutes = "0"+minutes;
        } else {
            minutes = minutes.toString();
        }
        if (seconds<=9) {
            seconds = "0"+seconds;
        } else {
            seconds = seconds.toString();
        }
    }

    return [minutes, seconds]
}
function setClock(seconds) {
    minutes = Math.floor(seconds/60);
    sec = seconds - 60*minutes;
    if (minutes<10) {
        minutes = "0"+minutes;
    }
    if (sec<10) {
        sec = "0" + sec;
    }
    return minutes + ":" + sec
}
function updateTime() {
    struct_time["clock_main"] = clockMain.innerHTML;
    struct_time["clock_play"] = clockPlay.innerHTML;
    struct_time["period"] = clockPer.innerHTML;
}
//#endregion

//#region Analysis
function updateAnlUITable() {
    tblAnl.innerHTML = "";
    
    var table = "";
    var metrics = Object.keys(tbl_period); // Rotations, Play Time, Rest Time, W/R
    var perlbl = struct_general.per_lbl;
    var cols = struct_team.players.length;

    // METRIC COLOR SCHEME
    metCol = [  [104,108,115,24,160,251],
                [104,108,115,79,191,111], // Play Time: Slate -> Green
                [104,108,115,240,65,80], // Rest Time: Slate -> Red
                [216,110,11,79,191,111,24,160,251], // WR Ratio: Red -> Green -> Blue
                [104,108,115,24,160,251]    ] // % of Period Played: Slate -> Blue

    // TEAM ROW
    table += "<tr>";
    table += "<th style='background-color:black; text-align: right'>Team &nbsp &nbsp</th>";
    for (c=0; c<cols; c++) {
        table += "<th style='background-color:black'>" + struct_team.players[c].nlast + "</th>";
    }
    table += "</tr>";
    table = addRowSpace(table);
    // DATA ROWS
    for (var p=0; p<struct_general.nper; p++) {
        for (m=0; m<metrics.length; m++) {
            table += "<tr>";
            table += "<th style='background-color:black; text-align: right'>" + perlbl[p] + "_" + metrics[m] +" &nbsp &nbsp</th>";

            for (c=0; c<cols; c++) {
                cellData = tbl_period[metrics[m]][p][c]
                // GET METRIC FORMAT
                if (m==1 || m==2) { // Play/Rest Time
                    cellData = setClock(cellData)
                } else if (m==4) { // % Played
                    cellData += "%"
                }
                cCol = 'black'
                if (m==3) {
                    cCol = getCellColorWR(tbl_period[metrics[m]][p][c], metCol[m])
                } else {
                    cCol = getCellColor(tbl_period[metrics[m]][p], c, metCol[m])
                }

                table += "<th style=" + 
                "'background-color:" + cCol + ";" + 
                "color:var(--grey6);" + 
                "'>" + cellData + "</th>"
            }
            table += "</tr>";
        }
        table = addRowSpace(table);
        tblAnl.innerHTML = table;
    }

    function addRowSpace(table) {
        table += "<tr>";
        table += "<th style='background-color:var(--slate1)'></th>";
        for (c=0; c<cols; c++) {
            table += "<th style='background-color:var(--slate1)'></th>";
        }
        table += "</tr>";

        return table;
    }
}
function getCellColor(dataArr, idx, rgb) {
    rVal = rgb[0]+(rgb[3]-rgb[0])*(dataArr[idx] / (Math.max(...dataArr)+0.01));
    gVal = rgb[1]+(rgb[4]-rgb[1])*(dataArr[idx] / (Math.max(...dataArr)+0.01));
    bVal = rgb[2]+(rgb[5]-rgb[2])*(dataArr[idx] / (Math.max(...dataArr)+0.01));

    return "rgb(" + rVal + "," + gVal + "," + bVal + ")"
}
function getCellColorWR(wr, rgbRGB) {
    rgb = [rgbRGB[0], rgbRGB[1], rgbRGB[2], rgbRGB[3], rgbRGB[4], rgbRGB[5]];
    if (wr>1) {
        wr = 1/wr;
        rgb = [rgbRGB[3], rgbRGB[4], rgbRGB[5], rgbRGB[6], rgbRGB[7], rgbRGB[8]];
    }
    rVal = rgb[0]+(rgb[3]-rgb[0])*wr;
    gVal = rgb[1]+(rgb[4]-rgb[1])*wr;
    bVal = rgb[2]+(rgb[5]-rgb[2])*wr;

    return "rgb(" + rVal + "," + gVal + "," + bVal + ")"
}
function getVisColorWR(wr, rgb1, rgb2) {
    rgb = rgb2;
    if (wr>1) {
        wr = 1/wr;
        rgb = rgb1;
    }
    rVal = rgb[0]+(rgb[3]-rgb[0])*wr;
    gVal = rgb[1]+(rgb[4]-rgb[1])*wr;
    bVal = rgb[2]+(rgb[5]-rgb[2])*wr;

    return "rgb(" + rVal + "," + gVal + "," + bVal + ")"
}
function updateLiveVis() {
    colG = [200,200,200,79,191,111];
    colR = [200,200,200,240,65,80];
    colGB = [24,160,251,79,191,111];
    colRG = [240,65,80,79,191,111];

    perno = struct_time.period;
    if (perno==0) {
        perno=1;
    }
    tPlayDat = getKeyArray(struct_team.players, "tplay")
    tRestDat = getKeyArray(struct_team.players, "trest")
    for (i=1; i<=struct_general.nplay + struct_general.nsub; i++) {
        // GET CLOCK COLOR
        txtRot = document.getElementById("rot" + i);
        txtRot.innerHTML = tbl_period.Rotations[perno-1][i-1];

        txtClock = document.getElementById("time" + i);
        clockDat = struct_team.players[i-1].tplay;
        cCol = getCellColor(tPlayDat, i-1, colG)
        if (struct_team.players[i-1].active==0) {
            clockDat = struct_team.players[i-1].trest;
            cCol = getCellColor(tRestDat, i-1, colR)
        }
        txtClock.innerHTML = setClock(clockDat);
        txtClock.style.color = cCol;

        wrRatio = Math.round(100*struct_team.players[i-1].tplay / (struct_team.players[i-1].trest+1))/100;
        if (wrRatio>=1) {
            
        }
        txtWR = document.getElementById("wr" + i);
        txtWR.innerHTML = wrRatio;
        txtWR.style.color = getVisColorWR(wrRatio, colGB, colRG);
    }
}

function updateWRPer(pno) {
    tplay = tbl_period["Play Time"][struct_time.period-1][pno];
    trest = tbl_period["Rest Time"][struct_time.period-1][pno];
    wrRatio = Math.round(100*tplay / (trest+1))/100;
    perPlay = 100*Math.round(100*tplay / (60*struct_general.per_time[struct_time.period-1]))/100;

    tbl_period["W/R Ratio"][struct_time.period-1][pno] = wrRatio;
    tbl_period["% Total Time"][struct_time.period-1][pno] = perPlay;
}
//#endregion

//#region Team Actions+Passing
function setSelected(i) {
    el = document.getElementById("play" + i);
    if (struct_team["players"][i-1]["selected"]==0) {
        struct_team["players"][i-1]["selected"] = 1;
        el.classList.add('selected');
    } else {
        struct_team["players"][i-1]["selected"] = 0;
        el.classList.remove('selected');
    }
}
function checkSub() {
    var selArray = getKeyArray(struct_team["players"], "selected");
    if (arrSum(selArray)==2) {
        switchPlayers(selArray);
    }
}
function switchPlayers(selArray){
    var pID1 = getAllIndexes(selArray, 1)[0];
    var pID2 = getAllIndexes(selArray, 1)[1];

    // Determine on and off
    var onID = pID1;
    var offID = pID2;
    var validSub = false;
    if (struct_team.players[pID1].active==0 && struct_team.players[pID2].active==1) {
        onID = pID1;
        offID = pID2;
        validSub = true;
    } else if (struct_team.players[pID1].active==1 && struct_team.players[pID2].active==0) {
        onID = pID2;
        offID = pID1;
        validSub = true;
    }
    el1 = document.getElementById("play" + (onID+1));
    el2 = document.getElementById("play" + (offID+1));

    if (validSub) {
        struct_team["players"][offID]["active"] = 0;
        struct_team["players"][onID]["active"] = 1;

        // Update Analysis Table
        perno = struct_time["period"];
        if (perno==0) {
            perno=1;
        }
        tbl_period.Rotations[perno-1][onID] += 1;
        console.log(tbl_period.Rotations[perno])

        // Update Live Vis
        struct_team.players[onID].tplay = 0;
        struct_team.players[offID].trest = 0;
        updateLiveVis();

        // Update Match Table
        updateTime();
        var timeMain = parseClock(struct_time["clock_main"],0);
        var timePlay = parseClock(struct_time["clock_play"],1);
        tbl_match["index"].push(tbl_match["index"].length + 1);
        tbl_match["period"].push(struct_time["period"]);
        tbl_match["min_run"].push(timeMain[0]);
        tbl_match["sec_run"].push(timeMain[1]);
        tbl_match["min_eff"].push(timePlay[0]);
        tbl_match["sec_eff"].push(timePlay[1]);
        tbl_match["result"].push("substitution");
        tbl_match["player_no1"].push(struct_team["players"][offID]["pno"]);
        tbl_match["last_name1"].push(struct_team["players"][offID]["nlast"]);
        tbl_match["player_no2"].push(struct_team["players"][onID]["pno"]);
        tbl_match["last_name2"].push(struct_team["players"][onID]["nlast"]);
        // Aesthetics
        el1.classList.add('active');
        el2.classList.remove('active');
        //checkSub();
        updateAnlUITable();
        console.log(el1)
    }
    struct_team.players[onID].selected = 0;
    struct_team.players[offID].selected = 0;
    el1.classList.remove('selected');
    el2.classList.remove('selected');
}

btnP1.onclick = function(){setSelected(1); checkSub()}
btnP2.onclick = function(){setSelected(2); checkSub()}
btnP3.onclick = function(){setSelected(3); checkSub()}
btnP4.onclick = function(){setSelected(4); checkSub()}
btnP5.onclick = function(){setSelected(5); checkSub()}
btnP6.onclick = function(){setSelected(6); checkSub()}
btnP7.onclick = function(){setSelected(7); checkSub()}
btnP8.onclick = function(){setSelected(8); checkSub()}
btnP9.onclick = function(){setSelected(9); checkSub()}
btnP10.onclick = function(){setSelected(10); checkSub()}
btnP11.onclick = function(){setSelected(11); checkSub()}
btnP12.onclick = function(){setSelected(12); checkSub()}
btnP13.onclick = function(){setSelected(13); checkSub()}
btnP14.onclick = function(){setSelected(14); checkSub()}
btnP15.onclick = function(){setSelected(15); checkSub()}
btnP16.onclick = function(){setSelected(16); checkSub()}

btnGH.onclick = function() {
    struct_match["score"][0]++
    txtHScore.innerHTML++;
    if (struct_team["tgl_home"]==1) {
        addGoal("goal for");
    } else {
        addGoal("goal against")
    }
}
btnGA.onclick = function() {
    struct_match["score"][1]++
    txtAScore.innerHTML++;
    if (struct_team["tgl_home"]==0) {
        addGoal("goal for");
    } else {
        addGoal("goal against")
    }
}

function addGoal(lbl) {
    updateTime()
    var timeMain = parseClock(struct_time["clock_main"],0);
    var timePlay = parseClock(struct_time["clock_play"],1);
    tbl_match["index"].push(tbl_match["index"].length + 1);
    tbl_match["period"].push(struct_time["period"]);
    tbl_match["min_run"].push(timeMain[0]);
    tbl_match["sec_run"].push(timeMain[1]);
    tbl_match["min_eff"].push(timePlay[0]);
    tbl_match["sec_eff"].push(timePlay[1]);
    tbl_match["result"].push(lbl);
    tbl_match["player_no1"].push(-1);
    tbl_match["last_name1"].push(-1);
    tbl_match["player_no2"].push(-1);
    tbl_match["last_name2"].push(-1);
}

//#endregion

//#region Load Team
btnLoadTeam.onchange = function() {loadTeamInfo()};

function loadTeamInfo() {
    var files = btnLoadTeam.files || [];
    if (!files.length) return;
    var file = files[0];
  
    var reader = new FileReader();
    reader.onloadend = function(event) {
      var arrayBuffer = reader.result;
 
      var options = { type: 'array' };
      var workbook = XLSX.read(arrayBuffer, options);
  
      var sheetName = workbook.SheetNames[0]
      var sheet = workbook.Sheets[sheetName]
      
      var matchInfo = {};
      for (var i=1; i<11; i++) {
        matchInfo[sheet["A"+i]["v"]] = sheet["B"+i]["v"];
      }
      var playerInfo = {
        "pid": [],
        "pno": [],
        "nfirst": [],
        "nlast": [],
        "position": []
      };
      for (var i=14; i<30; i++) {
        playerInfo["pid"].push(sheet["A"+i]["v"]);
        playerInfo["pno"].push(sheet["B"+i]["v"]);
        playerInfo["nfirst"].push(sheet["C"+i]["v"]);
        playerInfo["nlast"].push(sheet["D"+i]["v"]);
        playerInfo["position"].push(sheet["E"+i]["v"]);
        console.log(sheet["D" + i]["v"])
      }

      updateTeamInfo(matchInfo, playerInfo);
      updateAnlUITable();
    };
    reader.readAsArrayBuffer(file);
}
function updateTeamInfo(mInfo, pInfo) {
    // Match Info
    struct_match["date"] = mInfo["Match Date"];
    struct_match["location"] = mInfo["Location"];
    struct_match["competition"] = mInfo["Competition"];
    struct_match["stage"] = mInfo["Stage"];
    struct_match["kickoff"] = mInfo["Kick Off Time"];
    struct_match["teams"] = [mInfo["Home Team"], mInfo["Away Team"]];
    struct_match["initials"] = [mInfo["Home Display"], mInfo["Away Display"]];

    // Team Info
    struct_team["name"] = mInfo["Team Analyzed"];
    if (mInfo["Home Team"]==mInfo["Team Analyzed"]) {
        struct_team["tgl_home"] = 1;
    } else {
        struct_team["tgl_home"] = 0;
    }
    for(var i=0; i<(struct_general["nplay"] + struct_general["nsub"]); i++) {
        struct_team["players"][i]["pno"] = pInfo["pno"][i];
        struct_team["players"][i]["nfirst"] = pInfo["nfirst"][i];
        struct_team["players"][i]["nlast"] = pInfo["nlast"][i];
        struct_team["players"][i]["position"] = pInfo["position"][i];
    }

    // Update Team UI Labels
    txtHome.innerHTML = struct_match.initials[0];
    txtAway.innerHTML = struct_match.initials[1];
    txtHome.style.fontSize = "2vh"
    txtAway.style.fontSize = "2vh"
    btnGH.innerHTML = struct_match.initials[0] + "\n Goal";
    btnGA.innerHTML = struct_match.initials[1] + "\n Goal";

    // Update Player UI Labels
    for (i=0; i<struct_team.players.length; i++) {
        elName = document.getElementById('name'+(i+1));
        elName.innerHTML = struct_team.players[i].nlast.substring(0,7);
        elNo = document.getElementById('no'+(i+1));
        elNo.innerHTML = struct_team.players[i].pno + '.';
    }
}
//#endregion

//#region Load Match
btnLoadMatch.onchange = function() {
    let file = btnLoadMatch.files[0];
    let reader = new FileReader();
    reader.addEventListener('load', function(e) {
            let text = e.target.result;
            var match_data = JSON.parse(text);

            // UPDATE STRUCTURES
            struct_general = match_data["general"];
            struct_match = match_data["match"];
            struct_time = match_data["time"];
            struct_team = match_data["team"];
            tbl_match = match_data["tbl_match"];
            tbl_period = match_data["tbl_period"];

            // UPDATE MINUTES + SECONDS        
            var timeMain = parseClock(struct_time["clock_main"],0);
            var timePlay = parseClock(struct_time["clock_play"],1);
            minutesM = timeMain[0];
            secondsM = timeMain[1];
            minutesP = timePlay[0];
            secondsP = timePlay[1];

            // UPDATE INFO
            updateAnlUITable();
            clockPer.innerHTML = struct_time["period"];
            clockMain.innerHTML = struct_time["clock_main"];
            clockPlay.innerHTML = struct_time["clock_play"];
            txtHScore.innerHTML = struct_match["score"][0];
            txtAScore.innerHTML = struct_match["score"][1];
            // UPDATE ENABLES
            if (struct_time["pausetgl"]==1) {
                buttonEnable(clockKickOff, false);
                buttonEnable(clockBreak, true);
                buttonEnable(clockPause, true);
                buttonEnable(clockStop, false);
                buttonEnable(btnSave, true);
                buttonEnable(btnExport, false);
                
                clockPause.classList.add('toggle');
                clockMain.classList.remove('break');
                clockPlay.classList.remove('break');
                clockPer.classList.remove('break');
                clockMain.classList.add('pause');
                clockPlay.classList.add('pause');

                togglePlayers(true);
                toggleMatch(true);
            } else {
                buttonEnable(btnExport, true);
            }
    });
    reader.readAsText(file);
};
//#endregion

//#region Save Match
btnSave.onclick = function() {
    updateTime();
    var struct = {
        "general": struct_general,
        "match": struct_match,
        "time": struct_time,
        "team": struct_team,
        "tbl_match": tbl_match,
        "tbl_anl": tbl_anl
    }
    var blob = new Blob([JSON.stringify(struct)], {type: "text/plain;charset=utf-8"});
    var fileName = struct_match["teams"][0] + "_" + struct_match["teams"][1] + "_" + struct_match["date"] + ".txt";
    saveAs(blob, fileName);
}
//#endregion

//#region Export Data
function pushSheet(wb, name, data) {
    var ws = XLSX.utils.aoa_to_sheet(data);
    wb.SheetNames.push(name);
    wb.Sheets[name] = ws;

    return wb
}
function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
}

btnExport.onclick = function() {
    var head;
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "BreakAway Futsal",
        Author: "Sport Performance Analytics Inc.",
        CreatedDate: new Date()
    };

    // Match Info Tab
    var dataMatchInfo = [];
    // Header
    dataMatchInfo.push(["Team Analyzed", "Date", "Location", "Competition", "Stage", "KickOff",
    "Home Team", "Away Team", "Home Initials", "Away Initials", "Goals (Home)", "Goals (Away)"]);
    dataMatchInfo.push([struct_team["name"], struct_match["date"], struct_match["location"], struct_match["competition"],
    struct_match["stage"], struct_match["kickoff"], struct_match["teams"][0], struct_match["teams"][1],
    struct_match["initials"][0], struct_match["initials"][1], struct_match["score"][0], struct_match["score"][1]]);

    // Team Info Tab
    var dataTeamInfo = [];
    // Header
    dataTeamInfo.push(["Player ID", "Player No", "First Name", "Last Name", "Position"]);
    // Data
    for (var row=0; row<struct_team["players"].length; row++) {
        dataTeamInfo.push([
            struct_team["players"][row]["pid"],
            struct_team["players"][row]["pno"],
            struct_team["players"][row]["nfirst"],
            struct_team["players"][row]["nlast"],
            struct_team["players"][row]["position"]
        ]);
    }

    // Match Events Tab
    var dataMatchEvents = [];
    // Header
    dataMatchEvents.push(Object.keys(tbl_match));
    // Data
    if (tbl_match["index"].length > 0) {
        for (var row=0; row<tbl_match["index"].length; row++) {
            var datarow = [];
            for (var col=0; col<Object.keys(tbl_match).length; col++) {
                datarow.push(tbl_match[Object.keys(tbl_match)[col]][row])
            }
            dataMatchEvents.push(datarow.slice());
        }
    }

    // Playing Stats Tab
    var dataPlayEvents = [];
    var metrics = Object.keys(tbl_period); // Rotations, Play Time, Rest Time, W/R
    var perlbl = struct_general.per_lbl;
    // Header
    var headerrow = []
    headerrow.push('Jersey #')
    headerrow.push('Display Name')
    for (p=0; p<struct_general.nper; p++) {
        for (m=0; m<metrics.length; m++) {
            headerrow.push(perlbl[p] + '_' + metrics[m])
        }
    }
    dataPlayEvents.push(headerrow)
    // Data
    for (i=0; i<struct_team.players.length; i++) {
        var datarow = [];
        datarow.push(struct_team.players[i].pno)
        datarow.push(struct_team.players[i].nlast)
        for (p=0; p<struct_general.nper; p++) {
            for (m=0; m<metrics.length; m++) {
                datarow.push(tbl_period[metrics[m]][p][i])
            }
        }
        dataPlayEvents.push(datarow.slice());
    }

    wb = pushSheet(wb, "Match Info", dataMatchInfo);
    wb = pushSheet(wb, "Team Info", dataTeamInfo);
    wb = pushSheet(wb, "Match Events", dataMatchEvents);
    wb = pushSheet(wb, "Playing Stats", dataPlayEvents);

    // Export
    var fileName = struct_match["teams"][0] + "_" + struct_match["teams"][1] + "_" + struct_match["date"] + ".xlsx";
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), fileName);
};
//#endregion

//#region UI SET
window.onload = function() {
    toggleMatch(false);
    togglePlayers(false);
    buttonEnable(clockBreak, false);
    buttonEnable(clockPause, false);
    buttonEnable(clockStop, false);
    buttonEnable(btnSave, false);
    buttonEnable(btnExport, false);
    updateAnlUITable();
    updateLiveVis();
}
//#endregion

function buttonEnable(button, tgl) {
    if (tgl) {
        button.disabled = false;
        button.classList.remove('disabled');
    } else {
        button.disabled = true;
        button.classList.add('disabled');
    }
}
function togglePlayers(tgl) {
    var prefix = 'play';
    for(var i = 1; i<=struct_general.nplay+struct_general.nsub; i++) {
        el = document.getElementById(prefix + i);
        buttonEnable(el, tgl)
    }
    var prefix = 'btn';
    for(var i = 1; i<=struct_general.nplay+struct_general.nsub; i++) {
        el = document.getElementById(prefix + i);
        buttonEnable(el, tgl)
    }
}
function toggleMatch(tgl) {
    buttonEnable(btnGH, tgl);
    buttonEnable(btnGA, tgl);
    if (tgl==false) {
        txtHScore.classList.add("break");
        txtAScore.classList.add("break");
    } else {
        txtHScore.classList.remove("break");
        txtAScore.classList.remove("break");
    }
}
function getKeyArray(dictname, keyname) {
    var valueArray = [];
    for (i=0; i<dictname.length; i++) {
        valueArray.push(dictname[i][keyname])
    }

    return valueArray
}
function getAllIndexes(arr, val) {
    var indexes = [];
    for(var i = 0; i < arr.length; i++)
        if (arr[i] == val)
            indexes.push(i);
    return indexes;
}
