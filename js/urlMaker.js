/**
 * Functionality for YouTubeMod main page including creating custom url.
 * @author Ryan Lenea
 * Copyright 2020 Ryan Lenea
 */

let errorCounter = 0; // Hack to avoid repeat player errors. See onPlayerError() below.
let counter = 1; // Iterate to keep track of added, removed start/end time rows.
let prevSelectedInput = $('#start-0'); // Keep track of where slider value to be placed.

loadPage(); // Initial page load


/**
 * Loads the simple initial page where time adjusting functions are hidden.
 */
function loadPage() {
    addHeader();
    setListeners();
}


/**
 * Sets all listeners used for custom url creation panel and video tools.
 */
function setListeners() {
    let timeSlider = $('#timeSlider');

    $('#showBtn').click(function () {
        renderVideo()
    });
    $('#removeTimes-btn').click(function () {
        removeLastTime()
    });
    $('#logo-text').click(function () {
        resetPageSettings()
    });
    $('#addTimes-btn').click(function () {
        addRow();
        setTimeValidationListeners();
    });
    $('#constructUrl-btn').click(function () {
        constructUrl();
    });
    timeSlider.change(function () {
        sliderPop();
    });
    timeSlider.dblclick(function () {
        toggleState();
    });

    setTimeValidationListeners();
    setPrevSelectedListeners();
}


/**
 * Saves reference of last last clicked time input field so output of slide adjustment populates correct time input.
 * @return {String} id reference to last clicked time input.
 */
function setPrevSelectedListeners() {
    document.addEventListener('click', function (event) {
        if (!event.target.matches('.timeInput')) return;
        prevSelectedInput = document.getElementById(event.target.id);
    }, false);
}

/**
 * Performs time validation if time input value changed.
 */
function setTimeValidationListeners() {
    $('.timeInput').each(function(index) {
        $(this).on('input', function() {
            timesValid();
        });
    });
}

/**
 * Changes class of time inputs with invalid value to visually demonstrate they are invalid.
 * @return {boolean} true if all time inputs are valid, else false.
 */
function timesValid(){
    console.log("inside timesValid");
    let prev = -1;
    let valid = true;
    let max = parseInt($('#timeSlider').attr('max'), 10);
    $('.timeInput').each(function(index) {
        let inputVal = parseInt($(this).val());
        if(inputVal <= prev || isNaN(inputVal) || inputVal > max) {
            $(this).addClass("is-invalid");
            prev = inputVal;
            valid = false;
        }
        else {
            $(this).removeClass("is-invalid");
            prev = inputVal;
        }
    });
    return valid;
}


/**
 * Revert page to look at initial page load by removing time modifation panel etc.
 */
function resetPageSettings() {
    // TODO: this need to be uncommented and made to work, not just hackily reloaded.
    // resetTimeSettings();
    // $('#editor-tools').hide();
    // $('iframe').remove();
    // $('#video-spot').append('<div id="player" class="embed-youtube"></div>');
    // $('#url-field').val('');
    // if (!$('#title')) {
    //     addHeader();
    // }
    //Above addHeader adding back in not working, also url has # which shouldn't. Temp fix to just reload page below.
    location.reload();
}


/**
 * Revert to time settings panel and url input before any inputs added.
 */
function resetTimeSettings(){
    let startTime = $('#start-0');

    startTime.value = '';
    $('#end-0').value = '';
    $('#url-space').innerHTML = '';

    $("#user-added-times").children().remove();
    $('.url-row').remove();

    prevSelectedInput =  startTime;
    counter = 1;
}


/**
 * Add descriptive header on main page.
 */
function addHeader() {
    const div = document.createElement('div');
    div.className = 'class="col-xl-9 mx-auto';
    div.id = 'title';
    div.innerHTML = `<div class="col-xl-9 mx-auto"><h1 class="mb-5">Create a YouTube url that plays only the parts you want</h1></div>`;
    document.getElementById('mainForm').prepend(div);
}


/**
 * Remove descriptive header on main page.
 */
function removeHeader() {
    let title = $('#title');
    if (title){
        title.remove();
    }
}


/**
 * Sets the time slider's max val to be the length of the loaded video.
 * @param event
 */
function onPlayerReady(event) {
    let vidLength = player.getDuration();
    document.getElementById("timeSlider").max = vidLength - 2; // Not sure why need -2
}


/**
 * Copies the newly created url to the clipboard and notifies user.
 */
function copyCustomUrl() {
    let urlArea = document.getElementById('customUrl-input');
    urlArea.select();
    document.execCommand("copy");
    // TODO have highlight input or perform some other demonstration of copy. Not as intrusive as alert.
    // window.alert("Your URL is copied to your clipboard!");
    // delete window.alert;
}


/**
 * Removes a single time input setting row.
 */
function removeLastTime(){
    $("#user-added-times").children().last().remove();
    counter--;
    document.getElementById("url-space").innerHTML = '';
}


/**
 * Links time slider to video's time and time input fields.
 */
