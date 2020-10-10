import express from "express";
import bodyParser from "body-parser";
import { createServer } from "http";
import sockerio from "socket.io"
import path from "path"


const app = express()
const http = createServer(app)
const io = sockerio(http)
const port = 8080

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const generateId = (): string => Math.random().toString(36).substring(2, 15)

type Page = {
    id: string,
    date: Date,
    clients: Array<sockerio.Socket>
}

let DATA: { [key: string]: Page; } = {};

app.get("/api/new", (_, res) => {
    const newPage: Page = {
        id: generateId(),
        date: new Date(),
        clients: []
    }
    DATA[newPage.id] = newPage
    res.json(newPage)
});

app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
})

app.get("/:id", (_, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
})

io.on('connection', (socket) => {
    console.log(`a user ${socket.id} connected`)

    socket.on('text', (res) => {
        const data: any = JSON.parse(res)
        DATA[data.roomId].clients.forEach(client => {
            if (client.id != socket.id) {
                client.emit('updateText', data.text)
            }
        })
    })

    socket.on('joinRoom', data => DATA[data].clients.push(socket))

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
});

http.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})
