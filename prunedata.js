const nocodata = require('./noco-data/noco-data')

// Les contstantes
const PARTNER_NOLIFE = '1'
const FAMILY_CU = '3'
const FAMILY_CI = '413'
const TYPE_AP = '4'

// Les titres des émissions "101%"" et "Le continue de l'info" sont très majoritairement
// formé de la date du jour
// a faire avant que broadcast_date_utc soit réduit
function dedupDateCU (allshows) {
  allshows.filter(s => [FAMILY_CU, FAMILY_CI].includes(s.id_family.toString())).forEach(show => {
    const dow = 'Dimanche,Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi'
    const months = 'janvier,février,mars,avril,mai,juin,juillet,aout,septembre,octobre,novembre,décembre'
    const a = new Date(show.broadcast_date_utc)
    const datnew = dow.split(',')[a.getDay()] + ' ' +
      a.getDate().toString().replace(/^1$/, '1er') + ' ' + months.split(',')[a.getMonth()] +
      ' ' + a.getFullYear()
    if (show.show_TT === null) {
      // exception: met _ et en le remplacement par chaine vide à l'affichage
      show.show_TT = '_'
    } else if (show.show_TT === datnew) {
      show.show_TT = ''
    }
  })
}
dedupDateCU(nocodata.shows)

const partners = nocodata.partners.map(_ => [
  _.id_partner.toString(),
  _.partner_key,
  _.partner_name,
  _.partner_shortname,
  _.partner_resume ? _.partner_resume : '',
  _.partner_subtitle ? _.partner_subtitle : ''
])

const themes = nocodata.themes.map(_ => [
  _.id_theme.toString(),
  _.theme_name
])

const types = nocodata.types.map(_ => [
  _.id_type.toString(),
  _.type_name
])

