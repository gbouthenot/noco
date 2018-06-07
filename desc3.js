/* eslint-disable no-irregular-whitespace */

// compresser nom images

//
// outdir: ./noco-out
// partners:
//   Parner_name: x familles, x émissions, temps total
//

const fs = require('fs')
const outdir = './out'
!fs.existsSync(outdir) && fs.mkdirSync(outdir)

const nd = require('./noco-small.json')

// object definitions
'PA TH TY SH FA'.split(' ').forEach(itm => {
  nd[itm] = nd[itm].split(' ').reduce((acc, k, i) => { acc[k] = i; return acc }, {})
})

const nocomedia = 'http://static.atomas.com/noco/media.noco.tv/'

const removeAccents = require('remove-accents-diacritics')

//
// Fonctions utilitaires
//

const showTypes = [
  {
    name: 'Épisodes',
    filter: _ => _[nd.SH.episode_number] !== 0 && _[nd.SH.id_type] !== nd.TYPE_AP
  },
  {
    name: 'Rubriques',
    filter: _ => _[nd.SH.episode_number] === 0 && _[nd.SH.id_type] !== nd.TYPE_AP
  },
  {
    name: 'Bandes-annonces',
    filter: _ => _[nd.SH.id_type] === nd.TYPE_AP
  }
]

const totalDuration = (shows) => shows.reduce((acc, cur) => acc + cur[nd.SH.duration_ms], 0)

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

