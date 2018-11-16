const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
// default options
app.use(fileUpload());
//put o post
app.put('/upload/:tipo/:id', function(req, res) {
    //valores por parametro deben de llegar obligatorios
    let tipo = req.params.tipo;
    let id = req.params.id;
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        })
    }
    //Valida tipo  de Producto, usuarios
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las tipos permitidos  ' + tiposValidos.join(', '),
                ext: tipo
            }
        })
    }
    //archivo
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    // extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son  ' + extensionesValidas.join(', ')
            }
        })
    }
    // Cambiar nombre de archivo = 
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function(err) {
        if (err) return res.status(500).json({
            ok: false,
            err
        });
        // Aqui ya esta cargada la imagen
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);

        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(usuarioDB.img, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borrarArchivo(usuarioDB.img, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario No existe'
                }
            })
        }
        //eliminar imagen anterior
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })

}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(productoDB.img, 'productos');
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            borrarArchivo(productoDB.img, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario No existe'
                }
            })
        }
        //eliminar imagen anterior
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                usuario: productoGuardado,
                img: nombreArchivo
            })
        })
    })
}

function borrarArchivo(nombreImagen, tipo) {
    // verifica si existe imagen
    let pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`)
    if (fs.existsSync(pathImage)) {
        //borrar archivo
        fs.unlinkSync(pathImage);
    }
}
module.exports = app;