function sliderPop(){
    let timeSliderValue = $('#timeSlider').val();
    player.seekTo(timeSliderValue, true);
    $(prevSelectedInput).val(timeSliderValue);
    timesValid();
}


/**
 * Pauses/Plays video on double click of time slider.
 */
function toggleState() {
    let state = player.getPlayerState();
    if (state === -1 || state === 2 ) {
        player.playVideo();
    } else {
        player.pauseVideo();
    }
}


/**
 * Loads un-modified YouTube video based on url input by user.
 */
function renderVideo() {
    removeHeader();

    let vidIframe = $('iframe');
    let vidId = document.getElementById("url-field").value.split("=")[1];

    // If there is an iframe, there is a video; delete and replace with div placeholder to mark where new iframe to go.
    if (vidIframe.length > 0) {
        vidIframe.remove();
        $('#video-spot').append('<div id="player" class="embed-youtube"></div>');
    }

    // Load video.
    player = new YT.Player('player', {
        videoId: vidId, //'M7lc1UVf-VE'
        events: {
            onReady: onPlayerReady,
            onError: onPlayerError
        }
    });

    // Reset the time modification panel.
    resetTimeSettings();
    $('#editor-tools').show();
}


/**
 * Adds a row (one start and one stop time) to the time editing panel.
 */
function addRow() {
    $('#user-added-times').append(makeTimeRow());
    prevSelectedInput = document.getElementById('start-' + counter);
    $('#url-space').html('');
    counter++;
}


/**
 * Creates HTML for a time row (one start and one stop time).
 */
function makeTimeRow(){
    let startId = 'start-' + counter;
    let endId = 'end-' + counter;
    htmlRow = '<div class="form-row">'
        + '<div class="col-12 col-md-4 mb-2 mb-md-1">'
        + '<input type="number" class="form-control form-control-lg timeInput" min="0" id="'
        + startId
        + '"></div>'
        + '<div class="col-12 col-md-4 mb-2 mb-md-1">'
        + '<input type="number" class="form-control form-control-lg timeInput" min="0" id="'
        + endId
        + '"></div>'
        + '</div>';
    return htmlRow;
}


/**
 * Adds a row with the user customized YouTube url.
 */
function makeUrlRow() {
    return '<div class="form-row output-row url-row">'
        + '<div class="col-12 col-md-4 mb-2 mb-md-1">'
        + '<button type="button" id="copyOutput-btn" class="btn btn-block btn-lg btn-primary">Copy Your Link</button>'
        + '</div>'
        + '<div class="col-12 col-md-8 mb-2 mb-md-1">'
        + '<input type="text" id="customUrl-input" class="form-control form-control-lg timeInput">'
        + '</div></div>';
}


/**
 * Creates a custom url based on the user input url and their stop/start time preferences.
 * Note: If there is just one start time and one stop time, returns a legitimate YouTube url (as it YouTube natively handles).
 * @return {undefined} optional return value if user time inputs are invalid to prevent url creation.
 */
function constructUrl() {

    if (!timesValid()) {
        alert("Please enter a valid time sequence (currently must be sequential integer values representing seconds)");
        return;
    }

    // Create custom Url.
    let newUrl;
    let timeinputs = $('.timeInput');
    let vidId = $('#url-field').val().split("=")[1];
    if (timeinputs.length === 2){
        newUrl = "https://www.youtube.com/embed/" + vidId + "?start=" + timeinputs[0].value + "&end=" + timeinputs[1].value;
    } else {
        let times = "";
        timeinputs.each(function(index) {
            times += ($(this).val() + '&');
        });
        newUrl = "youtubemod.com/player?" + vidId + "?" + times + "beta";
    }

    // Clean up time panel and display custom Url.
    let outputRow = makeUrlRow();
    let urlSpace = $('#url-space');
    urlSpace.children().remove();
    urlSpace.append(outputRow);
    $('#customUrl-input').val(newUrl);

    // Allow button click to copy custom Url to clipboard.
    $('#copyOutput-btn').click(function() {
        copyCustomUrl();
    });

}


/**
 * Handle various YouTube player errors.
 * TODO improve below hack.
 * Notes: case2 uses a hack to get around Youtube API bug that throws two errors on each invalid url instance (case 2):
 * https://stackoverflow.com/questions/31878905/youtube-iframe-api-why-is-onerror-event-being-called-twice
 * @param event {event} Player API event.
 */
function onPlayerError(event) {
    switch (event.data) {
        case 2:
            if (errorCounter === 0){
                alert('Not a valid url');
                errorCounter = 1;
            }
            else {
                errorCounter = 0;
            }
            break;
        case 5:
            alert('HTML5 player error - try a different browser');
            break;
        case 100:
            alert('Could not find that video');
            break;
        case 101:
            alert('Owner blocked video from playing on 3rd party sites');
            break;
        case 150:
            alert('Owner blocked video from playing on 3rd party sites');
            break;
        default:
            alert('Unkown error playing video');
            break
    }
}