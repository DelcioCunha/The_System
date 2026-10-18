// Gera o hash da palavra-passe do administrador (para o segredo ADMIN_PASS_HASH).
// Uso: node tools/hash-password.mjs "a-tua-palavra-passe"
import { hashPassword } from '../src/index.js';
const pw = process.argv[2];
if (!pw || pw.length < 10) { console.error('Usa uma palavra-passe com pelo menos 10 caracteres.'); process.exit(1); }
console.log(await hashPassword(pw));
