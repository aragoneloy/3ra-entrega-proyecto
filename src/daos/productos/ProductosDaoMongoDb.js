import ContenedorMongoDb from "../../container/ContenedorMongoDb.js";



export default class ProductosDaoMongoDb extends ContenedorMongoDb{
    constructor() {
        super('productos', {
            title: {type: String, require: true},
            price: {type: Number, require: true},
            thumbnail: {type: String, require: true}
        })

    }


}

