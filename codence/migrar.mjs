/**
 * migrar.mjs — vuelca los prospectos del CRM propio al modelo nativo de Twenty.
 *
 * Corre una vez, el 07/08/2026, sobre
 * D:\respaldo-crm-codence-2026-08-07\prospectos.json — el respaldo que se tomó
 * antes de borrar el CRM propio.
 *
 * POR QUÉ ESE ARCHIVO Y NO NOTION. La base de prospectos de Notion quedó
 * marcada CONGELADA el 02/08, así que todo lo del 01/08 al 03/08 existe
 * únicamente en ese respaldo: el gradoConexion de Warren, Amarras 11 en
 * Descalificado, InsightPlay devuelta a Por investigar, y el texto exacto del
 * DM que salió el 31/07.
 *
 * CÓMO SE REPARTE cada prospecto, según el modelo nativo decidido el 07/08:
 *
 *   Company      empresa, sitio, industria
 *   Person       contacto, rol, linkedin, email, gradoConexion   (si hay decisor)
 *   Opportunity  el outbound entero — estado, canal, señal, fuente, ángulo,
 *                servicio, toques, fechas, auditoría
 *   Note         el cuerpo Markdown de la tarjeta + las notas sueltas
 *
 *   node codence/migrar.mjs --ensayo   muestra qué haría, no escribe
 *   node codence/migrar.mjs            lo aplica
 *
 * Idempotente por nombre de empresa: si la Company ya existe, no se duplica
 * nada. Correrlo dos veces no crea ocho prospectos más.
 */

import { readFile } from 'node:fs/promises';

const URL_BASE = process.env.TWENTY_URL ?? 'http://localhost:3000';
const CLAVE = process.env.TWENTY_KEY;
const RESPALDO =
  process.env.RESPALDO ?? 'D:/respaldo-crm-codence-2026-08-07/prospectos.json';

if (!CLAVE) {
  console.error('Falta TWENTY_KEY.');
  process.exit(1);
}

const ensayo = process.argv.includes('--ensayo');

/* ── Cliente ─────────────────────────────────────────────────────────────── */

