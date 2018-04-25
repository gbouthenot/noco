function delegateEvent(parent, type, selector, action) {
  parent.addEventListener(type, (e) => {
    // array of all layers until the parent (included)
    const path = e.path.slice(0, e.path.indexOf(parent) + 1);
    const el = path.find(_ => _.matches && _.matches(selector));
    if (el) {
      e.delTarget = el; // le match
      e.delParentTarget = parent; // le parent du delegate
      e.delPath = path;
      action.call(this, e);
    }
  });
}


delegateEvent(document, 'click', '.show', e => {
  console.log(e.delTarget)
  mos = e.delTarget.querySelector(".mos")
  scr = e.delTarget.querySelector(".show-scr")
  etp = 0

  mos.style.display=""
  scr.style.display="none"
  int = setInterval(_=>{
    mos.classList.remove('mos' + etp)
    etp = (etp + 1) % 100
    mos.classList.add('mos' + etp)
  }, 200)

})
