const qsall = document.querySelectorAll.bind(document), //shortcut for querySelectorAll
      qs = document.querySelector.bind(document), //shortcut for querySelector
      root = document.querySelector(':root'),
      timeDisplayer = qs ('.time-displayer'),
      trackInfoDisplayer = qs('.track-info-displayer'),
      volumeController = qs('.volume-controller'),
      progressBar = qs('.progress-bar'),
      canvasContainer = qs('.canvas-container'),
      canvas = qs('#cnv'),
      ctx = canvas.getContext('2d'),
      resizable = qsall('.resizable'),
      navBtn = qsall('.nav-btn'),
      prevBtn = qs('.prev-btn'),
      playBtn = qs('.play-btn'),
      pauseBtn = qs('.pause-btn'),
      stopBtn = qs('.stop-btn'),
      nextBtn = qs('.next-btn'),
      shuffleBtn = qs('.shuffle-btn'),
      repeatBtn = qs('.repeat-btn'),
      playlist = qs('.playlist'),
      audio = new Audio,
      audioContext = new (window.AudioContext || window.webkitAudioContext)(),
      /*audio = document.createElement('audio'),*/
      tracks = [], // array with tracks info : name, artist, duration and url
      tracksNb = 10// number of tracks
        
let tracksCreated = 0,
    trackInfo, //will store the track-info div after their creation
    trackLoaded = 0, //track that will be played
    play = false,
    pause = false,
    shuffle = false,
    repeat = false,
    lightness = '50%',
    audioSource,
    analyser

    audio.crossOrigin= 'anonymous'


// creation of the playlist, because I'm a little bit lazy, JS create the array for me :D
for(i = 0; i < tracksNb ; i++){
  tracks.push(  
    {
      name: '',
      artist: '',
      duration:'',
      url:''
    })
  tracks[i].name = 'track-' + (i+1)
  tracks[i].artist = "soundhelix"
  tracks[i].url = 'https://www.zamimots.fr/mp3/SoundHelix-Song-' + (i+1) +'.mp3'
    
  const audioForDuration = document.createElement('audio')
  audioForDuration.src = tracks[i].url
  audioForDuration.dataset.id = i
  
  audioForDuration.addEventListener('loadedmetadata', function(e){
    const duration = audioForDuration.duration
    const rank = parseInt((e.target.dataset.id), 10)
    tracks[rank].duration = duration
    tracksCreated++
    //once my tracks array is fill I have to add my tracks info in the playlist container
    tracksCreated === tracksNb ? createPlaylist() : console.log('tracks created: ' + tracksCreated)
  })
}

function createPlaylist() {
  //first I fill the playlist with the tracks infos
  for(i = 0; i < tracks.length; i++){
    playlist.innerHTML += '<div class = "track-info' + (i === 0 ? ' highlighted-track' : '') + '" data-id = "' + i + '"><div class = "track-id">' + (i+1) + ' ' + tracks[i].artist + ' - ' + tracks[i].name + '</div><div class = "track-duration">' + trackDuration(i) + '</div></div>'
  }
  
  //then I create the informations interactions (on double click / on touch)
  
  trackInfo = qsall('.track-info')

  trackInfo.forEach(track => {
    track.addEventListener('dblclick', (e) => {
      trackInteraction(e)
    })
    track.addEventListener('click', (e) => {
      trackInfo[trackLoaded].classList.toggle('highlighted-track')
      trackLoaded = e.target.dataset.id
      trackInfo[trackLoaded].classList.toggle('highlighted-track')
      updateTrackInfo()
    })
    track.addEventListener('touchstart', (e) => {
      trackInteraction(e)
    })
  })
  
  function trackInteraction(e){
    console.log('click on : ' + e.target.dataset.id)
    trackInfo[trackLoaded].classList.toggle('highlighted-track')
    trackLoaded = e.target.dataset.id
    trackInfo[trackLoaded].classList.toggle('highlighted-track')
    audio.src = tracks[trackLoaded].url
    audio.play()
    updateTrackInfo()
    if(!play){
      playBtn.classList.toggle('highlighted')
      stopBtn.classList.toggle('highlighted')
    }
    isAudioPaused()
    play = true
     
  }
  
  updateTrackInfo()
  audio.src = tracks[trackLoaded].url
}

//Now the playlist is created, let handle the buttons
playBtn.addEventListener('click', () => {
  if(!play){
    audio.src = tracks[trackLoaded].url
    audio.play()
    play = true 
    playBtn.classList.toggle('highlighted')
    stopBtn.classList.toggle('highlighted')
    visualisation()
  }
})

stopBtn.addEventListener('click', () => {
  if(play){
    audio.pause()
    audio.currentTime = 0
    play = false
    isAudioPaused()
    playBtn.classList.toggle('highlighted')
    stopBtn.classList.toggle('highlighted')
  }
})

