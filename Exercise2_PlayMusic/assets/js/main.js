const albumsApi = "http://localhost:3000/albums"
const playlistApi = "http://localhost:3000/playlist"
const curSongApi = "http://localhost:3000/currentSong"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

let newPlaylist = []
let newAlbums = []
let arrayList = []
let currentIndex
let boolen = []

let start = () => {
    getSong(albumsApi, renderAlbum)
    getSong(playlistApi, renderPlaylist)
    setTimeout(()=>{
        checkHasInPlaylist()
    }, 2000)
    interface()
    handleEventPlace()
}

let getSong = (linkApi, callback) => {
    fetch(linkApi)
    .then(response => response.json())
    .then(callback)
}

let renderAlbum = (albums) => {
    const list = $("#list")
    newAlbums = albums
    let html = albums.map(song => {
        return `
            <div id="album-item${song.id}" class="playlist-item">
                <div class="image-song" style="background-image: url('${song.image}')"></div>
                <div class="info">
                    <h3 class="name-song">${song.name}</h3>
                    <p class="name-actor">${song.actor}</p>
                </div>
                <div onclick="showOption(${song.id}, 'option', event)" class="show-option"><i class="fas fa-ellipsis-v"></i></div>
                <div onclick="handleAddToPlaylist(${song.id}, '${song.name}', '${song.image}', '${song.src}', '${song.actor}')" onmouseout="hideOption(${song.id}, 'option')" id="option${song.id}" class="option dp-none">Thêm vào playlist</div>
                <div id="active-item${song.id}" class="non-active"></div>
            </div>
        `
    })
    list.innerHTML = html.join("")
}
let renderPlaylist = (listSong) => {
    newPlaylist = listSong
    const playlist = $("#playlist")

    let html = listSong.map(song => {
        return `
            <div onclick="playSong(${song.songId}, '${song.songName}', '${song.songImage}', '${song.songSrc}')" id="item${song.songId}" class="playlist-item">
                <div class="image-song" style="background-image: url('${song.songImage}')"></div>
                <div class="info">
                    <h3 class="name-song">${song.songName}</h3>
                    <p class="name-actor">${song.songActor}</p>
                </div>
                <div onclick="showOption(${song.songId}, 'option-item', event)" class="show-option"><i class="fas fa-ellipsis-v"></i></div>
                <div onclick="handleRemoveSong(${song.songId}, event)" onmouseout="hideOption(${song.songId}, 'option-item')" id="option-item${song.songId}" class="option dp-none">Xóa khỏi playlist</div>
            </div>
        `
    })
    playlist.innerHTML = html.join("")
}

// ===================== handle event
const audio = $("#audio")

