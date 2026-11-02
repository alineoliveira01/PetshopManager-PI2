
import sqlite3 from "sqlite3";
import argon2 from "argon2";
import { createInterface } from "node:readline";

const db = new sqlite3.Database("./banco.db");

function perguntar(mensagem) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(mensagem, resposta => {
            rl.close();
            resolve(resposta.trim());
        });
    });
}

function perguntarSenha(mensagem) {
    return new Promise((resolve, reject) => {
        const entrada = process.stdin;

        if (!entrada.isTTY || !entrada.setRawMode) {
            reject(new Error("Execute pelo terminal interativo."));
            return;
        }

        process.stdout.write(mensagem);

        let senha = "";

        entrada.setRawMode(true);
        entrada.resume();
        entrada.setEncoding("utf8");

        function receber(tecla) {
            if (tecla === "\u0003") {
                finalizar();
                reject(new Error("Operação cancelada."));
                return;
            }

            if (tecla === "\r" || tecla === "\n") {
                finalizar();
                process.stdout.write("\n");
                resolve(senha);
                return;
            }

            if (tecla === "\u007f" || tecla === "\b") {
                senha = senha.slice(0, -1);
                return;
            }

            if (tecla >= " ") {
                senha += tecla;
            }
        }

        function finalizar() {
            entrada.removeListener("data", receber);
            entrada.setRawMode(false);
            entrada.pause();
        }

        entrada.on("data", receber);
    });
}

async function criarAdministrador() {
    try {
        const existente = await new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM usuarios WHERE perfil = 'admin' LIMIT 1",
                (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                }
            );
        });

        if (existente) {
            console.log("Já existe um administrador cadastrado.");
            return;
        }

        const senha = await perguntarSenha("Crie a senha do ADMIN: ");

        if (senha.length < 12) {
            throw new Error("A senha deve ter pelo menos 12 caracteres.");
        }

        const confirmacao = await perguntarSenha("Confirme a senha: ");

        if (senha !== confirmacao) {
            throw new Error("As senhas não coincidem.");
        }

        const hash = await argon2.hash(senha, {
            type: argon2.argon2id
        });

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO usuarios
                (nome, usuario, senha, perfil, ativo)
                VALUES (?, ?, ?, ?, 1)`,
                ["Administrador", "ADMIN", hash, "admin"],
                erro => erro ? reject(erro) : resolve()
            );
        });

        console.log("Administrador criado com sucesso!");

    } catch (erro) {
        console.error("Erro:", erro.message);
    } finally {
        db.close();
    }
}

criarAdministrador();
