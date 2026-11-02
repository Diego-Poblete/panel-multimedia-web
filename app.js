(function () {
  'use strict';

  var config = window.PANEL_CONFIG || {};
  var videoConfig = config.video || {};
  var channels = videoConfig.channels || [];
  var channelIndex = Number(videoConfig.initialChannel) || 0;
  var player = document.getElementById('video-player');
  var youtubeContainer = document.getElementById('youtube-container');
  var badge = document.getElementById('channel-badge');
  var channelTitle = document.getElementById('channel-title');
  var playerStatus = document.getElementById('player-status');
  var clockTime = document.getElementById('clock-time');
  var clockDate = document.getElementById('clock-date');
  var weatherCity = document.getElementById('weather-city');
  var weatherSummary = document.getElementById('weather-summary');
  var weatherTemperature = document.getElementById('weather-temperature');
  var weatherIcon = document.getElementById('weather-icon');
  var forecastDays = document.getElementById('forecast-days');
  var notificationsList = document.getElementById('notifications-list');
  var newsSection = document.getElementById('news-section');
  var newsHeadline = document.getElementById('news-headline');
  var newsSource = document.getElementById('news-source');
  var headlines = [];
  var headlineIndex = 0;
  var headlineTimer;
  var activeSource = '';
  var youtubePlayer;
  var youtubeApiReady = false;
  var youtubeApiLoading = false;
  var weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function pad(value) { return value < 10 ? '0' + value : String(value); }

  function updateClock() {
    var now = new Date();
    clockTime.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
    clockDate.textContent = weekdays[now.getDay()] + ' ' + now.getDate() + ' de ' + months[now.getMonth()];
  }

  function showChannel(index) {
    var channel;
    if (!channels.length) {
      playerStatus.textContent = 'Sin canales configurados';
      return;
    }
    channelIndex = (index + channels.length) % channels.length;
    channel = channels[channelIndex];
    badge.textContent = channel.group || 'CANAL';
    channelTitle.textContent = channel.name;
    playerStatus.textContent = 'Conectando...';
    player.src = channel.url;
    player.load();
    player.play().catch(function () {
      playerStatus.textContent = 'Presiona OK para reproducir';
    });
  }

  function startYoutube() {
    var youtube = videoConfig.youtube || {};
    var script;
    if (!youtube.videoId) {
      playerStatus.textContent = 'No hay video de YouTube configurado';
      return;
    }
    badge.textContent = 'YOUTUBE';
    channelTitle.textContent = youtube.title || 'YouTube';
    playerStatus.textContent = 'Cargando YouTube...';
    if (youtubeApiReady) {
      if (youtubePlayer) {
        youtubePlayer.loadVideoById(youtube.videoId);
      } else {
        youtubePlayer = new window.YT.Player('youtube-player-host', {
          width: '100%',
          height: '100%',
          videoId: youtube.videoId,
          playerVars: { autoplay: 1, controls: 1, playsinline: 1, rel: 0 },
          events: {
            onReady: function (event) {
              event.target.mute();
              event.target.playVideo();
              playerStatus.textContent = 'YouTube listo · OK activa audio';
            },
            onStateChange: function (event) {
              if (event.data === 1) playerStatus.textContent = event.target.isMuted() ? 'YouTube · sin audio' : 'YouTube · reproduciendo';
              if (event.data === 2) playerStatus.textContent = 'YouTube · pausado';
            },
            onError: function (event) {
              playerStatus.textContent = 'YouTube no pudo reproducir este video (error ' + event.data + ')';
            }
          }
        });
      }
      return;
    }
    if (!youtubeApiLoading) {
      youtubeApiLoading = true;
      script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  function selectSource(source) {
    activeSource = source;
    if (source === 'youtube') {
      if (videoConfig.youtube && videoConfig.youtube.requiresHttpsHost) {
        activeSource = 'hls';
        youtubeContainer.hidden = true;
        player.style.display = 'block';
        badge.textContent = 'YOUTUBE';
        channelTitle.textContent = 'Requiere la versión alojada por HTTPS';
        playerStatus.textContent = 'Presiona 1 para volver a HLS';
        return;
      }
      player.pause();
      player.style.display = 'none';
      youtubeContainer.hidden = false;
      startYoutube();
    } else {
      youtubeContainer.hidden = true;
      player.style.display = 'block';
      showChannel(channelIndex);
    }
  }

  function togglePlayback() {
    if (activeSource === 'youtube') {
      if (!youtubePlayer) return;
      if (youtubePlayer.getPlayerState() === 1 && youtubePlayer.isMuted()) {
        youtubePlayer.unMute();
        playerStatus.textContent = 'YouTube · audio activado';
      } else if (youtubePlayer.getPlayerState() === 1) {
        youtubePlayer.pauseVideo();
      } else {
        youtubePlayer.playVideo();
      }
      return;
    }
    if (player.paused) {
      player.muted = false;
      player.play().catch(function () { playerStatus.textContent = 'No se pudo iniciar el video'; });
    } else if (player.muted) {
      player.muted = false;
      playerStatus.textContent = 'Audio activado';
    } else {
      player.pause();
      playerStatus.textContent = 'Pausado';
    }
  }

  function weatherInfo(code) {
    if (code === 0) return { text: 'Despejado', icon: '☀' };
    if (code === 1 || code === 2) return { text: 'Parcialmente nublado', icon: '⛅' };
    if (code === 3) return { text: 'Nublado', icon: '☁' };
    if (code === 45 || code === 48) return { text: 'Neblina', icon: '≋' };
    if (code >= 51 && code <= 82) return { text: 'Lluvia', icon: '☂' };
    if (code >= 95) return { text: 'Tormenta', icon: 'ϟ' };
    return { text: 'Variable', icon: '•' };
  }

  function shortDay(dateText, index) {
    var names = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    var date;
    if (index === 0) return 'HOY';
    date = new Date(dateText + 'T12:00:00');
    return names[date.getDay()];
  }

  function renderForecast(daily) {
    var count;
    var i;
    var card;
    var day;
    var icon;
    var temperatures;
    var condition;
    if (!daily || !daily.time || !daily.time.length) {
      forecastDays.innerHTML = '<div class="forecast-loading">Pronóstico no disponible</div>';
      return;
    }
    count = Math.min(7, daily.time.length);
    forecastDays.innerHTML = '';
    for (i = 0; i < count; i += 1) {
      condition = weatherInfo(daily.weather_code[i]);
      card = document.createElement('div');
      card.className = 'forecast-day' + (i === 0 ? ' forecast-today' : '');
      day = document.createElement('div');
      day.className = 'forecast-day-name';
      day.textContent = shortDay(daily.time[i], i);
      icon = document.createElement('div');
      icon.className = 'forecast-icon';
      icon.textContent = condition.icon;
      temperatures = document.createElement('div');
      temperatures.className = 'forecast-temperatures';
      temperatures.innerHTML = '<strong>' + Math.round(daily.temperature_2m_max[i]) + '°</strong> ' +
        '<span>' + Math.round(daily.temperature_2m_min[i]) + '°</span>';
      card.appendChild(day);
      card.appendChild(icon);
      card.appendChild(temperatures);
      forecastDays.appendChild(card);
    }
  }

  function updateWeather() {
    var request = new XMLHttpRequest();
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(config.latitude) +
      '&longitude=' + encodeURIComponent(config.longitude) +
      '&current=temperature_2m,weather_code' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
      '&forecast_days=7&timezone=' + encodeURIComponent(config.timeZone);
    request.open('GET', url, true);
    request.onreadystatechange = function () {
      var data;
      var condition;
      if (request.readyState !== 4) return;
      if (request.status < 200 || request.status >= 300) {
        weatherSummary.textContent = 'Sin conexión al tiempo';
        return;
      }
      try {
        data = JSON.parse(request.responseText);
        condition = weatherInfo(data.current.weather_code);
        weatherCity.textContent = config.city;
        weatherSummary.textContent = condition.text;
        weatherTemperature.textContent = Math.round(data.current.temperature_2m) + '°';
        weatherIcon.textContent = condition.icon;
        renderForecast(data.daily);
      } catch (error) {
        weatherSummary.textContent = 'No se pudo leer el tiempo';
        renderForecast(null);
      }
    };
    request.send();
  }

  function renderNotifications() {
    var notices = config.notifications || [];
    var i;
    var item;
    var title;
    var text;
    notificationsList.innerHTML = '';
    if (!notices.length) {
      notificationsList.textContent = 'Sin notificaciones.';
      return;
    }
    for (i = 0; i < notices.length; i += 1) {
      item = document.createElement('div');
      item.className = 'notification-item';
      title = document.createElement('div');
      title.className = 'notification-title';
      title.textContent = notices[i].title;
      text = document.createElement('div');
      text.className = 'notification-text';
      text.textContent = notices[i].text;
      item.appendChild(title);
      item.appendChild(text);
      notificationsList.appendChild(item);
    }
  }

  function textOf(parent, tagName) {
    var element = parent.getElementsByTagName(tagName)[0];
    return element ? (element.textContent || element.text || '').replace(/^\s+|\s+$/g, '') : '';
  }

  function fetchNewsFeed(feed, done) {
    var request = new XMLHttpRequest();
    request.open('GET', feed.url, true);
    request.timeout = 15000;
    request.onreadystatechange = function () {
      var xml;
      var items;
      var result = [];
      var i;
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300) {
        xml = new DOMParser().parseFromString(request.responseText, 'text/xml');
        items = xml.getElementsByTagName('item');
        for (i = 0; i < items.length && i < 4; i += 1) {
          if (textOf(items[i], 'title')) result.push({ title: textOf(items[i], 'title'), section: feed.section, source: feed.name });
        }
      }
      done(result);
    };
    request.onerror = function () { done([]); };
    request.ontimeout = function () { done([]); };
    request.send();
  }

  function showHeadline(index) {
    var item;
    var seconds = (config.news && config.news.headlineSeconds) || 10;
    if (!headlines.length) {
      newsSection.textContent = 'SIN CONEXIÓN';
      newsHeadline.textContent = 'No se pudieron cargar titulares.';
      newsSource.textContent = '';
      return;
    }
    headlineIndex = (index + headlines.length) % headlines.length;
    item = headlines[headlineIndex];
    newsSection.textContent = item.section;
    newsHeadline.textContent = item.title;
    newsSource.textContent = item.source;
    if (headlineTimer) window.clearInterval(headlineTimer);
    headlineTimer = window.setInterval(function () { showHeadline(headlineIndex + 1); }, seconds * 1000);
  }

  function updateNews() {
    var sources = (config.news && config.news.sources) || [];
    var pending = sources.length;
    var grouped = [];
    var i;
    if (!pending) return;
    for (i = 0; i < sources.length; i += 1) {
      (function (source, position) {
        fetchNewsFeed(source, function (items) {
          grouped[position] = items;
          pending -= 1;
          if (pending === 0) {
            headlines = [];
            for (var row = 0; row < 4; row += 1) {
              for (var column = 0; column < grouped.length; column += 1) {
                if (grouped[column] && grouped[column][row]) headlines.push(grouped[column][row]);
              }
            }
            showHeadline(0);
          }
        });
      }(sources[i], i));
    }
  }

  player.addEventListener('playing', function () { playerStatus.textContent = player.muted ? 'Reproduciendo sin audio' : 'Reproduciendo'; });
  player.addEventListener('waiting', function () { playerStatus.textContent = 'Cargando señal...'; });
  player.addEventListener('error', function () { playerStatus.textContent = 'No se pudo reproducir esta señal'; });
  player.addEventListener('click', togglePlayback);
  document.addEventListener('keydown', function (event) {
    if (event.keyCode === 49) selectSource('hls');
    if (event.keyCode === 50) selectSource('youtube');
    if (event.keyCode === 13 || event.keyCode === 32) togglePlayback();
    if (activeSource === 'hls' && event.keyCode === 37) showChannel(channelIndex - 1);
    if (activeSource === 'hls' && event.keyCode === 39) showChannel(channelIndex + 1);
  });

  window.onYouTubeIframeAPIReady = function () {
    youtubeApiReady = true;
    if (activeSource === 'youtube') startYoutube();
  };

  updateClock();
  updateWeather();
  updateNews();
  renderNotifications();
  selectSource(videoConfig.initialSource === 'youtube' ? 'youtube' : 'hls');
  window.setInterval(updateClock, 1000);
  window.setInterval(updateWeather, 30 * 60 * 1000);
  window.setInterval(updateNews, ((config.news && config.news.refreshMinutes) || 20) * 60 * 1000);
}());
