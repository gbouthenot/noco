/* eslint-disable no-irregular-whitespace */

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

patchScreenshots(allshows)
patchMosaiques(allshows)
patchFamilies(allfamilies)
// process.exit(0)

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

const getUrl = (ep) => {
  let s = `${ep.partner_shortname}/${ep.family_TT}/${ep.episode_number ? ep.episode_number + '-' : ''}${ep.show_TT ? ep.show_TT : ''}`
    .replace(/[']/g, ' ')
    .replace(/[()! ,+:&]/g, '')
    .replace(/[ .;]/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/g, '')
    .toLowerCase()
  s = removeAccents(s)
  return `https://noco.tv/emission/${ep.id_show}/${s}`
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
    const fams = allfamilies.filter(_ => _.id_partner === part.id_partner)
      .sort((a, b) => a.family_TT.localeCompare(b.family_TT))
    const shows = allshows.filter(_ => _.id_partner === part.id_partner)
    const duration = shows.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(duration)
    const url2 = `${url}${part.partner_shortname}/`
    const icn = `${nocomedia}partner_160x90/${part.partner_key.toLowerCase()}.jpg`

    let out = ''
    out += `<div class='partner' data-id='${part.id_partner}'>`
    out += `  <a href="${url2}"><div class='part-icn'><img src='${icn}' /></div></a>`
    out += `  <div class='part-desc'>`
    out += `    <div class="part-name">${part.partner_name}</div>\n`
    out += `    <div class="part-stats">familles: ${fams.length}; nb emissions: ${shows.length}; durée totale: ${durationHuman}</div>`
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
    const theme = allthemes.find(_ => _.id_theme === fam.id_theme)
    const type = alltypes.find(_ => _.id_type === fam.id_type)

    const showsFam = partnerShows.filter(show => show.id_family === familyId)
    // .sort((a, b) => a.broadcast_date_utc.localeCompare(b.broadcast_date_utc))

    const durationMs = showsFam.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const durationHuman = formatDurationHuman(durationMs)
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
    out += `    <div class='fam-stats'>${showsFam.length} émissions, ${durationHuman}</div>\n`
    if (fam.family_TT !== fam.family_OT) {
      out += `    <div class='fam-name-vo'>${fam.family_OT} (${fam.OT_lang})</div>`
    }
    if (fam.family_resume) {
      out += `    <div class='fam-resume'>${fam.family_resume}</div>`
    }
    out += `  </div>`
    out += `</div>\n`
    txts.push(out)

    createPartnerFamilyYears(`${dir}/${fam.family_key}`, url2, prev + out, part, fam, showsFam)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner -> family : index des années
function createPartnerFamilyYears (dir, url, prev, part, fam, showsFam) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  // Par année, unique, trié
  let years = showsFam.filter(_ => _.sorting_date_utc).map(_ => _.sorting_date_utc.slice(0, 4))
  years = [...new Set(years)]
  years = years.sort()

  const txts = []
  years.forEach(year => {
    const shows = showsFam.filter(_ => _.sorting_date_utc.slice(0, 4) === year)
      .sort((a, b) => a.sorting_date_utc.localeCompare(b.sorting_date_utc))
    const duration = shows.reduce((acc, cur) => acc + cur.duration_ms, 0)
    const dur = formatDurationHuman(duration)
    const url2 = `${url}${year}/`

    let out = ''
    out += `<div class='year'>`
    out += `<div class='year-txt'>Année </div>`
    out += `<div class='year-name' data-id='${year}'><a href="${url2}">${year}</a></div>\n`
    out += `<div class="year-stats">${shows.length} émissions, ${dur}</div>`
    out += `</div>\n`
    txts.push(out)

    createPartnerFamilyYearShows(`${dir}/${year}`, url2, prev + out, part, fam, year, shows)
  })

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + txts.join('\n'))
}

// partner -> family -> year : index des émissions
function createPartnerFamilyYearShows (dir, url, prev, part, fam, year, shows) {
  !fs.existsSync(dir) && fs.mkdirSync(dir)

  // TODO: créer une nouvelle colonne = broadcast ou sorting

  const scrRE = new RegExp('https://media.noco.tv/screenshot/([a-z]+)/[0-9x]*/(.*)')
  const mosRE = new RegExp('https://media.noco.tv/mosaique/')

  const displayShows = (shows) => {
    const txts = []
    shows.forEach((show, i) => {
      const dur = formatDurationHuman(show.duration_ms)
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
      txts.push(out)
    })
    return txts
  }

  let txts
  let out = ''

  // les émissions qui ont un episode number
  txts = displayShows(shows.filter(_ => _.episode_number !== 0))
  if (txts.length) {
    out += `<h1>${txts.length} épisode(s)</h1>\n`
    out += txts.join('\n')
    out += '<hr />'
  }
  // les autres
  txts = displayShows(shows.filter(_ => _.episode_number === 0))
  if (txts.length) {
    out += `<h1>${txts.length} rubrique(s)</h1>\n`
    out += txts.join('\n')
  }

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + out)
}

