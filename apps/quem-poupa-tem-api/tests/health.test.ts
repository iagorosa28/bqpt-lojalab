// Testar o comportamento do endpoint /health

import {test, expect} from "vitest";
import request from "supertest";
import {app} from "../src/app.js";

test("deve responder com status 200", async () => {
    const resposta = await request(app).get("/health");
    expect(resposta.status).toBe(200);
    expect(resposta.body.mensagem).toBe("OK my friend :)");
})