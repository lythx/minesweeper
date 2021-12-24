let start = {
    tilesize: 30,
    buttons: [
        { txt: '9x9 10min', width: 9, height: 9, mines: 10 },
        { txt: '16x16 40min', width: 16, height: 16, mines: 40 },
        { txt: '30x16 99min', width: 30, height: 16, mines: 99 },
    ],
    customtexts: ['Szerokość planszy:', 'Wysokość planszy:', 'Ilość min:'],
    createInputs() {
        let container = document.createElement('div')
        container.id = 'startcont'
        container.classList.add('container')
        document.getElementById('main').appendChild(container)
        for (let i = 0; i <= this.buttons.length; i++) {
            let bt = document.createElement('button')
            bt.classList.add('bt')
            if (i < this.buttons.length) {
                bt.innerHTML = this.buttons[i].txt
                bt.addEventListener('click', () => this.btClick(this.buttons[i].width, this.buttons[i].height, this.buttons[i].mines))
            }
            else {
                bt.innerHTML = 'Dowolna'
                bt.addEventListener('click', this.createCustomGameboard)
            }
            container.appendChild(bt)
        }
    },
    createCustomGameboard() {
        this.removeEventListener('click', start.createCustomGameboard)
        let container = document.createElement('div')
        container.id = 'customcont'
        container.classList.add('container')
        document.getElementById('main').appendChild(container)
        for (let i = 1; i < 4; i++) {
            let div = document.createElement('div')
            div.classList.add('customdiv')
            container.appendChild(div)
            let span = document.createElement('span')
            span.classList.add('customspan')
            span.innerHTML = start.customtexts[i - 1]
            div.appendChild(span)
            let input = document.createElement('input')
            input.type = 'number'
            input.name = `i${i}`
            input.id = `i${i}`
            input.classList.add('custominput')
            div.appendChild(input)
        }
        let button = document.createElement('button')
        button.classList.add('bt')
        button.id = 'custombutton'
        button.addEventListener('click', () => start.btClick(document.getElementById('i1').value,
            document.getElementById('i2').value, document.getElementById('i3').value))
        button.innerHTML = 'START'
        container.appendChild(button)
    },
    btClick(width, height, mines) {
        if (!main.setVariables(width, height, mines)) {
            alert('Nieprawidłowe dane')
            return
        }
        main.clearSite()
        let cont = document.createElement('div')
        cont.id = 'gamecont'
        cont.classList.add('container')
        document.getElementById('main').appendChild(cont)
        main.createBombCounter()
        main.createTimer()
        main.generateTiles()
        main.appendButton()
        main.createLeaderboard()
        main.leftClickListeners()
    },
}

let ck = {
    cookies: [],
    sort() {
        if (!document.cookie) return
        this.cookies = []
        for (const e of document.cookie.split(';').filter(a => a.split(';')[0].includes('record'))) {
            this.cookies.push({
                name: e.split('=')[1].split('|')[0],
                time: e.split('=')[1].split('|')[1],
                mode: e.split('=')[1].split('|')[2]
            })
        }
        this.cookies.sort((a, b) => a.time - b.time)
    },
    get(str) {
        this.sort()
        return this.cookies.filter(a => a.mode == str)
    }
}

