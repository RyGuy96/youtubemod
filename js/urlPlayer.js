
counter = 0;
let startTimes = []; // Starting seconds
let timeOuts = []; // Milliseconds of each timeout

parsed = parseCustomURL(window.location.href);
let id = parsed[0];
parsed.shift(); // Lose id

startTimes = adjustTimes(parsed)[0];
timeOuts =  adjustTimes(parsed)[1];

// Loads the IFrame Player API code asynchronously
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Creates an <iframe> (and YouTube player) after the API downloads
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        // height: window.innerHeight,
        // width: window.innerWidth,
        videoId: id, //example id:https://www.youtube.com/watch?v=U03lLvhBzOw
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
    $('iframe').css({"position":"fixed", "top":0, "left":0, "bottom":0, "right":0, "width":"100%", "height":"100%", "border":"none", "margin":0, "padding":0, "overflow":"hidden", "z-index":"999999"})


}

// Parse custom Url
function parseCustomURL(customUrl) {
    customUrl =  document.location.href; //"youtubemod.com/player?mTdSh-em7_M?222&230&864&1102&beta";
    inputId = [customUrl.split("\?")[1]];
    body = customUrl.split("\?")[2];
    times = body.split("\&");
    times.pop(); // lose "beta" at end
    vidInfo = inputId.concat(times);
    return vidInfo
}

// Account for skips because function gets absolute not relative time
function adjustTimes(times) {

    let startTimes = [];
    let timeOuts = [0];
    let i;
    for (i = 0; i < times.length; i++) {
        if (i % 2 !== 0 || i === 1) {
            timeOuts.push(1000 * (times[i] - times[i - 1]));
        } else {
            startTimes.push(times[i])
        }
    }
    return [startTimes, timeOuts]
}

function goTo(time){
    player.seekTo(time, true);
    player.pauseVideo(); // Hack to trigger onPlayerStateChange()
    player.playVideo();
}

// Reloaded iFrame player to once again trigger onPlayerStateChange()
function endVideo(){
    player.stopVideo();
    location.reload();
}

function playWithTimeout () {
    if(timeOuts.length === counter) {
        endVideo();
    }
    else {
        setTimeout (function () {
            goTo (startTimes[counter]);
            counter++;
            playWithTimeout ();
        }, timeOuts[counter]);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && counter === 0) {
        setTimeout (function () {
            goTo (startTimes[counter]);
            counter++;
            playWithTimeout ();
        }, timeOuts[counter]);
    }
}


