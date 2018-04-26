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

function headers () {
  return `
  <style>
  .partner { margin-bottom:1em; }
  .part-name { display:inline; font-size:200%; margin-right:1em; }
  .part-stats { display:inline; }
  .part-resume { display:block; }
  .part-subtitle { display:block; }

  .family { margin-bottom:1em; }
  .fam-name { display:inline; font-size:200%; margin-right:1em; }
  .fam-theme { display:inline; background:#060; color:#fff; }
  .fam-type { display:inline; background:#a0a; color:#fff; }
  .fam-stats { display:inline; }
  .fam-name-vo { display:block; }

  .year { margin-bottom:1em; }
  .year-name { display:inline; font-size:200%; margin-right:1em; }
  .year-stats { display:inline; }

  .show { margin-bottom:1em; display:table; }
  .show-scr { display:table-cell; width:160px; height:90px; }
  .show-scr img { width:inherit; height:90px; }
  .show-desc { display:table-cell; vertical-align:top; padding-left:.5em; }
  .show-name { display:block; font-size:150%; margin-right:1em; }
  .show-name .num { display:inline; }
  .show-name .title { display:inline; }
  .show-name .key { display:inline; margin-left:1em; color:#aaa; }
  .show-stats { display:block; }
  .show-resume { display:block; }

  .icn, .ban { display:inline; }
  .icn img, .ban img { width:10em;}

  .show-mos { }
  .show-mos .mos { width:160px; height:90px; background-size:1000%; }
  .mos0  .mos { background-position:00.00% 00.00%; }
  .mos1  .mos { background-position:11.11% 00.00%; }
  .mos2  .mos { background-position:22.22% 00.00%; }
  .mos3  .mos { background-position:33.33% 00.00%; }
  .mos4  .mos { background-position:44.44% 00.00%; }
  .mos5  .mos { background-position:55.55% 00.00%; }
  .mos6  .mos { background-position:66.66% 00.00%; }
  .mos7  .mos { background-position:77.77% 00.00%; }
  .mos8  .mos { background-position:88.88% 00.00%; }
  .mos9  .mos { background-position:99.99% 00.00%; }
  .mos10 .mos { background-position:00.00% 11.11%; }
  .mos11 .mos { background-position:11.11% 11.11%; }
  .mos12 .mos { background-position:22.22% 11.11%; }
  .mos13 .mos { background-position:33.33% 11.11%; }
  .mos14 .mos { background-position:44.44% 11.11%; }
  .mos15 .mos { background-position:55.55% 11.11%; }
  .mos16 .mos { background-position:66.66% 11.11%; }
  .mos17 .mos { background-position:77.77% 11.11%; }
  .mos18 .mos { background-position:88.88% 11.11%; }
  .mos19 .mos { background-position:99.99% 11.11%; }
  .mos20 .mos { background-position:00.00% 22.22%; }
  .mos21 .mos { background-position:11.11% 22.22%; }
  .mos22 .mos { background-position:22.22% 22.22%; }
  .mos23 .mos { background-position:33.33% 22.22%; }
  .mos24 .mos { background-position:44.44% 22.22%; }
  .mos25 .mos { background-position:55.55% 22.22%; }
  .mos26 .mos { background-position:66.66% 22.22%; }
  .mos27 .mos { background-position:77.77% 22.22%; }
  .mos28 .mos { background-position:88.88% 22.22%; }
  .mos29 .mos { background-position:99.99% 22.22%; }
  .mos30 .mos { background-position:00.00% 33.33%; }
  .mos31 .mos { background-position:11.11% 33.33%; }
  .mos32 .mos { background-position:22.22% 33.33%; }
  .mos33 .mos { background-position:33.33% 33.33%; }
  .mos34 .mos { background-position:44.44% 33.33%; }
  .mos35 .mos { background-position:55.55% 33.33%; }
  .mos36 .mos { background-position:66.66% 33.33%; }
  .mos37 .mos { background-position:77.77% 33.33%; }
  .mos38 .mos { background-position:88.88% 33.33%; }
  .mos39 .mos { background-position:99.99% 33.33%; }
  .mos40 .mos { background-position:00.00% 44.44%; }
  .mos41 .mos { background-position:11.11% 44.44%; }
  .mos42 .mos { background-position:22.22% 44.44%; }
  .mos43 .mos { background-position:33.33% 44.44%; }
  .mos44 .mos { background-position:44.44% 44.44%; }
  .mos45 .mos { background-position:55.55% 44.44%; }
  .mos46 .mos { background-position:66.66% 44.44%; }
  .mos47 .mos { background-position:77.77% 44.44%; }
  .mos48 .mos { background-position:88.88% 44.44%; }
  .mos49 .mos { background-position:99.99% 44.44%; }
  .mos50 .mos { background-position:00.00% 55.55%; }
  .mos51 .mos { background-position:11.11% 55.55%; }
  .mos52 .mos { background-position:22.22% 55.55%; }
  .mos53 .mos { background-position:33.33% 55.55%; }
  .mos54 .mos { background-position:44.44% 55.55%; }
  .mos55 .mos { background-position:55.55% 55.55%; }
  .mos56 .mos { background-position:66.66% 55.55%; }
  .mos57 .mos { background-position:77.77% 55.55%; }
  .mos58 .mos { background-position:88.88% 55.55%; }
  .mos59 .mos { background-position:99.99% 55.55%; }
  .mos60 .mos { background-position:00.00% 66.66%; }
  .mos61 .mos { background-position:11.11% 66.66%; }
  .mos62 .mos { background-position:22.22% 66.66%; }
  .mos63 .mos { background-position:33.33% 66.66%; }
  .mos64 .mos { background-position:44.44% 66.66%; }
  .mos65 .mos { background-position:55.55% 66.66%; }
  .mos66 .mos { background-position:66.66% 66.66%; }
  .mos67 .mos { background-position:77.77% 66.66%; }
  .mos68 .mos { background-position:88.88% 66.66%; }
  .mos69 .mos { background-position:99.99% 66.66%; }
  .mos70 .mos { background-position:00.00% 77.77%; }
  .mos71 .mos { background-position:11.11% 77.77%; }
  .mos72 .mos { background-position:22.22% 77.77%; }
  .mos73 .mos { background-position:33.33% 77.77%; }
  .mos74 .mos { background-position:44.44% 77.77%; }
  .mos75 .mos { background-position:55.55% 77.77%; }
  .mos76 .mos { background-position:66.66% 77.77%; }
  .mos77 .mos { background-position:77.77% 77.77%; }
  .mos78 .mos { background-position:88.88% 77.77%; }
  .mos79 .mos { background-position:99.99% 77.77%; }
  .mos80 .mos { background-position:00.00% 88.88%; }
  .mos81 .mos { background-position:11.11% 88.88%; }
  .mos82 .mos { background-position:22.22% 88.88%; }
  .mos83 .mos { background-position:33.33% 88.88%; }
  .mos84 .mos { background-position:44.44% 88.88%; }
  .mos85 .mos { background-position:55.55% 88.88%; }
  .mos86 .mos { background-position:66.66% 88.88%; }
  .mos87 .mos { background-position:77.77% 88.88%; }
  .mos88 .mos { background-position:88.88% 88.88%; }
  .mos89 .mos { background-position:99.99% 88.88%; }
  .mos90 .mos { background-position:00.00% 99.99%; }
  .mos91 .mos { background-position:11.11% 99.99%; }
  .mos92 .mos { background-position:22.22% 99.99%; }
  .mos93 .mos { background-position:33.33% 99.99%; }
  .mos94 .mos { background-position:44.44% 99.99%; }
  .mos95 .mos { background-position:55.55% 99.99%; }
  .mos96 .mos { background-position:66.66% 99.99%; }
  .mos97 .mos { background-position:77.77% 99.99%; }
  .mos98 .mos { background-position:88.88% 99.99%; }
  .mos99 .mos { background-position:99.99% 99.99%; }
  </style>
  <script src='../../../../../shows.js' type='text/javascript'></script>
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
    out += `<div class='icn'><img src='${fam.icon_1024x576.replace('https://media.noco.tv/', 'http://static.atomas.com/noco/media.noco.tv/')}' /></div>`
    // out += `<div class='ban'><img src='${fam.banner_family.replace('https://media.noco.tv/', 'http://static.atomas.com/noco/media.noco.tv/')}' /></div>`
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
  let years = showsFam.filter(_ => _.broadcast_date_utc).map(_ => _.broadcast_date_utc.slice(0, 4))
  years = [...new Set(years)]
  years = years.sort()

  years.forEach(year => {
    const shows = showsFam.filter(_ => _.broadcast_date_utc.slice(0, 4) === year)
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

  const shows = allshows.filter(show => show.id_partner === partnerId &&
    show.id_family === familyId &&
    show.broadcast_date_utc.slice(0, 4) === year)
    .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

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
    scr = scr.replace(scrRE, 'http://static.atomas.com/noco/media.noco.tv/screenshot_160x90/$1/160x90/$2')
    let mos = show.mosaique
    mos = mos.replace(mosRE, 'http://static.atomas.com/noco/media.noco.tv/mosaique/')

    out += `<div class='show' data-id='${show.id_show}'>`
    out += `  <div class='show-mos' style='display:none;'>`
    out += `    <div class='mos' style='background-image:url("${mos}");'></div>`
    out += `  </div>`
    out += `  <div class='show-scr'><img src='${scr}' /></div>`
    out += `  <div class='show-desc'>`
    out += `    <div class='show-name'>`
    out += `      <div class='num'>#${++i}</div>`
    out += `      <div class='title'>${title.join(' - ')}</div>`
    out += `      <div class='key'>${show.show_key}</div>`
    out += `    </div>`
    if (show.show_resume && show.show_resume.length) {
      out += `    <div class='show-resume'>${show.show_resume.replace(/\n/g, '\n    ')}</div>\n`
    }
    out += `    <div class='show-stats'>diffusé le ${show.broadcast_date_utc} -- ${dur}</div>\n`
    out += '  </div>\n'
    out += '</div>\n'
  })
  out += '<script>new Mosaique().init()</script>'

  fs.writeFileSync(`${dir}/index.html`, out)
}

createPartners(outdir, allpartners)