let main = {
    boardheight: null,
    boardwidth: null,
    bombcount: null,
    gamearr: null,
    numberColors: ['none', 'blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'],
    setVariables(width, height, mines) {
        this.boardwidth = width
        this.boardheight = height
        this.bombcount = mines
        if (width < 1 || height < 1 || mines < 1 || width * height <= mines)
            return false
        this.gamearr = []
        return true
    },
    createBombCounter() {
        let cont = document.getElementById('gamecont')
        let top = document.createElement('div')
        top.id = 'top'
        cont.appendChild(top)
        let bc = document.createElement('div')
        bc.id = 'bc'
        bc.classList.add('box')
        bc.innerHTML = `Miny: ${main.bombcount}`
        top.appendChild(bc)
    },
    createTimer() {
        let cont = document.getElementById('gamecont')
        let top = document.getElementById('top')
        cont.style.width = `${start.tilesize * this.boardwidth + 9}px`
        let tim = document.createElement('div')
        tim.id = 'tim'
        tim.classList.add('box')
        top.appendChild(tim)
        let text = document.createElement('span')
        text.innerHTML = 'Czas:'
        text.id = 'txt1'
        tim.appendChild(text)
        let span = document.createElement('span')
        span.setAttribute('id', 'span')
        tim.appendChild(span)
        span.innerHTML = `00:00.0`
    },
    updateTimer(timeSinceStart) {
        let span = document.getElementById('span')
        if (span == undefined) return
        let date = new Date(timeSinceStart)
        span.innerHTML = date.toISOString().substr(14, 7)
    },
    clearSite() {
        document.getElementById('main').innerHTML = ""
    },
    generateTiles() {
        let cont = document.getElementById('gamecont')
        let gameboard = document.createElement('div')
        gameboard.id = 'gameboard'
        gameboard.addEventListener('contextmenu', function (ev) {
            ev.preventDefault()
        })
        gameboard.style.gridTemplateColumns = `repeat(${this.boardwidth},1fr)`
        cont.appendChild(gameboard)
        for (let i = 0; i < this.boardheight; i++)
            for (let j = 0; j < this.boardwidth; j++) {
                let tile = document.createElement('div')
                tile.classList.add('tile')
                tile.style.width = `${start.tilesize}px`
                tile.style.height = `${start.tilesize}px`
                tile.classList.add(`x${i}`)
                tile.classList.add(`y${j}`)
                gameboard.appendChild(tile)
            }
    },
    appendButton() {
        let cont = document.getElementById('gamecont')
        let button = document.createElement('button')
        button.classList.add('bt')
        button.id = 'resetbutton'
        button.addEventListener('click', () => this.resetGame())
        button.innerHTML = 'RESET'
        cont.appendChild(button)
    },
    createLeaderboard() {
        let lbcont = document.createElement('div')
        lbcont.classList.add('container')
        lbcont.id = 'lbcont'
        document.getElementById('main').appendChild(lbcont)
        let top = document.createElement('div')
        top.id = 'lbheader'
        top.classList.add('box')
        top.innerHTML = `Ranking ${this.boardwidth}x${this.boardheight} ${this.bombcount}min`
        lbcont.appendChild(top)
        let lb = document.createElement('div')
        lb.id = 'leaderboard'
        lbcont.appendChild(lb)
        let arr = ck.get(`${this.boardwidth}x${this.boardheight} ${this.bombcount}min`)
        let lgt = arr.length < 10 ? arr.length : 10
        if (lgt == 0) {
            lb.innerHTML = `<div style='grid-column:1 / span 3; display:flex; align-items:center; justify-content:center;font-size:30px;'>Brak rekordów</p>`
            return
        }
        lb.style.gridTemplateRows = `repeat(${lgt + 1},50px)`
        for (let i = 1; i <= lgt + 1; i++) {
            for (let j = 1; j <= 3; j++) {
                let el = document.createElement('div')
                el.style.gridRowStart = `${i}`
                el.style.gridColumnStart = `${j}`
                el.classList.add('lbtile')
                if (i == 1) {
                    switch (j) {
                        case 1:
                            el.innerHTML = 'Lp.'
                            break
                        case 2:
                            el.innerHTML = 'Nick'
                            break
                        case 3:
                            el.innerHTML = 'Czas'
                    }
                }
                else {
                    switch (j) {
                        case 1:
                            el.innerHTML = i - 1
                            break
                        case 2:
                            el.innerHTML = arr[i - 2]?.name ? decodeURIComponent(arr[i - 2].name) : ''
                            break
                        case 3:
                            el.innerHTML = arr[i - 2]?.time ? new Date(Number(arr[i - 2].time)).toISOString().substr(14, 9) : '-'
                    }
                }
                lb.appendChild(el)
            }
        }
    },
    resetGame() {
        timer.stop()
        this.clearSite()
        start.createInputs()
    },
    leftClickListeners() {
        let els = document.querySelectorAll('.tile')
        for (const e of els)
            e.addEventListener('click', lc.leftClick)
    },
    rightClickListeners() {
        let els = document.querySelectorAll('.tile')
        for (const e of els)
            e.addEventListener('contextmenu', rc.rightClick)
    },
    getTilePosition(el) {
        let x = Number(el.classList[1].substring(1))
        let y = Number(el.classList[2].substring(1))
        return { x, y }
    },
    getTileByPosition(x, y) {
        let els = document.querySelectorAll(`.x${x}`)
        for (const e of els)
            if (e.classList.contains(`y${y}`)) return e
    },
    checkIfWin() {
        for (let i = 0; i < this.boardheight; i++)
            for (let j = 0; j < this.boardwidth; j++)
                if (this.gamearr[i][j] != 'x' && this.gamearr[i][j] != 'fx'
                    && this.gamearr[i][j] != 'o' && this.gamearr[i][j] != 'px')
                    return false
        return true
    },
    playerWin() {
        let t = timer.stop()
        this.showmines()
        document.getElementById('bc').innerHTML = `Miny: 0`
        let name = prompt(`Wygrałeś! Twój czas gry: ${new Date(t).toISOString().substr(14, 9)}\n\nTwoje imię:`)
        let time = new Date(Date.now() + 1000 * 60 * 60 * 24)
        let count = document.cookie.split(';').length
        if (count == 1 && !document.cookie)
            count = 0
        document.cookie = `record${count + 1}=${encodeURIComponent(name)}|${t}|${this.boardwidth}x${this.boardheight} ${this.bombcount}min;expires=${time.toUTCString()}`
    },
    playerLose(el) {
        let t = timer.stop()
        this.showmines()
        el.style.backgroundImage = `url('gfx/bomb.png')`
        alert(`Przegrałeś. Twój czas gry: ${new Date(t).toISOString().substr(14, 9)}`)
    },
    // popUp(){

    // },
    showmines() {
        let els = document.querySelectorAll('.tile')
        for (let i = 0; i < els.length; i++) {
            els[i].removeEventListener('click', lc.leftClick)
            els[i].removeEventListener('contextmenu', rc.rightClick)
            if (this.gamearr[this.getTilePosition(els[i]).x][this.getTilePosition(els[i]).y] == 'x'
                || this.gamearr[this.getTilePosition(els[i]).x][this.getTilePosition(els[i]).y] == 'fx'
                || this.gamearr[this.getTilePosition(els[i]).x][this.getTilePosition(els[i]).y] == 'px')
                els[i].style.backgroundImage = `url('gfx/pbomb.png')`
        }
    },
    updateBombCount(bool) {
        let temp = Number(document.getElementById('bc').innerHTML.match(/[^ ]*$/g)[0])
        if (bool) document.getElementById('bc').innerHTML = `Miny: ${temp - 1}`
        else document.getElementById('bc').innerHTML = `Miny: ${temp + 1}`
    }
}
let timer = {
    startTime: null,
    count: null,
    isRunning: false,
    start() {
        this.startTime = Date.now()
        this.count = 1
        this.isRunning = true
        this.main()
    },
    main() {
        if (!this.isRunning) return
        let currentTime = Date.now()
        window.requestAnimationFrame(() => this.main())
        const timeSinceStart = currentTime - this.startTime
        if (timeSinceStart < 100 * this.count) return
        this.count++
        main.updateTimer(timeSinceStart)
    },
    stop() {
        this.isRunning = false
        return Date.now() - this.startTime
    }
}

