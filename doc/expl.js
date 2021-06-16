/* eslint-disable arrow-spacing, block-spacing, comma-spacing, no-const-assign,
   no-multiple-empty-lines, no-irregular-whitespace,
   no-undef, no-unused-expressions, quotes, space-infix-ops */
const shows = require('./noco-data/shows_full.json')
const families = require('./noco-data/families.json')
console.log(shows.length)

// FAMILLES
// Les familles qui ont pas TT==OT :
families.filter(fam=>fam.family_OT !== fam.family_TT).forEach(fam=>console.log(`${fam.family_OT} (${fam.OT_lang}) / ${fam.family_TT}`))

// family_OT (OT_lang) / family_TT
// Beauty of Japan (en) / À la découverte des beautés inconnues du Japon
// Flower Boy Ramen Shop (ko) / Cool Guys, Hot Ramen
// Gundam G no Reconguista (ja) / Gundam Reconguista in G
// Himawari! (ja) / Himawari! à l'école des ninjas
// In Need of Romance (ko) / I Need Romance
// Kyô no wanko (en) / Kyô no wanko - Le Toutou du jour
// Mawang (ko) / Lucifer
// MonHan nikki: Giri giri airu mura ☆Felyne Close Call☆ (ja) / Journal de Monster Hunter : Le Village Felyne au bord du Gouffre G
// Naughty Kiss (ko) / Playful Kiss

// tri par nom
families.filter(_=>_.id_partner===1).sort((a,b)=>a.family_TT.localeCompare(b.family_TT)).map(_=>`${_.family_TT}: ${_.family_key}`).join("\n")

// array des familles, trié par nom, format "nom£id£key"
fams = families.filter(_=>_.id_partner===1).sort((a,b)=>a.family_TT.localeCompare(b.family_TT)).map(_=>`${_.family_TT}£${_.id_family}£${_.family_key}`)

fams.map(_=>_.split('£')).forEach(fam=>{famname=fam[0]; famid=fam[1]; console.log(`Famille ${famname}`)})

fams.forEach(fam=>{fam=fam.split('£'); famname=fam[0]; famid=fam[1]; sho=shows.filter(_=>_.partner_key==='NOL'&&_.id_family===famid); console.log(`${famname}: ${sho.length}`)})

