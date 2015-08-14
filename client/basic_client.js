// counter starts at 0
Session.setDefault('counter', 0);

//console.log("Begin Recording");
// create a recorder


mySoundCollection = new UniRecorder({
  name: 'soundsCollection',
  targetFileFormat: 'ogg'
});
// do some preparation for the recorder
var onFail = function(e) {
    console.log('Rejected!', e);
};

var onSuccess = function(s) {
    var context = new webkitAudioContext();
    var mediaStreamSource = context.createMediaStreamSource(s);
    rec = new Recorder(mediaStreamSource);
}

navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var rec;
var audio = document.querySelector('#audio');

function startRecording() {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: true}, onSuccess, onFail);
        $("#message").text("Click export to stop recording");
    } else {
        //console.log('navigator.getUserMedia not present');
        $("#message").text("not present");
    }
}


var ws = new WebSocket("ws://127.0.0.1:8088/websocket/servlet/record");
ws.onopen = function () {
    console.log("Openened connection to websocket");
};
ws.onclose = function (){
     console.log("Close connection to websocket");
}
ws.onmessage = function(e) {
    audio.src = URL.createObjectURL(e.data);
}


// -------------- template hello ----------------
Template.hello.helpers({
  counter: function () {
    return Session.get('counter');
  }
});

Template.hello.events({
  'click button': function () {
    Session.set('counter', Session.get('counter') + 1);
    }
});

// -------------- template begin Record ----------------
Template.beginRecord.events({
  'click #record':function(){
      startRecording();
      rec.record();
      $("#message").text("starting to record");
      intervalKey = setInterval(function() {
      rec.exportWAV(function(blob) {
          rec.clear();
          ws.send(blob);
          //audio.src = URL.createObjectURL(blob);
      });
      }, 3000);
  }
});
// -------------- template end Record ----------------
Template.endRecord.events({
  'click #export':function(){
    $("#message").text("finish recording");
  }
});