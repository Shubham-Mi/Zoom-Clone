const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const socket = io('/');
myVideo.muted = true;
let myVideoStream;
let chathidden = false;
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});
let peers = {};
let currentUserId;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream, "me");

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })
})

peer.on('open', userId => {
    currentUserId = userId;
    socket.emit('join-room', roomId, userId);
})


const addVideoStream = (video, stream, userId="") => {
    video.srcObject = stream;
    video.id = userId;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const connectToNewUser = (userId, stream) => {
    console.log('New User: ', userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userId);
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call;
}

let msg = $('input');

$('html').keydown((e) => {
    if (e.which == 13 && msg.val().length != 0) {
        socket.emit('message', msg.val());
        msg.val('');
    }
})

socket.on('createMessage', (message, userId) => {
    if (userId != currentUserId)
        $('ul').append(`<li class = "message"><b>${userId}: </b><br>${message}</li>`);
    else
        $('ul').append(`<li class = "message"><b>Me: </b><br>${message}</li>`);
    scrollToBottom();
})

const scrollToBottom = () => {
    let d = $('.chat');
    d.scrollTop(d.prop("scrollHeight"));
}

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) {
        peers[userId].close();
    }
})

const MuteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.main_mute_button').innerHTML = html;
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector('.main_mute_button').innerHTML = html;
}

const PlayStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayButton();
    }
    else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopButton();
    }
}

const setPlayButton = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play</span>`
    document.querySelector('.main_play_button').innerHTML = html;
}

const setStopButton = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop</span>`
    document.querySelector('.main_play_button').innerHTML = html;
}

function copyToClipboard() {
    var copyText = window.location.href;
    navigator.clipboard.writeText(copyText);
    alert("Copied the text: " + copyText);
}

function leaveMeeting() {
    window.location.href = "https://www.google.com"
}
