const TILESIZE = 30
let start = {
    createInputs() {
        var container = document.createElement('div')
        container.setAttribute('id', 'container')
        document.body.appendChild(container)
        for (let i = 1; i < 4; i++) {
            var span = document.createElement('span')
            span.setAttribute('id', `s${i}`)
            if (i == 1) span.innerHTML = 'Wysokość planszy:'
            else if (i == 2) span.innerHTML = 'Szerokość planszy:'
            else span.innerHTML = 'Ilość bomb:'
            container.appendChild(span)
            var input = document.createElement('input')
            input.setAttribute('type', 'number')
            input.setAttribute('name', `i${i}`)
            input.setAttribute('id', `i${i}`)
            container.appendChild(input)
        }
        var button = document.createElement('button')
        button.setAttribute('id', 'bt1')
        button.addEventListener('click', this.btClick)
        button.innerHTML = 'START'
        container.appendChild(button)
    },
    btClick() {
        if (!main.getValues()) {
            alert('Nieprawidłowe dane')
            return
        }
        main.clearSite()
        main.generateTiles()
        main.leftClickListeners()
    },
}
start.createInputs()
let main = {
    boardheight: null,
    boardwidth: null,
    bombcount: null,
    gamearr: [],
    getValues() {
        var a = document.getElementById('i1').value
        var b = document.getElementById('i2').value
        var c = document.getElementById('i3').value
        if (a < 1 || b < 1 || c < 1 || a * b < c)
            return false
        this.boardheight = a
        this.boardwidth = b
        this.bombcount = c
        return true
    },
    clearSite() {
        for (let i = 0; i < document.body.children.length;)
            document.body.children[0].remove()
    },
    generateTiles() {
        var gameboard = document.createElement('div')
        gameboard.setAttribute('id', 'gameboard')
        gameboard.addEventListener('contextmenu', function (ev) {
            ev.preventDefault()
        })
        document.body.appendChild(gameboard)
        for (let i = 0; i < this.boardheight; i++)
            for (let j = 0; j < this.boardwidth; j++) {
                var tile = document.createElement('div')
                tile.classList.add('tile')
                tile.style.width = `${TILESIZE}px`
                tile.style.height = `${TILESIZE}px`
                tile.style.top = `${TILESIZE * i}px`
                tile.style.left = `${TILESIZE * j}px`
                tile.classList.add(`x${i}`)
                tile.classList.add(`y${j}`)
                gameboard.appendChild(tile)
            }
    },
    leftClickListeners() {
        var els = document.querySelectorAll('.tile')
        for (const e of els)
            e.addEventListener('click', lc.leftClick)
    },
    rightClickListeners() {
        var els = document.querySelectorAll('.tile')
        for (const e of els)
            e.addEventListener('contextmenu', rc.rightClick)
    },
    getTilePosition(el) {
        var x = Number(el.classList[1].substring(1))
        var y = Number(el.classList[2].substring(1))
        return { x, y }
    },
    getTileByPosition(x, y) {
        var els = document.querySelectorAll(`.x${x}`)
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
        this.showBombs()
    },
    playerLose(el) {
        this.showBombs()
        el.style.backgroundImage = `url('gfx/bomb.png')`
    },
    showBombs() {
        var els = document.querySelectorAll('.tile')
        for (let i = 0; i < els.length; i++) {
            els[i].removeEventListener('click', lc.leftClick)
            els[i].removeEventListener('contextmenu', rc.rightClick)
            if (this.gamearr[this.getTilePosition(els[i]).x][this.getTilePosition(els[i]).y] == 'x'
                || this.gamearr[this.getTilePosition(els[i]).x][this.getTilePosition(els[i]).y] == 'fx'
                || this.gamearr[this.getTilePosition(els[i]).x][this.getTilePosition(els[i]).y] == 'px')
                els[i].style.backgroundImage = `url('gfx/pbomb.png')`
        }
    }
}
let lc = {
    leftClick(el) {
        console.log(this)
        console.log(el)
        if (el.isTrusted == true) el = this
        el.addEventListener('click', lc.secondLeftClick)
        var x = main.getTilePosition(el).x
        var y = main.getTilePosition(el).y
        if (main.gamearr.length == 0) {
            gen.generateGamearr(x, y)
            main.rightClickListeners()
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
        var el = main.getTileByPosition(x, y)
        el.style.background = 'lightgray'
        el.style.border = '1px solid black'
        el.removeEventListener('click', this.leftClick)
        el.removeEventListener('contextmenu', rc.rightClick)
        el.addEventListener('click', this.secondLeftClick)
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                var a = x + i
                var b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth)
                    if (main.gamearr[a][b] == 0) this.showTiles(a, b)
                    else if (main.gamearr[a][b] != 'x' && main.gamearr[a][b] != 'o'
                        && main.gamearr[a][b][0] != 'f' && main.gamearr != 'p') this.showOneTile(a, b)
            }
    },
    showOneTile(x, y) {
        var el = main.getTileByPosition(x, y)
        el.removeEventListener('click', this.leftClick)
        el.removeEventListener('contextmenu', rc.rightClick)
        el.addEventListener('click', this.secondLeftClick)
        el.style.background = 'lightgray'
        el.style.border = '1px solid black'
        el.innerHTML = main.gamearr[x][y]
        main.gamearr[x][y] = 'o'
    },
    secondLeftClick() {
        console.log(this)
        var count = 0
        var x = main.getTilePosition(this).x
        var y = main.getTilePosition(this).y
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                var a = x + i
                var b = y + j
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
                var a = x + i
                var b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth)
                    if (main.gamearr[a][b] != 'o' && main.gamearr[a][b][0] != 'f')
                        this.leftClick(main.getTileByPosition(a, b))
            }
    }
}
let rc = {
    rightClick() {
        console.log(main.gamearr)
        this.removeEventListener('click', lc.leftClick)
        this.removeEventListener('contextmenu', rc.rightClick)
        this.style.backgroundImage = `url('gfx/flaga.png')`
        var root = main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y]
        main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y] = `f${root}`
        this.addEventListener('contextmenu', rc.secondRightClick)
    },
    secondRightClick() {
        this.removeEventListener('contextmenu', rc.secondRightClick)
        var root = main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y].substring(1)
        main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y] = `p${root}`
        this.style.backgroundImage = `url('gfx/pyt.png')`
        this.addEventListener('contextmenu', rc.thirdRightClick)
    },
    thirdRightClick() {
        this.removeEventListener('contextmenu', rc.thirdRightClick)
        this.style.backgroundImage = `url('gfx/klepa.png')`
        var root = main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y].substring(1)
        if (root != 'x') root = Number(root)
        main.gamearr[main.getTilePosition(this).x][main.getTilePosition(this).y] = root
        this.addEventListener('click', lc.leftClick)
        this.addEventListener('contextmenu', rc.rightClick)
    },
}
let gen = {
    generateGamearr(x, y) {
        main.gamearr = this.generate2dArray(main.boardheight, main.boardwidth)
        this.generateBombs(x, y)
    },
    generate2dArray(width, height) {
        arr = []
        for (let i = 0; i < width; i++) {
            arr[i] = []
            for (let j = 0; j < height; j++)
                arr[i][j] = 0
        }
        return arr;
    },
    generateBombs(x0, y0) {
        for (let i = 0; i < main.bombcount; i++) {
            var x = Math.floor(Math.random() * main.boardheight)
            var y = Math.floor(Math.random() * main.boardwidth)
            if (main.gamearr[x][y] == 0) main.gamearr[x][y] = 'x'
            else i--
        }
        if (main.gamearr[x0][y0] == 'x') this.generateGamearr(x0, y0)
        this.generateNumbers()
    },
    generateNumbers() {
        for (let i = 0; i < main.boardheight; i++)
            for (let j = 0; j < main.boardwidth; j++)
                if (main.gamearr[i][j] == 0)
                    main.gamearr[i][j] = this.writeNumber(i, j)
    },
    writeNumber(x, y) {
        var count = 0
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                var a = x + i
                var b = y + j
                if (a >= 0 && b >= 0 && a < main.boardheight && b < main.boardwidth)
                    if (main.gamearr[a][b] == 'x') count++
            }
        return count
    },
}
















