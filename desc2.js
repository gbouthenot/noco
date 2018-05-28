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
  s = removeAccents(s)
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
      .sort((a, b) => a.sorting_date_utc.localeCompare(b.sorting_date_utc))
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
    if (show.show_TT && show.show_TT.length) {
      title.push(`${show.show_TT}`)
    }

    let scr = show.screenshot_1024x576
    scr = scr.replace(scrRE, `${nocomedia}screenshot_160x90/$1/160x90/$2`)
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

function removeAccents (s) {
  /* eslint-disable quotes, object-property-newline */
  const l = {
    "Á": "A", "Ă": "A", "Ắ": "A", "Ặ": "A", "Ằ": "A", "Ẳ": "A", "Ẵ": "A", "Ǎ": "A", "Â": "A", "Ấ": "A", "Ậ": "A", "Ầ": "A", "Ẩ": "A", "Ẫ": "A", "Ä": "A", "Ǟ": "A", "Ȧ": "A", "Ǡ": "A", "Ạ": "A", "Ȁ": "A", "À": "A", "Ả": "A", "Ȃ": "A", "Ā": "A", "Ą": "A", "Å": "A", "Ǻ": "A", "Ḁ": "A", "Ⱥ": "A", "Ã": "A", "Ꜳ": "AA", "Æ": "AE", "Ǽ": "AE", "Ǣ": "AE", "Ꜵ": "AO", "Ꜷ": "AU", "Ꜹ": "AV", "Ꜻ": "AV", "Ꜽ": "AY", "Ḃ": "B", "Ḅ": "B",
    "Ɓ": "B", "Ḇ": "B", "Ƀ": "B", "Ƃ": "B", "Ć": "C", "Č": "C", "Ç": "C", "Ḉ": "C", "Ĉ": "C", "Ċ": "C", "Ƈ": "C", "Ȼ": "C", "Ď": "D", "Ḑ": "D", "Ḓ": "D", "Ḋ": "D", "Ḍ": "D", "Ɗ": "D", "Ḏ": "D", "ǲ": "D", "ǅ": "D", "Đ": "D", "Ƌ": "D", "Ǳ": "DZ", "Ǆ": "DZ", "É": "E", "Ĕ": "E", "Ě": "E", "Ȩ": "E", "Ḝ": "E", "Ê": "E", "Ế": "E", "Ệ": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ḙ": "E", "Ë": "E", "Ė": "E", "Ẹ": "E",
    "Ȅ": "E", "È": "E", "Ẻ": "E", "Ȇ": "E", "Ē": "E", "Ḗ": "E", "Ḕ": "E", "Ę": "E", "Ɇ": "E", "Ẽ": "E", "Ḛ": "E", "Ꝫ": "ET", "Ḟ": "F", "Ƒ": "F", "Ǵ": "G", "Ğ": "G", "Ǧ": "G", "Ģ": "G", "Ĝ": "G", "Ġ": "G", "Ɠ": "G", "Ḡ": "G", "Ǥ": "G", "Ḫ": "H", "Ȟ": "H", "Ḩ": "H", "Ĥ": "H", "Ⱨ": "H", "Ḧ": "H", "Ḣ": "H", "Ḥ": "H", "Ħ": "H", "Í": "I",
    "Ĭ": "I", "Ǐ": "I", "Î": "I", "Ï": "I", "Ḯ": "I", "İ": "I", "Ị": "I", "Ȉ": "I", "Ì": "I", "Ỉ": "I", "Ȋ": "I", "Ī": "I", "Į": "I", "Ɨ": "I", "Ĩ": "I", "Ḭ": "I", "Ꝺ": "D", "Ꝼ": "F", "Ᵹ": "G", "Ꞃ": "R", "Ꞅ": "S", "Ꞇ": "T", "Ꝭ": "IS", "Ĵ": "J", "Ɉ": "J", "Ḱ": "K", "Ǩ": "K", "Ķ": "K", "Ⱪ": "K", "Ꝃ": "K", "Ḳ": "K", "Ƙ": "K", "Ḵ": "K", "Ꝁ": "K", "Ꝅ": "K", "Ĺ": "L",
    "Ƚ": "L", "Ľ": "L", "Ļ": "L", "Ḽ": "L", "Ḷ": "L", "Ḹ": "L", "Ⱡ": "L", "Ꝉ": "L", "Ḻ": "L", "Ŀ": "L", "Ɫ": "L", "ǈ": "L", "Ł": "L", "Ǉ": "LJ", "Ḿ": "M", "Ṁ": "M", "Ṃ": "M", "Ɱ": "M", "Ń": "N", "Ň": "N", "Ņ": "N", "Ṋ": "N", "Ṅ": "N", "Ṇ": "N", "Ǹ": "N", "Ɲ": "N", "Ṉ": "N", "Ƞ": "N", "ǋ": "N", "Ñ": "N", "Ǌ": "NJ", "Ó": "O", "Ŏ": "O", "Ǒ": "O", "Ô": "O", "Ố": "O", "Ộ": "O", "Ồ": "O",
    "Ổ": "O", "Ỗ": "O", "Ö": "O", "Ȫ": "O", "Ȯ": "O", "Ȱ": "O", "Ọ": "O", "Ő": "O", "Ȍ": "O", "Ò": "O", "Ỏ": "O", "Ơ": "O", "Ớ": "O", "Ợ": "O", "Ờ": "O", "Ở": "O", "Ỡ": "O", "Ȏ": "O", "Ꝋ": "O", "Ꝍ": "O", "Ō": "O", "Ṓ": "O", "Ṑ": "O", "Ɵ": "O", "Ǫ": "O", "Ǭ": "O", "Ø": "O", "Ǿ": "O", "Õ": "O", "Ṍ": "O", "Ṏ": "O", "Ȭ": "O", "Ƣ": "OI",
    "Ꝏ": "OO", "Ɛ": "E", "Ɔ": "O", "Ȣ": "OU", "Ṕ": "P", "Ṗ": "P", "Ꝓ": "P", "Ƥ": "P", "Ꝕ": "P", "Ᵽ": "P", "Ꝑ": "P", "Ꝙ": "Q", "Ꝗ": "Q", "Ŕ": "R", "Ř": "R", "Ŗ": "R", "Ṙ": "R", "Ṛ": "R", "Ṝ": "R", "Ȑ": "R", "Ȓ": "R", "Ṟ": "R", "Ɍ": "R", "Ɽ": "R", "Ꜿ": "C", "Ǝ": "E", "Ś": "S", "Ṥ": "S", "Š": "S", "Ṧ": "S", "Ş": "S", "Ŝ": "S", "Ș": "S", "Ṡ": "S", "Ṣ": "S", "Ṩ": "S", "ẞ": "SS", "Ť": "T", "Ţ": "T",
    "Ṱ": "T", "Ț": "T", "Ⱦ": "T", "Ṫ": "T", "Ṭ": "T", "Ƭ": "T", "Ṯ": "T", "Ʈ": "T", "Ŧ": "T", "Ɐ": "A", "Ꞁ": "L", "Ɯ": "M", "Ʌ": "V", "Ꜩ": "TZ", "Ú": "U", "Ŭ": "U", "Ǔ": "U", "Û": "U", "Ṷ": "U", "Ü": "U", "Ǘ": "U", "Ǚ": "U", "Ǜ": "U", "Ǖ": "U", "Ṳ": "U", "Ụ": "U", "Ű": "U", "Ȕ": "U", "Ù": "U", "Ủ": "U", "Ư": "U", "Ứ": "U", "Ự": "U", "Ừ": "U", "Ử": "U", "Ữ": "U",
    "Ȗ": "U", "Ū": "U", "Ṻ": "U", "Ų": "U", "Ů": "U", "Ũ": "U", "Ṹ": "U", "Ṵ": "U", "Ꝟ": "V", "Ṿ": "V", "Ʋ": "V", "Ṽ": "V", "Ꝡ": "VY", "Ẃ": "W", "Ŵ": "W", "Ẅ": "W", "Ẇ": "W", "Ẉ": "W", "Ẁ": "W", "Ⱳ": "W", "Ẍ": "X", "Ẋ": "X", "Ý": "Y", "Ŷ": "Y", "Ÿ": "Y", "Ẏ": "Y", "Ỵ": "Y",
    "Ỳ": "Y", "Ƴ": "Y", "Ỷ": "Y", "Ỿ": "Y", "Ȳ": "Y", "Ɏ": "Y", "Ỹ": "Y", "Ź": "Z", "Ž": "Z", "Ẑ": "Z", "Ⱬ": "Z", "Ż": "Z", "Ẓ": "Z", "Ȥ": "Z", "Ẕ": "Z", "Ƶ": "Z", "Ĳ": "IJ", "Œ": "OE", "ᴀ": "A", "ᴁ": "AE", "ʙ": "B", "ᴃ": "B", "ᴄ": "C", "ᴅ": "D", "ᴇ": "E", "ꜰ": "F", "ɢ": "G", "ʛ": "G",
    "ʜ": "H", "ɪ": "I", "ʁ": "R", "ᴊ": "J", "ᴋ": "K", "ʟ": "L", "ᴌ": "L", "ᴍ": "M", "ɴ": "N", "ᴏ": "O", "ɶ": "OE", "ᴐ": "O", "ᴕ": "OU", "ᴘ": "P", "ʀ": "R", "ᴎ": "N", "ᴙ": "R", "ꜱ": "S", "ᴛ": "T", "ⱻ": "E", "ᴚ": "R", "ᴜ": "U", "ᴠ": "V", "ᴡ": "W", "ʏ": "Y", "ᴢ": "Z", "á": "a", "ă": "a", "ắ": "a", "ặ": "a", "ằ": "a",
    "ẳ": "a", "ẵ": "a", "ǎ": "a", "â": "a", "ấ": "a", "ậ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ä": "a", "ǟ": "a", "ȧ": "a", "ǡ": "a", "ạ": "a", "ȁ": "a", "à": "a", "ả": "a", "ȃ": "a", "ā": "a", "ą": "a", "ᶏ": "a", "ẚ": "a", "å": "a", "ǻ": "a", "ḁ": "a", "ⱥ": "a", "ã": "a", "ꜳ": "aa",
    "æ": "ae", "ǽ": "ae", "ǣ": "ae", "ꜵ": "ao", "ꜷ": "au", "ꜹ": "av", "ꜻ": "av", "ꜽ": "ay", "ḃ": "b", "ḅ": "b", "ɓ": "b", "ḇ": "b", "ᵬ": "b", "ᶀ": "b", "ƀ": "b", "ƃ": "b", "ɵ": "o", "ć": "c", "č": "c", "ç": "c", "ḉ": "c", "ĉ": "c", "ɕ": "c", "ċ": "c", "ƈ": "c", "ȼ": "c", "ď": "d", "ḑ": "d", "ḓ": "d", "ȡ": "d",
    "ḋ": "d", "ḍ": "d", "ɗ": "d", "ᶑ": "d", "ḏ": "d", "ᵭ": "d", "ᶁ": "d", "đ": "d", "ɖ": "d", "ƌ": "d", "ı": "i", "ȷ": "j", "ɟ": "j", "ʄ": "j", "ǳ": "dz", "ǆ": "dz", "é": "e", "ĕ": "e", "ě": "e", "ȩ": "e", "ḝ": "e", "ê": "e", "ế": "e", "ệ": "e", "ề": "e", "ể": "e", "ễ": "e",
    "ḙ": "e", "ë": "e", "ė": "e", "ẹ": "e", "ȅ": "e", "è": "e", "ẻ": "e", "ȇ": "e", "ē": "e", "ḗ": "e", "ḕ": "e", "ⱸ": "e", "ę": "e", "ᶒ": "e", "ɇ": "e", "ẽ": "e", "ḛ": "e", "ꝫ": "et", "ḟ": "f", "ƒ": "f", "ᵮ": "f", "ᶂ": "f", "ǵ": "g", "ğ": "g", "ǧ": "g", "ģ": "g", "ĝ": "g", "ġ": "g",
    "ɠ": "g", "ḡ": "g", "ᶃ": "g", "ǥ": "g", "ḫ": "h", "ȟ": "h", "ḩ": "h", "ĥ": "h", "ⱨ": "h", "ḧ": "h", "ḣ": "h", "ḥ": "h", "ɦ": "h", "ẖ": "h", "ħ": "h", "ƕ": "hv", "í": "i", "ĭ": "i", "ǐ": "i", "î": "i", "ï": "i", "ḯ": "i", "ị": "i", "ȉ": "i", "ì": "i", "ỉ": "i", "ȋ": "i", "ī": "i", "į": "i", "ᶖ": "i",
    "ɨ": "i", "ĩ": "i", "ḭ": "i", "ꝺ": "d", "ꝼ": "f", "ᵹ": "g", "ꞃ": "r", "ꞅ": "s", "ꞇ": "t", "ꝭ": "is", "ǰ": "j", "ĵ": "j", "ʝ": "j", "ɉ": "j", "ḱ": "k", "ǩ": "k", "ķ": "k", "ⱪ": "k", "ꝃ": "k", "ḳ": "k", "ƙ": "k", "ḵ": "k", "ᶄ": "k", "ꝁ": "k", "ꝅ": "k", "ĺ": "l", "ƚ": "l", "ɬ": "l", "ľ": "l",
    "ļ": "l", "ḽ": "l", "ȴ": "l", "ḷ": "l", "ḹ": "l", "ⱡ": "l", "ꝉ": "l", "ḻ": "l", "ŀ": "l", "ɫ": "l", "ᶅ": "l", "ɭ": "l", "ł": "l", "ǉ": "lj", "ſ": "s", "ẜ": "s", "ẛ": "s", "ẝ": "s", "ḿ": "m", "ṁ": "m", "ṃ": "m", "ɱ": "m", "ᵯ": "m", "ᶆ": "m", "ń": "n", "ň": "n", "ņ": "n", "ṋ": "n", "ȵ": "n", "ṅ": "n",
    "ṇ": "n", "ǹ": "n", "ɲ": "n", "ṉ": "n", "ƞ": "n", "ᵰ": "n", "ᶇ": "n", "ɳ": "n", "ñ": "n", "ǌ": "nj", "ó": "o", "ŏ": "o", "ǒ": "o", "ô": "o", "ố": "o", "ộ": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ö": "o", "ȫ": "o", "ȯ": "o", "ȱ": "o", "ọ": "o", "ő": "o", "ȍ": "o", "ò": "o", "ỏ": "o", "ơ": "o",
    "ớ": "o", "ợ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ȏ": "o", "ꝋ": "o", "ꝍ": "o", "ⱺ": "o", "ō": "o", "ṓ": "o", "ṑ": "o", "ǫ": "o", "ǭ": "o", "ø": "o", "ǿ": "o", "õ": "o", "ṍ": "o", "ṏ": "o", "ȭ": "o", "ƣ": "oi", "ꝏ": "oo", "ɛ": "e", "ᶓ": "e", "ɔ": "o", "ᶗ": "o", "ȣ": "ou", "ṕ": "p", "ṗ": "p", "ꝓ": "p", "ƥ": "p", "ᵱ": "p", "ᶈ": "p",
    "ꝕ": "p", "ᵽ": "p", "ꝑ": "p", "ꝙ": "q", "ʠ": "q", "ɋ": "q", "ꝗ": "q", "ŕ": "r", "ř": "r", "ŗ": "r", "ṙ": "r", "ṛ": "r", "ṝ": "r", "ȑ": "r", "ɾ": "r", "ᵳ": "r", "ȓ": "r", "ṟ": "r", "ɼ": "r", "ᵲ": "r", "ᶉ": "r", "ɍ": "r", "ɽ": "r", "ↄ": "c", "ꜿ": "c", "ɘ": "e", "ɿ": "r", "ś": "s", "ṥ": "s", "š": "s", "ṧ": "s",
    "ş": "s", "ŝ": "s", "ș": "s", "ṡ": "s", "ṣ": "s", "ṩ": "s", "ʂ": "s", "ᵴ": "s", "ᶊ": "s", "ȿ": "s", "ɡ": "g", "ß": "ss", "ᴑ": "o", "ᴓ": "o", "ᴝ": "u", "ť": "t", "ţ": "t", "ṱ": "t", "ț": "t", "ȶ": "t", "ẗ": "t", "ⱦ": "t", "ṫ": "t", "ṭ": "t", "ƭ": "t", "ṯ": "t", "ᵵ": "t", "ƫ": "t", "ʈ": "t", "ŧ": "t", "ᵺ": "th", "ɐ": "a", "ᴂ": "ae", "ǝ": "e", "ᵷ": "g", "ɥ": "h", "ʮ": "h",
    "ʯ": "h", "ᴉ": "i", "ʞ": "k", "ꞁ": "l", "ɯ": "m", "ɰ": "m", "ᴔ": "oe", "ɹ": "r", "ɻ": "r", "ɺ": "r", "ⱹ": "r", "ʇ": "t", "ʌ": "v", "ʍ": "w", "ʎ": "y", "ꜩ": "tz", "ú": "u", "ŭ": "u", "ǔ": "u", "û": "u", "ṷ": "u", "ü": "u", "ǘ": "u", "ǚ": "u", "ǜ": "u", "ǖ": "u", "ṳ": "u", "ụ": "u", "ű": "u", "ȕ": "u", "ù": "u", "ủ": "u", "ư": "u",
    "ứ": "u", "ự": "u", "ừ": "u", "ử": "u", "ữ": "u", "ȗ": "u", "ū": "u", "ṻ": "u", "ų": "u", "ᶙ": "u", "ů": "u", "ũ": "u", "ṹ": "u", "ṵ": "u", "ᵫ": "ue", "ꝸ": "um", "ⱴ": "v", "ꝟ": "v", "ṿ": "v", "ʋ": "v", "ᶌ": "v", "ⱱ": "v", "ṽ": "v", "ꝡ": "vy", "ẃ": "w", "ŵ": "w", "ẅ": "w", "ẇ": "w", "ẉ": "w", "ẁ": "w", "ⱳ": "w", "ẘ": "w", "ẍ": "x",
    "ẋ": "x", "ᶍ": "x", "ý": "y", "ŷ": "y", "ÿ": "y", "ẏ": "y", "ỵ": "y", "ỳ": "y", "ƴ": "y", "ỷ": "y", "ỿ": "y", "ȳ": "y", "ẙ": "y", "ɏ": "y", "ỹ": "y", "ź": "z", "ž": "z", "ẑ": "z", "ʑ": "z", "ⱬ": "z", "ż": "z", "ẓ": "z", "ȥ": "z", "ẕ": "z", "ᵶ": "z", "ᶎ": "z", "ʐ": "z", "ƶ": "z", "ɀ": "z", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ﬁ": "fi", "ﬂ": "fl",
    "ĳ": "ij", "œ": "oe", "ﬆ": "st", "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₒ": "o", "ᵣ": "r", "ᵤ": "u", "ᵥ": "v", "ₓ": "x"
  }
  return s.replace(/[^A-Za-z0-9[\] ]/g, a => l[a] || a)
};
