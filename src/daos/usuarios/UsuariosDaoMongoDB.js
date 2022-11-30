import ContenedorMongoDb from "../../container/ContenedorMongoDb.js";

export default class UsuariosDaoMongoDb extends ContenedorMongoDb{
    constructor() {
        super('usuarios', {
            email: { type: String, required: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            telephone: { type: Number, required: true },
            adress: { type: String, required: true },
            age: { type: Number, required: true },

        })

    }

    

}