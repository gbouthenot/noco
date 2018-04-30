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

const nocomedia = 'http://static.atomas.com/noco/media.noco.tv/'

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

function headers () {
  return `
<script type='text/javascript'>
(function () {
    const l = window.location.href
    const i = l.lastIndexOf("/out/")
    const baseurl = l.slice(0, i + 1)

    let el = document.createElement("link")
    el.href = baseurl + "page.css"
    el.type = "text/css"
    el.rel = "stylesheet"
    document.head.appendChild(el)

    el = document.createElement("script")
    el.src = baseurl + "page.js"
    el.type = "text/javascript"
    document.head.appendChild(el)
})()
</script>
  `
}

// les partners
function createPartners (outdir, partners) {
  const dir = `${outdir}/by_partner`
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const partSortd = partners.sort((a, b) => a.partner_name.localeCompare(b.partner_name))
  let out = headers()

  partSortd.forEach((part) => {
    const fams = allfamilies.filter(_ => _.id_partner === part.id_partner)
    const shos = allshows.filter(_ => _.id_partner === part.id_partner)
    const duration = shos.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(duration)

    out += `<div class='partner'>`
    out += `<div class="part-name" data-id='${part.id_partner}'><a href="${part.partner_shortname}/">${part.partner_name}</a></div>\n`
    out += `<div class="part-stats">familles: ${fams.length}; nb emissions: ${shos.length}; durée totale: ${durationHuman}</div>`
    if (part.partner_resume) {
      out += `  <div class='part-resume'>${esc(part.partner_resume)}</div>\n`
    }
    if (part.partner_subtitle) {
      out += `  <div class='part-subtitle'>${esc(part.partner_subtitle)}</div>\n`
    }
    out += '</div>\n'
  })

  fs.writeFileSync(`${dir}/index.html`, out)

  partSortd.forEach((part) => {
    createPartnerFamilies(`${dir}/${part.partner_shortname}`, part)
  })
}

// partner : index des familles d'un partner
function createPartnerFamilies (dir, part) {
  const partnerId = part.id_partner
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const fams = allfamilies.filter(_ => _.id_partner === part.id_partner)
    .sort((a, b) => a.family_TT.localeCompare(b.family_TT))

  let out = headers()
  fams.forEach(fam => {
    const familyId = fam.id_family
    const theme = allthemes.find(_ => _.id_theme === fam.id_theme)
    const type = alltypes.find(_ => _.id_type === fam.id_type)

    const showsFam = allshows.filter(show => show.id_partner === partnerId && show.id_family === familyId)
    // .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

    const durationMs = showsFam.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(durationMs)

    out += `<div class='family'>`
    out += `<div class='icn'><img src='${fam.icon_1024x576.replace('https://media.noco.tv/', nocomedia)}' /></div>`
    // out += `<div class='ban'><img src='${fam.banner_family.replace('https://media.noco.tv/', nocomedia)}' /></div>`
    out += `<div class='fam-name' data-id='${fam.id_family}'><a href="${fam.family_key}/">${fam.family_TT}</a></div>\n`
    out += `<div class='fam-theme'>${theme.theme_name}</div> <div class='fam-type'>${type.type_name}</div>\n`
    out += `<div class='fam-stats'>${showsFam.length} émissions, ${durationHuman}</div>\n`
    if (fam.family_TT !== fam.family_OT) {
      out += `<div class='fam-name-vo'>${fam.family_OT} (${fam.OT_lang})</div>`
    }
    out += `</div>\n`
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

  let out = headers()

  // Par année, unique, trié
  let years = showsFam.filter(_ => _.sorting_date_utc).map(_ => _.sorting_date_utc.slice(0, 4))
  years = [...new Set(years)]
  years = years.sort()

  years.forEach(year => {
    const shows = showsFam.filter(_ => _.sorting_date_utc.slice(0, 4) === year)
    const duration = shows.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const dur = formatDurationHuman(duration)
    out += `<div class='year'>`
    out += `<div class='year-name' data-id='${year}'><a href="${year}/">Année ${year}</a></div>\n`
    out += `<div class="year-stats">${shows.length} émissions, ${dur}</div>`
    out += `</div>\n`
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

  // TODO: créer une nouvelle colonne = broadcast ou sorting
  const shows = allshows.filter(show => show.id_partner === partnerId &&
    show.id_family === familyId &&
    show.sorting_date_utc.slice(0, 4) === year)
    .sort((a, b) => a.sorting_date_utc.localeCompare(b.sorting_date_utc))

  let out = headers()
  const scrRE = new RegExp('https://media.noco.tv/screenshot/([a-z]+)/[0-9x]*/(.*)')
  const mosRE = new RegExp('https://media.noco.tv/mosaique/')

  shows.forEach((show, i) => {
    const dur = formatDurationHuman(show.duration_ms)
    const title = []
    if (allfamilies.find(_ => _.id_family === show.id_family).family_TT !== show.family_TT) {
      title.push(`${show.family_TT}`)
    }
    if (show.show_TT && show.show_TT.length) {
      title.push(`${show.show_TT}`)
    }
    let scr = show.screenshot_1024x576
    scr = scr.replace(scrRE, `${nocomedia}screenshot_160x90/$1/160x90/$2`)
    let mos = show.mosaique
    mos = mos.replace(mosRE, `${nocomedia}mosaique/`)

    out += `<div class='show' data-id='${show.id_show}'>`
    out += `  <div class='show-mos' style='display:none;'>`
    out += `    <div class='mos' style='background-image:url("${mos}");'></div>`
    out += `    <div class='prog'></div>`
    out += `  </div>`
    out += `  <div class='show-scr'><img src='${scr}' /></div>`
    out += `  <div class='show-desc'>`
    out += `    <div class='show-name'>`
    out += `      <div class='num'>#${++i} S${show.season_number}E${show.episode_number}</div>`
    out += `      <div class='title'>${title.join(' - ')}</div>`
    out += `      <div class='key'>${show.show_key}</div>`
    out += `    </div>`
    if (show.show_resume && show.show_resume.length) {
      out += `    <div class='show-resume'>${show.show_resume.replace(/\n/g, '\n    ')}</div>\n`
    }
    out += `    <div class='show-stats'>`
    if (show.broadcast_date_utc) {
      out += `      diffusé le ${show.broadcast_date_utc} -- `
    }
    out += `${dur}</div>\n`
    out += '  </div>\n'
    out += '</div>\n'
  })
  out += "<script>window.addEventListener('load',_=>new Mosaique().init())</script>"

  fs.writeFileSync(`${dir}/index.html`, out)
}

createPartners(outdir, allpartners)
