import express from 'express'

const app = express()
const port = 4000

import rotasAgendaEvento from './routes/agendaEvento.js'
app.use(express.urlencoded({ extended: true}))

app.use(express.json()) 

app.use('/', express.static('public'))

app.use('/api/AgendaEventos', rotasagendaEvento)

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API 1 Projeto Fatec 100% funcional 👌',
        version: '1.0.0'
    })
})

app.use('/favicon.ico', express.static('public/image/computer.png'))

app.use(function (req, res) {
    res.status(404).json({
        errors: [{
            value: `${req.originalUrl}`,
            msg: `A rota ${req.originalUrl} não existe nesta API!`,
            param: 'invalid route'
        }]
    })
})
app.listen(port, function(){
    console.log(`🖥️ Servidor rodando na porta ${port}`)
})