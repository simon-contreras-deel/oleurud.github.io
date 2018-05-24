var _wmVideos_ = new function () {
  'use strict';
  var inited = false;
  var prefix;

  function on(ev, f) {
    if (window.addEventListener) {
      window.addEventListener(ev, f, false);
    } else if (window.attachEvent) {
      window.attachEvent('on' + ev, f);
    }
  }

  function ajax(method, url, success) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
      if (http.readyState === 4) {
        if (success) {
          success(http);
        }
      }
    };
    http.open(method, url);
    http.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    http.send();
  }

  this.init = function (prefix_) {
    if (inited) {
      console.log("already initialized");
      return;
    }
    inited = true;
    prefix = prefix_;

    startVideoPlayerReplacement();
    on('load', stopVideoPlayerReplacement);
  };

  var replacementInterval = 500;
  var replacementIntervalId;

  function startVideoPlayerReplacement() {
    replaceVideoPlayersWithIAPlayer();
    replacementIntervalId = setInterval(
      replaceVideoPlayersWithIAPlayer,
      replacementInterval
    );
  }

  function stopVideoPlayerReplacement() {
    clearInterval(replacementIntervalId);
  }

  var replacedVideos = [];

  function replaceVideoPlayersWithIAPlayer() {
    replacedVideos = replacedVideos.concat(
      scanForVideoPlayers()
        .filter(function (vo) {
          return replacedVideos.indexOf(vo.vinfo.player.id) < 0;
        })
        .map(function (vo) {
          writeWatchPlayer(vo.vinfo);
          removePreviousEls(vo.previousPlayerEls);
          return vo.vinfo.player.id;
        })
    );
  }

  /**
   *
   * @returns {Array} list of embeded players
   */
  function scanForVideoPlayers() {
    // TODO: we need to apply bunch of different rules here.
    console.log('%s initFun(prefix=%s)', document.location.href, prefix);

    var embed_match = document.location.href.match(
      /\/embed\/([-_a-zA-Z0-9]{11})/);

    var players = [];

    if (embed_match) {
      console.log('this is a embed for %s', embed_match[1]);
      // videos embedded in non-YouTube pages with IFRAME
      // get video ID from the URL
      var vo = {vid: embed_match[1]};
      var elVideo = document.querySelector('#player');
      if (elVideo) {
        vo.player = elVideo;
        // writeWatchPlayer(vo);
        players = players.concat([{
          previousPlayerEls: [],
          vinfo: vo,
        }]);
      }
    } else {
      var embeds = document.querySelectorAll('embed#movie_player');
      players = players.concat(
        mapToPlayer(mapToPlayerStructure(embeds), 'video[%s]=%s')
      );
      var h5video = document.querySelectorAll('div#movie_player');
      players = players.concat(
        mapToPlayer(mapToPlayerStructure(h5video), 'video[%s]=%s')
      );
      // if there are no video elements, we can find few placeholders for them.
      if (embeds.length + h5video.length === 0) {
        var playerList = Array.prototype.map.call(
          document.querySelectorAll('#player-api'),
          function(container) {
            var children = Array.prototype.concat.apply([], container.children);
            if (children.length > 0) {
              el = children.pop();
            } else {
              var el = document.createElement('div');
              container.appendChild(el);
            }
            el.id = el.id || 'jw_player_placehold_' + Date.now();
            return {
              target: el,
              previousPlayerEls: children
            };
          });
        players = players.concat(
          mapToPlayer(
            playerList,
            '#player-api[%s]=%s'
          )
        );
      }
    }
    return players;
  }

  function mapToPlayerStructure(list) {
    // make sure that list it array
    list = Array.prototype.concat.apply([], list);
    return list.map(function(target) {
      return {
        target: target,
        previousPlayerEls: []
      };
    });
  }

  function mapToPlayer(list, logTemplate) {
    console.log('found %s', list.length);
    var players = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var vinfo = getVideoInfo(item.target);
      logTemplate && console.log(logTemplate, i, item.target);
      if (vinfo && vinfo.vid) {
        players.push({
          vinfo: vinfo,
          previousPlayerEls: item.previousPlayerEls
        });
      }
    }
    return players;
  }

  var reVideoId1 = /\?video_id=([-_a-zA-Z0-9]+)/;
  var reVideoId2 = /\&video_id=([-_a-zA-Z0-9]+)/;

  function getVideoInfo(vp) {
    // get video inside of element
    var videoInside = vp.querySelector('video');
    var src = (videoInside || vp).src;
    console.log('video[src]=' + src);
    if (src) {
      var m = src.match(reVideoId1);
      if (m) {
        return {vid: m[1], player: vp};
      }
    }
    // embed with Flash player
    var flashvars = vp.getAttribute('flashvars');
    console.log('flashvars=%s', flashvars);
    if (flashvars && (m = flashvars.match(reVideoId2))) {
      return {vid: m[1], player: vp};
    }
    // assuming YouTube watch page.
    var content = document.querySelector('div#content meta[itemprop="videoId"]');
    if (content) {
      var vid = content.getAttribute('content');
      if (vid) {
        return {vid: vid, player: vp};
      }
    }
    return null;
  }

  function removePreviousEls(els) {
    els.forEach(function(el) {
      el.remove();
    });
  }

  /**
   * hide player placeholder from youtube player
   * so now i shouldn't find it
   */
  function hidePlayerPlaceholder() {
    var playerAPI = document.querySelector('#player-api');
    if (playerAPI) {
      playerAPI.id = playerAPI.id + '_hidden_' + Date.now();
    }
  }

  function writeWatchPlayer(vo) {
    var player = vo.player;
    var fullWaybackUrl = resourcekey('yt/' + vo.vid);
    var fullImgUrl = resourcekey('yt/img/' + vo.vid);

    var width = player.clientWidth || "100%";
    var height = player.clientHeight || "100%";

    //put mock data to the youtube player and ask it load again
    //to stop previous player
    if (window.ytplayer) {
      window.ytplayer.config = {};
      window.ytplayer.load = function() { };
    }

    function is_mac_safari() {
        return (navigator.userAgent.indexOf('Safari') != -1 &&
                navigator.userAgent.indexOf('Mac') != -1 &&
                navigator.userAgent.indexOf('Chrome') == -1);
    }

    function doSetup(theType, autostart, onErrFallback) {
      if (!jwplayer) {
        console.log('jwplayer is not loaded');
      }

      if (!player.parentNode) {
        var players = scanForVideoPlayers();
        if (players && players.length > 0) {
          player = players[0].vinfo.player;
          players.forEach(function(item) {
            removePreviousEls(item.previousPlayerEls);
          });
        }
      }

      //youtube player is too smart and it tries hard to restore player
      //so if we left #player-api we will lost everying inside and
      //youtube player will return back
      //only way to change ID of placeholder element
      hidePlayerPlaceholder();

      if (player.tagName.toLowerCase() !== "div") {
        var e = document.createElement('div');
        e.id = player.id || "_wm_video_embed_" + Date.now();
        player.parentNode.replaceChild(e, player);
      }

      console.log('initializing jwplayer on %s', player.outerHTML);
      jwplayer.key = "sZbikYlI/xtW0U/3Tw1DOdjC1EahhtUCJF5KggVdqDY=";
      var jwpInstance = jwplayer(player.id);

      if (!jwpInstance.setup) {
        console.log('Here is no element #%s left', player.id);
        return;
      }

      jwpInstance.setup({
        height: height,
        width: width,
        autostart: autostart,
        image: fullImgUrl,
        primary: is_mac_safari() ? 'flash' : 'html5',
        playlist: [{
          image: fullImgUrl,
          sources: [{
            'file': fullWaybackUrl,
            type: theType
          }]
        }],
        events: {
          onError: onErrFallback
        },
        analytics: {
          enabled: false
        }
      });
    }

    // Ajax to check type
    ajax('HEAD', fullWaybackUrl, function (http) {
      if (http.status != 200) {
        player.innerHTML = '<div style="text-align:center;margin:30% 24px 0 24px;">Sorry, the Wayback Machine does not have this video (' + vo.vid + ') archived/indexed.</div>';
        player.style.background = '';
        return;
      }
      var ctype = http.getResponseHeader("Content-Type");
      if (ctype.indexOf('webm') >= 0) {
        doSetup('webm', false);
      } else if (ctype.indexOf('flv') >= 0) {
        doSetup('flv', true);
      } else if (ctype.indexOf('mp4') >= 0) {
        doSetup('video/mp4', false);
      } else {
        doSetup('webm', false, function () {
          doSetup('flv', true);
        });
      }
    });
  }

  function resourcekey(key) {
    // TODO: we may want to return a link to "closest" capture.
    return prefix + '/2oe_/http://wayback-fakeurl.archive.org/' + key;
  }
};
