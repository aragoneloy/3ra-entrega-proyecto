// ---------------------------- Módulos ----------------------------
import express from 'express'
import exphbs from 'express-handlebars'
import path from 'path'
import session from 'express-session';
import dotenv from 'dotenv'
import connectMongo from 'connect-mongo'
import { createServer } from "http";
import { Server } from "socket.io";
import ContenedorArchivo from './src/container/ContenedorArchivo.js';
import UsuariosDaoMongoDb from './src/daos/usuarios/UsuariosDaoMongoDB.js';
import config from './src/utils/config.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import bcrypt from 'bcrypt'
import minimist from 'minimist';
import process, { execPath } from 'process';
import passport from "passport";
import { Strategy } from "passport-local";
import util from 'util'
import cluster from 'cluster';
import os from 'os'
import { normalize, schema } from 'normalizr'
import compression from 'compression';
import {logger} from './src/utils/logger.config.js';
import morgan from 'morgan';
import multer from 'multer';
import routerProductos from './src/routes/productos.routes.js';
import routerCarrito from './src/routes/carrito.routes.js';
import { carritosDao as carrito, productosDao as contenedor} from './src/daos/index.js'
import nodemailer from 'nodemailer';



const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config();

// ---------------------------- instancias del servidor ----------------------------
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const CPU_CORES = os.cpus().length 
// ---------------------------- MINIMIST ----------------------------
let options = {alias: { p: 'port', m: 'modo'}, default:{p: 8080, m: 'fork' }}
let args = minimist(process.argv.slice(2), options)
console.log(args.m)
const PORT = args.p;
let MODO = args.m;
export default PORT;


if(cluster.isPrimary && MODO === 'cluster'){
    
    for (let i = 0; i < CPU_CORES; i++) {
        cluster.fork();
    }
} else {
    //DB
    const DB_USUARIOS = new UsuariosDaoMongoDb()
    const DB_PRODUCTOS = contenedor
    const DB_MENSAJES = new ContenedorArchivo('./DB/mensajes.json')

    // ---------------------------- Nodemailer ----------------------------
    
    const EMAIL_ACCOUNT = process.env.EMAIL
    const EMAIL_PASSWORD = process.env.PASSWORD

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: EMAIL_ACCOUNT,
            pass: EMAIL_PASSWORD
        }
    });

    // ---------------------------- session pers en mongo ----------------------------

    const MongoStore = connectMongo.create({
        mongoUrl: process.env.MONGO_URL_SESSIONS,
        
    })


    /*----------- passport -----------*/
    const LocalStrategy = Strategy;
    passport.use(new LocalStrategy(
        async function(username, password, done) {
            
            const existeUsuario = await DB_USUARIOS.getByEmail(username)
            
            
            if(!existeUsuario) {
                return done(null, false)
            } else {
                const match = await verifyPass(existeUsuario, password)
                if (!match) {
                    return done(null, false)
                }
                return done(null, existeUsuario);
            }
        }
    ));

    passport.serializeUser((user, done) =>{
        return done(null, user.email)
    })

    passport.deserializeUser(async (email, done) =>{
        const existeUsuario = await DB_USUARIOS.getByEmail(email)
        return done(null, existeUsuario)
    })

    //Session setup

    app.use(session({
        store: MongoStore,
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000 //10 min
        }

        
    }))
    app.use(passport.initialize())
    app.use(passport.session())


    // ---------------------------- Middlewares ----------------------------
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.urlencoded({extended: true}));

    // Multer
    const upload = multer({ dest: './public/data/uploads' })
    
    //motor de plantillas
    app.engine('hbs', exphbs.engine({
        defaultLayout: 'main',
        layoutsDir: path.join(app.get('views'), 'layouts'),
        partialsDir: path.join(app.get('views'), 'partials'),
        extname: 'hbs'

    }))
    app.set('views', './views');
    app.set('view engine', 'hbs');



    function isAuth(req, res, next) {
        if(req.isAuthenticated()){
            next()
        } else {
            res.redirect('/login')
        }
    }

    let logInfo = {
        write: function (text) {
            logger.info(text);
        }
    };
    
    app.use(morgan('combined', { stream: logInfo }));
    
    let logErrors = {
        write: function (text) {
            logger.error(text);
        }
    };
    morgan('combined', { 
        stream: logErrors,
        skip: function (req, res) { return res.statusCode < 400}
      })


    //----------- metodos de auth -----------
    async function generateHashPassword(password){
        const hashPassword = await bcrypt.hash(password, 10)
        return hashPassword
    }

    async function verifyPass(usuario, password){
        const match = await bcrypt.compare(password, usuario.password);
        return match
    }   

    

    // ---------------------------- Rutas ----------------------------
    app.use('/api/productos', routerProductos);
    app.use('/api/carrito', routerCarrito);
    
    app.get('/', isAuth, async (req, res) => {
        const userData = await DB_USUARIOS.getByEmail(req.user.email)
        console.log(userData)
        return res.render('vista', {userData}) 
        
    });
    app.get('/cuenta', isAuth, async (req, res) => {
        const userData = await DB_USUARIOS.getByEmail(req.user.email)
        console.log(userData)
        return res.render('cuenta', {userData}) 
        
    });

    app.get('/login', async (req, res) =>{
        console.log(`Ruta especial en ${PORT} - PID ${process.pid} - ${new Date().toLocaleString()}`)
        return res.render('login')
    })

    app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect:'/login-error'} ))

    app.get('/logout', async (req, res) => {
        const username = req.user.email
        req.logout(function(err) {
            if (err) { return next(err); }
            res.render('logout', {username})
        });
        
    });

    app.get('/register', async (req, res) => {
        return res.render('registro')
    })

    app.post('/register', upload.single('avatar'), async (req, res) => {

        const { email, password, name, telephone, adress, age } = req.body
        

        const newUsuario = await DB_USUARIOS.getByEmail(email)
        console.log(newUsuario)
        if(newUsuario == undefined){
            DB_USUARIOS.save({ email, password: await generateHashPassword(password), name, telephone, adress, age}) 
            const mailOptions = {
                from: 'registros@ecommerce.com', // sender address
                to: 'eloy.aragon@hotmail.com', // list of receivers
                subject: 'Nuevo usuario', // Subject line
                html: `<p>${email} ${name} ${telephone} ${adress} ${age}</p>`// plain text body
              };
              transporter.sendMail(mailOptions, function (err, info) {
                 if(err)
                   console.log(err)
                 else
                   console.log(info);
              });
            res.redirect('/login')
        } else {
        res.render('registro-error')
        }
        
    })

    app.get('/login-error', async (req, res) => {
        return res.render('login-error')
    })



    // ---------------------------- Servidor ----------------------------c

        const server = httpServer.listen(PORT, () =>  {
        console.log(`servidor corriendo en el puerto ${PORT} - PID Worker ${process.pid}`)
        } );




    // ---------------------------- Websocket ----------------------------


    io.on('connection', async (socket)=>{
        console.log(`Nuevo cliente conectado! ${socket.id}`);
        

        // const productos = await DB_PRODUCTOS.getAll()
        
        // io.emit('from-server-productos', productos)

        // socket.on('from-client-producto', async producto =>{
            
        //     DB_PRODUCTOS.save(await producto);
            
        //     io.emit('from-server-productos', productos)
        // })

    })

    



}