let handleEventPlace = () => {
    const showAlbumsBtn = $("#show-albums")
    const hideAlbumsBtn = $("#close-albums")
    const albums = $(".albums")
    const repeatBtn = $("#repeat-btn")
    const randomBtn = $("#random-btn")
    const playBtn = $("#play-btn")
    const pauseBtn = $("#pause-btn")
    const preBtn = $("#pre-btn")
    const nextBtn = $("#next-btn")
    const progress = $("#progress")

    let isLoop = false
    let isRandom = false

    // =========== show / hide option event
    showAlbumsBtn.onclick = function() {
        albums.classList.remove("dp-none")
    }
    hideAlbumsBtn.onclick = function() {
        albums.classList.add("dp-none")
    }

    // =========== controler
    playBtn.onclick = function() {
        audio.play()
        this.classList.remove("active")
        pauseBtn.classList.add("active")
    }
    pauseBtn.onclick = function() {
        audio.pause()
        this.classList.remove("active")
        playBtn.classList.add("active")
    }
    nextBtn.onclick = function() {
        playNextSong()
    }
    preBtn.onclick = function() {
        playPreSong()
    }
    repeatBtn.onclick = function() {
        isLoop = !isLoop
        if(isLoop && isRandom) {
            isRandom = !isRandom
            randomBtn.classList.remove("active")
        }
        this.classList.toggle("active", isLoop)
    }
    randomBtn.onclick = function() {
        isRandom = !isRandom
        randomIndex(currentIndex, isRandom)
        if(isLoop && isRandom) {
            isLoop = !isLoop
            repeatBtn.classList.remove("active")
        }
        this.classList.toggle("active", isRandom)
    }

    // ======== audio event
    audio.onplay = function() {
        playBtn.classList.remove("active")
        pauseBtn.classList.add("active")
    }
    audio.onpause = function() {
        pauseBtn.classList.remove("active")
        playBtn.classList.add("active")
    }
    audio.onended = function() {
        setTimeout(()=> {
            if(!isLoop && !isRandom) playNextSong()
            else if(isLoop) this.play()
            else playRandomSong()
        }, 1000)
    }
    audio.onplaying = function() {
        activeSong(currentIndex)
    }
    audio.ontimeupdate = function() {
        if(this.duration) {
            let progressPercent = this.currentTime / this.duration * 100
            progress.value = progressPercent
        }
    }

    // ========== Input event
    progress.onchange = function() {
        console.log(this.value)
        audio.currentTime = this.value / 100 * audio.duration
    }
    const imgSong = $(".cdImage")
    const imgSongWidth = imgSong.offsetWidth
    const imgSongHeight = imgSong.offsetHeight

    document.onscroll = function() {
        let scrollTop = document.documentElement.scrollTop

        const newWidth = imgSongWidth - scrollTop
        const newHeight = imgSongHeight - scrollTop

        imgSong.style.width = newWidth > 0 ? newWidth + "px" : 0
        imgSong.style.height = newHeight > 0 ? newHeight + "px" : 0
    }
}

