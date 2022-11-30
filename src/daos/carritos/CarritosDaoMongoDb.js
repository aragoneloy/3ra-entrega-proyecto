import ContenedorMongoDb from "../../container/ContenedorMongoDb.js";

export default class CarritosDaoMongoDb extends ContenedorMongoDb{
    constructor() {
        super('carritos', {
            productos: { type: [], required: true }
        })

    }

    async save(carrito = { productos: []}) {
        return await super.save(carrito)
    }

}