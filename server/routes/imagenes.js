const express = require('express');

const fs = require('fs');
const path = require('path');
let app = express();
const { verificaTokenImg } = require('../middlewares/autenticacion')
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${ img }`)
    if (fs.existsSync(pathImage)) {
        //borrar archivo
        res.sendFile(pathImage);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.png');
        res.sendFile(noImagePath);
    }
});

module.exports = app;