navBtn.forEach(navigation => {
  
    navigation.addEventListener('mouseup', ()=>{
      navigation.classList.toggle('highlighted')
    })
                                
    navigation.addEventListener('mousedown', ()=>{
      navigation.classList.toggle('highlighted')
    })
                                
    navigation.addEventListener('click', () => {
      trackInfo[trackLoaded].classList.toggle('highlighted-track')
      if(navigation.dataset.nav === 'prev'){
        trackLoaded === (0) ? trackLoaded = (tracks.length - 1) : trackLoaded--
      }
      else if(navigation.dataset.nav === 'next'){
        trackLoaded === (tracks.length - 1) ? trackLoaded = 0 : trackLoaded++
      }
      else{
        console.error('there is a ball in the soup')
      }
      audio.src = tracks[trackLoaded].url
      trackInfo[trackLoaded].classList.toggle('highlighted-track')
      play ? audio.play() : null
      isAudioPaused()
      updateTrackInfo()
    })
})

pauseBtn.addEventListener('click', () => {
  if(play){
    pauseBtn.classList.toggle('highlighted')
    if(!pause){
      audio.pause()
      pause = true
    }
    else{
      audio.play()
      pause = false
    }
  }
})

function isAudioPaused() {
  if(pause){
    pause = false
    pauseBtn.classList.toggle('highlighted')
  }
}

// display time elapsed
audio.addEventListener('timeupdate', (e) => {
  timeDisplayer.textContent = (e.target.currentTime/60<10? '0' : '') + Math.floor(e.target.currentTime/60) + ':' + (e.target.currentTime%60<10? '0' : '') + Math.floor(e.target.currentTime%60)
  progressBar.value = e.target.currentTime / e.target.duration
})

function updateTrackInfo(){
  trackInfoDisplayer.textContent = (parseInt(trackLoaded, 10)+1) + '. ' + tracks[trackLoaded].name + ' (' + trackDuration(trackLoaded) + ')'
}

function trackDuration(place){
  return(
  Math.floor(tracks[place].duration/60) + ':' + (tracks[place].duration%60<10? '0' : '') + Math.floor(tracks[place].duration%60)
  )
}

//progressBar interaction
progressBar.addEventListener('input', (e) => {
  audio.currentTime = audio.duration * e.target.value
})

//volume controller
volumeController.addEventListener('input', (e) => {
  audio.volume = (e.target.value/100)
  lightness = (100 - (e.target.value/2)) + '%'
  document.documentElement.style.setProperty('--volume-track-lightness', lightness);
})

// when the track ends, move to the next track or a random one

shuffleBtn.addEventListener('click', () => {
  if(repeat){
    repeatBtn.classList.toggle('highlighted')
    repeat = false
  }
  shuffleBtn.classList.toggle('highlighted')
  shuffle ? shuffle = false : shuffle = true
})

repeatBtn.addEventListener('click', () => {
  if(shuffle){
    shuffleBtn.classList.toggle('highlighted')
    shuffle = false
  }
  repeatBtn.classList.toggle('highlighted')
  repeat ? repeat = false : repeat = true
})

audio.addEventListener('ended', () => {
  repeat ? (audio.currentTime = 0, audio.play() ) : trackLoaded < (tracks.length - 1) ? nextTrack() : shuffle ? nextTrack() : console.log('fin')
  function nextTrack() {
    trackInfo[trackLoaded].classList.toggle('highlighted')
    shuffle ? trackLoaded = Math.floor(Math.random() * tracks.length) : trackLoaded++
    audio.src = tracks[trackLoaded].url
    audio.play()
    trackInfo[trackLoaded].classList.toggle('highlighted')
    updateTrackInfo()
  } 
})
              
// expand the playlist or the visualisation

resizable.forEach(resize => {
    resize.addEventListener('click', () => {
      const resizeParent = qs('.' + resize.parentNode.className)
      console.log(resizeParent.style.height)
      resizeParent.style.height === 'auto' ? resizeParent.style.height = '2rem' : resizeParent.style.height = 'auto'
    })
})

// generation of the audio visualisors
  
canvas.width = canvasContainer.getBoundingClientRect().width
canvas.height = canvasContainer.getBoundingClientRect().height



function visualisation() {
  
  console.log('animation')

  analyser = audioContext.createAnalyser()
  audioSource = audioContext.createMediaElementSource(audio)
  
  audioSource.connect(analyser)
  analyser.connect(audioContext.destination)

  analyser.fftSize = 64

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const barWidth = canvas.width/bufferLength
  let barHeight
  let x = 0

  function animation(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    analyser.getByteTimeDomainData(dataArray)

    //animation loop
    for(let i = 0; i < bufferLength; i++){
      barHeight = dataArray[i]
      ctx.fillstyle = 'white'
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
    }

    requestAnimationFrame(animation)
  }
}