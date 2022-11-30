import admin from"firebase-admin";
import config from '../utils/config.js'

admin.initializeApp({
  credential: admin.credential.cert(config.firebase)
});
//inicializar firebase
const db = admin.firestore()
export default class ContenedorFirebase {
    
    constructor(nombreColeccion){
        this.coleccion = db.collection(nombreColeccion)
    }

    async getAll(){
        try {
            const result = []
            const snapshot = await this.coleccion.get()
            snapshot.forEach(doc => {
                result.push({id: doc.id, ...doc.data()})
            })
            return result
        } catch (error) {
            throw error; 
        }
        
    }

    async getById(id){
        try {
            const docRef = this.coleccion.doc(`${id}`);
            const doc = await docRef.get()
            console.log(doc)
            if (!doc.exists){
               throw new Error('error al listar por id')
            } else {
                const data = doc.data()
                return { ...data, id}
                
            }
        } catch (error) {
            throw error; 
        }
    }

    async save(obj){
        try {
            const guardado = await this.coleccion.add(obj)
            return {...obj, id: guardado.id}
        } catch (error) {
           throw error; 
        }
        
    }

    async update(obj){
        try {
           const actualizado = await this.coleccion.doc(obj.id).set(obj)
           return actualizado
        } catch (error) {
            throw error
        }
    }

    async deleteById(id){
        try {
            const item = await this.coleccion.doc(id).delete()
            return item
        } catch (error) {
            throw error;
        }

    }

   
}

