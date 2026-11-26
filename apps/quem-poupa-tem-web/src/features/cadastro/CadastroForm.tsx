import { useState } from "react";
// import { calcularSha256 } from "../../utils/sha256";
import "./cadastro-form.css";

function CadastroForm() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");

  type CampoCadastro = "nome" | "sobrenome" | "email" | "senha" | "confSenha";
  const [erro, setErro] = useState<{
    campo: CampoCadastro;
    mensagem: string;
  } | null>(null);

  async function enviar(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();

    const nomeLimpo = nome.trim();
    const sobrenomeLimpo = sobrenome.trim();
    const emailLimpo = email.trim().toLowerCase();

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nomeLimpo.length === 0) {
      setErro({ campo: "nome", mensagem: "Informe seu nome." });
      return;
    }

    if (nomeLimpo.length > 80) {
      setErro({
        campo: "nome",
        mensagem: "O nome deve ter no máximo 80 caracteres.",
      });
      return;
    }

    if (sobrenomeLimpo.length === 0) {
      setErro({ campo: "sobrenome", mensagem: "Informe seu sobrenome." });
      return;
    }

    if (sobrenomeLimpo.length > 150) {
      setErro({
        campo: "sobrenome",
        mensagem: "O sobrenome deve ter no máximo 150 caracteres.",
      });
      return;
    }

    if (emailLimpo.length === 0) {
      setErro({ campo: "email", mensagem: "Informe seu e-mail." });
      return;
    }

    if (emailLimpo.length > 254) {
      setErro({
        campo: "email",
        mensagem: "O e-mail deve ter no máximo 254 caracteres.",
      });
      return;
    }

    if (!formatoEmail.test(emailLimpo)) {
      setErro({ campo: "email", mensagem: "Informe um e-mail válido." });
      return;
    }

    if (senha.length < 8) {
      setErro({
        campo: "senha",
        mensagem: "A senha deve ter no mínimo 8 caracteres.",
      });
      return;
    }

    if (senha != confSenha) {
      setErro({
        campo: "confSenha",
        mensagem: "As senhas precisam ser iguais.",
      });
      return;
    }

    setErro(null);

    // const senhaHash = await calcularSha256(senha);

    alert("Validação concluída!");

    setNome("");
    setSobrenome("");
    setEmail("");
    setSenha("");
    setConfSenha("");
  }

  return (
    <form className="cadastro-form" onSubmit={enviar} noValidate>
      <div className={erro?.campo === "nome" ? "campo-com-erro" : undefined}>
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          value={nome}
          onChange={(evento) => setNome(evento.currentTarget.value)}
          aria-invalid={erro?.campo === "nome"}
          aria-describedby={erro?.campo === "nome" ? "erro-nome" : undefined}
        />
        {erro?.campo === "nome" && (
          <p id="erro-nome" className="cadastro-erro" role="alert">
            {erro.mensagem}
          </p>
        )}
      </div>

      <div
        className={erro?.campo === "sobrenome" ? "campo-com-erro" : undefined}
      >
        <label htmlFor="sobrenome">Sobrenome</label>
        <input
          id="sobrenome"
          value={sobrenome}
          onChange={(evento) => setSobrenome(evento.currentTarget.value)}
          aria-invalid={erro?.campo === "sobrenome"}
          aria-describedby={
            erro?.campo === "sobrenome" ? "erro-sobrenome" : undefined
          }
        />
        {erro?.campo === "sobrenome" && (
          <p id="erro-sobrenome" className="cadastro-erro" role="alert">
            {erro.mensagem}
          </p>
        )}
      </div>

      <div className={erro?.campo === "email" ? "campo-com-erro" : undefined}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.currentTarget.value)}
          aria-invalid={erro?.campo === "email"}
          aria-describedby={erro?.campo === "email" ? "erro-email" : undefined}
        />
        {erro?.campo === "email" && (
          <p id="erro-email" className="cadastro-erro" role="alert">
            {erro.mensagem}
          </p>
        )}
      </div>

      <div className={erro?.campo === "senha" ? "campo-com-erro" : undefined}>
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(evento) => setSenha(evento.currentTarget.value)}
          aria-invalid={erro?.campo === "senha"}
          aria-describedby={erro?.campo === "senha" ? "erro-senha" : undefined}
        />
        {erro?.campo === "senha" && (
          <p id="erro-senha" className="cadastro-erro" role="alert">
            {erro.mensagem}
          </p>
        )}
      </div>

      <div
        className={erro?.campo === "confSenha" ? "campo-com-erro" : undefined}
      >
        <label htmlFor="confSenha">Confirmar Senha</label>
        <input
          id="confSenha"
          type="password"
          value={confSenha}
          onChange={(evento) => setConfSenha(evento.currentTarget.value)}
          aria-invalid={erro?.campo === "confSenha"}
          aria-describedby={
            erro?.campo === "confSenha" ? "erro-confSenha" : undefined
          }
        />
        {erro?.campo === "confSenha" && (
          <p id="erro-confSenha" className="cadastro-erro" role="alert">
            {erro.mensagem}
          </p>
        )}
      </div>

      <button type="submit">Enviar inscrição</button>
    </form>
  );
}

export default CadastroForm;
