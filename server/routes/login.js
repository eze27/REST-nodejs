const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');

app.post('/login', (req, res) => {

    let body = req.body;
    //que email exista
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        //si usuario no existe
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "usuario o contraseña incorrectas"
                }
            })
        }
        //comparamos contraseñas
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "usuario o contraseña incorrectas"
                }
            })
        }
        //se construye token
        let token = jwt.sign({
                usuario: usuarioDB
            },
            process.env.SEED, {
                expiresIn: process.env.CADUCIDAD_TOKEN
            });
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })

    })
});
//Configuracion de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


//servicio que procesa token generado del lado del html
app.post('/google', async(req, res) => {
    //lega un token
    let token = req.body.idtoken;
    //este token se envia por parametro
    //el metodo verify lo valida si NO es valido no se ejecuta
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        })

    // comparar que no exista email en bd de mongo
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        // si existe usuario
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Deb usar su autenticacion normal'
                    }
                })
            } else {
                let token = jwt.sign({
                        usuario: usuarioDB
                    },
                    process.env.SEED, {
                        expiresIn: process.env.CADUCIDAD_TOKEN
                    });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            // si el usuario no existe en BD  de mongo
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                //se construye token
                let token = jwt.sign({
                        usuario: usuarioDB
                    },
                    process.env.SEED, {
                        expiresIn: process.env.CADUCIDAD_TOKEN
                    });
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            })

        }
    })

    /*  res.json({
          usuario: googleUser
      })*/
});

module.exports = app;