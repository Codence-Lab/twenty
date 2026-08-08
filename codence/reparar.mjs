/**
 * reparar.mjs — devuelve los 8 prospectos a su estado migrado.
 *
 * POR QUÉ EXISTE. El 07/08/2026, después de migrar, se borró la información de
 * demo que Twenty siembra sola y el borrado se llevó también los 8 prospectos.
 * Al intentar rehacer la migración, Twenty la rechazó con "duplicate entry":
 * sus registros no se borran de verdad, se marcan con `deletedAt`, y la
 * detección de duplicados los sigue viendo.
 *
 * QUÉ HACE, y por qué en ese orden:
 *
 *   1. Limpia lo que dejó a medias la corrida fallida — alcanzó a crear un
 *      juego de Amarras 11 antes de chocar contra el duplicado.
 *   2. Restaura de la papelera las empresas, personas y oportunidades de los 8.
 *      Se restauran en vez de recrearse porque conservan todos sus campos, y
 *      porque recrearlas volvería a chocar contra el duplicado.
 *   3. Rehace las notas desde el respaldo. Estas sí se habían borrado en duro
 *      —no quedó ninguna en la papelera— así que no hay nada que restaurar.
 *
 * La información de demo NO se restaura: se queda en la papelera, que es donde
 * Alan la mandó.
 *
 *   node codence/reparar.mjs --ensayo
 *   node codence/reparar.mjs
 */

import { readFile } from 'node:fs/promises';

const URL_BASE = process.env.TWENTY_URL ?? 'http://localhost:3000';
const CLAVE = process.env.TWENTY_KEY ?? process.env.TWENTY_API_KEY;
const RESPALDO = process.env.RESPALDO ?? 'D:/respaldo-crm-codence-2026-08-07/prospectos.json';

if (!CLAVE) {
  console.error('Falta TWENTY_KEY (o TWENTY_API_KEY).');
  process.exit(1);
}

const ensayo = process.argv.includes('--ensayo');

async function api(ruta, opts = {}) {
  const r = await fetch(`${URL_BASE}/rest${ruta}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CLAVE}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  const t = await r.text();
  let c;
  try {
    c = JSON.parse(t);
  } catch {
    c = t;
  }
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${ruta} — ${JSON.stringify(c).slice(0, 400)}`);
  return c;
}

const lista = (j, clave) => j?.data?.[clave] ?? j?.data ?? [];
const uno = (j) => (j?.data && !Array.isArray(j.data) ? Object.values(j.data)[0] ?? j.data : j?.data ?? j);

const vivos = async (r) => lista(await api(`/${r}?limit=200&depth=0`), r);
const enPapelera = async (r) =>
  lista(
    await api(`/${r}?limit=200&depth=0&filter=${encodeURIComponent('deletedAt[is]:NOT_NULL')}`),
    r,
  );

const nombreDe = (x) =>
  x?.name?.firstName !== undefined
    ? `${x.name.firstName ?? ''} ${x.name.lastName ?? ''}`.trim()
    : x?.name ?? x?.title ?? '';

async function main() {
  const respaldo = JSON.parse(await readFile(RESPALDO, 'utf8'));
  const prospectos = respaldo.prospectos;

  /* Los nombres que son nuestros. Todo lo demás en la papelera es la
   * información de demo de Twenty y se queda ahí. */
  const empresas = new Set(prospectos.map((p) => p.empresa));
  const personas = new Set(prospectos.filter((p) => p.contacto).map((p) => p.contacto));

  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Reparando ──\n');

  /* ── 1. Limpiar lo que dejó la corrida fallida ─────────────────────────── */
  console.log('1. Restos de la corrida fallida');
  for (const r of ['noteTargets', 'notes', 'opportunities', 'people', 'companies']) {
    const actuales = await vivos(r);
    for (const x of actuales) {
      const etiqueta = nombreDe(x) || x.id;
      if (ensayo) {
        console.log(`   -  ${r}: ${etiqueta}`);
      } else {
        await api(`/${r}/${x.id}`, { method: 'DELETE' });
        console.log(`   -  ${r}: ${etiqueta}`);
      }
    }
  }

  /* ── 2. Restaurar de la papelera ───────────────────────────────────────── */
  console.log('\n2. Restaurando de la papelera');
  const restaurados = { companies: {}, people: {}, opportunities: {} };

  for (const [r, nuestros] of [
    ['companies', empresas],
    ['people', personas],
    ['opportunities', empresas],
  ]) {
    /* Se miran la papelera Y los vivos. Mirar sólo la papelera funcionaría en
     * una corrida real —el paso 1 acaba de mandar todo ahí— pero depende del
     * orden y hace que el ensayo mienta. Uniendo las dos listas, el resultado
     * es el mismo se haya borrado algo antes o no. */
    const candidatos = [...(await enPapelera(r)), ...(await vivos(r))];

    /* Puede haber más de un registro con el mismo nombre —la corrida fallida
     * creó un Amarras 11 de más—. Nos quedamos con el más viejo: es el de la
     * migración buena, el que tiene todos los campos cargados. */
    const porNombre = new Map();
    for (const x of candidatos.slice().sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))) {
      const n = nombreDe(x);
      if (nuestros.has(n) && !porNombre.has(n)) porNombre.set(n, x);
    }

    for (const [n, x] of porNombre) {
      if (!ensayo) {
        await api(`/${r}/${x.id}`, { method: 'PATCH', body: JSON.stringify({ deletedAt: null }) });
      }
      restaurados[r][n] = x.id;
      console.log(`   +  ${r}: ${n}`);
    }
    const faltan = [...nuestros].filter((n) => !porNombre.has(n));
    if (faltan.length) console.log(`   !  ${r}: sin encontrar en la papelera → ${faltan.join(', ')}`);
  }

  /* ── 3. Rehacer las notas ──────────────────────────────────────────────── */
  console.log('\n3. Rehaciendo las bitácoras desde el respaldo');
  let notas = 0;
  for (const p of prospectos) {
    const partes = [];
    if (p.cuerpo?.trim()) partes.push(p.cuerpo.trim());
    if (p.notas?.length) partes.push('## Notas\n\n' + p.notas.map((n) => `- ${n}`).join('\n'));
    if (!partes.length) continue;

    const markdown =
      `> Migrado del CRM propio el 07/08/2026. Tarjeta original: \`${p.slug}.md\`, creada el ${p.creada}.\n\n` +
      partes.join('\n\n');

    const companyId = restaurados.companies[p.empresa];
    const oppId = restaurados.opportunities[p.empresa];

    if (ensayo) {
      console.log(`   +  ${p.empresa} — ${markdown.length} caracteres`);
      notas++;
      continue;
    }

    const nota = uno(
      await api('/notes', {
        method: 'POST',
        body: JSON.stringify({ title: `Bitácora — ${p.empresa}`, bodyV2: { markdown } }),
      }),
    );
    if (companyId)
      await api('/noteTargets', {
        method: 'POST',
        body: JSON.stringify({ noteId: nota.id, targetCompanyId: companyId }),
      });
    if (oppId)
      await api('/noteTargets', {
        method: 'POST',
        body: JSON.stringify({ noteId: nota.id, targetOpportunityId: oppId }),
      });

    console.log(`   +  ${p.empresa} — ${markdown.length} caracteres`);
    notas++;
  }

  console.log(`\n${notas} bitácora(s) ${ensayo ? 'a rehacer' : 'rehechas'}.`);
}

main().catch((e) => {
  console.error('\n✗ ' + e.message);
  process.exit(1);
});
