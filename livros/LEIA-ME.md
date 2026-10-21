# Livros do Sistema

- `gen.py` + `book.css` → «O Livro do Sistema» (manual do jogador). Capturas com `shots.js`, PDF com `render.js`.
- `gen_lore.py` + `narr.py` + `lore.css` → «Crónicas do Sistema» (lore narrada pelo Sistema). PDF com `render_lore.js`.
- As ilustrações novas das Crónicas ficam em `assets/lore/<id>.png` (prompts na secção «Crónicas» da página de prompts). Enquanto faltarem, o livro usa a arte dos chefes.
- Os caminhos nos scripts apontam para /home/claude/livro (ambiente de geração).
- `cr_a.py`, `cr_b.py`, `cr_c.py` (texto da lore, narrado pelo Sistema) + `gen_cr.py` + `paginate.js` + `cr.css` → «Crónicas do Sistema» (versão narrativa). PDF com `render_cr.js`. As ilustrações ficam em `assets/lore/<id>.png|jpg`.
