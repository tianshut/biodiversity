/* global d3 barGraphPromise reHighlightPromise */
window.timeGraphPromise = Promise.all([barGraphPromise, reHighlightPromise]).then(
  ([[finalData, PhylumClassOrderFamilyGenusSpecies, kdeDatum,redrawBarByX], reHighlight]) => {
    // 画timeline图
    const time = document.getElementById('time')
    const { width: widthT, height: heightT } = time.getBoundingClientRect()
    const marginTime = { top: 30, right: 30, bottom: 20, left: 40 }

    const yT = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, heightT - marginTime.bottom - marginTime.top])

    const formatDate = (d) => (d < 0 ? `${-d}MA` : `${d}AD`)

    const black = d3.color('black')
    const darkGrey = black.darker()

    const lineWidth = 0.7
    const strokeWidth = `${lineWidth}px`
    let chartT = null
    let filteredData = null
    let lineXPosition = null
    let lineYPosition = null
    let xT = null
   // let axisTop = null
    let axisBottom = null
    const getRect = function (d) {
      const el = d3.select(this)
      const sx = xT(d.start_year)
      const w = xT(d.end_year) - sx

      el.style('cursor', 'pointer')

      el.append('rect')
        .attr('x', sx)
        // .attr('height', yT.bandwidth())
        .attr('height', 3)
        .attr('width', w)
        .attr('fill', 'black')
        .append('title')
        .text(`${d.name}\n${d.start_year}~${d.end_year}`)
    }
    const draw = () => {
      if (!lineXPosition || !lineYPosition) return
      if (chartT) chartT.remove()

      const svg = d3
        .create('svg')
        .attr('width', widthT)
        .attr('height', heightT)
        .attr('viewBox', [0, 0, widthT, heightT])
      const lines = svg.append('g')
      for (const y of lineXPosition) {
        const yPos = marginTime.top + yT(y) - lineWidth / 2
        lines
          .append('line')
          .attr('x1', 0)
          .attr('y1', yPos)
          .attr('x2', widthT)
          .attr('y2', yPos)
          .attr('stroke', 'black')
          .attr('stroke-width', strokeWidth)
          .attr('stroke-dasharray', '10')
          .attr('pointer-events', 'none')
      }
      for (const x of lineYPosition) {
        const xPos = marginTime.left + xT(x) - lineWidth / 2
        lines
          .append('line')
          .attr('x1', xPos)
          .attr('y1', 0)
          .attr('x2', xPos)
          .attr('y2', heightT)
          .attr('stroke', 'black')
          .attr('stroke-width', strokeWidth)
          .attr('stroke-dasharray', '10')
          .attr('pointer-events', 'none')
      }

      const g = svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginTime.left} ${marginTime.top})`)

      const groups = g.selectAll('g').data(filteredData).enter().append('g').attr('class', 'civ')
     // console.log(filteredData)
      groups.attr('transform', (d, i) => `translate(0 ${yT(d.centerPos) - 1.5})`)

      groups
        .each(getRect)
        .on('mouseover', function (d) {
          d3.select(this).select('rect').attr('fill', darkGrey)
        })
        .on('mouseleave', function (d) {
          d3.select(this).select('rect').attr('fill', 'black')
        })

     // svg
     //   .append('g')
       // .attr('transform', (d, i) => `translate(${marginTime.left} ${marginTime.top - 10})`)
        //.call(axisTop)

      svg
        .append('g')
        .attr('transform', (d, i) => `translate(${marginTime.left} ${heightT - marginTime.bottom})`)
        .call(axisBottom)

      chartT = svg.node()
      time.appendChild(chartT)
    }

    class LineSegments {
      constructor(name, centerPos) {
        this.name = name
        this.centerPos = centerPos
        this.segments = []
      }

      _lowerBound(key) {
        const segments = this.segments
        let first = 0
        let len = segments.length
        while (len > 0) {
          const half = len >> 1
          const middle = first + half
          if (segments[middle] < key) {
            first = middle + 1
            len = len - half - 1
          } else {
            len = half
          }
        }
        return first
      }

      _upperBound(key) {
        const segments = this.segments
        let first = 0
        let len = segments.length - 1
        while (len > 0) {
          const half = len >> 1
          const middle = first + half
          if (segments[middle] > key) {
            len = half
          } else {
            first = middle + 1
            len = len - half - 1
          }
        }
        return first
      }

      add(data) {
        const segments = this.segments
        const { start_year: startYear, end_year: endYear } = data
        const end = (((this._upperBound(endYear) - 1) >> 1) << 1) + 1
        if (end === -1) {
          segments.unshift(startYear, endYear)
          return
        }
        const start = (this._lowerBound(startYear) >> 1) << 1
        if (start === segments.length) {
          segments.push(startYear, endYear)
          return
        }
        segments.splice(
          start,
          end - start + 1,
          Math.min(startYear, segments[start]),
          Math.max(endYear, segments[end]),
        )
      }

      pushResults(result) {
        const { segments, name, centerPos } = this
        for (let i = 0; i < segments.length; i += 2) {
          result.push(
            Object.freeze({
              start_year: segments[i],
              end_year: segments[i + 1],
              name,
              centerPos,
            }),
          )
        }
      }
    }

    function redrawTimeByX(datumArr, lineXPos) {
      const nextList = []
      for (const [name, centerPos, datum] of datumArr) {
        const lineSegments = new LineSegments(name, centerPos)
        for (const data of datum) {
          lineSegments.add(data)
        }
        lineSegments.pushResults(nextList)
      }
      filteredData = nextList
      lineXPosition = lineXPos
      draw()
    }
    function redrawTimeByY(lineYPos, minYear, maxYear) {
      lineYPosition = lineYPos
      xT = d3
        .scaleLinear()
        .domain([minYear, maxYear])
        .range([0, widthT - marginTime.left - marginTime.right])

     // axisTop = d3.axisTop(xT).tickPadding(2).tickFormat(formatDate)

      axisBottom = d3.axisBottom(xT).tickPadding(2).tickFormat(formatDate)
      draw()
    }

    // const chartT = (() => {
    //   const parent = document.createElement('div')

    //   const svg = d3.select(DOM.svg(widthT + 200, heightT))

    //   const g = svg
    //     .append('g')
    //     .attr('transform', (d, i) => `translate(${marginTime.left} ${marginTime.top})`)

    //   svg
    //     .append('g')
    //     .attr('transform', (d, i) => `translate(${marginTime.left} ${marginTime.top - 10})`)
    //     .call(axisTop)

    //   svg
    //     .append('g')
    //     .attr('transform', (d, i) => `translate(${marginTime.left} ${heightT - marginTime.bottom})`)
    //     .call(axisBottom)

    //   parent.appendChild(svg.node())
    //   return parent
    // })()

    return {
      PhylumClassOrderFamilyGenusSpecies,
      kdeDatum,
      reHighlight,
      redrawTimeByX,
      redrawTimeByY,
      marginTime,
    }
  },
)
