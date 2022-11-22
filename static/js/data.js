/* globals d3 */
window.dataPromise = d3.csv(sourcefileall).then((dataCollection) => {
  
  const NUMERIC_KEYS = [
    'modern_longitude',
    'modern_latitude',
    'start_year',
    'end_year',
    'ancient_longitude',
    'ancient_latitude',
    'era',
  ]
  const PhylumClassOrderFamilyGenusSpecies = new Map()
  const KEYS = ['Phylum', 'Class', 'Order', 'Family', 'Genus']
  const LAST_KEY = KEYS[KEYS.length - 1]
  let lane = -1
  let a = []
  let i = 0
  for (const data of dataCollection.values()) {
    a[i++] = -1
    for (const key of NUMERIC_KEYS) {
      data[key] = +data[key]
    }
    data.lives = data.end_year - data.start_year
    let node = PhylumClassOrderFamilyGenusSpecies
    for (const key of KEYS) {
      if (node.has(data[key])) {
        node = node.get(data[key])
      } else {
        const newNode = key === LAST_KEY ? [new Set(), new Set()] : new Map()
        node.set(data[key], newNode)
        node = newNode
      }
    }
    if (!node[0].has(data.Species)) {
      lane++
      node[0].add(data.Species)
    }
    data.lane = lane
    Object.freeze(data)
    node[1].add(data)
  }
  
  return [dataCollection, PhylumClassOrderFamilyGenusSpecies,a]
})
