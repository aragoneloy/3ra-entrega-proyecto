import ContenedorArchivo from "../../container/ContenedorArchivo.js";

class ProductosDaoArchivo extends ContenedorArchivo{
    constructor() {
        super('../../../DB/productos.json')
    }

  
}

export default ProductosDaoArchivo