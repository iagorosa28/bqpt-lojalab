import { Router } from "express";
import { cadastrarCliente } from "./clientes.controller.js";

const clientesRoutes = Router();

clientesRoutes.post("/", cadastrarCliente);

export { clientesRoutes };
