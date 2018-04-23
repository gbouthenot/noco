//
// outdir: ./noco-out
// partners:
//   Parner_name: x familles, x émissions, temps total
//

const fs = require('fs')
const outdir = './out'
!fs.existsSync(outdir) && fs.mkdirSync(outdir)

const allshows = require('./noco-data/shows_full.json')
const allfamilies = require('./noco-data/families.json')
const allthemes = require('./noco-data/themes.json')
const alltypes = require('./noco-data/types.json')
const allpartners = require('./noco-data/partners.json')

//
// Fonctions utilitaires
//

const formatDurationHuman = (durationMs) => {
  let secs = Math.round(durationMs / 1000)
  const days = Math.floor(secs / 86400)
  secs -= days * 86400
  const hours = Math.floor(secs / 3600)
  secs -= hours * 3600
  const mins = Math.floor(secs / 60)
  secs -= mins * 60
  if (days) {
    return `${days}j ${hours}h`
  } else if (hours) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m ${secs}s`
  }
}

// TODO: escape HTML entities
function esc (string, indent) {
  string = string.replace(/\r/g, '').replace(/\n/g, '\n  ')
  return string
}

// les partners
function createPartners (outdir, partners) {
  const dir = `${outdir}/by_partner`
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const partSortd = partners.sort((a, b) => a.partner_name.localeCompare(b.partner_name))
  let out = ''
  partSortd.forEach((part) => {
    const fams = allfamilies.filter(_ => _.id_partner === part.id_partner)
    const shos = allshows.filter(_ => _.id_partner === part.id_partner)
    const duration = shos.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(duration)

    out += `<h1 data-id='${part.id_partner}'><a href="${part.partner_shortname}/">${part.partner_name}</a></h1>\n`
    out += `<div class="part-stats">familles: ${fams.length}; nb emissions: ${shos.length}; durée totale: ${durationHuman}</div>`
    if (part.partner_resume) {
      out += `  <div class='part-resume'>${esc(part.partner_resume)}</div>\n`
    }
    if (part.partner_subtitle) {
      out += `  <div class='part-subtitle'>${esc(part.partner_subtitle)}</div>\n`
    }
    out += '\n'
  })

  fs.writeFileSync(`${dir}/index.html`, out)

  partSortd.forEach((part) => {
    createPartnerFamilies(`${dir}/${part.partner_shortname}`, part)
  })
}

// partner : index des familles
function createPartnerFamilies (dir, part) {
  const partnerId = part.id_partner
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const fams = allfamilies.filter(_ => _.id_partner === part.id_partner)
    .sort((a, b) => a.family_TT.localeCompare(b.family_TT))

  let out = ''
  fams.forEach(fam => {
    const familyId = fam.id_family
    const theme = allthemes.find(_ => _.id_theme === fam.id_theme)
    const type = alltypes.find(_ => _.id_type === fam.id_type)

    const showsFam = allshows.filter(show => show.id_partner === partnerId && show.id_family === familyId)
//      .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

    const durationMs = showsFam.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(durationMs)

    out += `<h1 data-id='${fam.id_family}'><a href="${fam.family_key}/">${fam.family_TT} (${theme.theme_name}) [${type.type_name}]</a></h1>\n`
    out += `<div class='fam-summary'>${showsFam.length} émissions, ${durationHuman}</div>\n`
    if (fam.family_TT !== fam.family_OT) {
      out += `<div class='title-vo'>${fam.family_OT} (${fam.OT_lang})</div>\n`
    }
  })

  fs.writeFileSync(`${dir}/index.html`, out)

  fams.forEach((fam) => {
    createPartnerFamilyYears(`${dir}/${fam.family_key}`, part, fam)
  })
}

// partner -> family : index des années
function createPartnerFamilyYears (dir, part, fam) {
  const partnerId = part.id_partner
  const familyId = fam.id_family
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const showsFam = allshows.filter(show => show.id_partner === partnerId && show.id_family === familyId)

  let out = ''

  // Par année, unique, trié
  let years = showsFam.filter(_ => _.broadcast_date_utc).map(_ => _.broadcast_date_utc.slice(0, 4))
  years = [...new Set(years)]
  years = years.sort()

  years.forEach(year => {
    const shows = showsFam.filter(_ => _.broadcast_date_utc.slice(0, 4) === year)
    const durationMs = shows.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(durationMs)
    out += `<h1 data-id='${year}'><a href="${year}/">Année ${year}</a></h1>\n`
    out += `<div class="year-summary">${shows.length} émissions, ${durationHuman}</div>\n`
  })

  fs.writeFileSync(`${dir}/index.html`, out)

  years.forEach((year) => {
    createPartnerFamilyYearShows(`${dir}/${year}`, part, fam, year)
  })
}

// partner -> family -> year : index des émissions
function createPartnerFamilyYearShows (dir, part, fam, year) {
  const partnerId = part.id_partner
  const familyId = fam.id_family
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const shows = allshows.filter(show => show.id_partner === partnerId &&
    show.id_family === familyId &&
    show.broadcast_date_utc.slice(0, 4) === year)
    .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

  let out = ''

  shows.forEach((show, i) => {
    out += `  #${++i}: `
    if (show.show_TT && show.show_TT.length) {
      out += `${show.show_TT}: `
    }
    out += `diffusé le ${show.broadcast_date_utc}\n`
    if (show.show_resume && show.show_resume.length) {
      out += `    ${show.show_resume.replace(/\n/g, '\n    ')}\n`
    }
    out += '<br />\n'
  })

  fs.writeFileSync(`${dir}/index.html`, out)
}

createPartners(outdir, allpartners)
