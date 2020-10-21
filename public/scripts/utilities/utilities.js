let seconds = 0;
let minutes = 0;
let hours = 0;
let secondsConcat = 0;
let stringTime = ``;

function incrementSeconds() {

    if (secondsConcat === 60) {
        minutes++;
        secondsConcat = 0;
    }

    if (minutes === 59) {
        minutes = 0;
        hours++;
        stringTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${secondsConcat < 10 ? `0${secondsConcat}` : secondsConcat}`
    }


    if (seconds >= 60) {
        if (minutes >= 59) {
            hours = Math.floor(seconds / 3600);
        }

        if (Math.floor((seconds + 1) / 60) % 60 < 60 && minutes === 0) {
            minutes = Math.floor((seconds + 1) / 60) % 60;
        }

        stringTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${secondsConcat < 10 ? `0${secondsConcat}` : secondsConcat}`
        secondsConcat++;
    } else {
        if (seconds < 10) {
            stringTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:0${seconds}`
        }
        else {
            stringTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds}`
        }
    }

    document.getElementById('time-in-call').innerHTML = `${stringTime}`;

    seconds++;

    setTimeout(() => {
        incrementSeconds();
    }, 1000);
}

function disableF5(e) { if ((e.which || e.keyCode) == 116 || (e.which || e.keyCode) == 82) e.preventDefault(); };