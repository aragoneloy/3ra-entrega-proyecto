import express from 'express'

import { carritosDao as carrito, productosDao as contenedor} from '../daos/index.js'

const routerProductos = express.Router();

const isAdmin = true

routerProductos.get('/', async (req, res) => {
    const productos = await contenedor.getAll()
    return res.render('historico', {productos})
});

routerProductos.get('/:id', async (req, res) => {
    const id = req.params.id;
    res.status(200).json(await contenedor.getById(id))
});

routerProductos.post('/', async (req, res) => {
    if (!isAdmin) {
        res.status(401).json({error:'error 401', descripcion:`ruta /productos, metodo post, no autorizada`})
    } else{
        console.log(await req.body)
        await contenedor.save( req.body)
        res.status(201).json({msg: 'Agregado!', data: req.body})
    }
    
});

routerProductos.put('/:id', async (req, res) => {
    const id = req.params.id;
    if (!isAdmin) {
        res.status(401).json({error:'error 401', descripcion:`ruta /productos/${id}, metodo put, no autorizada`})
    } else{
    res.status(201).json(await contenedor.updateById(id, "banana", "2", "nd"))
    }
})

routerProductos.delete('/:id', async (req, res) => {
    const id = req.params.id;
    if (!isAdmin) {
        res.status(401).json({error:'error 401', descripcion:`ruta /productos/${id}, metodo delete, no autorizada`})
    } else{
    res.status(201).json(await contenedor.deleteById(id))
    }
})


export default routerProductos;
