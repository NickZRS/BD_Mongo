import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'agendaEventos'

router.get('/', async (req, res)=> {
    try{
        db.collection(nomeCollection).find().sort({titulo: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `&{err.message}`,
                msg: 'erro ao obter a lista de eventos',
                param: '/'
            }]
        })
    }
})

export default router