async function api(ruta, opts = {}) {
  const r = await fetch(`${URL_BASE}/rest${ruta}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CLAVE}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  const texto = await r.text();
  let cuerpo;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    cuerpo = texto;
  }
  if (!r.ok) {
    const d = typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo);
    throw new Error(`HTTP ${r.status} en ${ruta} — ${d.slice(0, 500)}`);
  }
  return cuerpo;
}

const creado = (j, clave) => j?.data?.[`create${clave}`] ?? j?.data ?? j;

/* ── Conversiones ────────────────────────────────────────────────────────── */

/** Mismo derivador que modelo.mjs: el rótulo se convierte al valor interno. */
const aValor = (etiqueta) =>
  etiqueta
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();

/* gradoConexion lleva valores explícitos, igual que en modelo.mjs. */
const GRADO = { '1º': 'GRADO_1', '2º': 'GRADO_2', '3º': 'GRADO_3', 'Sin conexión': 'SIN_CONEXION' };

const enlace = (url, etiqueta) =>
  url ? { primaryLinkUrl: url, primaryLinkLabel: etiqueta ?? '', secondaryLinks: [] } : null;

/**
 * Parte "Warren Ifergane" en nombre y apellido. Twenty guarda FULL_NAME
 * separado y no acepta una sola cadena.
 *
 * Con dos palabras es obvio; con tres o más, la primera es el nombre y el resto
 * el apellido. No es infalible —un "María del Carmen" quedaría raro— pero es
 * revisable a ojo sobre ocho tarjetas, y no hay forma de deducirlo mejor.
 */
function partirNombre(completo) {
  if (!completo) return null;
  const p = completo.trim().split(/\s+/);
  if (p.length === 1) return { firstName: p[0], lastName: '' };
  return { firstName: p[0], lastName: p.slice(1).join(' ') };
}

/* ── Migración de un prospecto ───────────────────────────────────────────── */

async function migrar(p, existentes) {
  const linea = [];

  if (existentes.has(p.empresa.toLowerCase())) {
    return { salteado: true, motivo: 'la empresa ya existe en Twenty' };
  }

  /* 1. La empresa */
  const empresa = {
    name: p.empresa,
    ...(p.sitio ? { domainName: enlace(p.sitio) } : {}),
    ...(p.industria ? { industria: aValor(p.industria) } : {}),
  };

  if (ensayo) {
    linea.push(`Company  ${p.empresa}${p.industria ? ' · ' + p.industria : ''}`);
  }
  const companyId = ensayo ? null : creado(await api('/companies', { method: 'POST', body: JSON.stringify(empresa) }), 'Company').id;

  /* 2. El decisor, sólo si lo hay. Cinco de las ocho tarjetas no tienen: es el
   *    cuello de botella conocido, y se migra tal cual está. */
  let personId = null;
  if (p.contacto) {
    const persona = {
      name: partirNombre(p.contacto),
      ...(p.rol ? { jobTitle: p.rol } : {}),
      ...(p.linkedin ? { linkedinLink: enlace(p.linkedin) } : {}),
      ...(p.email ? { emails: { primaryEmail: p.email, additionalEmails: [] } } : {}),
      ...(p.gradoConexion ? { gradoConexion: GRADO[p.gradoConexion] } : {}),
      ...(companyId ? { companyId } : {}),
    };
    if (ensayo) {
      linea.push(`Person   ${p.contacto}${p.rol ? ' — ' + p.rol : ''}${p.gradoConexion ? ' · ' + p.gradoConexion : ''}`);
    } else {
      personId = creado(await api('/people', { method: 'POST', body: JSON.stringify(persona) }), 'Person').id;
    }
  }

  /* 3. El outbound */
  const oportunidad = {
    name: p.empresa,
    stage: aValor(p.estado),
    ...(companyId ? { companyId } : {}),
    ...(personId ? { pointOfContactId: personId } : {}),
    ...(p.canal ? { canal: aValor(p.canal) } : {}),
    ...(p.senal ? { senal: p.senal } : {}),
    ...(p.fuente ? { fuente: enlace(p.fuente) } : {}),
    ...(p.angulo ? { angulo: aValor(p.angulo) } : {}),
    ...(p.servicio?.length ? { servicio: p.servicio.map(aValor) } : {}),
    ...(p.toques != null ? { toques: p.toques } : {}),
    ...(p.ultimoToque ? { ultimoToque: p.ultimoToque } : {}),
    ...(p.proximoToque ? { proximoToque: p.proximoToque } : {}),
    ...(p.calificadoEn ? { calificadoEn: p.calificadoEn } : {}),
    ...(p.auditoria ? { auditoria: enlace(p.auditoria, 'Auditoría') } : {}),
  };

  if (ensayo) {
    linea.push(`Opp      ${p.estado}${p.canal ? ' · ' + p.canal : ''}${p.toques ? ' · ' + p.toques + ' toque(s)' : ''}${p.auditoria ? ' · con auditoría' : ''}`);
  }
  const oppId = ensayo ? null : creado(await api('/opportunities', { method: 'POST', body: JSON.stringify(oportunidad) }), 'Opportunity').id;

  /* 4. La bitácora. El cuerpo Markdown de la tarjeta es la investigación de
   *    /prospectar más el historial de mensajes: es el trabajo más caro de
   *    reponer y se conserva entero, sin recortar. Las `notas` sueltas van
   *    atrás, con su encabezado. */
  const partes = [];
  if (p.cuerpo?.trim()) partes.push(p.cuerpo.trim());
  if (p.notas?.length) {
    partes.push('## Notas\n\n' + p.notas.map((n) => `- ${n}`).join('\n'));
  }

  let notas = 0;
  if (partes.length) {
    const markdown =
      `> Migrado del CRM propio el 07/08/2026. Tarjeta original: \`${p.slug}.md\`, creada el ${p.creada}.\n\n` +
      partes.join('\n\n');

    if (ensayo) {
      linea.push(`Note     ${markdown.length} caracteres de bitácora`);
    } else {
      const nota = creado(
        await api('/notes', {
          method: 'POST',
          body: JSON.stringify({ title: `Bitácora — ${p.empresa}`, bodyV2: { markdown } }),
        }),
        'Note',
      );
      /* La nota se ata a la empresa y a la oportunidad. noteTargets es la tabla
       * intermedia: una nota puede colgar de varios registros.
       *
       * Los campos son targetCompanyId / targetOpportunityId, con prefijo — no
       * companyId, que es lo que usan Opportunity y Person. */
      await api('/noteTargets', {
        method: 'POST',
        body: JSON.stringify({ noteId: nota.id, targetCompanyId: companyId }),
      });
      await api('/noteTargets', {
        method: 'POST',
        body: JSON.stringify({ noteId: nota.id, targetOpportunityId: oppId }),
      });
    }
    notas = 1;
  }

  return { linea, notas };
}

/* ── Main ────────────────────────────────────────────────────────────────── */

async function main() {
  const respaldo = JSON.parse(await readFile(RESPALDO, 'utf8'));
  const prospectos = respaldo.prospectos;

  console.log(`Respaldo: ${RESPALDO}`);
  console.log(`Tomado el ${respaldo.exportadoEl?.slice(0, 10)} — ${prospectos.length} prospectos\n`);
  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Aplicando ──\n');

  /* Idempotencia: las empresas que ya están no se vuelven a crear. */
  const yaHay = await api('/companies?limit=200');
  const lista = yaHay?.data?.companies ?? yaHay?.data ?? [];
  const existentes = new Set(lista.map((c) => String(c.name).toLowerCase()));
  if (existentes.size) console.log(`  (ya hay ${existentes.size} empresa(s) en Twenty)\n`);

  let ok = 0;
  let salteados = 0;

  for (const p of prospectos) {
    const r = await migrar(p, existentes);
    if (r.salteado) {
      console.log(`  =  ${p.empresa} — ${r.motivo}`);
      salteados++;
      continue;
    }
    console.log(`  +  ${p.empresa}`);
    for (const l of r.linea ?? []) console.log(`       ${l}`);
    ok++;
  }

  console.log(`\n${ok} prospecto(s) ${ensayo ? 'a migrar' : 'migrados'}, ${salteados} salteado(s).`);
}

main().catch((e) => {
  console.error('\n✗ ' + e.message);
  process.exit(1);
});
