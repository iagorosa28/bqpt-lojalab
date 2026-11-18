CREATE TABLE clientes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE
    CHECK (email = lower(btrim(email))),
  nome VARCHAR(80) NOT NULL,
  sobrenome VARCHAR(150) NOT NULL,
  senha_hash TEXT NOT NULL
);

CREATE SEQUENCE contas_numero_conta_seq
  AS BIGINT
  START WITH 1
  INCREMENT BY 1
  MAXVALUE 99999999
  NO CYCLE;

CREATE TABLE contas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente_id BIGINT NOT NULL UNIQUE REFERENCES clientes(id),
  numero_conta VARCHAR(8) NOT NULL UNIQUE
    DEFAULT lpad(nextval('contas_numero_conta_seq')::text, 8, '0')
    CHECK (numero_conta ~ '^[0-9]{8}$'),
  saldo NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (saldo >= 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER SEQUENCE contas_numero_conta_seq
  OWNED BY contas.numero_conta;