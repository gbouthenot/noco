(function () {
  const shows = require('./shows_full.json')
  const families = require('./families.json')
  const themes = require('./themes.json')
  const types = require('./types.json')
  const partners = require('./partners.json')

  // LR_S15s37...WELCOMTOJAP -> WELCOMTOJAPAN
  // Il faut aussi changer la mosaique associée !
  function patchShows (shows) {
    let show

    // nol/0/f/LR_S15s37_JE16_DIMANCHE_n02_WELCOMETOJAPAN_9282cfd50fb121d7ea9135456bb76a70.jpg
    show = shows.find(s => s.id_show === 22573)
    show.show_key += 'AN'
    show.mosaique = show.mosaique.replace('_WELCOMETOJAP_', '_WELCOMETOJAPAN_')

    // 8/d/VAC_LR AJIKAN_689883edfc07ff723b7b8910220e9c31.jpg -> enleve espace
    show = shows.find(s => s.id_show === 24963)
    show.mosaique = show.mosaique.replace('VAC_LR AJIKAN', 'VAC_LRAJIKAN')
  }

  function patchScreenshots (shows) {
    let data = `
      noco/960x540/c/8/AP_nolife_01.jpg
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

  patchScreenshots(shows)
  patchMosaiques(shows)
  patchShows(shows)
  patchFamilies(families)

  module.exports = { shows, families, themes, types, partners }
})()
