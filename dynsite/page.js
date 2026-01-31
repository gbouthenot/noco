const nocomedia = 'https://static.atomas.com/noco-assets/media.noco.tv/'
class Page {

    constructor () {
        this.nd = {}
        this.init()
    }

    totalDuration (shows) {
        return shows.reduce((acc, cur) => acc + parseInt(cur[this.nd.SH.duration_ms]), 0)
    }

    formatDuration (durationMs) {
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

    getUrl (ep, pa, famtt, showtt) {
        const nd = this.nd
        let s = `${ep[nd.SH.episode_number] !== '' ? ep[nd.SH.episode_number] + '-' : ''}${showtt}`
            .replace(/[']/g, ' ')
            .replace(/[()! ,+:&/]/g, '')
            .replace(/[ .;]/g, '-')
            .replace(/--+/g, '-')
            .replace(/-$/g, '')
            .toLowerCase()
        // s = removeAccents.remove(s)
        return `https://noco.tv/emission/${pa[nd.PA.partner_shortname]}/${famtt}/${ep[nd.SH.id_show]}/${s}`
    }


    init () {
        window.fetch('../noco-small.json')
        .then(response => response.json())
        .then(nd => {
            // hydrate database
            Object.keys(nd).forEach(itm => {
            if (itm.length === 2) {
                nd[itm] = nd[itm].split(' ').reduce((acc, k, i) => { acc[k] = i; return acc }, {})
            } else if (itm.indexOf('_') === -1) {
                // data: join everything
                nd[itm] = nd[itm].map(o => o.split('§'))
            } else {
                // constants: keep it like that
            }
            })
            this.nd = nd
            this.context = {
                page: 'root',
            }

            // init event handlers
            const srctxt = document.getElementById('srctxt')
            srctxt.addEventListener("input", _=> this.updateSearch())
            const srcre = document.getElementById('srcre')
            srcre.addEventListener("change", _=> this.updateSearch())

            // init router
            this.router = new Navigo('/', { hash: true })
            this.router.on('/', (rnfo) => {
                this.context = {
                    page: 'root',
                }
                this.updateSearch()
            })
            this.router.on('/partner/:partner', (rnfo) => {
                this.context = {
                    page: 'partner',
                    partner_name: rnfo.data.partner
                }
                this.updateSearch()
            })
            this.router.on('/family/:family', (rnfo) => {
                this.context = {
                    page: 'family',
                    family_key: rnfo.data.family
                }
                this.updateSearch()
            })
            this.router.resolve()
        })
        .catch(err => {
            console.log('error: ' + err);
        })
    }

    updateSearch() {
        // read search params
        const search = document.getElementById('srctxt').value
        const isre = document.getElementById('srcre').checked

        console.log('updatesearch page', this.context)
        const nd = this.nd
        let matchedShows
        if (isre) {
            const searchRE = new RegExp(search, 'i')
            matchedShows = nd.shows.filter(sh=>sh[nd.SH.show_resume].match(searchRE) || sh[nd.SH.show_TT].match(searchRE))
        } else {
            matchedShows = nd.shows.filter(sh=>sh[nd.SH.show_resume].indexOf(search)!=-1 || sh[nd.SH.show_TT].indexOf(search)!=-1)
        }

        document.getElementById('partners').innerHTML = ''
        document.getElementById('families').innerHTML = ''
        document.getElementById('shows').innerHTML = ''

        switch (this.context.page) {
            case 'root':
                this.listPartners(matchedShows)
                break;
            case 'partner':
                this.listFamiliesOfPartner(matchedShows, this.context.partner_name)
                break;
            case 'family':
                this.listShowsOfFamily(matchedShows, this.context.family_key)
                break;
        }
    }

    listPartners (matchedShows) {
        const nd = this.nd
        const uniqueFamilies = [...new Set(matchedShows.map(sh => sh[nd.SH.id_family]))]
        const uniquePartners = [...new Set(uniqueFamilies.map(fam_id => nd.families.find(fam => fam[nd.FA.id_family] === fam_id)[nd.FA.id_partner]))]

        const partners = uniquePartners.map(pid => nd.partners.find(pa => pa[nd.PA.id_partner] === pid))
            .sort((a, b) => a[nd.PA.partner_name].localeCompare(b[nd.PA.partner_name]))
        
        partners.forEach(partner => this.renderPartner('#', matchedShows, partner))
        this.router.updatePageLinks()
    }

    renderPartner (url, matchedShows, partner) {
        const nd = this.nd
        const id_partner = partner[nd.PA.id_partner]
        const shows = matchedShows.filter(sh =>
            nd.families.find(fa => fa[nd.FA.id_family] === sh[nd.SH.id_family])[nd.FA.id_partner] === id_partner
        )
        const uniqueFamilies = [...new Set(shows.map(sh => sh[nd.SH.id_family]))]
        const fams = uniqueFamilies.map(faid => nd.families.find(fa => fa[nd.FA.id_family] === faid))
        const dur = this.formatDuration(this.totalDuration(shows))
        const url2 = `${url}/partner/${partner[nd.PA.partner_shortname]}`
        const icn = `${nocomedia}partner_160x90/${partner[nd.PA.partner_key].toLowerCase()}.jpg`

        const tmpl = jsrender.templates("#tplPartners");
        // const partObj = this.getObj(this.nd.PA, partner)
        const tpldata = {nd, partner, fams, shows, dur, icn, url2}
        const html = tmpl(tpldata)
        document.getElementById('partners').innerHTML += html

        // fams.forEach(family => {
        //     this.renderFamily(url, partnerdata, family, shows)
        // })
    }

    listFamiliesOfPartner (matchedShows, partner_name) {
        const nd = this.nd
        const partner = nd.partners.find(pa => pa[nd.PA.partner_name] === partner_name)
        const uniqueFamilies = [...new Set(matchedShows.map(sh => sh[nd.SH.id_family]))]
        const families = uniqueFamilies.map(fid => nd.families.find(fa => fa[nd.FA.id_family] === fid))
            .filter(fa => fa[nd.FA.id_partner] === partner[nd.PA.id_partner])
            .sort((a, b) => a[nd.FA.family_TT].localeCompare(b[nd.FA.family_TT]))
        
        families.forEach(family => this.renderFamily('#', partner, family, matchedShows))
        this.router.updatePageLinks()
    }

    renderFamily(url, partner, family, matchedShows) {
        const nd = this.nd
        const theme = nd.themes.find(th => th[nd.TH.id_theme] === family[nd.FA.id_theme])
        const type = nd.types.find(ty => ty[nd.TY.id_type] === family[nd.FA.id_type])
        const shows = matchedShows.filter(sh => sh[nd.SH.id_family] === family[nd.FA.id_family])
        const dur = this.formatDuration(this.totalDuration(shows))

        const url2 = `${url}/family/${family[nd.FA.family_key]}`
        const icn = family[nd.FA.icon_1024x576] ? ''
            : (`${nocomedia}family_160x90/${partner[nd.PA.partner_key].toLowerCase()}` +
            `/${family[nd.FA.family_key].toLowerCase()}.jpg`)

        const tpldata = {nd, fam: family, theme, type, shows, dur, icn, url2}
        const tmpl = jsrender.templates("#tplFamily");
        const html = tmpl(tpldata)
        document.getElementById('families').innerHTML += html
    }

    listShowsOfFamily (matchedShows, family_key) {
        const nd = this.nd
        const family = nd.families.find(fa => fa[nd.FA.family_key] === family_key)
        const partner = nd.partners.find(pa => pa[nd.PA.id_partner] === family[nd.FA.id_partner])
        const shows = matchedShows.filter(sh => sh[nd.SH.id_family] === family[nd.FA.id_family])
        shows.forEach(show => this.renderShow(show, partner, family))
        this.router.updatePageLinks()
    }

    renderShow(show, partner, family) {
        const nd = this.nd

        const dur = this.formatDuration(show[nd.SH.duration_ms])
        let title = []
        let sn = ''
        if (show[nd.SH.season_number] !== '') {
            sn += 'S' + show[nd.SH.season_number]
        }
        if (show[nd.SH.episode_number] !== '') {
            sn += 'E' + show[nd.SH.episode_number]
        }

        // si le nom de la famille est différent, affiche-le
        let famtt = family[nd.FA.family_TT]
        if (show[nd.SH.family_TT]) {
            famtt = show[nd.SH.family_TT]
            title.push(famtt)
        }

        // broadcast_date_utc
        let broadcastDate = null
        if (show[nd.SH.broadcast_date_utc] !== '') {
            broadcastDate = ('00000000000' + show[nd.SH.broadcast_date_utc]).slice(-12)
            broadcastDate = broadcastDate.replace(/^(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/, '$1-$2-$3 $4:$5:$6')
            broadcastDate = (parseInt(broadcastDate.slice(0, 2)) > 18 ? '19' : '20') + broadcastDate
        }

        // show key FIRST : season
        let showKey = show[nd.SH.show_key]
        // S1 -> S12: janvier à aout: S(n), septembre à décembre: S(n+1)
        // S13 -> S18: une saison par année janvier à décembre
        if (broadcastDate && partner[nd.PA.id_partner] === nd.PARTNER_NOLIFE) {
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
            } else if (showtt === '_') {
                showtt = ''
            }
        }

        if (showtt) {
            title.push(showtt)
        }
        title = title.join(' - ')

        // show_key SECOND: family_key
        showKey = show[nd.SH.id_type] === nd.TYPE_AP ? `AP_${showKey}`
            : showKey[0] === '_' ? showKey.slice(1)
                : `${family[nd.FA.family_key]}_${showKey}`

        let scr = ''
        const parsl = partner[nd.PA.partner_key].toLowerCase()
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

        const show_resume = show[nd.SH.show_resume].replace(/\n/g, '\n    ')
        let mos = show[nd.SH.mosaique]
        if (mos) {
            mos = `${mos}${'73a1'.slice(mos.length - 30)}`
            mos = `${nocomedia}mosaique/${parsl}/${mos[0]}/${mos[1]}/${showKey}_${mos.slice(2)}.jpg`
        }
        const nocourl = this.getUrl(show, partner, famtt, showtt)

        const tpldata = {nd, show, broadcastDate, dur, mos, nocourl, scr, showKey, show_resume, sn, title}
        const tmpl = jsrender.templates("#tplShow");
        const html = tmpl(tpldata)
        document.getElementById('shows').innerHTML += html
    }

    // getObj (def, data) {
    //     const obj = {}
    //     for (const i in def) {
    //         obj[i] = data[def[i]]
    //     }
    //     return obj
    // }

    tmp () {
        const nd = this.nd
        const partner_id = '1' // Nolife
        const fam_id = '8' // 8:critique 214:POL vous savez pourquoi on est là
        const families = nd.families.filter(fa => fa[page.nd.FA.id_partner] === partner_id)
            .sort((a, b) => a[nd.FA.family_TT].localeCompare(b[nd.FA.family_TT]))
        const familyShows = nd.shows.filter(sh => sh[nd.SH.id_family] === fam_id)

        // obtient les années
        let years = familyShows.map(_ => parseInt(_[nd.SH.sorting_year]) + 2000)
        years = [...new Set(years)]
        years = years.sort()

        // les shows
        year = 2014
        familyYearShows = familyShows.filter(_ => parseInt(_[nd.SH.sorting_year]) + 2000 === year)

        // ensuite chercher dans show_resume (4) et show_TT (8)
        const search = 'La'
        familyYearShows.filter(sh=>sh[nd.SH.show_resume].indexOf(search)!=-1 || sh[nd.SH.show_TT].indexOf(search)!=-1)

        // ou en regexp
        const searchRE = new RegExp('L.y', 'i')
        familyYearShows.filter(sh=>sh[nd.SH.show_resume].match(searchRE) || sh[nd.SH.show_TT].match(searchRE))
    }

    tmp2 () {
        // exemple recherche globale
        const nd = page.nd
        const searchRE = new RegExp('L.yt', 'i')
        const matchedShows = nd.shows.filter(sh=>sh[nd.SH.show_resume].match(searchRE) || sh[nd.SH.show_TT].match(searchRE))
        const uniqueFamilies = [...new Set(matchedShows.map(sh => sh[nd.SH.id_family]))]
        const uniquePartners = [...new Set (uniqueFamilies.map(fam_id => nd.families.find(fam => fam[nd.FA.id_family] === fam_id)[nd.FA.id_partner]))]
    }


}