const getUrl = (ep, pa, famtt, showtt) => {
  let s = `${ep[nd.SH.episode_number] ? ep[nd.SH.episode_number] + '-' : ''}${showtt}`
    .replace(/[']/g, ' ')
    .replace(/[()! ,+:&/]/g, '')
    .replace(/[ .;]/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/g, '')
    .toLowerCase()
  s = removeAccents.remove(s)
  return `https://noco.tv/emission/${pa[nd.PA.partner_shortname]}/${famtt}/${ep[nd.SH.id_show]}/${s}`
}

// TODO: escape HTML entities
function esc (string, indent) {
  string = string.replace(/\r/g, '').replace(/\n/g, '\n  ')
  return string
}

// script pour ajouter js et css
function headers (recap) {
  return `
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

  const partSortd = partners.sort((a, b) => a[nd.PA.partner_name].localeCompare(b[nd.PA.partner_name]))

  const txts = []
  partSortd.forEach((part) => {
    const fams = nd.families.filter(fa => fa[nd.FA.id_partner] === part[nd.PA.id_partner])
      .sort((a, b) => a[nd.FA.family_TT].localeCompare(b[nd.FA.family_TT]))
    const famids = fams.map(fa => fa[nd.FA.id_family])
    const shows = nd.shows.filter(sh => famids.indexOf(sh[nd.SH.id_family]) >= 0)
    const dur = formatDuration(totalDuration(shows))
    const url2 = `${url}${part[nd.PA.partner_shortname]}/`
    const icn = `${nocomedia}partner_160x90/${part[nd.PA.partner_key].toLowerCase()}.jpg`

    let out = ''
    out += `<div class='partner' data-id='${part[nd.PA.id_partner]}'>`
    out += `  <a href="${url2}"><div class='part-icn'><img src='${icn}' /></div></a>`
    out += `  <div class='part-desc'>`
    out += `    <div class="part-name">${part[nd.PA.partner_name]}</div>\n`
    out += `    <div class="part-stats">familles: ${fams.length}; nb emissions: ${shows.length}; durée totale: ${dur}</div>`
    if (part[nd.PA.partner_resume]) {
      out += `    <div class='part-resume'>${esc(part[nd.PA.partner_resume])}</div>\n`
    }
    if (part[nd.PA.partner_subtitle]) {
      out += `    <div class='part-subtitle'>${esc(part[nd.PA.partner_subtitle])}</div>\n`
    }
    out += '  </div>'
    out += '</div>\n'
    txts.push(out)

    createPartnerFamilies(`${dir}/${part[nd.PA.partner_shortname]}`, url2, prev + out, part, fams, shows)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner : index des familles d'un partner
function createPartnerFamilies (dir, url, prev, part, fams, partnerShows) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  const txts = []
  fams.forEach(fam => {
    const familyId = fam[nd.FA.id_family]
    const theme = nd.themes.find(_ => _[nd.TH.id_theme] === fam[nd.FA.id_theme])
    const type = nd.types.find(_ => _[nd.TY.id_type] === fam[nd.FA.id_type])

    const shows = partnerShows.filter(show => show[nd.SH.id_family] === familyId)
    // .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

    const dur = formatDuration(totalDuration(shows))
    const url2 = `${url}${fam[nd.FA.family_key]}/`
    let icn = ''
    if (fam[nd.FA.icon_1024x576].length) {
      icn = `${nocomedia}family_160x90/${part[nd.PA.partner_key].toLowerCase()}/${fam[nd.FA.family_key].toLowerCase()}.jpg`
    }

    let out = ''
    out += `<div class='family' data-id='${fam[nd.FA.id_family]}'>`
    out += `  <a href="${url2}"><div class='fam-icn'>`
    if (icn.length) {
      out += `    <img src='${icn}' />`
    }
    out += `  </div></a>`
    out += `  <div class='fam-desc'>`
    out += `    <div class='fam-name'>${fam[nd.FA.family_TT]}</div>\n`
    out += `    <div class='fam-theme'>${theme[nd.TH.theme_name]}</div> <div class='fam-type'>${type[nd.TY.type_name]}</div>\n`
    out += `    <div class='fam-stats'>${shows.length} vidéos, ${dur}</div>\n`
    if (fam[nd.FA.family_OT]) {
      out += `    <div class='fam-name-vo'>${fam[nd.FA.family_OT]}</div>`
    }
    if (fam[nd.FA.family_resume]) {
      out += `    <div class='fam-resume'>${fam[nd.FA.family_resume]}</div>`
    }
    out += `  </div>`
    out += `</div>\n`
    txts.push(out)

    createPartnerFamilyYears(`${dir}/${fam[nd.FA.family_key]}`, url2, prev + out, part, fam, shows)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner -> family : index des années
function createPartnerFamilyYears (dir, url, prev, part, fam, familyShows) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  // Par année, unique, trié
  let years = familyShows.map(_ => _[nd.SH.sorting_year] + 2000)
  years = [...new Set(years)]
  years = years.sort()

  const txts = []
  years.forEach(year => {
    const shows = familyShows.filter(_ => _[nd.SH.sorting_year] + 2000 === year)
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

  // appelé par shows.map(formatShow)
  const formatShow = (show, i) => {
    const dur = formatDuration(show[nd.SH.duration_ms])
    const title = []
    let sn = ''
    if (show[nd.SH.season_number]) {
      sn += 'S' + show[nd.SH.season_number]
    }
    if (show[nd.SH.episode_number]) {
      sn += 'E' + show[nd.SH.episode_number]
    } else {
      // pas de numéro d'épisode, met le numéro d'index
      sn = `#${i + 1} ` + sn
    }

    // si le nom de la famille est différent, affiche-le
    let famtt = fam[nd.FA.family_TT]
    if (show[nd.SH.family_TT]) {
      famtt = show[nd.SH.family_TT]
      title.push(famtt)
    }

    // broadcast_date_utc
    let broadcastDate = null
    if (show[nd.SH.broadcast_date_utc]) {
      broadcastDate = ('00000000000' + show[nd.SH.broadcast_date_utc]).slice(-12)
      broadcastDate = broadcastDate.replace(/^(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/, '$1-$2-$3 $4:$5:$6')
      broadcastDate = (parseInt(broadcastDate.slice(0, 2)) > 18 ? '19' : '20') + broadcastDate
    }

    // show key FIRST : season
    let showKey = show[nd.SH.show_key]
    // S1 -> S12: janvier à aout: S(n), septembre à décembre: S(n+1)
    // S13 -> S18: une saison par année janvier à décembre
    if (broadcastDate && part[nd.PA.id_partner] === nd.PARTNER_NOLIFE) {
      const season = 'S' + (parseInt(broadcastDate) >= 2013 ? broadcastDate.slice(2, 4)
        : (parseInt(broadcastDate) - 2006) * 2 - (parseInt(broadcastDate.slice(5)) < 9))
      if (showKey[0] === '-') {
        showKey = showKey.slice(1)
      } else {
        showKey = season + showKey
      }
    }

    let showtt = show[nd.SH.show_TT]
    // pour "101%"" et "le Continue de l'info"
    if ([nd.FAMILY_CU, nd.FAMILY_CI].includes(show[nd.SH.id_family])) {
      if (showtt === '') {
        const dow = 'Dimanche,Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi'
        const months = 'janvier,février,mars,avril,mai,juin,juillet,aout,septembre,octobre,novembre,décembre'
        let a = new Date(broadcastDate)
        const datnew = dow.split(',')[a.getDay()] + ' ' +
          a.getDate().toString().replace(/^1$/, '1er') + ' ' + months.split(',')[a.getMonth()] +
          ' ' + a.getFullYear()
        showtt = datnew
      } else if (showtt === '_') {
        showtt = ''
      }
    }

    if (showtt) {
      title.push(showtt)
    }

    // show_key SECOND: family_key
    showKey = show[nd.SH.id_type] === nd.TYPE_AP ? `AP_${showKey}`
      : showKey[0] === '_' ? showKey.slice(1)
        : `${fam[nd.FA.family_key]}_${showKey}`

    let scr = ''
    const parsl = part[nd.PA.partner_key].toLowerCase()
    if (show[nd.SH.screenshot]) {
      scr = show[nd.SH.screenshot]
      if (scr[0] === '/') {
        scr = `${nocomedia}family/icon/${parsl}${scr}.jpg`
      } else if (scr.indexOf('https://') !== 0) {
        let shk = show[nd.SH.scrkey] ? show[nd.SH.scrkey] : showKey
        if (scr.length !== 2) {
          shk += '_'
        }
        scr = `${nocomedia}screenshot_160x90/${parsl}/${scr[0]}/${scr[1]}/${shk}${scr.slice(2)}.jpg`
      }
    }
    let mos = show[nd.SH.mosaique]
    if (mos) {
      mos = `${nocomedia}mosaique/${parsl}/${mos[0]}/${mos[1]}/${showKey}_${mos.slice(2)}.jpg`
    }

    let out = ''
    out += `<div class='show' data-id='${show[nd.SH.id_show]}'>`
    out += `  <div class='show-mos' style='display:none;'>`
    out += `    <div class='mos' style='background-image:url("${mos}");'></div>`
    out += `    <div class='prog'></div>`
    out += `  </div>`
    out += `  <div class='show-scr'>`
    if (scr) {
      out += `    <img src='${scr}' />`
    }
    out += `  </div>`
    out += `  <div class='show-desc'>`
    out += `    <div class='show-idx'>#${i + 1}</div>`
    out += `    <div class='show-name'>`
    out += `      <div class='num'>${sn}</div>`
    out += `      <div class='title'>${title.join(' - ')}</div>`
    out += `      <div class='key'>${showKey}</div>`
    out += `    </div>`
    if (show[nd.SH.show_resume]) {
      out += `    <div class='show-resume'>${show[nd.SH.show_resume].replace(/\n/g, '\n    ')}</div>\n`
    }
    out += `    <div class='show-stats'>`
    if (broadcastDate) {
      out += `      diffusé le ${broadcastDate} -- `
    }
    out += `      ${dur} -- <a href="${getUrl(show, part, famtt, showtt)}">noco</a>`
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
createPartners(outdir, 'by_partner/', prev, nd.partners)
