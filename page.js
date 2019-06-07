/* eslint quotes:["warn", "double"] */
/* eslint padded-blocks:[0] */
function delegateEvent (parent, type, selector, action) {
  parent.addEventListener(type, (e) => {
    // getParents. chrome has event.path
    let path = ((elem) => {
      const parents = []
      for (; elem; elem = elem.parentNode) {
        parents.push(elem)
      }
      parents.push(window)
      return parents
    })(e.target)
    // all layers up to the parent (included)
    path = path.slice(0, path.indexOf(parent) + 1)
    const el = path.find(_ => _.matches && _.matches(selector))
    if (el) {
      e.delTarget = el // matched el
      e.delParentTarget = parent // delegate parent
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

    delegateEvent(document, "click", ".show .show-mos, .show .show-scr", e => {
      const target = e.delTarget.closest(".show")
      if (int) {
        // il y a déjà une alim: l'éteint
        // si on a cliqué sur une autre émission, démarre la nouvelle anim
        off()
        if (mos !== target.querySelector(".show-mos")) {
          on(target)
        }
      } else {
        on(target)
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

    function off () {
      clearInterval(int)
      int = null

      mos.classList.remove("mos" + etp)
      mos.style.display = "none"
      scr.style.display = ""
    }

  }
}

window.addEventListener("load", _ => {
  document.querySelectorAll(".access a, .partner a, .family a, .year a, .show a").forEach(el => {
    if (!el.getAttribute("href").match(/^https?:\/\//)) {
      el.href = `${window.baseurl}out/${el.getAttribute("href")}`
    }
  })
  new Mosaique().init()
})