/*
(Vous savez) Pourquoi on est là (214): 80
101 PUR 100 (322): 137
101% (3): 1975
1D6 (91): 143
3mn pas + pour parler d'un jeu 3+ (68): 87
56Kast (139): 124
À la découverte des beautés inconnues du Japon (408): 0
À lire, à voir (211): 117
À Table ! (142): 20
Another Hero (117): 15
BD Blogueurs (21): 8
Big Bang Hunter (217): 30
Big Bug Hunter (105): 47
Ça déboîte ! (376): 38
Catsuka (78): 179
Ce qu'il ne faut pas dire (337): 14
Ce soir j'ai raid (92): 10
Chaud Time (69): 33
Chez Marcus (22): 446
Classés 18+ (12): 146
Club Télé Achier (334): 6
Collector's Quest (372): 16
Compiler (77): 44
Costume Player (76): 52
Côté Comics (120): 24
CréAtioN (102): 13
Critique (8): 2035
Crunch Time (220): 49
Debug Mode (28): 197
Deux minutes pour parler de... (29): 16
Devil'Slayer (138): 14
Documentaire (61): 39
DonJon Legacy (437): 9
Double Face (63): 17
écrans.fr, le podcast (86): 68
En Mode Normal (396): 46
Esprit Japon (223): 71
EXP (30): 54
Extra Life (93): 175
FAQ (325): 27
Fatal Misses & Plastic Girl (263): 2
Film amateur (46): 81
First Contact (410): 47
Format Court (31): 48
France Five (137): 0
Full Metal Panic! (380): 0
Game Center (88): 20
Game Trailer (112): 34
Geek's Life (33): 136
Gunbuster / Diebuster (285): 0
Gundam Reconguista in G (254): 0
Hall of Shame (35): 10
Hard Corner (107): 36
Hidden Palace (37): 59
Hôkago Midnighters (140): 12
J-5 (362): 8
J-Top (Speed run) (66): 355
J'ai jamais su dire non (103): 16
Jamais sans 1% (65): 19
Japan in Motion (75): 266
Jeu-Top (131): 75
Journal de Monster Hunter : Le Village Felyne au bord du Gouffre G (260): 13
Keskejfé (425): 9
Kyô no wanko - Le Toutou du jour (143): 23
L'Hebdo Jeu Vidéo (340): 25
L'hippodrôle de Nolife (331): 39
L'Instant Kamikaze (10): 4
La Faute à l'algo (346): 24
La Grosse Partie (144): 17
La minute du geek (14): 332
Le coin des abonnés (67): 3
Le Continue de l'info (413): 113
Le Decliptage du J-Top (360): 8
Le jeu du *** (39): 41
Le Point Info (235): 60
Le point sur Nolife (94): 201
Le Saviez-tu ? De Jean-Foutre (354): 23
Le Visiteur du Futur (80): 38
Les Blablagues de Laurent-Laurent (116): 18
Les conseils vidéo du professeur Théorie et du docteur Pratique (276): 29
Les Oubliés de la Playhistoire (111): 147
Les vacances de Nolife (115): 160
Live report (194): 62
Love Live! Sunshine!! (431): 0
Mange mon geek (43): 16
Metal Missile & Plastic Gun (127): 108
Mon Nolife à Moi (79): 5
Mon plan Culte (328): 29
Mon souvenir (44): 181
Money Shot (81): 176
mot de saison (284): 20
News (357): 1481
Nihongo ga dekimasu ka (109): 87
Nochan (82): 225
Noir (232): 31
Nolife (62): 145
Nolife Emploi IRL (95): 39
NONSÉRIE (279): 13
Nuit Calme en PLS (392): 19
One-shot (19): 3
Oscillations (47): 139
OTO (48): 158
OTO EX (6): 12
OTO Play (4): 47
PICO PICO (98): 34
PIXA (51): 14
PIXELS (400): 46
Purgatoire (145): 31
Random Access Archives (348): 3
Reportage (9): 907
Retro & Magic (54): 475
Rêves et Cris (100): 56
Roadstrip (55): 43
Roleplay (388): 44
Silence, on joue ! (364): 49
Skill (96): 139
Smartphones & Tablettes (99): 41
Soirée spéciale (60): 182
Stamina (343): 19
Superplay (5): 183
Technologie de l’Information en Pratique et Sans danger (126): 20
Temps Perdu (57): 239
Temps Réel (7): 25
The Place to Be (108): 116
toco toco (97): 125
Tôkyô Café (56): 243
Un peu de silence (404): 17
Very Hard (110): 34
War Pigs (104): 4
WiP – Work in Progress (130): 8
Wolf's Rain (319): 0
Zikos (368): 18
*/

// Les familles qui utilisent season_number:
shows.filter(_=>_.season_number!==0).map(_=>_.id_family).filter((x, i, a) => a.indexOf(x)===i).map(_=>families.find(y=>y.id_family===_).family_TT);
[ 'Roleplay',
  'DonJon Legacy',
  'Japan in Motion',
  'Zikos',
  'Noob',
  'Les conseils vidéo du professeur Théorie et du docteur Pratique',
  'J-5',
  'Purgatoire',
  'Himawari! à l\'école des ninjas',
  'NONSÉRIE',
  'Metal Hurlant Chronicles',
  'The Guild',
  'Nolife',
  'Côté Comics',
  'Film amateur',
  'WiP – Work in Progress',
  'Flander\'s Company' ]

// Les familles qui n'ont pas de date de diffusion
shows.filter(_=>_.broadcast_date_utc===null).map(_=>_.id_family).filter((x, i, a) => a.indexOf(x)===i).map(_=>families.find(y=>y.id_family===_).family_TT);
[ 'WarpZone Project', 'Le Blog de Gaea' ]

