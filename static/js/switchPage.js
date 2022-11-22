/* global d3 */
/* exported switchPage */
const switchPage = (() => {
  const switchable = d3.select('#switchable')
  const pages = switchable.selectAll('.page')
  let destroyHandler = null
  const switchPage = (id, onDestroy = null) => {
    if (typeof destroyHandler === 'function') {
      try {
        destroyHandler()
      } catch (e) {
        // do nothing
      }
    }
    pages.classed('hidden', function () {
      return this.id !== id
    })
    destroyHandler = onDestroy
  }
  d3.select('#switches').selectAll('.btn.btn-info').on('click', function () {
    switchPage(this.dataset.id)
  })
  return switchPage
})()