let lc = {
    leftClick(el) {
        if (el.isTrusted) el = this
        el.addEventListener('click', lc.secondLeftClick)
        let x = main.getTilePosition(el).x
        let y = main.getTilePosition(el).y
        if (main.gamearr.length == 0) {
            gen.generateGamearr(x, y)
            main.rightClickListeners()
            timer.start()
        }
        if (main.gamearr[x][y] == 0) lc.showTiles(x, y)
        else if (main.gamearr[x][y] != 'x') lc.showOneTile(x, y)
        else {
            main.playerLose(el)
            return
        }
        if (main.checkIfWin()) main.playerWin()
    },
    showTiles(x, y) {
        main.gamearr[x][y] = 'o'
        let el = main.getTileByPosition(x, y)
        el.style.background = 'var(--lgray)'
        el.style.borderTop = `1px solid black`
        el.style.borderLeft = `1px solid black`
        el.removeEventListener('click', this.leftClick)
        el.removeEventListener('contextmenu', rc.rightClick)
        el.addEventListener('click', this.secondLeftClick)
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                let a = x + i
                let b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth)
                    if (main.gamearr[a][b] == 0) this.showTiles(a, b)
                    else if (main.gamearr[a][b] != 'x' && main.gamearr[a][b] != 'o'
                        && main.gamearr[a][b][0] != 'f' && main.gamearr[a][b][0] != 'p') this.showOneTile(a, b)
            }
    },
    showOneTile(x, y) {
        let el = main.getTileByPosition(x, y)
        el.removeEventListener('click', this.leftClick)
        el.removeEventListener('contextmenu', rc.rightClick)
        el.addEventListener('click', this.secondLeftClick)
        el.style.background = 'var(--lgray)'
        el.style.borderTop = `1px solid black`
        el.style.borderLeft = `1px solid black`
        el.innerHTML = main.gamearr[x][y]
        el.style.color = main.numberColors[main.gamearr[x][y]]
        main.gamearr[x][y] = 'o'
    },
    secondLeftClick() {
        let count = 0
        let x = main.getTilePosition(this).x
        let y = main.getTilePosition(this).y
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                let a = x + i
                let b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth) {
                    if (main.gamearr[a][b][0] == 'f') count++
                    if (main.gamearr[a][b][0] == 'p') return
                }
            }
        if (main.getTileByPosition(x, y).innerHTML == count) lc.revealSurrounding(x, y)
    },
    revealSurrounding(x, y) {
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                let a = x + i
                let b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth)
                    if (main.gamearr[a][b] != 'o' && main.gamearr[a][b][0] != 'f')
                        this.leftClick(main.getTileByPosition(a, b))
            }
    }
}
let rc = {
    rightClick() {
        this.removeEventListener('click', lc.leftClick)
        this.removeEventListener('contextmenu', rc.rightClick)
        this.style.backgroundImage = `url('gfx/flaga.png')`
        let root = main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y]
        main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y] = `f${root}`
        this.addEventListener('contextmenu', rc.secondRightClick)
        main.updateBombCount(true)
    },
    secondRightClick() {
        this.removeEventListener('contextmenu', rc.secondRightClick)
        let root = main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y].substring(1)
        main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y] = `p${root}`
        this.style.backgroundImage = `url('gfx/pyt.png')`
        this.addEventListener('contextmenu', rc.thirdRightClick)
        main.updateBombCount(false)
    },
    thirdRightClick() {
        this.removeEventListener('contextmenu', rc.thirdRightClick)
        this.style.backgroundImage = `url('gfx/klepa.png')`
        let root = main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y].substring(1)
        if (root != 'x') root = Number(root)
        main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y] = root
        this.addEventListener('click', lc.leftClick)
        this.addEventListener('contextmenu', rc.rightClick)
    },
}
let gen = {
    generateGamearr(x, y) {
        main.gamearr = this.generate2dArray(main.boardheight, main.boardwidth)
        this.generatemines(x, y)
    },
    generate2dArray(height, width) {
        arr = []
        for (let i = 0; i < height; i++) {
            arr[i] = []
            for (let j = 0; j < width; j++)
                arr[i][j] = 0
        }
        return arr;
    },
    generatemines(x0, y0) {
        for (let i = 0; i < main.bombcount; i++) {
            let x = Math.floor(Math.random() * main.boardheight)
            let y = Math.floor(Math.random() * main.boardwidth)
            if (main.gamearr[x][y] == 0) main.gamearr[x][y] = 'x'
            else i--
        }
        if ((main.boardheight * main.boardwidth) - main.bombcount > 15) {
            if (!this.checkGamearrValidity(x0, y0, main.boardheight, main.boardwidth, main.bombcount, main.gamearr))
                this.generateGamearr(x0, y0)
            else this.generateNumbers()
        }
        else this.generateNumbers()
        if ((main.boardheight * main.boardwidth) - main.bombcount > 15) {
            if (main.gamearr[x0][y0] != 0) this.generateGamearr(x0, y0)
        }
        else if (main.gamearr[x0][y0] == 'x') this.generateGamearr(x0, y0)
    },
    checkGamearrValidity(x, y, h, w, mines, arr) {
        let eq = (h * w) / mines
        let count = 0
        for (let i = 0; i < eq; i++) {
            for (let j = 0; j < eq; j++) {
                let a = x + i - Math.round(eq / 2)
                let b = y + j - Math.round(eq / 2)
                if (a >= 0 && b >= 0 && a < h && b < w)
                    if (arr[a][b] == 'x') count++
            }
        }
        if (count > eq * eq * 0.3) return false
        return true
    },
    generateNumbers() {
        for (let i = 0; i < main.boardheight; i++)
            for (let j = 0; j < main.boardwidth; j++)
                if (main.gamearr[i][j] == 0)
                    main.gamearr[i][j] = this.writeNumber(i, j)
    },
    writeNumber(x, y) {
        let count = 0
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                let a = x + i
                let b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth)
                    if (main.gamearr[a][b] == 'x') count++
            }
        return count
    },
}

start.createInputs()