// ===================== Add to playlist
let handleAddToPlaylist = (id, name, image, src, actor) => {
    const data = {
        songId: id,
        songName: name,
        songImage: image,
        songSrc: src,
        songActor: actor
    }

    addToPlaylist(data, (song)=>{
        createSongItemElement(song.songId, song.songName, song.songImage, song.songSrc, song.songActor)
        getSong(playlistApi, (songs)=>{
            newPlaylist = songs
            console.log(newPlaylist)
            checkHasInPlaylist()
        })
    })
}
let addToPlaylist = (data, callback) => {
    fetch(playlistApi, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(callback)
}
let createSongItemElement = (songId, songName, songImage, songSrc, songActor) => {
    const playlist = $("#playlist")
    const divElement = document.createElement("div")

    divElement.setAttribute("onclick", `playSong(${songId}, "${songName}", "${songImage}", "${songSrc}")`)
    divElement.setAttribute("id", `item${songId}`)
    divElement.classList.add("playlist-item")

    divElement.innerHTML = `
        <div class="image-song" style="background-image: url('${songImage}')"></div>
        <div class="info">
            <h3 class="name-song">${songName}</h3>
            <p class="name-actor">${songActor}</p>
        </div>
        <div onclick="showOption(${songId}, 'option-item', event)" class="show-option"><i class="fas fa-ellipsis-v"></i></div>
        <div onclick="handleRemoveSong(${songId}, event)" onmouseout="hideOption(${songId}, 'option-item')" id="option-item${songId}" class="option dp-none">Xóa khỏi playlist</div>
    `
    playlist.appendChild(divElement)
}
// ===================== Remove song

let handleRemoveSong = (id, event) => {
    event.stopPropagation();
    let newId
    const songItem = $("#item"+id)
    newPlaylist.forEach(song=>{
        if(song.songId === id) newId = song.id
    })

    let oldIndex
    removeSong(newId, (songHasDel)=>{
        newPlaylist.forEach((song, index) => {
            if(id === song.id) {
                oldIndex = index
                currentIndex = oldIndex < currentIndex ? --currentIndex : currentIndex
            }
        });
        songItem.remove()
        getSong(playlistApi, (songs)=>{
            newPlaylist = songs
            console.log(newPlaylist)
            checkHasInPlaylist()
        })
    })
}

let removeSong = (songId, callback) => {
    fetch(playlistApi+"/"+songId, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(callback)
}

// ===================== non-active / active album item
let checkHasInPlaylist = () => {
    let hasInPlaylist = false
    newAlbums.forEach(album => {
        newPlaylist.forEach(song => {
            if(song.songId === album.id) hasInPlaylist = true
        });
        setActiveElement(album.id, hasInPlaylist)
        hasInPlaylist = false
    });
}
let setActiveElement = (item, boolen) => {
    const activeItem = $("#active-item"+item)
    const albumItem = $("#album-item"+item)

    activeItem.classList.toggle("active", boolen)
    albumItem.classList.toggle("active1", boolen)
}
// ===================== play song
let playSong = (id, name, image, src) => {
    dashboardInterface(id, name, image, src)
    newPlaylist.forEach((song, index) => {
        if(id === song.songId) {
            currentIndex = index
            handleSaveCurrentSong(currentIndex)
        }
    })
    audio.play()
}

let playNextSong = () => {
    currentIndex = currentIndex === newPlaylist.length-1 ? 0 : ++currentIndex
    const nextSong = newPlaylist[currentIndex]
    playSong(nextSong.songId, nextSong.songName, nextSong.songImage, nextSong.songSrc)
}
let playPreSong = () => {
    currentIndex = currentIndex === 0 ? newPlaylist.length-1 : --currentIndex
    const preSong = newPlaylist[currentIndex]
    playSong(preSong.songId, preSong.songName, preSong.songImage, preSong.songSrc)
}
let playRandomSong = () => {
    const lenPlaylist = newPlaylist.length
    do {
        currentIndex = Math.floor(Math.random() * lenPlaylist)
    } while(arrayList.includes(currentIndex))
    
    if(arrayList.length === lenPlaylist-1) arrayList = []
    arrayList.push(currentIndex)

    const randomSong = newPlaylist[currentIndex]
    playSong(randomSong.songId, randomSong.songName, randomSong.songImage, randomSong.songSrc)
}
let randomIndex = (index, boolen) => {
    if(boolen) arrayList = [index]
    else arrayList = []
}
// ===================== Interface
let interface = () => {
    getSong(curSongApi, song => {
        const uploadSong = song[0]
        dashboardInterface(uploadSong.songId, uploadSong.songName, uploadSong.songImage, uploadSong.songSrc)
        newPlaylist.forEach((song, index) => {
            if(song.songId === uploadSong.songId) currentIndex = index
        });
    })
}
let dashboardInterface = (id, name, image, src) => {
    const nameSong = $("#name-song")
    const imageSong = $(".cdImage")
    audio.id = id   
    audio.src = src
    nameSong.innerHTML = name
    imageSong.style.backgroundImage = `url("${image}")`
}

// ===================== active song
let activeSong = (curIndex) => {
    newPlaylist.forEach((song, index) => {
        if(curIndex === index) {
            if($(".playlist-item.active")) $(".playlist-item.active").classList.remove("active")
            const itemSong = $("#item"+song.songId)
            itemSong.classList.add("active")
        }
    });
}

// ===================== show / hide option
let showOption = (id, string, event) => {
    event.stopPropagation()
    const option = $("#"+string+id)
    option.classList.remove("dp-none")
}

let hideOption = (id, string) => {
    const option = $("#"+string+id)
    option.classList.add("dp-none")
}

// ===================== save current song to data
let handleSaveCurrentSong = (curIndex) => {
    let hasSong = false
    const playingSong = newPlaylist.find((song, index) => index === curIndex)

    const data = {
        songId: playingSong.songId,
        songName: playingSong.songName,
        songImage: playingSong.songImage,
        songSrc: playingSong.songSrc,
        songActor: playingSong.songActor
    }

    getSong(curSongApi, (song)=>{
        if(song.length === 0) hasSong = true
    })
    setTimeout(()=>{
        saveCurrentSong(data, method = hasSong == true ? "POST" : "PUT", stringId = method === "POST" ? "" : "/"+1)
    }, 500)
}

let saveCurrentSong = (data, method, stringId) => {
    fetch(curSongApi+stringId, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(song => console.log(song))
}

start()