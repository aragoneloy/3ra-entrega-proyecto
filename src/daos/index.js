let productosDao
let carritosDao

import * as dotenv from 'dotenv';
dotenv.config();
switch (process.env.PERS) {
    case 'json':
        const { default : ProductosDaoArchivo} = await import('./productos/ProductosDaoArchivo.js')
        const { default : CarritosDaoArchivo} = await import('./carritos/CarritosDaoArchivo.js')
        
        productosDao = new ProductosDaoArchivo()
        carritosDao = new CarritosDaoArchivo()
        break;
    case 'mongodb':
        const { default : ProductosDaoMongoDb} = await import('./productos/ProductosDaoMongoDb.js')
        const { default : CarritosDaoMongoDb} = await import('./carritos/CarritosDaoMongoDb.js')
        
        productosDao = new ProductosDaoMongoDb()
        carritosDao = new CarritosDaoMongoDb()
        break;
    case 'firebase':
        const { default : ProductosDaoFirebase} = await import('./productos/ProductosDaoFirebase.js')
        const { default : CarritosDaoFirebase} = await import('./carritos/CarritosDaoFirebase.js')
        
        productosDao = new ProductosDaoFirebase()
        carritosDao = new CarritosDaoFirebase()
        break;
    default:
        // const { default : ProductosDaoMem} = await import('')
        // const { default : CarritosDaoMem} = await import('')
        
        // productosDao = new ProductosDaoMem()
        // carritosDao = new CarritosDaoMem()
        // break;
}

export { productosDao, carritosDao }