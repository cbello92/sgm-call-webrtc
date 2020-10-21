function useH264Codec(sdp) {
    var isFirefox = typeof InstallTrigger !== 'undefined';

    if (isFirefox) {
        console.log("isFirefox")
        updated_sdp = sdp.replace("m=video 9 UDP/TLS/RTP/SAVPF 120 126 97\r\n", "m=video 9 UDP/TLS/RTP/SAVPF 126 120 97\r\n");
    } else {
        updated_sdp = sdp.replace("m=video 9 UDP/TLS/RTP/SAVPF 100 101 107 116 117 96 97 99 98\r\n", "m=video 9 UDP/TLS/RTP/SAVPF 107 101 100 116 117 96 97 99 98\r\n");
    }


    return updated_sdp;
}




function startMedia() {

    let configMedia = { audio: true, video: false };
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('vid')) {
        configMedia['video'] = true;
    }

    var promisifiedOldGUM = function (constraints, successCallback, errorCallback) {

        // First get ahold of getUserMedia, if present
        var getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia);

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function (successCallback, errorCallback) {
            getUserMedia.call(navigator, constraints, successCallback, errorCallback);
        });
    }

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
    }

    navigator.mediaDevices.getUserMedia(configMedia)
        .then(function (stream) {
            const localVideo = document.getElementById("local-video");

            if (localVideo.mozSrcObject) {
                localVideo.mozSrcObject = stream;
                // localVideo.play();
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            } else {
                try {
                    localVideo.srcObject = stream;
                    // localVideo.play();
                    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
                } catch (e) {
                    console.log("Error setting video src: ", e);
                }
            }
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
            // if (location.protocol === 'http:') {
            //   alert('Please test this WebRTC experiment on HTTPS.');
            // } else {
            //   alert('Screen capturing is either denied or not supported. Have you enabled the appropriate flag? see README.md');
            // }
            // console.error(e);
        });
}