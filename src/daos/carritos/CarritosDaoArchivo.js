import ContenedorArchivo from "../../container/ContenedorArchivo.js";

class CarritosDaoArchivo extends ContenedorArchivo{
    constructor() {
        super('../../../DB/carritos.json')
    }

    
}

export default CarritosDaoArchivo