const families = nocodata.families.map(_ => [
  _.id_family.toString(),
  _.family_key,
  _.id_partner.toString(),
  _.family_TT,
  _.id_theme.toString(),
  _.id_type.toString(),
  _.icon_1024x576.replace('https://media.noco.tv/family/icon/', '').replace(/\/\d{1,4}x\d{3}\//, '/'),
  _.family_resume && _.family_resume.length ? _.family_resume : '',
  _.family_OT !== _.family_TT ? `${_.family_OT} (${_.OT_lang})` : ''])

// trie par sorting_date_utc, permet de ne pas garder qu'une partie de "sorting_date_utc"
const shows = nocodata.shows.sort((a, b) => (a.sorting_date_utc + a.show_key).localeCompare(b.sorting_date_utc + b.show_key)).map(_ => [
  _.id_show.toString(),
  _.show_key,
  _.id_family.toString(),
  _.id_type.toString(),
  _.show_resume && _.show_resume.length ? _.show_resume : '',
  _.season_number > 0 ? _.season_number.toString() : '',
  _.episode_number > 0 ? _.episode_number.toString() : '',
  // uniquement si != du family_TT de la famille
  _.family_TT === nocodata.families.find(f => f.id_family === _.id_family).family_TT ? '' : _.family_TT,
  _.show_TT && _.show_TT.toString().length ? _.show_TT.toString() : '',
  (_.screenshot_1024x576.indexOf('https://media.noco.tv/screenshot/') === 0 ? _.screenshot_1024x576.replace(/^https:\/\/media.noco.tv\/screenshot\/[a-z]{3,4}\/\d{1,4}x\d{3}\/([0-9a-z])\/([0-9a-z])\//, '$1/$2/')
    : _.screenshot_1024x576.indexOf('https://media.noco.tv/family/icon/') === 0 ? _.screenshot_1024x576.replace(/^https:\/\/media.noco.tv\/family\/icon\/[a-z]{3,4}\//, '/') : _.screenshot_1024x576)
    .replace(/\.jpg$/, ''),
  '',
  _.mosaique.replace(/^https:\/\/media.noco.tv\/mosaique\/[a-z]{3,4}\/([0-9a-z])\/([0-9a-z])\//, '$1/$2/').replace(/\.jpg$/, ''),
  _.duration_ms.toString(),
  // ne garde que les deux derniers chiffres de l'année (sans le zéro)
  _.sorting_date_utc.slice(2, 4).replace(/^0+(.+)/, '$1'),
  // enlève les séprarateurs et les deux premiers chiffres de l'année (sans le zéro)
  _.broadcast_date_utc && _.broadcast_date_utc.length ? _.broadcast_date_utc.slice(2).replace(/[: -]/g, '').replace(/^0+(.+)/, '$1') : ''
])

const nd = {
  PARTNER_NOLIFE,
  FAMILY_CU,
  FAMILY_CI,
  TYPE_AP,
  PA: { id_partner: 0, partner_key: 1, partner_name: 2, partner_shortname: 3, partner_resume: 4, partner_subtitle: 5 },
  TH: { id_theme: 0, theme_name: 1 },
  TY: { id_type: 0, type_name: 1 },
  SH: { id_show: 0, show_key: 1, id_family: 2, id_type: 3, show_resume: 4, season_number: 5, episode_number: 6, family_TT: 7, show_TT: 8, screenshot: 9, scrkey: 10, mosaique: 11, duration_ms: 12, sorting_year: 13, broadcast_date_utc: 14 },
  FA: { id_family: 0, family_key: 1, id_partner: 2, family_TT: 3, id_theme: 4, id_type: 5, icon_1024x576: 6, family_resume: 7, family_OT: 8 },
  partners,
  types,
  themes,
  families,
  shows
}

// screenshots commencent en général par show_key, puis _ puis une chaine
// les exceptions sont réécrites
function patchScreenshots (shows) {
  const def = [
    [ 5049, 'MOS_S9s05n15' ],
    [ 4572, 'JTSR_S11s09' ],
    [ 559, 'CM_S11s20n208' ],
    [ 4022, 'FA_bitoman14' ],
    [ 8614, 'EC_S11s28' ],
    [ 7220, 'SO18_s13s12n76xxx' ],
    [ 3988, 'EX_S13s13n35xxx' ],
    [ 3935, 'EL_S14S03' ],
    [ 222, 'AT_S14s04' ],
    [ 11000, 'PUR_S14s11n07_résumé_pré_épisode' ],
    [ 10997, 'PUR_S14s11n07_mof_post_épisode' ],
    [ 11532, 'RM_S14S16n305' ],
    [ 11535, 'RM_S14S16n306' ],
    [ 32148, 'CUP_S16S16n01_P04_ITW' ],
    [ 32253, 'CUP_S16S16n01_P05_JMUSIC_PUB' ],
    [ 32154, 'CUP_S16S16n01_P06_ITW' ],
    [ 32256, 'CUP_S16S16n01_P07_PN_PUB' ],
    [ 32160, 'CUP_S16S16n01_P08_PTB' ],
    [ 32692, 'J-5_S16s13' ],
    [ 35080, '56k_S16s39' ],
    [ 40228, 'EMN_S17s12' ],
    [ 41728, 'CS_s17s20n03' ],
    [ 45119, 'NWJ_S17s40n05H' ],
    [ 47675, 'NW_S17s49n03A' ],
    [ 47852, 'NW_S17s50n05A' ],
    [ 48263, 'NW_S17s51n05M' ]
  ]

  shows.forEach(show => {
    const scr = show[nd.SH.screenshot]
    if (scr === '') { return }
    if (scr[0] === '/') { return }
    const idx = scr.indexOf(show[nd.SH.show_key])
    if (idx === 4) {
      show[nd.SH.screenshot] = scr.replace(show[nd.SH.show_key], '')
    } else {
      const patch = def.find(_ => _[0].toString() === show[0])
      if (!patch) { throw new Error(`cannot find show patch for ${show[0]}`) }
      show[nd.SH.screenshot] = scr.replace(`${patch[1]}_`, '')
      show[nd.SH.scrkey] = patch[1]
    }
    show[nd.SH.screenshot] = show[nd.SH.screenshot].replace(/([0-9a-z])\/([0-9a-z])\/_?(.*)/, '$1$2$3')
  })
}
patchScreenshots(shows)

// Mosaiques:
// Enlève le séparateur a/b/cdefgh -> abcdefgh
// Elles sont hashées, la séquence "73a1" sont majoritaires à la fin. (pas énormément)
function dedupMosaiques (shows) {
  shows.forEach(show => {
    let scr = show[nd.SH.mosaique]
    if (scr === '') { return }
    scr = scr.replace(show[nd.SH.show_key] + '_', '')
      .replace(/([0-9a-z])\/([0-9a-z])\/_?(.*)/, '$1$2$3')
      .replace(/(73a1|3a1|a1|1)$/, '')
    show[nd.SH.mosaique] = scr
  })
}
dedupMosaiques(shows)

// Supprime le début de show_key quand il est identique à family_key
function dedupShowKeys (families, allshows) {
  families.forEach(f => {
    const fid = f[nd.FA.id_family]
    const fkey = f[nd.FA.family_key] + '_'
    let shows
    // les shows normaux:
    // si show_key commence par `${family_key}_`: enlève ce préfixe
    // sinon, fait précéder show_key par '_'
    shows = allshows.filter(s => s[nd.SH.id_family] === fid && s[nd.SH.id_type] !== TYPE_AP)
    shows.forEach(show => {
      const skey = show[nd.SH.show_key]
      if (skey.indexOf(fkey) === 0) {
        show[nd.SH.show_key] = show[nd.SH.show_key].slice(fkey.length)
        if (show[nd.SH.show_key][0] === '_') {
          throw new Error(`show_key=${skey} has multiple _`)
        }
      } else {
        show[nd.SH.show_key] = `_${show[nd.SH.show_key]}`
      }
    })
    // les BA
    shows = allshows.filter(s => s[nd.SH.id_family] === fid && s[nd.SH.id_type] === TYPE_AP)
    shows.forEach(show => {
      const skey = show[nd.SH.show_key]
      if (skey.indexOf('AP_') !== 0) {
        throw new Error(`AP: show key does not begin with AP_`)
      }
      show[nd.SH.show_key] = skey.replace(/^AP_/, '')
    })
  })
}
dedupShowKeys(families, shows)

// Supprime le numéro de saison au début de show_key. A faire
// après "Supprime le début de show_key quand il est identique à family_key"
// show_key est lui même généré à partir de show_key et family_key
function dedupSeason (families, allshows) {
  const restoreDate = (a) => {
    a = ('00000000000' + a).slice(-12)
    a = a.replace(/^(\d\d)(\d\d).*/, '$1-$2')
    a = (parseInt(a) > 18 ? '19' : '20') + a
    return a
  }

  // Uniquement pour Partner Nolife
  families.filter(f => f[nd.FA.id_partner] === PARTNER_NOLIFE).forEach(f => {
    const shows = allshows.filter(s => s[nd.SH.broadcast_date_utc] && s[nd.SH.id_family] === f[nd.FA.id_family])
    shows.forEach(show => {
      const date = restoreDate(show[nd.SH.broadcast_date_utc])
      // S1 -> S12: janvier à aout: S(n), septembre à décembre: S(n+1)
      // S13 -> S18: une saison par année janvier à décembre
      const season = 'S' + (parseInt(date) >= 2013 ? date.slice(2, 4)
        : (parseInt(date) - 2006) * 2 - (parseInt(date.slice(5)) < 9))
      if (show[nd.SH.show_key].indexOf(season) === 0) {
        show[nd.SH.show_key] = show[nd.SH.show_key].slice(season.length)
      } else if (show[nd.SH.show_key][0] === '-') {
        throw new Error('show_key begin with -')
      } else {
        show[nd.SH.show_key] = '-' + show[nd.SH.show_key]
      }
    })
  })
}
dedupSeason(families, shows)

// les icones des familles sont toutes formées de partner_key/family_key.jpg
function dedupFamilies (families, partners) {
  families.forEach(f => {
    const fkey = f[nd.FA.family_key]
    const part = partners.find(p => p[0] === f[nd.FA.id_partner])
    const icon = f[nd.FA.icon_1024x576]
    const icon2 = `${part[nd.PA.partner_key]}/${fkey}.jpg`.toLowerCase()
    if (icon === '') {
      f[nd.FA.icon_1024x576] = '_'
    } else if (icon === icon2) {
      f[nd.FA.icon_1024x576] = ''
    } else {
      throw new Error(`NOK for ${f[0]} ${icon} ${icon2}`)
    }
  })
}
dedupFamilies(families, partners)

// before saving, compact object definitions
Object.keys(nd).forEach(itm => {
  if (itm.length === 2) {
    nd[itm] = Object.keys(nd[itm]).join(' ')
  } else if (itm.indexOf('_') === -1) {
    // data: join everything
    nd[itm] = nd[itm].map(o => o.join('§'))
  } else {
    // constants: keep it like that
  }
})

const fs = require('fs')
fs.writeFileSync('noco-small.json', JSON.stringify(nd, null, 1))
