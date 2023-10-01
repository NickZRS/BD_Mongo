import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import {check, validationResult} from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'agendaEventos'

const validaEventos = [
    
    check('n_registro')
    .not().isEmpty().trim().withMessage('É obrigatório informar o Número de Registro')
    .isNumeric().withMessage('O Número de Registro só deve conter números')
    .isLength({min: 8, Max:8}).withMessage('O Número de Registro deve conter 8 dígitos')
    
]   

/**
 * GET /api/agendaEventos/
 * Lista todos os Eventos 
 *
 */
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

/**
 * GET /api/agendaEventos/id/:id
 * Lista todos os Eventos por ID
 *
 */

router.get('/id/:id',async(req, res)=> {
    try{
        db.collection(nomeCollection).find({'_id':{$eq: ObjectId(req.params.id)}})
        .toArray((err, docs)=> {
            if(err){
                res.status(400).json(err) // bad request
            }else{
                res.status(200).json(docs) //retorna o documento
            }
        })
    }catch(err){
        res.status(500).json({"error": err.message})
    }
})
/**

 * GET /api/agendaEventos/titulo/:titulo

 * Lista por título

 */

router.get('/titulo/:titulo', async (req, res) => {
    try {
        db.collection(nomeCollection).find({ 'titulo': { $regex: req.params.titulo, $options: "i"}})
            .toArray((err, docs) => {
                if (err) {
                    res.status(400).json(err)
                } else {
                    res.status(200).json(docs)
                }
            })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})
 
/**

 * GET /api/agendaEventos/precos/

 * Lista todos os eventos de 2023 com o preço entre R$100,00 e R$900,00

 */
router.get('/precos', async (req, res) => {
    try {
        db.collection(nomeCollection).find({ $and:[
            {'custo': { $gte: 100, $lte: 900}}, // Filtrar por custo maior ou igual a 100 e menor ou igual a 900
            {data : /2023$/i}
        ]
           
        }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(docs);
            }
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

 

/**
 * DELETE /api/agendaEventos/:id
 * Apaga o Evento pelo id
 *
 */
router.delete('/:id', async(req,res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result=> res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})

/**
 * POST /api/agendaEventos
 * Insere um novo Evento
 *
 */

router.post('/' , validaEventos, async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    }else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**
 * PUT /api/agendaEventos
 * Altera um Evento
 */
router.put('/', validaEventos, async(req, res) => {
    let idDocumento = req.body._id //armazenando o id do documento
    delete req.body._id //iremos remover o id do body
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq : ObjectId(idDocumento)}},
                   { $set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

export default router