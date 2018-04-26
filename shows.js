/* eslint quotes:["warn", "double"] */
/* eslint padded-blocks:[0] */
function delegateEvent (parent, type, selector, action) {
  parent.addEventListener(type, (e) => {
    // array of all layers until the parent (included)
    const path = e.path.slice(0, e.path.indexOf(parent) + 1)
    const el = path.find(_ => _.matches && _.matches(selector))
    if (el) {
      e.delTarget = el // le match
      e.delParentTarget = parent // le parent du delegate
      e.delPath = path
      action.call(this, e)
    }
  })
}

class Mosaique {
  init () {
    let mos, scr
    let etp = 0
    let int = null

    delegateEvent(document, "click", ".show", e => {
      if (int) {
        // il y a déjà une alim: l'éteint
        // si on a cliqué sur une autre émission, démarre la nouvelle anim
        off()
        if (mos !== e.delTarget.querySelector(".show-mos")) {
          on(e.delTarget)
        }
      } else {
        on(e.delTarget)
      }
    })

    function on (target) {
      mos = target.querySelector(".show-mos")
      scr = target.querySelector(".show-scr")
      etp = 0
      mos.classList.add("mos" + etp)

      mos.style.display = ""
      scr.style.display = "none"
      int = setInterval(_ => {
        mos.classList.remove("mos" + etp)
        etp = (etp + 1) % 100
        mos.classList.add("mos" + etp)
      }, 250)
    }

    function off (e) {
      clearInterval(int)
      int = null

      mos.classList.remove("mos" + etp)
      mos.style.display = "none"
      scr.style.display = ""
    }

  }
}
