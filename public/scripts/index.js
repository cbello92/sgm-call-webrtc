let isAlreadyCalling = false;
let getCalled = false;
let user;
let usersInCall = [];
let countCall = 0;
let confirmed = null;
let streamLocal = 0;
let mettingId = null;
let searchParams = new URLSearchParams(window.location.search);
let userOff = undefined;

incrementSeconds();

let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

let RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.RTCSessionDescription;

let RTCPeerConnection = window.webkitRTCPeerConnection || window.RTCPeerConnection;

let peerConnection = new RTCPeerConnection();


function endCall() {
    // console.log(usersInCall)
    // window.onbeforeunload = null;
    // window.onunload = null;
    let findUserFrom = usersInCall.find(x => x.name === user.name);
    let findUserTo = usersInCall.find(x => x.name !== user.name);

    if (findUserFrom && findUserTo) {
        socket.emit('end-call', {
            message: `${findUserFrom.name} ha finalizado la llamada`,
            userFrom: findUserFrom,
            userTo: findUserTo,
            to: findUserTo.sid
        });
    }

    window.close();
}


async function callUser(socketId) {
    let offer = await peerConnection.createOffer();

    // if(offer) {
        offer.sdp = useH264Codec(offer.sdp);
    
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    
        socket.emit("call-user", {
            offer,
            to: socketId
        });
    
        streamLocal++;

    // }

}

const socket = io.connect("http://10.50.10.35:6002", {
    "forceNew": true
});

const socketAPINotifications = io.connect("http://10.50.10.35:5002", {
    "forceNew": true
});

socket.on('connect', () => {
    user = JSON.parse(sessionStorage.getItem('user'));

    if (searchParams.has('mettingId')) {
        mettingId = searchParams.get('mettingId');
        user['mettingId'] = mettingId;
    }

    if (searchParams.has('municipality')) {
        document.getElementById('title-municipality').innerHTML = searchParams.get('municipality');
    }

    getCalled = false;

    socket.emit('userConnected', user, async function (data) {

        usersInCall = data;

        let findUser = data.find(x => x.username === user.username);

        if (findUser) {
            sessionStorage.setItem('user', JSON.stringify(findUser));
            user = JSON.parse(sessionStorage.getItem('user'));
        }

        if (!searchParams.has('origin')) {
            if (data.length === 1) {
                // window.onbeforeunload = null;
                // window.onunload = null;
                let swConfirm = await Swal.fire({
                    title: 'Estado de la llamada',
                    text: `El usuario organizador de la reunion ha abandonado la conexion`,
                    icon: 'info',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false
                });

                if (swConfirm && swConfirm.isConfirmed) {
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                }
            }
        }

        // if(data.length === 2) {
        //     let userFind = data.find(x => x.name !== user.name);

        //   callUser(userFind.sid);
        // }
    });
});

socket.on('listUsersConnectedMunicipality', async (data) => {
    console.log("municipality", data)

    socketAPINotifications.emit('users-in-call', data);

});


socket.on('listUsersConnectedMetting', async (data) => {
    console.log("metting 1", data)
    console.log("metting 2", userOff)
    let userFind = data.find(x => x.name !== user.name);

    usersInCall = data;

    if(userOff) {
        let userRecconect = data.find(x => x.name === userOff.name);
        if(userRecconect) {
            console.log("disconnect user", userOff)
            console.log("reconnect user", userRecconect)
            let swConfirm = await Swal.fire({
                title: 'Volver a conectar',
                text: `Deseas volver a reconectar con ${userRecconect.name}?`,
                icon: 'info',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok',
                allowOutsideClick: false
            });
    
            if (swConfirm && swConfirm.isConfirmed) {
                callUser(userRecconect.sid);
            }
        }
    } else {
        console.log("ACAAAAA <===================")
        if (userFind && !userOff) {
            console.log("listUsersConnectedMetting")
            callUser(userFind.sid);
        }
    }

    // if(userDisconn) {
    //     callUser(userFind.sid);
    // }

    
});


socket.on('call-end', async (data) => {
    // window.onbeforeunload = null;
    // window.onunload = null;

    let swConfirm = await Swal.fire({
        title: 'Estado de la llamada',
        text: data.message,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
    });

    if (swConfirm && swConfirm.isConfirmed) {
        setTimeout(() => {
            window.close();
        }, 3000);
    }
});


socket.on('userDisconnectedMetting', async (data) => {
    userOff = data;
    console.log("userDisconnectedMetting", data);
    // userDisconn = true;
    // let swConfirm = await Swal.fire({
    //     title: 'Estado de la llamada',
    //     text: `${data.name} ha abandonado la llamada`,
    //     icon: 'info',
    //     confirmButtonColor: '#3085d6',
    //     confirmButtonText: 'Ok',
    //     allowOutsideClick: false
    // });

    // if (swConfirm && swConfirm.isConfirmed) {
    //     setTimeout(() => {
    //         window.close();
    //     }, 3000);
    // }
});


socket.on('userDisconnectedMunicipality', async (data) => {
    console.log("userDisconnectedMunicipality", data)
});


socket.on("call-made", async data => {
    let { userFrom, userTo } = data;

    if (countCall === 1) {
        confirmed = await Swal.fire({
            title: `Reunion con ${data.userFrom.name}`,
            text: "Por favor confirme si desea unirse?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Unirme!',
            cancelButtonText: 'Salir',
            allowOutsideClick: false
        });

        if (confirmed && !confirmed.isConfirmed) {
            socket.emit("reject-call", {
                from: data.socket,
                userFrom,
                userTo,
            });

            setTimeout(() => {
                window.close();
            }, 3000);

            return;
        }

    }

    if (data.userTo.sid === user.sid && countCall === 1) {
        inCall = true;
        document.getElementById('call-with').innerHTML = `En reunion con ${data.userFrom.name}`;
    }

    if(data.offer) {
        data.offer.sdp = useH264Codec(data.offer.sdp);

        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer)
        );
    
        let answer = await peerConnection.createAnswer();
    
        answer.sdp = useH264Codec(answer.sdp);
    
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    
        socket.emit("make-answer", {
            answer,
            to: data.socket,
            userFrom,
            userTo,
        });
    
        getCalled = true;
    
        countCall++;
    }

});

socket.on("answer-made", async data => {
    if(data && data.answer) {
        data.answer.sdp = useH264Codec(data.answer.sdp);
    
        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.answer)
        );

        console.log("llego aqui sosi")

        if (!isAlreadyCalling) {
            document.getElementById('call-with').innerHTML = `En reunion con ${data.userTo.name}`;
            callUser(data.socket);
            isAlreadyCalling = true;
        }
    }
});

socket.on("call-rejected", async (data) => {
    console.log("call-rejected", data)
    let swConfirm = await Swal.fire({
        title: 'Estado de la llamada',
        text: `${data.userTo.name} ha rechazado la conexion`,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
    });

    if (swConfirm && swConfirm.isConfirmed) {
        setTimeout(() => {
            window.close();
        }, 3000);
    }

});

peerConnection.ontrack = function ({ streams: [stream] }) {
    const remoteVideo = document.getElementById("remote-video");
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
    }
};

peerConnection.addEventListener('iceconnectionstatechange', function (e) {
    console.log('ice state change', peerConnection.iceConnectionState);
});


// navigator.getUserMedia(
//     { video: true, audio: true },
//     stream => {
//         const localVideo = document.getElementById("local-video");
//         if (localVideo) {
//             localVideo.srcObject = stream;
//         }

//         console.log(stream.getTracks())
//         stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
//     },
//     error => {
//         console.warn(error.message);
//     }
// );

startMedia();
