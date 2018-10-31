const express = require('express');
const app = express();
const Categoria = require('../models/categoria');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
const bcrypt = require('bcrypt');
const _ = require('underscore');
//muestra toda las categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                categorias
            })
        })

});

//Muestra una categoria por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El Id no es correcto'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

});

//crear nueva categoria
app.post('/categoria', verificaToken, (req, res) => {

    // recoge valores de campos de texto
    let body = req.body;
    //instancia de  nueva categoria
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    // guardar nueva categoria en bd de mongo
    categoria.save((err, categoriaDB) => {
        //si devuelve error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Si no inserta
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        //se hizo correctamente
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });




})

// acrualizar una categoria
app.put('/categoria/:id', verificaToken, (req, res) => {
    // obtiene el id por la URL
    let id = req.params.id;
    // recibe dato por formulario
    let body = req.body;
    // dato a actualizar
    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Si no inserta
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        // correcto
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

// Elimina categoria, Solo un Admin lo puede hacer
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    //  recoge valor en URL
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Si no inserta
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el Id no existe'
                }
            })
        }
        res.json({
            ok: true,
            message: 'Categoria Borrada'
        })
    })

});

module.exports = app;