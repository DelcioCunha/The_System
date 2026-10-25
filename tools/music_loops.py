"""Calcula os pontos de loop das músicas (assets/music/*.mp3) → assets/music/loops.json
Para cada faixa: início = fim do silêncio inicial; fim = antes do silêncio final e da cauda que se apaga
(o volume cai muito abaixo do volume normal da música). O jogo faz o loop entre estes dois pontos
com uma transição cruzada curta, por isso a música nunca soa a "acabou e recomeçou".
Uso: python3 tools/music_loops.py"""
import json, os, subprocess
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'music')
SR, WIN = 22050, 0.05


def rms_db(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    n = int(SR * WIN); k = len(x) // n
    w = x[:k * n].reshape(k, n)
    return 20 * np.log10(np.sqrt((w ** 2).mean(axis=1)) + 1e-9), len(x) / SR


out = {}
for f in sorted(os.listdir(ROOT)):
    if not f.endswith('.mp3'): continue
    db, dur = rms_db(os.path.join(ROOT, f))
    loud = np.median(db[db > -60]) if (db > -60).any() else -20
    on = np.where(db > -42)[0]
    start = max(0.0, on[0] * WIN - 0.02) if len(on) else 0.0
    # fim: última janela ainda "dentro da música" (até 16 dB abaixo do volume normal); corta a cauda que se apaga
    body = np.where(db > loud - 16)[0]
    end = min(dur, (body[-1] + 1) * WIN + 0.15) if len(body) else dur
    if end - start < 6: start, end = 0.0, dur
    out[f[:-4]] = [round(float(start), 3), round(float(end), 3), round(float(dur), 3)]
    print('%-12s %6.2fs  loop %6.2f → %6.2f  (corta %.2fs no início e %.2fs no fim)' % (f, dur, start, end, start, dur - end))
json.dump(out, open(os.path.join(ROOT, 'loops.json'), 'w'), indent=1)
