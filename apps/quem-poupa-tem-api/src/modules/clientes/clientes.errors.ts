class ErroEmailDuplicado extends Error {
  constructor() {
    super("E-mail já cadastrado.");
    this.name = "ErroEmailDuplicado";
  }
}

export { ErroEmailDuplicado };
