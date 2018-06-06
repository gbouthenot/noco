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

// a faire avant que broadcast_date_utc soit réduit
function dedupDateCU (allshows) {
  allshows.filter(s => s.id_family === 3).forEach(show => {
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

// trie par sorting_date_utc, permet de ne pas avoir champ complet
const shows = nocodata.shows.sort((a, b) => (a.sorting_date_utc + a.show_key).localeCompare(b.sorting_date_utc + b.show_key)).map(_ => [
  _.id_show,
  _.show_key,
  _.id_family,
  _.id_type,
  _.show_resume && _.show_resume.length ? _.show_resume : '',
  _.season_number,
  _.episode_number,
  _.family_TT === nocodata.families.find(f => f.id_family === _.id_family).family_TT ? '' : _.family_TT,
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
}
patchScreenshots(shows)

function dedupMosaiques (shows) {
  shows.forEach(show => {
    let scr = show[nd.SH.mosaique]
    if (scr === '') { return }
    scr = scr.replace(show[nd.SH.show_key] + '_', '')
      .replace(/([0-9a-z])\/([0-9a-z])\/_?(.*)/, '$1$2$3')
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
    shows = allshows.filter(s => s[nd.SH.id_family] === fid && s[nd.SH.id_type] !== 4)
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
    shows = allshows.filter(s => s[nd.SH.id_family] === fid && s[nd.SH.id_type] === 4)
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

const fs = require('fs')
fs.writeFileSync('noco-small.json', JSON.stringify(nd, null, 0))
fs.writeFileSync('noco-small-2.json', JSON.stringify(nd, null, 2))

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
// les mosaiques qui ne correspondent pas avec show_key:
// nosmall.shows.filter(_=>_[11]!=="").map(_=>[_[0], _[11], _[1], _[11].indexOf(_[1]+'_')]).filter(_=>_[3]!==4)
// [ [ 24963, '8/d/VAC_LR AJIKAN_689883edfc07ff723b7b8910220e9c31', 'VAC_LRAJIKAN', -1 ] ]

// non concordance show_key avec family_key:
// a=0;b=0;nocodata.families.forEach(family=>{fid=family.id_family; fkey=family.family_key; l=fkey.length; shows=nocodata.shows.filter(s=>s.id_family===fid && s.type_key!=='AP'); sho=shows.filter(s=>s.show_key.slice(0,l+1)!==(fkey+'_')); console.log(`Famille ${family.family_key} (${family.family_TT}): ${sho.length} / ${shows.length}`); a+=shows.length; b+=sho.length}); console.log(`total: ${b} / ${a} vidéos non concordantes`);
// Famille POL ((Vous savez) Pourquoi on est là): 0 / 80
// Famille CUP (101 PUR 100): 0 / 137
// Famille CU (101%): 2 / 1975
// Famille 1D6 (1D6): 0 / 143
// Famille 3MPP (3mn pas + pour parler d'un jeu 3+): 17 / 87
// Famille 56K (56Kast): 0 / 124
// Famille ALAV (À lire, à voir): 0 / 117
// Famille AT (À Table !): 0 / 20
// Famille ANN (Annonces): 2 / 2
// Famille AH (Another Hero): 0 / 15
// Famille BD (BD Blogueurs): 0 / 8
// Famille BOJ (À la découverte des beautés inconnues du Japon): 0 / 0
// Famille BBAH (Big Bang Hunter): 0 / 30
// Famille BBH (Big Bug Hunter): 0 / 47
// Famille CDB (Ça déboîte !): 0 / 38
// Famille CASH (Casshern Sins): 0 / 24
// Famille CK (Catsuka): 2 / 179
// Famille CQFD (Ce qu'il ne faut pas dire): 0 / 14
// Famille RA (Ce soir j'ai raid): 0 / 10
// Famille CT (Chaud Time): 0 / 33
// Famille CM (Chez Marcus): 5 / 446
// Famille SO18 (Classés 18+): 8 / 146
// Famille CTAC (Club Télé Achier): 0 / 6
// Famille CQ (Collector's Quest): 0 / 18
// Famille CPL (Compiler): 0 / 44
// Famille CP (Costume Player): 21 / 52
// Famille CCO (Côté Comics): 0 / 24
// Famille CRE (CréAtioN): 0 / 13
// Famille CS (Critique): 6 / 2035
// Famille CRUN (Crunch Time): 1 / 49
// Famille DAMN (Damned): 0 / 10
// Famille DM (Debug Mode): 0 / 198
// Famille DP (Deux minutes pour parler de...): 0 / 16
// Famille DS (Devil'Slayer): 0 / 14
// Famille DO (Documentaire): 0 / 39
// Famille DL (DonJon Legacy): 0 / 9
// Famille DF (Double Face): 0 / 17
// Famille EC (écrans.fr, le podcast): 0 / 68
// Famille EMN (En Mode Normal): 0 / 47
// Famille EJ (Esprit Japon): 0 / 71
// Famille EX (EXP): 1 / 54
// Famille EL (Extra Life): 0 / 175
// Famille FAQ (FAQ): 0 / 27
// Famille FMPG (Fatal Misses & Plastic Girl): 0 / 2
// Famille FILM (Film): 0 / 33
// Famille FA (Film amateur): 16 / 81
// Famille FCON (First Contact): 0 / 47
// Famille FLAG (FLAG): 0 / 13
// Famille FL (Flander's Company): 0 / 82
// Famille COOL (Cool Guys, Hot Ramen): 0 / 16
// Famille FC (Format Court): 0 / 48
// Famille FFIV (France Five): 0 / 0
// Famille FMP (Full Metal Panic!): 0 / 0
// Famille GC (Game Center): 0 / 20
// Famille TG (Game Trailer): 34 / 34
// Famille GL (Geek's Life): 0 / 136
// Famille GUNB (Gunbuster / Diebuster): 0 / 0
// Famille GUNG (Gundam Reconguista in G): 0 / 0
// Famille HA (Hall of Shame): 0 / 10
// Famille HC (Hard Corner): 0 / 36
// Famille HP (Hidden Palace): 0 / 59
// Famille HIMA (Himawari! à l'école des ninjas): 0 / 26
// Famille AFM (Hôkago Midnighters): 0 / 12
// Famille NEED (I Need Romance): 0 / 16
// Famille J-5 (J-5): 0 / 8
// Famille JTSR (J-Top (Speed run)): 32 / 356
// Famille JJS (J'ai jamais su dire non): 0 / 16
// Famille JMCU (Jamais sans 1%): 0 / 19
// Famille JM (Japan in Motion): 0 / 266
// Famille JET (Jeu-Top): 25 / 75
// Famille KES (Keskejfé): 0 / 9
// Famille KYO (Kyô no wanko - Le Toutou du jour): 0 / 23
// Famille HJV (L'Hebdo Jeu Vidéo): 0 / 25
// Famille HDN (L'hippodrôle de Nolife): 1 / 39
// Famille IK (L'Instant Kamikaze): 0 / 4
// Famille FAL (La Faute à l'algo): 0 / 24
// Famille LGP (La Grosse Partie): 0 / 17
// Famille MG (La minute du geek): 1 / 332
// Famille BDG (Le Blog de Gaea): 0 / 5
// Famille CA (Le coin des abonnés): 0 / 3
// Famille CI (Le Continue de l'info): 0 / 113
// Famille DCLP (Le Decliptage du J-Top): 0 / 8
// Famille JE (Le jeu du ***): 0 / 41
// Famille INFO (Le Point Info): 0 / 60
// Famille PN (Le point sur Nolife): 69 / 201
// Famille LST (Le Saviez-tu ? De Jean-Foutre): 0 / 23
// Famille VF (Le Visiteur du Futur): 0 / 38
// Famille BLA (Les Blablagues de Laurent-Laurent): 0 / 18
// Famille COVI (Les conseils vidéo du professeur Théorie et du docteur Pratique): 0 / 29
// Famille OPL (Les Oubliés de la Playhistoire): 0 / 147
// Famille VAC (Les vacances de Nolife): 47 / 160
// Famille LR (Live report): 5 / 63
// Famille LLS (Love Live! Sunshine!!): 0 / 0
// Famille MM (Mange mon geek): 0 / 16
// Famille LUCI (Lucifer): 0 / 20
// Famille MHC (Metal Hurlant Chronicles): 0 / 25
// Famille MMPG (Metal Missile & Plastic Gun): 0 / 108
// Famille MNM (Mon Nolife à Moi): 0 / 5
// Famille MPC (Mon plan Culte): 0 / 29
// Famille MS (Mon souvenir): 0 / 181
// Famille MOS (Money Shot): 0 / 176
// Famille MONH (Journal de Monster Hunter : Le Village Felyne au bord du Gouffre G): 0 / 13
// Famille MDS (mot de saison): 1 / 20
// Famille KISS (Playful Kiss): 0 / 16
// Famille NW (News): 354 / 1481
// Famille NG (Nihongo ga dekimasu ka): 0 / 87
// Famille NC (Nochan): 0 / 225
// Famille NOIR (Noir): 0 / 31
// Famille NL (Nolife): 105 / 149
// Famille NEI (Nolife Emploi IRL): 0 / 39
// Famille NONS (NONSÉRIE): 0 / 13
// Famille NO (Noob): 0 / 118
// Famille PLS (Nuit Calme en PLS): 0 / 19
// Famille 1S (One-shot): 3 / 3
// Famille OS (Oscillations): 0 / 139
// Famille OT (OTO): 0 / 158
// Famille OTEX (OTO EX): 8 / 12
// Famille OP (OTO Play): 0 / 47
// Famille PIC (PICO PICO): 0 / 34
// Famille PI (PIXA): 0 / 14
// Famille PIX (PIXELS): 0 / 46
// Famille PUR (Purgatoire): 0 / 31
// Famille RAA (Random Access Archives): 0 / 3
// Famille RP (Reportage): 16 / 910
// Famille RM (Retro & Magic): 1 / 475
// Famille RC (Rêves et Cris): 0 / 56
// Famille RS (Roadstrip): 0 / 43
// Famille ROL (Roleplay): 0 / 45
// Famille SOJ (Silence, on joue !): 0 / 49
// Famille SK (Skill): 1 / 139
// Famille SM (Smartphones & Tablettes): 0 / 41
// Famille SO (Soirée spéciale): 3 / 186
// Famille ST (Stamina): 0 / 19
// Famille SP (Superplay): 93 / 186
// Famille TIPS (Technologie de l’Information en Pratique et Sans danger): 0 / 20
// Famille TP (Temps Perdu): 0 / 239
// Famille TR (Temps Réel): 0 / 25
// Famille GUI (The Guild): 0 / 58
// Famille PTB (The Place to Be): 30 / 116
// Famille TOC (toco toco): 0 / 125
// Famille TC (Tôkyô Café): 3 / 243
// Famille UPS (Un peu de silence): 1 / 17
// Famille VH (Very Hard): 0 / 34
// Famille WP (War Pigs): 0 / 4
// Famille WZP (WarpZone Project): 0 / 11
// Famille WIP (WiP – Work in Progress): 0 / 8
// Famille WOLF (Wolf's Rain): 0 / 0
// Famille ZIKO (Zikos): 0 / 18
// total: 914 / 15779 vidéos non concordantes
// soit moins de 6%
