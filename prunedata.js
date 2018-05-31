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
  (_.screenshot_1024x576.indexOf('https://media.noco.tv/screenshot/') === 0 ? _.screenshot_1024x576.replace('https://media.noco.tv/screenshot/', '').replace(/\/\d{1,4}x\d{3}\//, '/')
    : _.screenshot_1024x576.indexOf('https://media.noco.tv/family/icon/') === 0 ? _.screenshot_1024x576.replace('https://media.noco.tv/family/icon', '') : _.screenshot_1024x576)
    .replace(/\.jpg$/, ''),
  _.mosaique.replace('https://media.noco.tv/mosaique/', '').replace(/\/\d{1,4}x\d{3}\//, '/').replace(/\.jpg$/, ''),
  _.duration_ms,
  parseInt(_.sorting_date_utc.slice(2, 4)),
  _.broadcast_date_utc && _.broadcast_date_utc.length ? parseInt(_.broadcast_date_utc.slice(2).replace(/[: -]/g, '')) : 0
])

// console.log(families)
// TODO: il y a des exceptions pour screenshot

// partners.forEach(_ => {
//   console.log(_[3])
// })
const newdata = {
  PA: { id_partner: 0, partner_key: 1, partner_name: 2, partner_shortname: 3, partner_resume: 4, partner_subtitle: 5 },
  TH: { id_theme: 0, theme_name: 1 },
  TY: { id_type: 0, type_name: 1 },
  SH: { id_show: 0, show_key: 1, id_family: 2, id_type: 3, show_resume: 4, season_number: 5, episode_number: 6, family_TT: 7, show_TT: 8, screenshot: 9, mosaique: 10, duration_ms: 11, sorting_year: 12, broadcast_date_utc: 13 },
  FA: { id_family: 0, family_key: 1, id_partner: 2, family_TT: 3, id_theme: 4, id_type: 5, icon_1024x576: 6, family_resume: 7, family_OT: 8 },
  partners,
  types,
  themes,
  families,
  shows
}

const fs = require('fs')
fs.writeFileSync('noco-small.json', JSON.stringify(newdata, null, 0))
// fs.writeFileSync('noco-small-2.json', JSON.stringify(newdata, null, 2))

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