const prev = `<div class='access'><div class='access-name'><a href='by_partner/'>Partenaires</a></div></div>\n`
createPartners(outdir, 'by_partner/', prev, allpartners)

function patchScreenshots (shows) {
  let data = `
    nol/960x540/e/b/CS_S16s17s07n07_170965.jpg
    noco/960x540/9/4/AA_CSAENFANCE_2016_14612.jpg
    nol/960x540/6/c/CU_S15s38n02_3461875.jpg
    wep/960x540/b/d/HIMA_S02E13.jpg
    wep/960x540/f/d/HIMA_S02E12.jpg
    wep/960x540/b/7/HIMA_S02E11.jpg
    wep/960x540/e/f/HIMA_S02E10.jpg
    wep/960x540/6/d/FLAG_E13.jpg
    wep/960x540/5/8/HIMA_S02E09.jpg
    wep/960x540/1/a/HIMA_S02E08.jpg
    wep/960x540/6/0/FLAG_E12.jpg
    wep/960x540/0/8/HIMA_S02E07.jpg
    wep/960x540/2/8/HIMA_S02E06.jpg
    wep/960x540/7/8/FLAG_E11.jpg
    wep/960x540/8/1/HIMA_S02E05.jpg
    wep/960x540/a/e/HIMA_S02E04.jpg
    wep/960x540/e/f/FLAG_E10.jpg
    wep/960x540/8/f/HIMA_S02E03.jpg
    wep/960x540/f/e/HIMA_S02E02.jpg
    wep/960x540/a/1/FLAG_E09.jpg
    wep/960x540/c/5/HIMA_S02E01.jpg
    wep/960x540/7/e/HIMA_S01E13.jpg
    wep/960x540/2/0/FLAG_E08.jpg
    wep/960x540/7/b/HIMA_S01E12.jpg
    wep/960x540/8/f/HIMA_S01E11.jpg
    wep/960x540/9/1/FLAG_E07.jpg
    wep/960x540/0/2/HIMA_S01E10.jpg
    wep/960x540/2/7/FILM_Battlefield.jpg
    wep/960x540/f/7/HIMA_S01E09.jpg
    wep/960x540/f/f/FLAG_E06.jpg
    wep/960x540/f/9/HIMA_S01E08.jpg
    wep/960x540/4/7/HIMA_S01E07.jpg
    wep/960x540/b/c/FLAG_E05.jpg
    wep/960x540/0/0/HIMA_S01E06.jpg
    wep/960x540/a/d/HIMA_S01E05.jpg
    wep/960x540/1/5/FLAG_E01.jpg
    wep/960x540/8/4/FLAG_E02.jpg
    wep/960x540/c/a/FLAG_E03.jpg
    wep/960x540/9/0/FLAG_E04.jpg
    wep/960x540/9/8/HIMA_S01E01.jpg
    wep/960x540/6/6/HIMA_S01E02.jpg
    wep/960x540/c/2/HIMA_S01E03.jpg
    wep/960x540/6/6/HIMA_S01E04.jpg
    wep/960x540/b/8/FILM_Cromartie.jpg
    wep/960x540/d/6/FILM_Babysitter_Wanted.jpg
    wep/960x540/a/e/FILM_Assault_Girls.jpg
    gua/960x540/2/6/DAMN_E07_P1.jpg
    wep/960x540/3/5/MHC_MOCO_S02E06.jpg
    wep/960x540/c/8/MHC_MOCO_S02E05.jpg
    wep/960x540/4/6/MHC_MOCO_S02E04.jpg
    wep/960x540/3/d/MHC_MOCO_S02E03.jpg
    wep/960x540/f/7/MHC_S02E06.jpg
    wep/960x540/e/0/MHC_MOCO_S02E02.jpg
    wep/960x540/8/0/MHC_MOCO_S02E01.jpg
    wep/960x540/0/7/MHC_MOCO_S01E07.jpg
    wep/960x540/2/3/MHC_MOCO_S01E06.jpg
    wep/960x540/2/5/MHC_MOCO_S01E05.jpg
    wep/960x540/c/2/MHC_S02E05.jpg
    wep/960x540/e/7/MHC_MOCO_S01E04.jpg
    wep/960x540/c/8/MHC_MOCO_S01E03.jpg
    wep/960x540/0/9/MHC_MOCO_S01E02.jpg
    wep/960x540/5/8/MHC_MOCO_S01E01.jpg
    gua/960x540/7/0/DAMN_E07_preview.jpg
    wep/960x540/6/0/FILM_Gamera_8.jpg
    wep/960x540/6/3/MHC_S02E03.jpg
    wep/960x540/3/1/FILM_Gamera_7.jpg
    wep/960x540/b/5/MHC_S02E02.jpg
    wep/960x540/6/0/MHC_S02E01.jpg
    oly/960x540/3/b/NO_FILM1.jpg
    nol/960x540/2/2/VAC_TGE_S14_live3_3856922.jpg
    nol/960x540/5/3/VAC_TGE_S14_live1_1294140.jpg
    wep/960x540/0/8/FILM_Gamera_6.jpg
    wep/960x540/c/1/FILM_Tamara.jpg
    wep/960x540/7/0/FILM_Gamera_5.jpg
    wep/960x540/c/a/FILM_Tachiguishi.jpg
    wep/960x540/4/0/FILM_Maitre_des_Sorciers.jpg
    wep/960x540/4/b/CASH_E24.jpg
    wep/960x540/b/c/MHC_S01E06.jpg
    wep/960x540/e/c/CASH_E23.jpg
    wep/960x540/e/3/FILM_Yatterman.jpg
    wep/960x540/4/d/CASH_E22.jpg
    wep/960x540/6/7/FILM_Slaughter_Night.jpg
    wep/960x540/8/4/MHC_S01E05.jpg
    wep/960x540/5/8/CASH_E21.jpg
    wep/960x540/c/6/FILM_Tentetachance.jpg
    wep/960x540/6/0/CASH_E20.jpg
    wep/960x540/3/c/FILM_Sasquatch.jpg
    wep/960x540/4/f/MHC_S01E04.jpg
    wep/960x540/9/8/CASH_E19.jpg
    wep/960x540/3/c/FILM_Orbital.jpg
    wep/960x540/2/3/CASH_E18.jpg
    wep/960x540/a/f/FILM_MIRAGE_MAN.jpg
    wep/960x540/b/a/MHC_S01E01.jpg
    wep/960x540/0/2/MHC_S01E02.jpg
    wep/960x540/2/4/MHC_S01E03.jpg
    wep/960x540/4/3/FILM_Zebraman2.jpg
    wep/960x540/a/1/FILM_TheDarkHour.jpg
    wep/960x540/c/f/FILM_TheSkeptic.jpg
    wep/960x540/3/7/FILM_Sky-high.jpg
    wep/960x540/7/9/FILM_MERANTAU.jpg
    wep/960x540/0/b/CASH_E17.jpg
    wep/960x540/8/6/CASH_E16.jpg
    wep/960x540/a/5/CASH_E15.jpg
    wep/960x540/e/5/CASH_E14.jpg
    wep/960x540/d/a/CASH_E13.jpg
    wep/960x540/a/c/CASH_E12.jpg
    wep/960x540/b/f/CASH_E11.jpg
    wep/960x540/d/e/CASH_E10.jpg
    wep/960x540/c/2/CASH_E09.jpg
    wep/960x540/b/5/CASH_E08.jpg
    wep/960x540/2/0/CASH_E07.jpg
    wep/960x540/0/4/CASH_E06.jpg
    wep/960x540/0/c/FILM_Gamera_4.jpg
    wep/960x540/9/4/CASH_E05.jpg
    wep/960x540/2/2/FILM_TokyoGirlCop.jpg
    wep/960x540/2/e/FILM_Bangkok_Adrenaline.jpg
    wep/960x540/0/1/FILM_FireOfConscience.jpg
    wep/960x540/6/4/FILM_Gamera_1.jpg
    wep/960x540/1/2/FILM_Gamera_2.jpg
    wep/960x540/a/3/FILM_Gamera_3.jpg
    wep/960x540/d/d/FILM_Macbeth.jpg
    wep/960x540/6/c/FILM_MeatballMachine.jpg
    wep/960x540/e/e/FILM_Spiral.jpg
    wep/960x540/0/b/CASH_E01.jpg
    wep/960x540/1/f/CASH_E02.jpg
    wep/960x540/1/7/CASH_E03.jpg
    wep/960x540/b/b/CASH_E04.jpg
    tok/960x540/3/9/COOL_E06.jpg
    tok/960x540/0/1/LUCI_E07.jpg
    lbl/960x540/2/1/GUI_S05E09.jpg
    tok/960x540/6/0/COOL_E01.jpg
    lbl/960x540/1/c/GUI_S02E12.jpg
    lbl/960x540/8/5/GUI_S02E02.jpg
    oly/960x540/4/0/NO_S05E11.jpg
    oly/960x540/c/7/NO_S05E10.jpg
    noco/960x540/b/7/NO_Conference_noco.jpg
    nol/960x540/e/5/VAC_AtticAie_S13n03_NolifeE_273052.jpg
    nol/960x540/0/8/VAC_CL_S12_10_81329.jpg
    nol/960x540/9/2/VAC_CL_S12_08_71190.jpg
    nol/960x540/a/4/VAC_CL_S12_03_122263.jpg
    gua/960x540/b/3/FL_S04E19.jpg
    gua/960x540/d/f/FL_S04E18.jpg
    gua/960x540/b/6/FL_S04E17.jpg
    gua/960x540/4/7/FL_S04E15.jpg
    gua/960x540/0/6/FL_S04E14.jpg
    gua/960x540/9/b/FL_S04E13.jpg
    gua/960x540/1/1/FL_S04E12.jpg
    gua/960x540/1/c/FL_S04E11.jpg
    gua/960x540/d/5/FL_S04E10.jpg
    gua/960x540/e/0/FL_S04E09.jpg
    nol/960x540/a/4/SEC_S10s01n07_53883.jpg
    nol/960x540/d/f/SEC_S10s52n03_41332.jpg
    gua/960x540/4/f/FL_S04E08.jpg
    gua/960x540/5/5/FL_S04E06.jpg
    gua/960x540/3/5/FL_S04E05.jpg
    gua/960x540/6/6/FL_S04E03.jpg
    gua/960x540/3/8/FL_S04E02.jpg
    gua/960x540/3/f/FL_S04E01.jpg
    gua/960x540/f/1/FL_S03E20.jpg
    gua/960x540/5/7/FL_S03E19.jpg
    gua/960x540/f/8/FL_S03E18.jpg
    gua/960x540/f/2/FL_S03E17.jpg
    gua/960x540/2/b/FL_S03E16.jpg
    gua/960x540/6/1/FL_S03E15.jpg
    gua/960x540/4/8/FL_S03E14.jpg
    gua/960x540/3/2/FL_S03E12.jpg
    gua/960x540/f/3/FL_S03SP02.jpg
    gua/960x540/7/b/FL_S03E11.jpg
    gua/960x540/4/5/FL_S03E10.jpg
    gua/960x540/a/7/FL_S03E09.jpg
    gua/960x540/4/4/FL_S03E08.jpg
    gua/960x540/3/7/FL_S03E07.jpg
    gua/960x540/c/1/FL_S03E06.jpg
    gua/960x540/1/5/FL_S03E05.jpg
    gua/960x540/5/f/FL_S03E04.jpg
    gua/960x540/8/0/FL_S03SP01.jpg
    gua/960x540/5/3/FL_S03_POWERPARTY.jpg
    gua/960x540/4/7/FL_S03E03.jpg
    gua/960x540/e/a/FL_S03E02.jpg
    gua/960x540/3/4/FL_S03E01.jpg
    gua/960x540/f/b/FL_S02E20.jpg
    gua/960x540/2/8/DAMN_E63.jpg
    gua/960x540/0/3/FL_S02E19.jpg
    gua/960x540/c/f/FL_S02E18.jpg
    gua/960x540/6/e/FL_S02E17.jpg
    gua/960x540/f/b/FL_S02E16.jpg
    gua/960x540/f/7/FL_S02E15.jpg
    gua/960x540/4/f/FL_S02E14.jpg
    gua/960x540/1/c/FL_S02E13.jpg
    gua/960x540/8/4/FL_S02E12.jpg
    gua/960x540/2/6/FL_S02E11.jpg
    gua/960x540/8/d/FL_S02E10.jpg
    gua/960x540/3/3/FL_S02E09.jpg
    gua/960x540/c/a/FL_S02E08.jpg
    gua/960x540/6/d/FL_S02E07.jpg
    gua/960x540/7/6/FL_S02E06.jpg
    gua/960x540/7/5/FL_S02E05.jpg
    gua/960x540/9/d/FL_S02E04.jpg
    gua/960x540/1/3/FL_S02E03.jpg
    gua/960x540/3/c/FL_S02E02.jpg
    gua/960x540/9/4/FL_S02E01.jpg
    gua/960x540/a/1/FL_S01E19.jpg
    gua/960x540/0/5/FL_S01E18.jpg
    gua/960x540/e/b/FL_S01E17.jpg
    gua/960x540/9/e/FL_S01E16.jpg
    gua/960x540/8/5/FL_S01E15.jpg
    gua/960x540/2/4/FL_S01E14.jpg
    gua/960x540/0/8/FL_S01E13.jpg
    gua/960x540/6/b/FL_S01E12.jpg
    gua/960x540/2/7/FL_S01E11.jpg
    gua/960x540/b/9/FL_S01E10.jpg
    gua/960x540/1/3/FL_S01E09.jpg
    gua/960x540/9/d/FL_S01E08.jpg
    gua/960x540/4/a/FL_S01E07.jpg
    gua/960x540/5/3/FL_S01E06.jpg
    gua/960x540/1/7/FL_S01E05.jpg
    gua/960x540/9/7/FL_S01E04.jpg
    gua/960x540/c/c/FL_S01E03.jpg
    gua/960x540/0/0/FL_S01E02.jpg
    gua/960x540/f/f/FL_S01E01.jpg
    gua/960x540/8/6/DAMN_E62.jpg
    gua/960x540/d/0/DAMN_E61.jpg
    gua/960x540/0/8/DAMN_E52.jpg
    gua/960x540/2/e/DAMN_E51.jpg
    gua/960x540/e/9/DAMN_D4betisier.jpg
    gua/960x540/c/7/DAMN_E04.jpg
    gua/960x540/b/0/DAMN_E03.jpg
    wep/512x288/9/1/MHC_S02E04.jpg
    tok/512x288/5/4/LUCI_E06.jpg
    lbl/512x288/6/2/GUI_S05E04.jpg
    nol/512x288/7/8/VAC_AtticAie_S13n02_MonSouv_44964.jpg
    nol/256x144/9/2/EL_S11s11_1374165.jpg
    nol/256x144/e/4/EX_S9s07n15xxx_1616000.jpg
    tok/0x0/2/5/NEED_E02.jpg
    tok/0x0/5/0/KISS_E01.jpg
    lbl/0x0/0/0/GUI_S02E11.jpg
    nol/0x0/3/1/VAC_AtticAie_S13n05_RevesEt_138387.jpg
    nol/0x0/4/3/VAC_CL_S12_09_52450.jpg
    nol/0x0/2/9/VAC_CL_S12_04_94389.jpg
    nol/0x0/1/3/VAC_CL_S12_02_85843.jpg
    nol/0x0/b/0/AP_TNL_S12s35n22_7598.jpg
  `
  data = data.split('\n').map(_ => _.trim()).filter(_ => _.length)
  const re = new RegExp('^([a-z]{3,4})/[0-9]+x[0-9]+/(.*)$')

  data.forEach(pat => {
    const pat2 = pat.replace(re, '$1/1024x576/$2')
    const sh = shows.filter(s => s.screenshot_1024x576.slice(33) === pat2)
    sh.forEach(s => {
      let repl = ''
      if (pat.indexOf('/0x0/') === -1) {
        repl = s.screenshot_1024x576.slice(0, 33) + pat
      }
      s.screenshot_1024x576 = repl
    })
  })
}

