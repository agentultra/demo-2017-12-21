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
    DROPPING: 'DROPPING'
}

canvas.width = stageW
canvas.height = stageH

let x = 40
, y = 40
, speed = 8
, dx = 0
, dy = 0.1
, gravity = 1.08
, playerState
, fallingPresents = []

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

const clear = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const Present = (x, y, dx=-0.4, dy=0.1) => ({
    x, y, dx, dy
})

const update = dt => {
    if (btn('Up')) dy = -speed
    if (btn('Right')) dx = speed
    if (btn('Left')) dx = -speed
    if (!btn('Left') && !btn('Right')) dx = 0
    if (btn('Fire')) playerState = playerStates.DROPPING
    if (playerState === playerStates.DROPPING) {
        fallingPresents.push(Present(x, y, dx*0.6, dy+dy*Math.random()))
        playerState = playerStates.FLYING
    }
    for (const p of fallingPresents) {
        p.dy += gravity
        p.y += p.dy
        p.x += p.dx
    }
    fallingPresents = fallingPresents.filter(p => p.y < stageH)
    dy += gravity
    x = clamp(0, stageW - 20, x + dx)
    y = clamp(0, stageH - 20, y + dy)
}

const render = dt => {
    clear()
    stage.fillStyle = 'green'
    stage.fillRect(x, y, 20, 20)
    stage.fillStyle = 'magenta'
    for (const p of fallingPresents) {
        stage.fillRect(p.x, p.y, 10, 10)
    }
}

const loop = dt => {
    update()
    render()
    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop)