// Uniquement "Vous savez pourquoi on est là":
shows.filter(_=>_.partner_key==='NOL'&&_.family_key==='POL').length
// 80

// les 101%
shows.filter(_=>_.partner_key==='NOL'&&_.id_family===3)

// Les 101% d'une date (ex: 1 avril)
shows.filter(_=>_.partner_key==='NOL'&&_.id_family===3&&_.show_OT==='Vendredi 16 décembre 2011')

// par episode number:
shows.filter(_=>_.partner_key==='NOL'&&_.id_family===3&&_.episode_number===897)

// par id dun'show:
shows.find(_=>_.id_show===4059)

// Pour la famille "46" (film amateur)

// items intéréssants:
// id_family
// id_show
// id_type
// id_theme
// mark_read
// hq_master:1
// hd_master:1
// show_key
// family_resume
// show_resume
// family_TT
// duration_ms
// screenshot_128x72
// screenshot_256x144
// screenshot_512x288
// screenshot_960x540
// screenshot_1024x576
// mosaique
// sorting_date_utc
// online_date_start_utc
// last_sorting_date_utc ?
// broadcast_date_utc
// season_number
// episode_number
// episode_reference
// show_OT
// show_TT
// show_resume
// type_key


// Pour trouver l'URL: (il faut ensuite enlever les accents)
// plus à jour voir la ligne plus bas
// ep=>`https://noco.tv/emission/${ep.id_show}/${ep.partner_shortname}/${ep.family_TT}/${ep.episode_number?ep.episode_number+'-':''}${ep.show_TT}`.replace(/[\']/g, ' ').replace(/[()! ,\+:&]/g, '').replace(/[ \.;]/g, '-').replace(/--+/g, '-').replace(/-$/g, '').toLowerCase()

