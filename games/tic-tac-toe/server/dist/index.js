import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import db from './db.js';
const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:1192',
        'http://127.0.0.1:1192',
    ],
    credentials: true,
}));
const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
function win(b, p) {
    for (const [a, c, d] of lines) {
        const line = [a, c, d];
        const vals = line.map((i) => b[i]);
        const countP = vals.filter((v) => v === p).length;
        const emptyIndex = line.find((i) => !b[i]);
        if (countP === 2 && emptyIndex !== undefined)
            return emptyIndex;
    }
    return -1;
}
function winnerOf(b) {
    for (const [a, c, d] of lines) {
        if (b[a] && b[a] === b[c] && b[a] === b[d])
            return b[a];
    }
    return '';
}
const wss = new WebSocketServer({ noServer: true });
const waiting = new Map();
const active = new Map();
wss.on('connection', async (ws, request) => {
    try {
        console.log('[ws] upgrade url=', request.url, 'cookie=', request.headers?.cookie);
    }
    catch { }
    const url = new URL(request.url || '', 'http://localhost');
    const gameUuid = url.searchParams.get('game_uuid') || '';
    const reconnectPartyUuid = url.searchParams.get('party_uuid') || '';
    if (!gameUuid) {
        ws.close();
        return;
    }
    let sid = '';
    try {
        const cookie = String(request.headers?.cookie || '');
        const m = cookie.match(/sid=([^;]+)/);
        sid = m ? m[1] : '';
    }
    catch { }
    if (!sid) {
        console.warn('[ws] no sid cookie, proceeding with ephemeral id');
    }
    let userId = 0;
    try {
        const resp = await fetch('http://localhost:3000/api/session', {
            headers: { Cookie: `sid=${sid}` },
        });
        const u = await resp.json();
        userId = Number(u?.id || 0);
    }
    catch { }
    try {
        console.log('[ws] resolved userId=', userId, 'gameUuid=', gameUuid);
    }
    catch { }
    if (!userId) {
        userId = Math.floor(Math.random() * 1000000000);
        console.warn('[ws] session not resolved, use ephemeral userId=', userId);
    }
    const ctx = { ws: ws, userId, gameUuid };
    const queue = waiting.get(gameUuid) || [];
    if (reconnectPartyUuid) {
        db.get('SELECT player_x_id as x, player_o_id as o, moves, status FROM parties WHERE uuid = ?', [reconnectPartyUuid], (err, row) => {
            if (err || !row)
                return;
            ctx.partyUuid = reconnectPartyUuid;
            ctx.symbol = ctx.userId === row.x ? 'x' : ctx.userId === row.o ? 'o' : undefined;
            ws._ctx = ctx;
            try {
                const board = Array(9).fill('');
                const moves = JSON.parse(row.moves || '[]');
                for (const m of moves)
                    board[m.i] = m.s;
                const w = winnerOf(board);
                const payload = JSON.stringify({
                    type: 'state',
                    partyUuid: ctx.partyUuid,
                    board,
                    turn: w ? null : moves.length % 2 === 0 ? 'x' : 'o',
                    symbol: ctx.symbol,
                });
                ws.send(payload);
            }
            catch { }
        });
        // continue; handlers will be attached below
    }
    if (active.has(userId)) {
        const partyUuid = active.get(userId);
        ctx.partyUuid = partyUuid;
        ws._ctx = ctx;
        try {
            console.log('[ws] reattach active user', { userId, partyUuid });
        }
        catch { }
        db.get('SELECT player_x_id as x, player_o_id as o, moves, status FROM parties WHERE uuid = ?', [partyUuid], (err, row) => {
            if (err || !row)
                return;
            try {
                ctx.symbol = ctx.userId === row.x ? 'x' : ctx.userId === row.o ? 'o' : undefined;
                ws._ctx = ctx;
                const board = Array(9).fill('');
                const moves = JSON.parse(row.moves || '[]');
                for (const m of moves)
                    board[m.i] = m.s;
                const w = winnerOf(board);
                const payload = JSON.stringify({
                    type: 'state',
                    partyUuid,
                    board,
                    turn: w ? null : moves.length % 2 === 0 ? 'x' : 'o',
                    symbol: ctx.symbol,
                });
                ws.send(payload);
            }
            catch { }
        });
        // continue; handlers will be attached below
    }
    if (!ctx.partyUuid) {
        const opponent = queue.find((c) => c.userId !== userId && !active.has(c.userId));
        if (!opponent) {
            queue.push(ctx);
            waiting.set(gameUuid, queue);
            ws._ctx = ctx;
            try {
                console.log('[ws] queued', { gameUuid, userId, qlen: queue.length });
            }
            catch { }
            try {
                ws.send(JSON.stringify({ type: 'waiting', gameUuid }));
            }
            catch { }
        }
        else {
            waiting.set(gameUuid, queue.filter((c) => c !== opponent));
            const partyUuid = crypto.randomUUID();
            ctx.partyUuid = partyUuid;
            opponent.partyUuid = partyUuid;
            ctx.symbol = 'x';
            opponent.symbol = 'o';
            const createdAt = new Date().toISOString();
            try {
                console.log('[ws] match', { gameUuid, x: ctx.userId, o: opponent.userId, partyUuid });
            }
            catch { }
            db.run('INSERT INTO parties (uuid, game_uuid, player_x_id, player_o_id, moves, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [partyUuid, gameUuid, ctx.userId, opponent.userId, JSON.stringify([]), 'playing', createdAt]);
            const startMsg = JSON.stringify({
                type: 'start',
                partyUuid,
                userXId: ctx.userId,
                userOId: opponent.userId,
                me: 'x',
            });
            const startMsgOpp = JSON.stringify({
                type: 'start',
                partyUuid,
                userXId: ctx.userId,
                userOId: opponent.userId,
                me: 'o',
            });
            try {
                console.log('[ws] send start -> x,o', { partyUuid });
            }
            catch { }
            ws.send(startMsg);
            opponent.ws.send(startMsgOpp);
            active.set(ctx.userId, partyUuid);
            active.set(opponent.userId, partyUuid);
            ws._ctx = ctx;
            opponent.ws._ctx = opponent;
        }
    }
    ws.on('message', (raw) => {
        try {
            console.log('[ws] raw', String(raw));
        }
        catch { }
        const ctx = ws._ctx;
        try {
            const msg = JSON.parse(String(raw));
            if (msg?.type === 'move') {
                const idx = Number(msg.index);
                if (!ctx?.partyUuid && typeof msg.partyUuid === 'string' && msg.partyUuid) {
                    ctx.partyUuid = msg.partyUuid;
                    ws._ctx = ctx;
                    db.get('SELECT player_x_id as x, player_o_id as o FROM parties WHERE uuid = ?', [ctx.partyUuid], (e0, r0) => {
                        if (!e0 && r0) {
                            ctx.symbol = ctx.userId === r0.x ? 'x' : ctx.userId === r0.o ? 'o' : undefined;
                            ws._ctx = ctx;
                        }
                    });
                }
                try {
                    console.log('[ws] recv move', { userId: ctx?.userId, partyUuid: ctx?.partyUuid, idx });
                }
                catch { }
                if (!ctx?.partyUuid || idx < 0 || idx > 8) {
                    try {
                        console.log('[ws] move rejected: bad ctx or index', { userId: ctx?.userId, partyUuid: ctx?.partyUuid, idx });
                    }
                    catch { }
                    return;
                }
                db.get('SELECT moves, status FROM parties WHERE uuid = ?', [ctx.partyUuid], (err, row) => {
                    if (err || !row)
                        return;
                    if (row.status !== 'playing') {
                        try {
                            console.log('[ws] move rejected: status not playing', { partyUuid: ctx.partyUuid, status: row.status });
                        }
                        catch { }
                        return;
                    }
                    const moves = JSON.parse(row.moves || '[]');
                    const board = Array(9).fill('');
                    for (const m of moves)
                        board[m.i] = m.s;
                    const nextSymbol = moves.length % 2 === 0 ? 'x' : 'o';
                    if (nextSymbol !== ctx.symbol) {
                        try {
                            console.log('[ws] move rejected: wrong turn', { partyUuid: ctx.partyUuid, userId: ctx.userId, expected: nextSymbol, actual: ctx.symbol });
                        }
                        catch { }
                        return;
                    }
                    if (board[idx]) {
                        try {
                            console.log('[ws] move rejected: occupied', { partyUuid: ctx.partyUuid, idx });
                        }
                        catch { }
                        return;
                    }
                    moves.push({ i: idx, s: ctx.symbol });
                    board[idx] = ctx.symbol;
                    const w = winnerOf(board);
                    const done = w || board.every((v) => v);
                    db.run('UPDATE parties SET moves = ? WHERE uuid = ?', [
                        JSON.stringify(moves),
                        ctx.partyUuid,
                    ]);
                    const turnNext = w ? null : nextSymbol === 'x' ? 'o' : 'x';
                    try {
                        console.log('[ws] state', { partyUuid: ctx.partyUuid, len: moves.length });
                    }
                    catch { }
                    ws.send(JSON.stringify({
                        type: 'state', partyUuid: ctx.partyUuid, board, turn: turnNext, symbol: ctx.symbol,
                    }));
                    for (const client of wss.clients) {
                        const oc = client._ctx;
                        if (oc?.partyUuid === ctx.partyUuid && client !== ws) {
                            const sym = oc?.symbol;
                            client.send(JSON.stringify({
                                type: 'state', partyUuid: ctx.partyUuid, board, turn: turnNext, symbol: sym,
                            }));
                        }
                    }
                    if (done) {
                        const result = w ? (w === 'x' ? 'x' : 'o') : 'draw';
                        const finishedAt = new Date().toISOString();
                        db.run('UPDATE parties SET status = ?, result = ?, finished_at = ? WHERE uuid = ?', [
                            'finished',
                            result,
                            finishedAt,
                            ctx.partyUuid,
                        ]);
                        const endMsgSelf = JSON.stringify({ type: 'end', partyUuid: ctx.partyUuid, result, symbol: ctx.symbol });
                        try {
                            console.log('[ws] end', { partyUuid: ctx.partyUuid, result });
                        }
                        catch { }
                        ws.send(endMsgSelf);
                        for (const client of wss.clients) {
                            const oc = client._ctx;
                            if (oc?.partyUuid === ctx.partyUuid && client !== ws) {
                                const endMsgOpp = JSON.stringify({ type: 'end', partyUuid: ctx.partyUuid, result, symbol: oc?.symbol })(client).send(endMsgOpp);
                            }
                        }
                        // освобождение активной партии
                        active.delete(ctx.userId);
                        for (const client of wss.clients) {
                            const oc = client._ctx;
                            if (oc?.partyUuid === ctx.partyUuid && oc?.userId && oc.userId !== ctx.userId) {
                                active.delete(oc.userId);
                            }
                        }
                        db.get('SELECT player_x_id as x, player_o_id as o FROM parties WHERE uuid = ?', [ctx.partyUuid], async (e2, r2) => {
                            if (e2 || !r2)
                                return;
                            try {
                                const resp = await fetch('http://localhost:3000/api/ratings/update', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        gameUuid,
                                        partyUuid: ctx.partyUuid,
                                        userXId: r2.x,
                                        userOId: r2.o,
                                        result,
                                    }),
                                });
                                const data = await resp.json();
                                const ratingsMsg = JSON.stringify({
                                    type: 'ratings',
                                    userX: data.userX,
                                    userO: data.userO,
                                });
                                ws.send(ratingsMsg);
                                for (const client of wss.clients) {
                                    const oc = client._ctx;
                                    if (oc?.partyUuid === ctx.partyUuid && client !== ws)
                                        client.send(ratingsMsg);
                                }
                            }
                            catch { }
                        });
                    }
                });
            }
        }
        catch { }
    });
    ws.on('error', (err) => {
        try {
            console.log('[ws] error', err?.message || err);
        }
        catch { }
    });
    ws.on('close', () => {
        const oc = ws._ctx;
        const g = oc?.gameUuid || gameUuid;
        const q = waiting.get(g) || [];
        const nq = q.filter((c) => c.ws !== ws && c.userId !== oc?.userId);
        waiting.set(g, nq);
        try {
            console.log('[ws] close', { userId: oc?.userId, partyUuid: oc?.partyUuid, qlen: nq.length });
        }
        catch { }
    });
});
app.get('/api/party/:uuid', (req, res) => {
    const { uuid } = req.params;
    db.get('SELECT uuid, game_uuid, player_x_id, player_o_id, moves, status, result, created_at, finished_at FROM parties WHERE uuid = ?', [uuid], (err, row) => {
        if (err)
            return res.status(500).json({ error: 'Ошибка базы данных' });
        if (!row)
            return res.status(404).json({ error: 'Партия не найдена' });
        return res.json({
            uuid: row.uuid,
            gameUuid: row.game_uuid,
            playerXId: row.player_x_id,
            playerOId: row.player_o_id,
            moves: JSON.parse(row.moves || '[]'),
            status: row.status,
            result: row.result || null,
            createdAt: row.created_at,
            finishedAt: row.finished_at || null,
        });
    });
});
const port = 11692;
const server = app.listen(port, () => {
    console.log(`TicTacToe backend on http://localhost:${port}`);
});
server.on('upgrade', (req, socket, head) => {
    if (req.url && req.url.startsWith('/ws')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    }
    else {
        socket.destroy();
    }
});
