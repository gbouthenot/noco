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

patch(allshows)
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
    out += `<div class='partner'>`
    out += `  <div class='part-icn'><img src='${icn}' /></div>`
    out += `  <div class='part-desc'>`
    out += `    <div class="part-name" data-id='${part.id_partner}'><a href="${url2}">${part.partner_name}</a></div>\n`
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
    const icn = `${nocomedia}family_160x90/${part.partner_key.toLowerCase()}/${fam.family_key.toLowerCase()}.jpg`

    let out = ''
    out += `<div class='family'>`
    out += `  <div class='fam-icn'><img src='${icn}' /></div>`
    out += `  <div class='fam-desc'>`
    out += `    <div class='fam-name' data-id='${fam.id_family}'><a href="${url2}">${fam.family_TT}</a></div>\n`
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
    out += `<div class='year-name' data-id='${year}'><a href="${url2}">Année ${year}</a></div>\n`
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
      txts.push(out)
    })
    return txts
  }

  let txts
  let out = ''

  // les émissions qui ont un episode number
  txts = displayShows(shows.filter(_ => _.episode_number !== 0))
  if (txts.length) {
    out += '<h1>Épisodes</h1>\n'
    out += txts.join('\n')
    out += '<hr />'
  }
  // les autres
  txts = displayShows(shows.filter(_ => _.episode_number === 0))
  if (txts.length) {
    out += '<h1>Rubriques</h1>\n'
    out += txts.join('\n')
  }

  fs.writeFileSync(`${dir}/index.html`, headers(prev) + out)
}

const prev = `<div class='access'><div class='access-name'><a href='by_partner/'>Partenaires</a></div></div>\n`
createPartners(outdir, 'by_partner/', prev, allpartners)

function patch(shows) {
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