// ex: les urls de toutes les critiques:
shows.filter(_=>_.id_family===8).map(ep=>`https://noco.tv/emission/${ep.id_show}/`+`${ep.partner_shortname}/${ep.family_TT}/${ep.episode_number?ep.episode_number+'-':''}${ep.show_TT}`.replace(/[']/g, ' ').replace(/[()! ,+:&]/g, '').replace(/[ .;]/g, '-').replace(/--+/g, '-').replace(/-$/g, '').toLowerCase())

// ex: les titres de tous les superplays
shows.filter(_=>_.id_family===5).map(ep=>`${ep.id_show} #${ep.episode_number} ${ep.show_OT}`)

// trouver une critique par nom:
shows.filter(_=>_.id_family===8 && _.show_TT && _.show_TT.toLowerCase().indexOf('fez')>=0)

// Critiques:
// id_family===8
// 3mn pas plus: 68

// Sauvegarder les screenshots:
scr=shows.map(_=>_.screenshot_1024x576)
fs.writeFileSync("screenshots.txt", scr.join('\n'))

// Trouver les nouveaux shows:
// récupérer bearer
// URL api: https://api.noco.tv/1.1/documentation/
// lancer bl():
// node noco_fetch_api.js() > tmp.json
// node
shows = require('./noco-data/shows_full.json'); showsDate = require('./noco-data/shows_date2.json')
showsDate.map(_=>_.id_show).filter(id=>!shows.find(show=>show.id_show===id)).map(id=>shows.find(_=>_.id_show===id)).map(_=>[_.id_show, _.family_TT, _.show_TT, _.screenshot_1024x576, _.mosaique])
// [ 51809, 51893 ]
// [ 51947, 51938, 51917, 51923, 51914, 51920, 51911, 51932, 51803 ]
// zombie: 51923, 51920, 51932
// 18 avr: [ 51959, 51953 ]
// [ 51956 ]
// 23 avr: [ 51905, 51908, 51899 ]
// 25 avr: 51965:zombie(4)
// 26 avr:
// [ [ 51971,
//     'Debug Mode',
//     'Finir Nolife',
//     'https://media.noco.tv/screenshot/nol/1024x576/0/a/DM_S18s17_496899.jpg',
//     'https://media.noco.tv/mosaique/nol/f/3/DM_S18s17_82b005d84fb4bfc2f5e38fbcbcb80d7d.jpg' ],
//   [ 51980,
//     'Interview',
//     'Christophe Cointault pour le manga Tinta Run',
//     'https://media.noco.tv/screenshot/nol/1024x576/1/2/RP_S18s17n03B_75974.jpg',
//     'https://media.noco.tv/mosaique/nol/0/3/RP_S18s17n03B_1bc8a294476fb376bc1e5025f83ca4ba.jpg' ],
//   [ 51977,
//     'Interview',
//     'MURATA Range au Japan Tours Festival',
//     'https://media.noco.tv/screenshot/nol/1024x576/8/3/RP_S18s17n03A_44662.jpg',
//     'https://media.noco.tv/mosaique/nol/3/8/RP_S18s17n03A_15228b27e4223052172ee85280328f36.jpg' ] ]
// charger puis:
// for i in media.noco.tv/screenshot/nol/1024x576/0/a/DM_S18s17_496899.jpg media.noco.tv/screenshot/nol/1024x576/1/2/RP_S18s17n03B_75974.jpg media.noco.tv/screenshot/nol/1024x576/8/3/RP_S18s17n03A_44662.jpg ; do  mkdir -p $(dirname toto/$i) ; convert $i -resize 160x90\! toto/$i ; done

// CORRECTION
// show:24963: enlever espace dans screenshots et show_key
// show:12670: screenshots: /0/0/ ->

// nouveaux shows (dans showsDate mais pas dans shows)
showsDate.map(_=>_.id_show).filter(id=>!shows.find(show=>show.id_show===id));
[ 51956 ]

// shows supprimés (dans shows mais pas dans showsDate)
shows.map(_=>_.id_show).filter(id=>!showsDate.find(show=>show.id_show===id));
[ 7283 ] // superplay damdam


// wget --input-file=screenshots.txt --no-verbose --tries=5 --retry-connrefused --no-clobber --wait=10 --random-wait --waitretry=57 --force-directories


// Emissions cachées:
// Classés 18+ affiche 19 émissions sur le site web, mais n'en liste que 18, comme nous.
// Peut-etre qu'une émission a été supprimé (comme pour Superplay ?)
shows.filter(_=>_.family_key==='SO18').filter(_=>_.sorting_date_utc.slice(0,4) === '2015').length
18
shows.filter(_=>_.family_TT==='Classés 18+').filter(_=>_.sorting_date_utc.slice(0,4) === '2015').length
18
shows.filter(_=>_.show_key.slice(0,4)==='SO18').filter(_=>_.broadcast_date_utc.slice(0,4) === '2015').length
18


// REPL

noco = require('./noco-data/noco-data.js')
// famille 101% (pas la peine de filtrer par partner)
fam = noco.families.find(a=>a.family_key==='CU')
// tous les shows


// Saisons de diffusion:
function getSemestre(d) {
  if (d <= '2007-06-01') return 0
  if (d <=' 2007-07-15') return 1
  if (d <=' 2007-12-23') return 2
  if (d <=' 2008-07-13') return 3
  if (d <=' 2008-12-31') return 4
  if (d <=' 2009-07-03') return 5
  if (d <=' 2009-12-31') return 6
  if (d <=' 2010-07-01') return 7
  if (d <=' 2010-12-31') return 8
  if (d <=' 2011-07-08') return 9
  if (d <=' 2011-12-31') return 10
  if (d <=' 2012-07-15') return 11
  if (d <=' 2012-12-31') return 12
  if (d <=' 2013-07-15') return 13 // a partir de la saison 13 (2013), les saisons durent un an
  if (d <=' 2013-12-31') return 14
  if (d <=' 2014-07-15') return 15
  if (d <=' 2014-12-31') return 16
  if (d <=' 2015-07-15') return 17
  if (d <=' 2015-12-31') return 18
  if (d <=' 2016-07-15') return 19
  if (d <=' 2016-12-31') return 20
  if (d <=' 2017-07-15') return 21
  if (d <=' 2017-12-31') return 21
  return 22
}
