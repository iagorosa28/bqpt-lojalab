export async function calcularSha256(texto: string): Promise<string> {
  const dados = new TextEncoder().encode(texto);
  const resultado = await crypto.subtle.digest("SHA-256", dados);
  const bytes = new Uint8Array(resultado);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
