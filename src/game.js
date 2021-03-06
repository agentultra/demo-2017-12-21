const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 1080
, stageH = 650
, buttons = {
    Up: 0,
    Down: 0,
    Left: 0,
    Right: 0,
    Fire: 0
}
, playerStates = {
    FLYING: 'FLYING',
    DROPPING: 'DROPPING',
    HIT: 'HIT'
}

canvas.width = stageW
canvas.height = stageH

let tick = 0
, x = 108
, y = 40
, speed = 8
, dx = 0
, dy = 0.1
, gravity = 1.08
, playerState = playerStates.FLYING
, score = 0
, presentsLeft = 1000
, fallingPresents = []
, houses = []
, enemies = []
, hitTimeout = 20
, prevPositions = [
    [107, 40],
    [106, 40],
    [105, 40],
    [104, 40],
    [103, 40],
    [102, 40],
    [101, 40],
    [100, 40],
    [99, 40],
    [98, 40],
    [97, 40],
    [96, 40],
    [95, 40],
    [94, 40],
    [93, 40],
    [92, 40],
    [91, 40],
    [90, 40],
    [89, 40],
    [88, 40],
    [87, 40],
    [86, 40],
    [85, 40],
    [84, 40],
    [83, 40],
    [82, 40],
    [81, 40],
    [80, 40],
    [79, 40],
    [78, 40],
    [76, 40],
    [77, 40],
    [76, 40],
    [74, 40],
    [73, 40],
    [72, 40]
]

document.addEventListener('keydown', ev => {
    if (ev.key === 'a') {
        if (!buttons.Left) buttons.Left = 1
    } else if (ev.key === 'd') {
        if (!buttons.Right) buttons.Right = 1
    } else if (ev.key === 's') {
        if (!buttons.Down) buttons.Down = 1
    } else if (ev.key === 'w') {
        if (!buttons.Up) buttons.Up = 1
    } else if (ev.key === ' ') {
        if (!buttons.Fire) buttons.Fire = 1
    }
})

document.addEventListener('keyup', ev => {
    if (ev.key === 'a') {
        if (buttons.Left) buttons.Left = 0
    } else if (ev.key === 'd') {
        if (buttons.Right) buttons.Right = 0
    } else if (ev.key === 's') {
        if (buttons.Down) buttons.Down = 0
    } else if (ev.key === 'w') {
        if (buttons.Up) buttons.Up = 0
    } else if (ev.key === ' ') {
        if (buttons.Fire) buttons.Fire = 0
    }
})

const btn = name => name in buttons && buttons[name]

const clamp = (min, max, v) =>
      v <= min ? min : v >= max ? max : v

const intersectRect = (ax, ay, aw, ah, bx, by, bw, bh) =>
      !((ax + aw < bx) ||
        (ax > bx + bw) ||
        (ay + ah < by) ||
        (ay > by + bh))

const clear = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const House = (x, y, w, h, dx=-1) => ({
    x, y, w, h, dx
})

const Present = (x, y, dx=-0.4, dy=0.1) => ({
    x, y, dx, dy, delivered: false
})

const Bird = (x, y, dx=0, dy=0, state='FLYING') => ({
    name: 'BIRD', x, y, dx, dy, state, deathTimeout: 15
})

const updateBird = bird => {
    const updateFlying = b => {
        if (tick % 90 === 0) {
            const c = Math.random()
            if (c < 0.3) {
                if (b.y < 300) b.dy = 1
            } else if (c >= 0.3 && c < 0.7) {
                b.dy = 0
            } else {
                b.dy = -1
            }
        }
    }

    const updateDying = b => {
        b.dy += 1
        b.deathTimeout -= 1
        if (b.deathTimeout === 0)
            b.state = 'DEAD'
    }

    switch (bird.state) {
    case 'FLYING':
        updateFlying(bird)
        break;
    case 'DYING':
        updateDying(bird)
        break;
    }

    if (bird.x + 10 < 0)
        bird.state = 'DEAD'
}

const updateEnemy = e => {
    switch (e.name) {
    case 'BIRD':
        updateBird(e)
        break;
    }
}

const update = dt => {
    if (tick % 80 == 0) {
        if (Math.random() > 0.3) {
            houses.push(House(stageW, stageH - 40, 60, 40, -1))
        }
        if (Math.random() > 0.4) {
            enemies.push(Bird(stageW, y, -3))
        }
    }

    if (playerState === playerStates.FLYING) {
        if (btn('Up')) dy = -speed
        if (btn('Right')) dx = speed
        if (btn('Left')) dx = -speed
        if (!btn('Left') && !btn('Right')) dx = 0
        if (btn('Fire')) playerState = playerStates.DROPPING
        if (playerState === playerStates.DROPPING) {
            fallingPresents.push(Present(x, y, dx*0.6, dy+dy*Math.random()))
            presentsLeft -= 1
            playerState = playerStates.FLYING
        }
    } else if (playerState === playerStates.HIT) {
        hitTimeout -= 1
        if (hitTimeout === 0) {
            hitTimeout = 20
            playerState = playerStates.FLYING
        }
    }
    for (const p of fallingPresents) {
        p.dy += gravity
        p.y += p.dy
        p.x += p.dx
        for (const h of houses) {
            if (p.x >= h.x && (p.x + 10) < (h.x + h.w)) {
                if (p.y + 10 >= h.y) {
                    p.delivered = true
                    score += 1
                }
            }
        }
    }
    fallingPresents = fallingPresents.filter(p => p.y < stageH && !p.delivered)
    for (const h of houses) {
        h.x += h.dx
    }
    houses = houses.filter(h => h.x + h.w > 0)
    for (const e of enemies) {
        updateEnemy(e)
        e.x += e.dx
        e.y += e.dy

        if (intersectRect(x, y, 20, 20, e.x, e.y, 10, 5)) {
            e.state = 'DYING'
            if (playerState !== playerStates.HIT)
                playerState = playerStates.HIT
        }
    }
    enemies = enemies.filter(e => e.state !== 'DEAD')
    dy += gravity
    x = clamp(0, stageW - 20, x + dx)
    y = clamp(0, stageH - 20, y + dy)
    prevPositions.push([x, y])
    if (prevPositions.length >= 30)
        prevPositions = prevPositions.slice(1)
}

const render = dt => {
    clear()
    stage.fillStyle = playerState === playerStates.FLYING ? 'green' : 'red'
    stage.fillRect(x, y, 20, 20)
    stage.fillStyle = 'brown'
    stage.fillRect(prevPositions[28][0] - 20, prevPositions[28][1], 20, 20)
    stage.fillStyle = 'yellow'
    for (const e of enemies) {
        stage.fillRect(e.x, e.y, 10, 5)
    }
    stage.fillStyle = 'magenta'
    for (const p of fallingPresents) {
        stage.fillRect(p.x, p.y, 10, 10)
    }
    stage.fillStyle = 'blue'
    for (const h of houses) {
        stage.fillRect(h.x, h.y, h.w, h.h)
    }
    stage.fillStyle = 'white'
    stage.font = '40px mono'
    stage.fillText(`Score: ${score}`, 10, 40)
    stage.fillText(`Presents Left: ${presentsLeft}`, 10, 80)
}

const loop = dt => {
    update(dt)
    render(dt)
    tick += 1
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop)
