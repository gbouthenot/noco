const nocodata = require('./noco-data/noco-data')

const partners = nocodata.partners.map(_ => [
  _.id_partner,
  _.partner_key,
  _.partner_name,
  _.partner_shortname,
  _.partner_resume,
  _.partner_subtitle
])

const themes = nocodata.themes.map(_ => [
  _.id_theme,
  _.theme_name
])

const types = nocodata.types.map(_ => [
  _.id_type,
  _.type_name
])

const families = nocodata.families.map(_ => [
  _.id_family,
  _.family_key,
  _.id_partner,
  _.family_TT,
  _.id_theme,
  _.id_type,
  _.icon_1024x576.replace('https://media.noco.tv/family/icon/', '').replace(/\/\d{1,4}x\d{3}\//, '/'),
  _.family_resume && _.family_resume.length ? _.family_resume : '',
  _.family_OT !== _.family_TT ? `${_.family_OT} (${_.OT_lang})` : ''])

// trie par sorting_date_utc, permet de ne pas avoir champ complet
const shows = nocodata.shows.sort((a, b) => (a.sorting_date_utc + a.show_key).localeCompare(b.sorting_date_utc + b.show_key)).map(_ => [
  _.id_show,
  _.show_key,
  _.id_family,
  _.id_type,
  _.show_resume && _.show_resume.length ? _.show_resume : '',
  _.season_number,
  _.episode_number,
  _.family_TT,
  _.show_TT && _.show_TT.toString().length ? _.show_TT.toString() : '',
  (_.screenshot_1024x576.indexOf('https://media.noco.tv/screenshot/') === 0 ? _.screenshot_1024x576.replace(/^https:\/\/media.noco.tv\/screenshot\/[a-z]{3,4}\/\d{1,4}x\d{3}\/([0-9a-z])\/([0-9a-z])\//, '$1/$2/')
    : _.screenshot_1024x576.indexOf('https://media.noco.tv/family/icon/') === 0 ? _.screenshot_1024x576.replace(/^https:\/\/media.noco.tv\/family\/icon\/[a-z]{3,4}\//, '/') : _.screenshot_1024x576)
    .replace(/\.jpg$/, ''),
  '',
  _.mosaique.replace(/^https:\/\/media.noco.tv\/mosaique\/[a-z]{3,4}\/([0-9a-z])\/([0-9a-z])\//, '$1/$2/').replace(/\.jpg$/, ''),
  _.duration_ms,
  parseInt(_.sorting_date_utc.slice(2, 4)),
  _.broadcast_date_utc && _.broadcast_date_utc.length ? parseInt(_.broadcast_date_utc.slice(2).replace(/[: -]/g, '')) : 0
])

// console.log(families)
// TODO: il y a des exceptions pour screenshot

// partners.forEach(_ => {
//   console.log(_[3])
// })
const nd = {
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
      const patch = def.find(_ => _[0] === show[0])
      if (!patch) { throw new Error(`cannot find show patch for ${show[0]}`) }
      show[nd.SH.screenshot] = scr.replace(`${patch[1]}_`, '')
      show[nd.SH.scrkey] = patch[1]
    }
    show[nd.SH.screenshot] = show[nd.SH.screenshot].replace(/([0-9a-z])\/([0-9a-z])\/_?(.*)/, '$1$2$3')
  })
  // def.forEach(d => {
  //   const show = shows.find(s => s[0] === d[0])
  //   if (!show) { throw new Error('cannot find show') }
  //   console.log(show[nd.SH.screenshot], d[2], show[nd.SH.show_key])
  // })
}
patchScreenshots(shows)

const fs = require('fs')
fs.writeFileSync('noco-small.json', JSON.stringify(nd, null, 0))
// fs.writeFileSync('noco-small-2.json', JSON.stringify(nd, null, 2))

//
// famshows=nosmall.families.map(f => nosmall.shows.filter(s => s[nd.SH.id_family] === f[nd.FA.id_family]))
// parfams = nosmall.partners.map(p=>[p[0], nosmall.families.filter(f => f[2]===p[0])]);
// parfamids = nosmall.partners.map(p=>[p[0], nosmall.families.filter(f => f[2]===p[0]).map(f => f[0])]);
//   [ [ 18, [ 266, 269 ] ], ...]
//   [ [ partner_id, [ id_family, ...] ], ... ]
//
// parfamshows = nosmall.partners.map(p=>[p[0], nosmall.families.filter(f => f[2]===p[0]).map(f => nosmall.shows.filter(sh => sh[nd.SH.id_family]===f[0])).reduce((a, b) => a.concat(b), [])])
// parfamshows.map(p=>[p[0], p[1].length])
// les partners et leurs shows:
// [ [ 18, 92 ],
//   [ 12, 58 ],
//   [ 26, 3 ],
//   [ 1, 15355 ],
//   [ 4, 134 ],
//   [ 9, 68 ],
//   [ 24, 121 ] ]
// vérification que les mosaiques/screenshots commencencent toutes par "partner_key/" ou "/partner_key/":
// parfamshows.map(p=>[p[0], [...new Set(p[1].map(s => s[nd.SH.mosaique].slice(0,5)))]])

// les screenshots qui ne correpondent pas avec show_key:
// nosmall.shows.filter(_=>_[9]!=="" && _[9][0]!=='/').map(_=>[_[0], _[9], _[1], _[9].indexOf(_[1])]).filter(_=>_[3]!==4)
