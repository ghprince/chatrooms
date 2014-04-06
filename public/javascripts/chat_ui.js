function divEscapedContentElement(message, divClass) {
  if (divClass !== undefined) {
    return $('<div class="' + divClass + '"></div>').text(message);  
  } else {
    return $('<div></div>').text(message);
  }
}

function spanEscapedContentElement(message, spanClass) {
  if (spanClass !== undefined) {
    return $('<span class="' + spanClass + '"></span>').text(message);  
  } else {
    return $('<span></span>').text(message);
  }
}

function stringfy(element) {
  return $("<div />").append(element.clone()).html();
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  var systemMessage;
  
  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }
  
  $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);
  socket.on('nameResult', function(result) {
    var message;
    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });
  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });
  socket.on('message', function (message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });
  socket.on('rooms', function(rooms) {
    $('#room-list').empty();
    for(var room in rooms) {
      var peopleCount = rooms[room].length;
      room = room.substring(1, room.length);
      if (room !== '') {
        $('#room-list').append($('<div></div>').html(
          stringfy(spanEscapedContentElement(room, 'room-name')) + 
          stringfy(spanEscapedContentElement('(' + peopleCount + ')', 'people-count'))
          ));
      }
    }
    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).children(':first').text());
      $('#send-message').focus();
    });
  });
  
  setInterval(function() {
    socket.emit('rooms');
  }, 1000);
  
  $('#send-message').focus();
  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});