/* eslint-disable no-irregular-whitespace */

//
// outdir: ./noco-out
// partners:
//   Parner_name: x familles, x émissions, temps total
//

const fs = require('fs')
const outdir = './out'
!fs.existsSync(outdir) && fs.mkdirSync(outdir)

const nocodata = require('./noco-data/noco-data')

const nocomedia = 'http://static.atomas.com/noco/media.noco.tv/'

const removeAccents = require('remove-accents-diacritics')

//
// Fonctions utilitaires
//

const showTypes = [
  {
    name: 'Épisodes',
    filter: _ => _.episode_number !== 0 && _.type_key !== 'AP'
  },
  {
    name: 'Rubriques',
    filter: _ => _.episode_number === 0 && _.type_key !== 'AP'
  },
  {
    name: 'Bandes-annonces',
    filter: _ => _.type_key === 'AP'
  }
]

const totalDuration = (shows) => shows.reduce((acc, cur) => acc + cur.duration_ms, 0)

const formatDuration = (durationMs) => {
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

const getUrl = (ep) => {
  let s = `${ep.episode_number ? ep.episode_number + '-' : ''}${ep.show_TT ? ep.show_TT : ''}`
    .replace(/[']/g, ' ')
    .replace(/[()! ,+:&/]/g, '')
    .replace(/[ .;]/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/g, '')
    .toLowerCase()
  s = removeAccents.remove(s)
  return `https://noco.tv/emission/${ep.partner_shortname}/${ep.family_TT}/${ep.id_show}/${s}`
}

// TODO: escape HTML entities
function esc (string, indent) {
  string = string.replace(/\r/g, '').replace(/\n/g, '\n  ')
  return string
}

// script pour ajouter js et css
function headers (recap) {
  return `
<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Noco Legacy</title>
  </head>
<body>
<script type='text/javascript'>
(function () {
    const l = window.location.href
    const i = l.lastIndexOf("/out/")
    const baseurl = l.slice(0, i + 1)
    window.baseurl = baseurl

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
<div class='recap'>${recap}</div><hr />
  `
}

// les partners
function createPartners (outdir, url, prev, partners) {
  const dir = `${outdir}/${url}`
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const partSortd = partners.sort((a, b) => a.partner_name.localeCompare(b.partner_name))

  const txts = []
  partSortd.forEach((part) => {
    const fams = nocodata.families.filter(_ => _.id_partner === part.id_partner)
      .sort((a, b) => a.family_TT.localeCompare(b.family_TT))
    const shows = nocodata.shows.filter(_ => _.id_partner === part.id_partner)
    const dur = formatDuration(totalDuration(shows))
    const url2 = `${url}${part.partner_shortname}/`
    const icn = `${nocomedia}partner_160x90/${part.partner_key.toLowerCase()}.jpg`

    let out = ''
    out += `<div class='partner' data-id='${part.id_partner}'>`
    out += `  <a href="${url2}"><div class='part-icn'><img src='${icn}' /></div></a>`
    out += `  <div class='part-desc'>`
    out += `    <div class="part-name">${part.partner_name}</div>\n`
    out += `    <div class="part-stats">familles: ${fams.length}; nb emissions: ${shows.length}; durée totale: ${dur}</div>`
    if (part.partner_resume) {
      out += `    <div class='part-resume'>${esc(part.partner_resume)}</div>\n`
    }
    if (part.partner_subtitle) {
      out += `    <div class='part-subtitle'>${esc(part.partner_subtitle)}</div>\n`
    }
    out += '  </div>'
    out += '</div>\n'
    txts.push(out)

    createPartnerFamilies(`${dir}/${part.partner_shortname}`, url2, prev + out, part, fams, shows)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner : index des familles d'un partner
function createPartnerFamilies (dir, url, prev, part, fams, partnerShows) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const txts = []
  fams.forEach(fam => {
    const familyId = fam.id_family
    const theme = nocodata.themes.find(_ => _.id_theme === fam.id_theme)
    const type = nocodata.types.find(_ => _.id_type === fam.id_type)

    const shows = partnerShows.filter(show => show.id_family === familyId)
    // .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

    const dur = formatDuration(totalDuration(shows))
    const url2 = `${url}${fam.family_key}/`
    let icn = ''
    if (fam.icon_1024x576.length) {
      icn = `${nocomedia}family_160x90/${part.partner_key.toLowerCase()}/${fam.family_key.toLowerCase()}.jpg`
    }

    let out = ''
    out += `<div class='family' data-id='${fam.id_family}'>`
    out += `  <a href="${url2}"><div class='fam-icn'>`
    if (icn.length) {
      out += `    <img src='${icn}' />`
    }
    out += `  </div></a>`
    out += `  <div class='fam-desc'>`
    out += `    <div class='fam-name'>${fam.family_TT}</div>\n`
    out += `    <div class='fam-theme'>${theme.theme_name}</div> <div class='fam-type'>${type.type_name}</div>\n`
    out += `    <div class='fam-stats'>${shows.length} vidéos, ${dur}</div>\n`
    if (fam.family_TT !== fam.family_OT) {
      out += `    <div class='fam-name-vo'>${fam.family_OT} (${fam.OT_lang})</div>`
    }
    if (fam.family_resume) {
      out += `    <div class='fam-resume'>${fam.family_resume}</div>`
    }
    out += `  </div>`
    out += `</div>\n`
    txts.push(out)

    createPartnerFamilyYears(`${dir}/${fam.family_key}`, url2, prev + out, part, fam, shows)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner -> family : index des années
function createPartnerFamilyYears (dir, url, prev, part, fam, familyShows) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  // Par année, unique, trié
  let years = familyShows.filter(_ => _.sorting_date_utc).map(_ => _.sorting_date_utc.slice(0, 4))
  years = [...new Set(years)]
  years = years.sort()

  const txts = []
  years.forEach(year => {
    const shows = familyShows.filter(_ => _.sorting_date_utc.slice(0, 4) === year)
      .sort((a, b) => (a.sorting_date_utc + a.show_key).localeCompare(b.sorting_date_utc + b.show_key))
    const dur = formatDuration(totalDuration(shows))
    const url2 = `${url}${year}/`

    let out = ''
    out += `<div class='year'>`
    out += `<div class='year-txt'>Année </div>`
    out += `<div class='year-name' data-id='${year}'><a href="${url2}">${year}</a></div>\n`
    out += `<div class="year-stats">${shows.length} vidéos, ${dur}</div>`
    out += `</div>\n`
    txts.push(out)

    createPartnerFamilyYearShows(`${dir}/${year}`, url2, prev + out, part, fam, year, shows)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner -> family -> year : index des émissions
function createPartnerFamilyYearShows (dir, url, prev, part, fam, year, showsYear) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  // TODO: créer une nouvelle colonne = broadcast ou sorting

  const scrRE = new RegExp('https://media.noco.tv/screenshot/([a-z]+)/[0-9x]*/(.*)')
  const mosRE = new RegExp('https://media.noco.tv/mosaique/')

  // appelé par shows.map(formatShow)
  const formatShow = (show, i) => {
    const dur = formatDuration(show.duration_ms)
    const title = []
    let sn = ''
    if (show.season_number) {
      sn += 'S' + show.season_number
    }
    if (show.episode_number) {
      sn += 'E' + show.episode_number
    } else {
      // pas de numéro d'épisode, met le numéro d'index
      sn = `#${i + 1} ` + sn
    }

    // si le nom de la famille est différent, affiche-le
    if (nocodata.families.find(_ => _.id_family === show.id_family).family_TT !== show.family_TT) {
      title.push(`${show.family_TT}`)
    }
    if (show.show_TT && show.show_TT.toString().length) {
      title.push(`${show.show_TT.toString()}`)
    }

    let scr = show.screenshot_1024x576
    scr = scr.replace(scrRE, `${nocomedia}screenshot_160x90/$1/$2`)
      .replace('https://media.noco.tv/family/icon/', `${nocomedia}family/icon/`)
    let mos = show.mosaique
    mos = mos.replace(mosRE, `${nocomedia}mosaique/`)

    let out = ''
    out += `<div class='show' data-id='${show.id_show}'>`
    out += `  <div class='show-mos' style='display:none;'>`
    out += `    <div class='mos' style='background-image:url("${mos}");'></div>`
    out += `    <div class='prog'></div>`
    out += `  </div>`
    out += `  <div class='show-scr'>`
    if (scr.length) {
      out += `    <img src='${scr}' />`
    }
    out += `  </div>`
    out += `  <div class='show-desc'>`
    out += `    <div class='show-idx'>#${i + 1}</div>`
    out += `    <div class='show-name'>`
    out += `      <div class='num'>${sn}</div>`
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
    out += `      ${dur} -- <a href="${getUrl(show)}">noco</a>`
    out += `    </div>\n`
    out += '  </div>\n'
    out += '</div>\n'
    return out
  }

  let out = ''

  showTypes.forEach(showType => {
    const shows = showsYear.filter(showType.filter)
    if (shows.length) {
      const dur = formatDuration(totalDuration(shows))
      out += `<h1>${showType.name}: ${shows.length} (${dur})</h1>\n`
      out += shows.map(formatShow).join('\n')
      out += '<hr />'
    }
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + out)
}

const prev = `<div class='access'><div class='access-name'><a href='by_partner/'>Partenaires</a></div></div>\n`
createPartners(outdir, 'by_partner/', prev, nocodata.partners)