function patchMosaiques (shows) {
  let data = `
    nol/8/e/RM_S17s02_0e028390a91f14db6f040711e47a9312.jpg
    nol/4/6/CS_S17s02n02_c160374f90a36f61e61325f00f078743.jpg
    nol/d/1/CU_S17s02n02_NEWS_88e8dab113d12de671bad9a04901007f.jpg
    nol/b/8/CU_S17s02n02_2eff918b849fd3d0ac2a4e31b6226eca.jpg
    nol/7/1/56K_S16s19_cb0d292972776caccd468dbfddc07c4c.jpg
    nol/b/4/TIPS_S14s21_fcac556660e204f49dc60a08232910e3.jpg
    nol/9/3/DM_S14s21_4fea11981f52c36f57e864fb13aae8e8.jpg
    nol/2/d/CS_S14s21n01_04d99185a9fa30eaaba332108ae3b9f5.jpg
    nol/5/6/CU_S14s21n01_fbdcc366da8132788db07f91654f3403.jpg
    nol/d/f/CS_S14s20n05_9e1c95477ba1adc000c356434aa7a698.jpg
    nol/9/1/OPL_S14s18_ff8a6f55931f5164e7c45287702709f3.jpg
    nol/a/5/RM_S14s16n306_d31b72d578324e1fd9faa76e17dfd666.jpg
    nol/7/e/RM_S14s16n305_d338a7391b6fcf3a835b3bbce8e6fc27.jpg
    nol/4/0/JET_S14s10xxx_411d4df0c3e4d64f2e8948958311f5fc.jpg
    nol/a/c/MOS_S14s10_4d702f41ef31a35cbdff039f185a8011.jpg
    nol/a/4/OPL_S14s09_cbfbdcab47d8e0b13e20f34b9f5bee5f.jpg
    nol/d/e/PTB_S14s07_aaa653df1b48222125f11727eedc66f0.jpg
    nol/d/1/CU_S14s05n05_a92be9f3c130a068414a32ce2cd34f89.jpg
    nol/1/a/CU_S14s05n03_faeb7f422c62467e1718953bd9727f6d.jpg
    nol/f/a/CU_S14s05n02_c62ea0d2be28dd43591ac6cad44e0fc9.jpg
    nol/8/2/CU_S14s05n01_11c4ab4d00d32dee2756231a66081184.jpg
    nol/1/5/CU_S14s04n05_c442e7f44c5c8a4e8504150567fc2af2.jpg
    oly/6/7/NO_S13s45_deed4c6615894a97d56480a57e6722ca.jpg
    nol/1/d/AP_TNL_S12s35n25_cb322880957edd922981ec842f968911.jpg
    nol/5/8/AP_TNL_S12s35n24_c506cbe9244258a84f07e576833e571b.jpg
    nol/2/9/AP_TNL_S12s35n20_4ed1c7e2c33d90f808150e96e857b328.jpg
    nol/e/6/AP_TNL_S12s35n19_4edf24e69de9eb8d8a2419603ba36417.jpg
    nol/d/b/AP_TNL_S12s35n23_52da066c5bb4d215026b644ac754647a.jpg
    nol/9/f/AP_TNL_S12s35n22_edcb312566784563a8609a51c3fc687b.jpg
    nol/6/2/AP_TNL_S12s35n18_5e47a39bd69fbd0635241739a71b2b40.jpg
    nol/a/5/AP_TNL_S12s35n21_9ed1e041a336e8045fa123183923376a.jpg
    nol/4/3/AP_TNL_S12s35n17_447b20902b018ca3400946b34d1450b3.jpg
    nol/9/c/AP_TNL_S12s35n14_2c04d4ef39336c30a3d41403a8135659.jpg
    nol/8/e/AP_TNL_S12s35n13_b08f056acec5baa0345e205c08c76dfc.jpg
    nol/d/8/AP_TNL_S12s35n15_160cc8856c8416d2397d89bb06321308.jpg
    nol/d/b/AP_TNL_S12s35n16_ba8e03eeeec0e74fe96538fb00520c2a.jpg
    nol/6/5/AP_TNL_S12s35n12_85b4957ceb711632f1ed38af2f39a61c.jpg
    nol/2/4/AP_TNL_S12s35n11_3cc68f7614b5a873956b45cc8a00452b.jpg
  `
  data = data.split('\n').map(_ => _.trim()).filter(_ => _.length)

  data.forEach(pat => {
    const sh = shows.filter(s => s.mosaique.slice(31) === pat)
    sh.forEach(s => {
      s.mosaique = ''
    })
  })
}

function patchFamilies (fams) {
  // ces familles n'ont pas d'icone ni banner
  'BOJ DL J-5 KES'.split(' ').forEach(fk => {
    const fam = fams.find(f => f.family_key === fk)
    fam.icon_1024x576 = ''
    fam.banner_family = ''
  })
  // cette famille n'a pas d'icone, mais a une banner que j'ai transformé en icone
  const fam = fams.find(f => f.family_key === 'PLS')
  fam.icon_1024x576 = 'https://media.noco.tv/family/icon/nol/960x540/pls.jpg'
}

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
