/* global d3 timeGraphPromise */
Promise.all([d3.json('./static/data/picture.json'), timeGraphPromise]).then(
  ([pictureJson, { redrawTimeByY, marginTime }]) => {
    barGraphPromise.then(([finalData, PhylumClassOrderFamilyGenusSpecies, kdeDatum,redrawBarByX,redrawBargraphByY]) => {
    const picture = document.getElementById('picture')
    const margin = { right: marginTime.right, left: marginTime.left }
    let { width, height } = picture.getBoundingClientRect()
    width -= margin.left + margin.right
    const format = d3.format('.2f')

    ;(function ensureMinMax(node) {
      if (!node.children){
      node.clic = 0
      return
      } 
      for (const child of node.children) {
        ensureMinMax(child)
      }
      node.min = node.children[0].min
      node.max = node.children[node.children.length - 1].max
      node.clic = 0
    })(pictureJson)

    const partition = (data) => {
      const root = d3.hierarchy(data).sum((d) => (d.children ? 0 : d.max - d.min))
      return d3.partition().size([width, ((root.height + 1) * height) / 3])(root)
    }

    const chart = (() => {
      const root = partition(pictureJson)
      let focus = root

      window.pnode = focus
      const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width + margin.left])
        .attr('width', width + margin.left)
        .attr('height', height)
        .style('font', '10px sans-serif')
        .style('font-weight', 'bold')
        .style('text-shadow', 'white 0 0 1px')
      var cell = svg
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', (d) => `translate(${d.x0 + margin.left},${d.y0})`)

      function updateLineY(node) {
        let lineYPosition
        if (!node.children) lineYPosition = []
        else {
          lineYPosition = (node.children[0].children
            ? node.children.map((child) => child.children).flat()
            : node.children
          ).map((child) => child.data.max)
          lineYPosition.pop()
        }
        redrawTimeByY(lineYPosition, node.data.min, node.data.max)
        redrawBargraphByY(node.data.min, node.data.max)
      }
      var rect = cell
        .append('rect')
        .attr('width', (d) => rectWidth(d))
        .attr('height', (d) => d.y1 - d.y0 - 1)
        .attr('fill', (d) => {
          d.data.colorBase = d.data.color
          return d.data.color
        })
        .style('outline', 'white solid 0.5px')
        .style('cursor', 'pointer')
        .on('click', clicked)

      var text = cell
        .append('text')
        .style('user-select', 'none')
        .attr('pointer-events', 'none')
        .attr('x', 4)
        .attr('y', 13)
        .attr('fill-opacity', (d) => Number(labelVisible(d)))

      text.append('tspan').text((d) => d.data.name)

      var tspan = text
        .append('tspan')
        .attr('fill-opacity', (d) => Number(labelVisible(d)) * 0.7)
        .text((d) => ` ${format(d.data.min)}~${format(d.data.max)}`)

      cell.append('title').text(
        (d) =>
          `${d
            .ancestors()
            .map((d) => d.data.name)
            .reverse()
            .join('/')}\n${format(d.data.min)}~${format(d.data.max)}`,
      )

      function clicked(p) {
        p.data.clic++
        pnode = p
        if(p.parent.depth==0||p.depth==0){
          timeMin = -251.90
          timeMax = -66
        }
        else{
        if(p.parent){
          p.parent.data.clic++
        }
        if(p.parent.parent){
          p.parent.parent.data.clic++
        }
        if(p.data.clic%2==0){
          if(p.parent){
        timeMin = pnode.parent.data.min
        timeMax = pnode.parent.data.max
          }
        }
        else{
        timeMin = pnode.data.min
        timeMax = pnode.data.max
        }
      }
        redraw1(p)
        if (p === root) return
        focus = focus === p ? (p = p.parent) : p
        root.each(
          (d) =>
            (d.target = {
              x0: ((d.x0 - p.x0) / (p.x1 - p.x0)) * width,
              x1: ((d.x1 - p.x0) / (p.x1 - p.x0)) * width,
              y0: d.y0 - p.y0,
              y1: d.y1 - p.y0,
            }),
        )
        updateLineY(focus)

        const t = cell
          .transition()
          .duration(750)
          .attr('transform', (d) => `translate(${d.target.x0 + margin.left},${d.target.y0})`)

        rect.transition(t).attr('width', (d) => rectWidth(d.target))
        text.transition(t).attr('fill-opacity', (d) => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', (d) => labelVisible(d.target) * 0.7)
        
      }

      function rectWidth(d) {
        return d.x1 - d.x0
      }

      function labelVisible(d) {
        return d.y1 <= height && d.y0 >= 0 && d.x1 - d.x0 > 16
      }

      updateLineY(root)
      var arr = [[1,3], [2,6],[15,18],[8,10],[10,11],[7,8]]
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
      function reclicked(p){
        if (p === root) return
        const t = cell
          .transition()
          .duration(750)
          .attr('transform', (d) => `translate(${d.target.x0 + margin.left},${d.target.y0})`)

        rect.transition(t).attr('width', (d) => rectWidth(d.target))
        text.transition(t).attr('fill-opacity', (d) => +labelVisible(d.target))
        tspan.transition(t).attr('fill-opacity', (d) => labelVisible(d.target) * 0.7)
      }
      window.redraw2=(no)=>{
        var data1 = root.descendants()
        var j =0
        var timeStartEnd1 = timeStartEnd.reduce(function (a, b) { return a.concat(b)} ); 
        var timeStartEnd2 = merge(timeStartEnd1)  
        for(var i = 0;i<data1.length;i++){
          for(j = 0;j<timeStartEnd2.length;j++){
              if(!((timeStartEnd2[j][0]<=data1[i].data.min&&timeStartEnd2[j][1]<=data1[i].data.min)||(timeStartEnd2[j][0]>=data1[i].data.max &&timeStartEnd2[j][1]>=data1[i].data.max ))){
                
                data1[i].data.color = data1[i].data.colorBase
              }
              else{
                data1[i].data.color = '#F8F8FF'
              }
            }
        }
        rect = cell
        .append('rect')
        .attr('width', (d) => rectWidth(d))
        .attr('height', (d) => d.y1 - d.y0 - 1)
        .attr('fill', (d) => {
          return d.data.color
        })
        .style('outline', 'white solid 0.5px')
        .style('cursor', 'pointer')
        .on('click', clicked)
        text = cell
        .append('text')
        .style('user-select', 'none')
        .attr('pointer-events', 'none')
        .attr('x', 4)
        .attr('y', 13)
        .attr('fill-opacity', (d) => Number(labelVisible(d)))

      text.append('tspan').text((d) => d.data.name)

      var tspan = text
        .append('tspan')
        .attr('fill-opacity', (d) => Number(labelVisible(d)) * 0.7)
        .text((d) => ` ${format(d.data.min)}~${format(d.data.max)}`)

      cell.append('title').text(
        (d) =>
          `${d
            .ancestors()
            .map((d) => d.data.name)
            .reverse()
            .join('/')}\n${format(d.data.min)}~${format(d.data.max)}`,
      )
        reclicked(pnode)
      }
      return svg.node()
    })()

    picture.appendChild(chart)
  })
    },
  )
