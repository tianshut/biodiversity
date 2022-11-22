/* globals d3 dataPromise */
window.barGraphPromise = dataPromise.then(([earlyData, PhylumClassOrderFamilyGenusSpecies]) => {
  const padding = { top: 10, right: 30, bottom: 18.5, left: 40 }
  const barGraph = document.getElementById('bar-graph')
  const { width, height } = barGraph.getBoundingClientRect()

  // 准备数据
  const marginTime = { top: 30, right: 30, bottom: 20, left: 40 }
  const lineWidth = 0.7
    const strokeWidth = `${lineWidth}px`
  const minYear = -251
  const maxYear = -66
  let minx = NaN
  let maxx = NaN
  let x=null
  x = d3
  .scaleLinear()
  .domain([minYear, maxYear])
  .range([0, width - marginTime.left - marginTime.right])
  let y = null
  let chartB = null
  const formatDate = (d) => (d < 0 ? `${-d}MA` : `${d}AD`)
  let xAxis = d3.axisBottom(x).tickFormat(formatDate)

  let  thresholds = x.ticks(maxYear - minYear)

  // 准备种数据
  let newData = new Array(maxYear - minYear).fill(0)
  let newData1 = null
  let datum = {
    all: {
      show: true,
      data: newData,
    },
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    datum[phylumName] = {
      show: false,
      data: new Array(maxYear - minYear).fill(0),
    }
  }
  let lastDataLane = -1
  let lastDataMax = 0
  for (const data of earlyData) {
    if (lastDataLane !== data.lane) {
      lastDataMax = 0
      lastDataLane = data.lane
    }
    const min = Math.max(data.start_year - minYear, lastDataMax)
    const max = Math.max(data.end_year - minYear, lastDataMax)
    lastDataMax = max
    const arr = datum[data.Phylum].data
    for (let i = min; i < max; i++) {
      arr[i]++
    }
  }
  for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
    for (const [key, val] of datum[phylumName].data.entries()) {
      newData[key] += val
    }
  }
  function merge(arr){
    //排序
    arr.sort(function(a,b){
        if(a[0] != b[0]){
            return a[0]-b[0]
        }
        return a[1] - b[1]
    })
    let ans = [], start, end;
    //排序之后，看看有没有重叠的，如果有，合并
    for(let i=0;i<arr.length;i++){
            let s = arr[i][0], e = arr[i][1];
            if(start === undefined){
                start = s, end = e;
            }else if(s <= end){
                end = Math.max(e, end)
            }else{
                let part = [start, end];
                ans.push(part)
                start = s;
                end = e
            }
    }
    if(start !== undefined){
        let part = [start, end]
        ans.push(part)
    }
    
    return ans
}
  function kde(kernel, thresholds, data, offset) {
    return thresholds.map((t) => [
      t,
      data.reduce((acc, val, index) => acc + val * kernel(t - (index + offset)), 0),
    ])
  }

  function epanechnikov(bandwidth) {
    return (x) => (Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0)
  }
  const draw = () => {
  if (chartB) chartB.remove()
  y = d3
    .scaleLinear()
    .domain([0, d3.max(newData)])
    .range([height - padding.bottom, padding.top])

  const yAxis = d3.axisLeft(y)

  const svg = d3.select(barGraph).append('svg').attr('width', width).attr('height', height)
  const rectWidth = x(thresholds[1]) - x(thresholds[0])
  const rectStep = rectWidth
  const lines = svg.append('g')
  const g = svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginTime.left})`)
  svg
    .append('g')
    .selectAll('rect')
    .data(newData)
    .enter()
    .append('rect')
    .attr('fill', 'lightGrey')
    .attr('x', function (d, i) {
      return padding.left + i * rectStep
    })
    .attr('y', function (d) {
      return y(d)
    })
    .attr('width', function (d, i) {
      return rectWidth
    })
    .attr('height', function (d) {
      return y(0) - y(d)
    })

  svg
    .append('g')
    .attr('transform', (d, i) => `translate(${marginTime.left} ${height - marginTime.bottom})`)
    .attr('text-anchor', 'end')
    .call(xAxis)

  svg
    .append('g')
    .call(yAxis)
    .attr('transform', `translate(${padding.left},0)`)
    .attr('text-anchor', 'end')

  const text = document.getElementById('text')
  const range = document.getElementById('range')
  const redraw = () => {
    text.value = Math.round(range.value * 1000) / 1000 + ' bandwidth'
    svg.selectAll('.thisPath, .thisDensityPath, .slope-axis-y').remove()
    const slopesArr = []
    for (const [key, info] of Object.entries(datum)) {
      if (!info.show) continue
      drawLine(key, info)
      slopesArr.push([key, info.densitySlope])
    }
    drawSlopes(slopesArr)
  }
  range.addEventListener('input', redraw, false)

  const lineColors = {
    all: '#d62728',
    Angiospermae: '#152bf4',
    Bryophyta: '#dff415',
    Gymnospermae: '#2ca02c',
    Pteridophyta: '#1f77b4',
  }

  function lineColor(key) {
    const hasOwnProperty = Object.prototype.hasOwnProperty
    if (hasOwnProperty.call(lineColors, key)) return lineColors[key]
    else return '#9467bd'
  }

  function drawLine(key, info) {
    const densitySlope = (datum[key].densitySlope = [])

    const bandwidth = range.value
    const density = kde(epanechnikov(bandwidth), thresholds, info.data, minx)

    const line = d3
      .line()
      .curve(d3.curveNatural)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))

    svg
      .append('path')
      .datum(density)
      .attr('transform', (d, i) => `translate(${marginTime.left})`)
      .attr('class', 'thisPath path-' + key.toLowerCase())
      .attr('fill', 'none')
      .attr('stroke', lineColor(key))
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    const densityLength = density.length
    for (let i = 0; i < densityLength - 1; i++) {
      const slope = (density[i + 1][1] - density[i][1]) / (density[i + 1][0] - density[i][0])
      densitySlope.push(slope)
    }
  }

  const drawSlopes = (slopesArr) => {
    const slopeY = d3
      .scaleLinear()
      .domain([
        d3.min(slopesArr.map(([key, slopes]) => d3.min(slopes))),
        d3.max(slopesArr.map(([key, slopes]) => d3.max(slopes))),
      ])
      .range([height - padding.bottom, padding.top])

    const slopeYAxis = g => g
    .attr("transform", `translate(${padding.left},0)`)
    .call(d3.axisRight(slopeY).tickPadding(20))
    .call(g => g.selectAll(".tick line")
      .filter(d => d === 0)
      .clone()
        .attr("x2", -width + padding.right + padding.left)
        .attr('stroke', 'blue')
        .attr("stroke-dasharray", 10))

    svg
      .append('g')
      .attr('class', 'slope-axis-y')
      .call(slopeYAxis)
      .attr('transform', `translate(${width - padding.right},0)`)
      .attr('text-anchor', 'end')

    const slopeLine = d3
      .line()
      .curve(d3.curveNatural)
      .x((slope, index) => x(index + minx + 0.5))
      .y((slope) => slopeY(slope))

    for (const [key, slopes] of slopesArr) {
      svg
        .append('path')
        .datum(slopes)
        .attr('transform', (d, i) => `translate(${marginTime.left})`)
        .attr('class', 'thisDensityPath path-' + key.toLowerCase())
        .attr('fill', 'none')
        .attr('stroke', lineColor(key))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '10')
        .attr('stroke-linejoin', 'round')
        .attr('d', slopeLine)
    }
  }

  for (const [key, info] of Object.entries(datum)) {
    let show = info.show
    Object.defineProperty(info, 'show', {
      get() {
        return show
      },
      set(newShow) {
        if (show === newShow) return
        show = newShow
        if (newShow) {
          drawLine(key, info)
        } else {
          svg.select('.thisPath.path-' + key.toLowerCase()).remove()
        }
        svg.selectAll('.thisDensityPath, .slope-axis-y').remove()
        drawSlopes(
          Object.entries(datum)
            .filter(([key, info]) => info.show)
            .map(([key, info]) => [key, info.densitySlope]),
        )
      },
      enumerable: true,
      configurable: true,
    })
  }
  redraw()
  chartB = svg.node()
  barGraph.appendChild(chartB)
}
  function redrawBarByX(clickNode){
    newData = new Array(maxYear - minYear).fill(0)
    newData1 = new Array(maxYear - minYear).fill(0)
    for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
      datum[phylumName] = {
        show: false,
        data: new Array(maxYear - minYear).fill(0),
      }
    }
    let lastDataLane = -1
    let lastDataMax = 0
    var myMap = new Map();
    for (const data of earlyData) {
      if(clickNode.depth==1){
        if(data.Phylum!=clickNode.data.name) {
          continue
        }
      }else if(clickNode.depth==2){
        if(data.Phylum+data.Class!=(clickNode.parent.data.name+clickNode.data.name)){
          continue
        }
      }else if(clickNode.depth==3){
        if(data.Phylum+data.Class+data.Order!=(clickNode.parent.parent.data.name+clickNode.parent.data.name+clickNode.data.name)){
          continue
        }
      }else if(clickNode.depth==4){
        if(data.Phylum+data.Class+data.Order+data.Family!=(clickNode.parent.parent.parent.data.name+clickNode.parent.parent.data.name+clickNode.parent.data.name+clickNode.data.name)) {
        continue
        }
      }else if(clickNode.depth==5){
        if(data.Phylum+data.Class+data.Order+data.Family+data.Genus!=(clickNode.parent.parent.parent.parent.data.name+clickNode.parent.parent.parent.data.name+clickNode.parent.parent.data.name+clickNode.parent.data.name+clickNode.data.name)){
          continue
        }
      }else if(clickNode.depth==6){
        if(data.Phylum+data.Class+data.Order+data.Family+data.Genus+data.Species!=(clickNode.parent.parent.parent.parent.parent.data.name+clickNode.parent.parent.parent.parent.data.name+clickNode.parent.parent.parent.data.name+clickNode.parent.parent.data.name+clickNode.parent.data.name+clickNode.data.name)){
          continue
        }
    }
    if(typeof(myMap.get(data.Phylum+","+data.Class+data.Order+data.Family+data.Genus+data.Species)) == "undefined"){
      myMap.set(data.Phylum+","+data.Class+data.Order+data.Family+data.Genus+data.Species,[[data.start_year-minYear,data.end_year-minYear]])
    }
    else{
      myMap.get(data.Phylum+","+data.Class+data.Order+data.Family+data.Genus+data.Species).push([data.start_year-minYear,data.end_year-minYear])
    }
    }
    for(const [key, val] of myMap.entries()){
      const arr = datum[key.split(",")[0]].data
      var interval_y_merge = merge(val)
      for(let j = 0;j < interval_y_merge.length;j++){
        for (let i = interval_y_merge[j][0]; i < interval_y_merge[j][1]; i++) {
          arr[i]++
        }
      }
    }
    for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
      for (const [key, val] of datum[phylumName].data.entries()) {
        newData[key] += val
        newData1[key] +=val
      }
    }
    
    if(!Number.isNaN(minx)&&!Number.isNaN(maxx)){
      for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
        datum[phylumName] = {
          show: false,
          data: new Array(maxYear - minYear).fill(0),
        }
      }
      x= d3
    .scaleLinear()
    .domain([minx, maxx])
    .range([0, width - marginTime.left - marginTime.right])
    xAxis = d3.axisBottom(x).tickFormat(formatDate)
    thresholds = x.ticks(maxx-minx)
    let j=0
    for(j=0;j<maxx-minx;j++){
      newData[j]=newData[j+minx-minYear]
    }
    newData.splice(j,maxYear-minYear-j)
    }
    datum = {
      all: {
        show: true,
        data: newData,
      },
    }
    
    draw()
  }
  function redrawBargraphByY(min1,max1){
    newData = new Array(maxYear - minYear).fill(0)
    if(min1<=minYear){
      minx = minYear
    }else{
    if(String(min1).indexOf(".")+1!=0){
    minx = Math.floor(min1)
    }
    else{
      minx = min1
    }
  }
    if(String(max1).indexOf(".")+1!=0){
    maxx = Math.ceil(max1)
    }
    else{
      maxx = max1
    }
    for (const phylumName of PhylumClassOrderFamilyGenusSpecies.keys()) {
      datum[phylumName] = {
        show: false,
        data: new Array(maxYear - minYear).fill(0),
      }
    }
    if(!Number.isNaN(minx)&&!Number.isNaN(maxx)){
    
    x= d3
    .scaleLinear()
    .domain([minx, maxx])
    .range([0, width - marginTime.left - marginTime.right])
    xAxis = d3.axisBottom(x).tickFormat(formatDate)
    thresholds = x.ticks(maxx-minx)
    let j = 0
    for(j=0;j<maxx-minx;j++){
        newData[j]=newData1[j+minx-minYear]
      }
      
    newData.splice(j,maxYear-minYear-j)
      datum = {
        all: {
          show: true,
          data: newData,
        },
      }
    }
    draw()
  }
  return [earlyData, PhylumClassOrderFamilyGenusSpecies, datum,redrawBarByX,redrawBargraphByY]
})
