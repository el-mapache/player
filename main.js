var app = angular.module('nprPlayer', []);

var apiKey = 'MDEyMDM4MTE2MDEzNzcxMzMwMjkxMDFjMw001',
    nprUrl = 'http://api.npr.org/query?id=61&fields=all&output=JSON';

app.controller('PlayerCtrl', ['$scope', '$http', 'player', function($scope, $http, player) {
  $scope.player = player;

  $scope.play = function(program) {
    $scope.player.play(program.audio[0].format.mp4.$text);
  };

  $scope.stop = function() {
    $scope.player.stop();
  };

  $http({
    method: "JSONP",
    url: nprUrl + "&apiKey=" + apiKey + "&callback=JSON_CALLBACK"
  }).success(function(data, status) {
      // Store a list of the programs returned from the api request;
      $scope.programs = data.list.story
  }).error(function(data, status) {
  
  });
}]);

app.directive("nprLink", function() {
  return {
    restrict: "EA",
    replace: true,
    scope: {
      program: "=",
      play: "&",
      stop: "&"
    },
    templateUrl: 'views/npr-list-item.html',
    link: function(scope, elem, attrs) {
      scope.duration = scope.program.audio[0].duration.$text;
    }
  };
});

/* Abstracts away the audio element from the controller.
 * The controller simply requires that the 'audio'
 * element expose a way to set the source.  In this case, 
 * we use an html audio element but it could be anything 
 * that meets the aforementioned requirements.
 */
app.factory('audio', ['$document', function($document) {
  return $document[0].createElement('audio');
}]);

app.factory('player', ['audio', '$rootScope',  function(audio, $rootScope) {
  var player = {

    playing: false,
    current: null,
    ready: false,
    progress: 0,
    progressPercent: 0,
    
    play: function(source) {
      if (this.playing) audio.pause();
      audio.src = source;
      audio.play();
      this.playing = true;
    },
    
    stop: function() {
      audio.pause();
      audio.stop();
      this.playing = false;
    },

    currentTime: function() {
      return audio.currentTime;
    },

    currentDuration: function() {
      return parseInt(audio.duration);
    }
  }; 

  audio.addEventListener('timeupdate', function(evt) {
    $rootScope.$apply(function() {
      player.progress = player.currentTime();
      player.progressPercent = player.progress / player.currentDuration();
    });
  });

  audio.addEventListener('canplay', function(evt) {
    $rootScope.$apply(function() {
      player.ready = true;
    });
  }); 
  
  audio.addEventListener("ended", function() {
    $rootScope.$apply(function() {
      player.stop();
    });
  });

  return player;
}]);
