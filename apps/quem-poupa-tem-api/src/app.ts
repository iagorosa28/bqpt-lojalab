// Criar e configurar a aplicação Express, incluindo suas rotas

import express from "express";

const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({
        mensagem: "OK my friend :)"
    })
})

export {
    app
};