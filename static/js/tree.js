/* global timeGraphPromise d3 */
timeGraphPromise.then(
  ({ PhylumClassOrderFamilyGenusSpecies, kdeDatum, reHighlight, redrawTimeByX, marginTime }) => {
    barGraphPromise.then(([finalData, PhylumClassOrderFamilyGenusSpecies, kdeDatum,redrawBarByX]) => {
    const marginTree = { top: marginTime.top, bottom: marginTime.bottom, left: 1 }
    const tree = document.getElementById('tree')
    let { width, height } = tree.getBoundingClientRect()
    height -= marginTree.top + marginTree.bottom
    width -= marginTree.left
    window.timeMin = -251.90
    window.timeMax = -66
    
    function transform(node) {
      if (Array.isArray(node)) {
        return [...node[1]].map((data) => ({ name: data.Species, data }))
      }
      return [...node.entries()].map(([name, childNode]) => ({
        name,
        children: transform(childNode),
      }))
    }

    const myDict = {}
    myDict.name = 'all'
    myDict.children = transform(PhylumClassOrderFamilyGenusSpecies)

    //   const myDict = {}
    //   myDict.name = 'all'
    //   myDict.children = transform(PhylumClassOrderFamilyGenusSpecies)

    //   function assignValue(myDict,beforeValue){
    //     let array=myDict['children']
    //     if(!array){
    //         myDict['value']=1/beforeValue
    //         console.log(myDict['value'])
    //     }else{
    //       let arrayLength=array.length
    //       beforeValue=beforeValue*arrayLength
    //       array.forEach((d)=>{
    //         assignValue(d,beforeValue)
    //       })
    //     }

    // }
    // assignValue(myDict,1)

    const partition = (data) => {
      const root = d3
        .hierarchy(data)
        .count()
        .eachBefore(function (node) {
          if (!node.children || !node.children.length) return
          let logSum = 0
          for (const child of node.children) {
            logSum += child._logValue = Math.log2(child.value + 1)
          }
          let sum = 0
          const linePos = []
          for (const child of node.children) {
            const ratio = child._logValue / logSum
            child.value = ratio * node.value
            child.data.centerPos = sum + ratio / 2
            sum += ratio
            linePos.push(sum)
          }
          linePos.pop()
          node.data.linePos = linePos
          node.data.clic = 0
        })
      return d3.partition().size([height, ((root.height + 1) * width) / 2])(root)
    }

    const chart = (() => {
      const root = partition(myDict)
      //console.log(root)
      let focus = root
      window.tnode = focus
      const svg = d3
        .create('svg')
        .attr('viewBox', [
          0,
          0,
          width + marginTree.left,
          height + marginTree.top + marginTree.bottom,
        ])
        .attr('width', width + marginTree.left)
        .attr('height', height + marginTree.top + marginTree.bottom)
        .style('font', '10px sans-serif')

      let timer = 0
      let lastNode = null
      const clickListener = (node) => {
        
        tnode = node
        if (node.depth === 1) {
          if (node === lastNode) {
            lastNode = null
            if (timer) clearTimeout(timer)
            handleDblClick(node)
          } else {
            lastNode = node
            timer = setTimeout(() => {
              timer = 0
              lastNode = null
              clicked(node)
            }, 300)
          }
        } else {
          clicked(node)
        }
      }

      const createCell = (nodes) => {
        const cell = svg
          .selectAll(null)
          .data(nodes)
          .enter()
          .insert('g')
          .attr('class', 'tree-cell')
          .attr(
            'transform',
            (d) => `translate(${d.target.y0 + marginTree.left},${d.target.x0 + marginTree.top})`,
          )

        cell
          .append('rect')
          .attr('class', 'tree-rect')
          .attr('width', 142.5)
          .attr('height', (d) => rectHeight(d.target))
          .attr(
            'fill',
            'white',
            // (d) => {
            //   if (!d.depth) return 'grey'
            //   else return 'lightgrey'
            // }
          )
          .style('outline', 'rgb(179, 179, 179) solid 1px')
          .style('cursor', (d) => (d.children ? 'pointer' : 'not-allowed'))
          .filter((d) => d.children && d !== root)
          .on('click', clickListener)

        const text = cell
          .append('text')
          .attr('class', 'tree-text')
          .style('user-select', 'none')
          .attr('pointer-events', 'none')
          .attr('x', 33)
          .attr('y', (d) => rectHeight(d.target) / 2 + 5)
          .attr('fill-opacity', (d) => +labelVisible(d.target))

        text.append('tspan').text((d) => d.data.name)

        cell.append('title').text(
          (d) =>
            `${d
              .ancestors()
              .map((d) => d.data.name)
              .reverse()
              .join('/')}\n`,
        )
      }
      
      function trigger(node) {
        const datumArr = node.children.map((child) => [
          child.data.name,
          child.data.centerPos,
          child.leaves().map((leave) => leave.data.data),
        ])
        var arr1 = new Array()
        for(var i = 0;i < datumArr.length;i++){
          arr1[i] = new Array()
          for(var j = 0;j < datumArr[i][2].length;j++){
            arr1[i][j] = new Array()
            arr1[i][j][0] = datumArr[i][2][j].start_year
            arr1[i][j][1] = datumArr[i][2][j].end_year
          }
        }
        window.timeStartEnd = arr1
        reHighlight(datumArr.map((arr) => arr[2]).flat())
        redrawTimeByX(datumArr, node.data.linePos)
        redrawBarByX(node)
      }

      const calcPosition = (d) =>
        (d.target = {
          x0: ((d.x0 - focus.x0) / (focus.x1 - focus.x0)) * height,
          x1: ((d.x1 - focus.x0) / (focus.x1 - focus.x0)) * height,
          y0: d.y0 - focus.y0,
          y1: d.y1 - focus.y0,
        })

      function ensureNodes(focus) {
        const nodes = []
        const check = (node) => {
          if (!node._inDom) {
            var mainNode = node
            var j1,j2,j3,j4,j5,j6,j7 = 0
            if(node.data.data){
             if(!((node.data.data.start_year<=timeMin&&node.data.data.end_year<=timeMin)||(node.data.data.start_year>=timeMax&&node.data.data.end_year>=timeMax))){
              nodes.push(mainNode)
             }
            }
            else{
              for(var i1 = 0;i1<node.children.length;i1++){
              if(j1==1)
                break;
              node1 = node.children[i1]
              if(node1.data.data){ 
                if(!((node1.data.data.start_year<=timeMin&&node1.data.data.end_year<=timeMin)||(node1.data.data.start_year>=timeMax&&node1.data.data.end_year>=timeMax))){
                  nodes.push(mainNode)
                  j1++
                }
              }
              else{
              for(var i2 = 0;i2<node1.children.length;i2++){
                if(j2==1)
                  break;
                node2 = node1.children[i2]
                if(node2.data.data){
                  if(!((node2.data.data.start_year<=timeMin&&node2.data.data.end_year<=timeMin)||(node2.data.data.start_year>=timeMax&&node2.data.data.end_year>=timeMax))){
                    nodes.push(mainNode)
                    j2++
                  }
                }
                else{
                for(var i3 = 0;i3<node2.children.length;i3++){
                  if(j3==1)
                    break;
                  node3 = node2.children[i3]
                  if(node3.data.data){
                  if(!((node3.data.data.start_year<=timeMin&&node3.data.data.end_year<=timeMin)||(node3.data.data.start_year>=timeMax&&node3.data.data.end_year>=timeMax))){
                    nodes.push(mainNode)
                    j3++
                  }
                  }
                  else{
                  for(var i4 = 0;i4<node3.children.length;i4++){
                    if(j4==1)
                      break;
                    node4 = node3.children[i4]
                    if(node4.data.data){
                    if(!((node4.data.data.start_year<=timeMin&&node4.data.data.end_year<=timeMin)||(node4.data.data.start_year>=timeMax&&node4.data.data.end_year>=timeMax))){
                      nodes.push(mainNode)
                      j4++
                    }
                    }
                    else{
                    for(var i5 = 0;i5<node4.children.length;i5++){
                      if(j5==1)
                          break;
                      node5 = node4.children[i5]
                      if(node5.data.data){
                      if(!((node5.data.data.start_year<=timeMin&&node5.data.data.end_year<=timeMin)||(node5.data.data.start_year>=timeMax&&node5.data.data.end_year>=timeMax))){
                        nodes.push(mainNode)
                        j5++
                      }
                    }
                      else{
                      for(var i6 = 0;i6<node5.children.length;i6++){
                        if(j6==1)
                          break;
                        node6 = node5.children[i6]
                        if(node6.data.data){
                        if(!((node6.data.data.start_year<=timeMin&&node6.data.data.end_year<=timeMin)||(node6.data.data.start_year>=timeMax&&node6.data.data.end_year>=timeMax))){
                          nodes.push(mainNode)
                          j6++
                        }
                      }
                        else{
                        for(var i7 = 0;i7<node6.children.length;i7++){
                          if(j7==1)
                          break;
                          node7 = node6.children[i7]
                          if(node7.data.data){
                          if(!((node7.data.data.start_year<=timeMin&&node7.data.data.end_year<=timeMin)||(node7.data.data.start_year>=timeMax&&node7.data.data.end_year>=timeMax))){
                            nodes.push(mainNode)
                            j7++
                          }
                        }
                        }
                      }
                      } 
                    }
                  }
                } 
                }  
              }
              }  
            }
            }  
          }
            }
          }
          //nodes.push(node)
          }
          else if (node._inDom == true) {
            var mainNode = node
            var j1,j2,j3,j4,j5,j6,j7 = 0
            if(node.data.data){
             if(!((node.data.data.start_year<=timeMin&&node.data.data.end_year<=timeMin)||(node.data.data.start_year>=timeMax&&node.data.data.end_year>=timeMax))){
              nodes.push(mainNode)
             }
            }
            else{
              for(var i1 = 0;i1<node.children.length;i1++){
              if(j1==1)
                break;
              node1 = node.children[i1]
              if(node1.data.data){ 
                if(!((node1.data.data.start_year<=timeMin&&node1.data.data.end_year<=timeMin)||(node1.data.data.start_year>=timeMax&&node1.data.data.end_year>=timeMax))){
                  nodes.push(mainNode)
                  j1++
                }
              }
              else{
              for(var i2 = 0;i2<node1.children.length;i2++){
                if(j2==1)
                  break;
                node2 = node1.children[i2]
                if(node2.data.data){
                  if(!((node2.data.data.start_year<=timeMin&&node2.data.data.end_year<=timeMin)||(node2.data.data.start_year>=timeMax&&node2.data.data.end_year>=timeMax))){
                    nodes.push(mainNode)
                    j2++
                  }
                }
                else{
                for(var i3 = 0;i3<node2.children.length;i3++){
                  if(j3==1)
                    break;
                  node3 = node2.children[i3]
                  if(node3.data.data){
                  if(!((node3.data.data.start_year<=timeMin&&node3.data.data.end_year<=timeMin)||(node3.data.data.start_year>=timeMax&&node3.data.data.end_year>=timeMax))){
                    nodes.push(mainNode)
                    j3++
                  }
                  }
                  else{
                  for(var i4 = 0;i4<node3.children.length;i4++){
                    if(j4==1)
                      break;
                    node4 = node3.children[i4]
                    if(node4.data.data){
                    if(!((node4.data.data.start_year<=timeMin&&node4.data.data.end_year<=timeMin)||(node4.data.data.start_year>=timeMax&&node4.data.data.end_year>=timeMax))){
                      nodes.push(mainNode)
                      j4++
                    }
                    }
                    else{
                    for(var i5 = 0;i5<node4.children.length;i5++){
                      if(j5==1)
                          break;
                      node5 = node4.children[i5]
                      if(node5.data.data){
                      if(!((node5.data.data.start_year<=timeMin&&node5.data.data.end_year<=timeMin)||(node5.data.data.start_year>=timeMax&&node5.data.data.end_year>=timeMax))){
                        nodes.push(mainNode)
                        j5++
                      }
                    }
                      else{
                      for(var i6 = 0;i6<node5.children.length;i6++){
                        if(j6==1)
                          break;
                        node6 = node5.children[i6]
                        if(node6.data.data){
                        if(!((node6.data.data.start_year<=timeMin&&node6.data.data.end_year<=timeMin)||(node6.data.data.start_year>=timeMax&&node6.data.data.end_year>=timeMax))){
                          nodes.push(mainNode)
                          j6++
                        }
                      }
                        else{
                        for(var i7 = 0;i7<node6.children.length;i7++){
                          if(j7==1)
                          break;
                          node7 = node6.children[i7]
                          if(node7.data.data){
                          if(!((node7.data.data.start_year<=timeMin&&node7.data.data.end_year<=timeMin)||(node7.data.data.start_year>=timeMax&&node7.data.data.end_year>=timeMax))){
                            nodes.push(mainNode)
                            j7++
                          }
                        }
                        }
                      }
                      } 
                    }
                  }
                } 
                }  
              }
              }  
            }
            }  
          }
            }
          }
          }
        }
        check(focus)
        for (const child of focus.children) {
          check(child)
        }
        for (const node of nodes) {
          node._inDom = true
          calcPosition(node)
        }
        createCell(nodes)
      }

      var j1=0,j2=0,j3=0,j4=0,j5=0,j6 =0,j7 = 0
      function clearNodes() {
        var d01,d02,d03,d04,d05,d06,d07
        svg
          .selectAll('.tree-cell')
          .filter((d) => {
            if (
              d.parent !== focus &&
              d.parent !== focus.parent &&
              d !== focus &&
              focus.parent !== d
            ) {
              d._inDom = false
              return true
            }
            else{ 
            if(d.data.data){//last level
              if(!((d.data.data.start_year<=timeMin&&d.data.data.end_year<=timeMin)||(d.data.data.start_year>=timeMax&&d.data.data.end_year>=timeMax))){
                return false
              }
              else return true
            }
            else {
              for(var i1 = 0;i1<d.children.length;i1++){
                d01 = d.children[i1]
                if(d01.data.data){ 
                  j1++
                    if(!((d01.data.data.start_year<=timeMin&&d01.data.data.end_year<=timeMin)||(d01.data.data.start_year>=timeMax&&d01.data.data.end_year>=timeMax))){
                      return false
                  }
                }
                else{
                  for(var i2 = 0;i2<d01.children.length;i2++){
                    d02 = d01.children[i2]
                    if(d02.data.data){
                      j2++
                        if(!((d02.data.data.start_year<=timeMin&&d02.data.data.end_year<=timeMin)||(d02.data.data.start_year>=timeMax&&d02.data.data.end_year>=timeMax))){
                          return false
                      }
                    }
                    else{
                    for(var i3 = 0;i3<d02.children.length;i3++){
                        d03 = d02.children[i3]
                      if(d03.data.data){
                        j3++
                        if(!((d03.data.data.start_year<=timeMin&&d03.data.data.end_year<=timeMin)||(d03.data.data.start_year>=timeMax&&d03.data.data.end_year>=timeMax))){
                          return false
                      }
                      }
                      else{
                        for(var i4 = 0;i4<d03.children.length;i4++){
                          d04 = d03.children[i4]
                          if(d04.data.data){
                            j4++
                            if(!((d04.data.data.start_year<=timeMin&&d04.data.data.end_year<=timeMin)||(d04.data.data.start_year>=timeMax&&d04.data.data.end_year>=timeMax))){
                              return false
                          }
                          }
                          else{
                            for(var i5 = 0;i5<d04.children.length;i5++){
                              d05 = d04.children[i5]
                              if(d05.data.data){
                              j5++
                              if(!((d05.data.data.start_year<=timeMin&&d05.data.data.end_year<=timeMin)||(d05.data.data.start_year>=timeMax&&d05.data.data.end_year>=timeMax))){
                                return false
                              }
                              }
                              else{
                                for(var i6 = 0;i6<d05.children.length;i6++){
                                  d06 = d05.children[i6]
                                  if(d06.data.data){
                                   // console.log(d06)
                                    j6++
                                  if(!((d06.data.data.start_year<=timeMin&&d06.data.data.end_year<=timeMin)||(d06.data.data.start_year>=timeMax&&d06.data.data.end_year>=timeMax))){
                                    return false
                                  }
                                 }
                                  else{
                                    for(var i7 = 0;i7<d06.children.length;i7++){
                                      d07 = d06.children[i7] 
                                      if(d07.data.data){
                                      j7++
                                      if(!((d07.data.data.start_year<=timeMin&&d07.data.data.end_year<=timeMin)||(d07.data.data.start_year>=timeMax&&d07.data.data.end_year>=timeMax))){
                                        return false
                                      }
                                    }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  }
                }
              }
              return true
            }
          }
          })
          .remove()
          .size()
      }

      function clicked(node) {
        tnode = node
        tnode.data.clic++
        if (!node.children || node === root) return
        const nextFocus = focus === node ? node.parent : node
        ensureNodes(nextFocus)
        focus = nextFocus
        trigger(focus)

        const t = svg
          .selectAll('.tree-cell')
          .each(calcPosition)
          .transition()
          .duration(750)
          .attr(
            'transform',
            (d) => `translate(${d.target.y0 + marginTree.left},${d.target.x0 + marginTree.top})`,
          )

        svg
          .selectAll('.tree-rect')
          .transition(t)
          .attr('height', (d) => rectHeight(d.target))
        svg
          .selectAll('.tree-text')
          .transition(t)
          .attr('fill-opacity', (d) => +labelVisible(d.target))
          .attr('y', (d) => rectHeight(d.target) / 2 + 5)

        t.end().then(clearNodes, () => {})
        redraw2(node) 

      }

      const handleDblClick = (d) => {
        kdeDatum[d.data.name].show = !kdeDatum[d.data.name].show
      }

      function rectHeight(d) {
        return d.x1 - d.x0
      }

      function labelVisible(d) {
        return d.x1 - d.x0 > 16
      }

      ensureNodes(root)
      trigger(root)
      function reclicked(node) {
        if (!node.children) return
        const nextFocus = tnode
        ensureNodes(nextFocus)
        

        const t = svg
          .selectAll('.tree-cell')
          .each(calcPosition)
          .transition()
          .duration(750)
          .attr(
            'transform',
            (d) => `translate(${d.target.y0 + marginTree.left},${d.target.x0 + marginTree.top})`,
          )

        svg
          .selectAll('.tree-rect')
          .transition(t)
          .attr('height', (d) => rectHeight(d.target))
        svg
          .selectAll('.tree-text')
          .transition(t)
          .attr('fill-opacity', (d) => +labelVisible(d.target))
          .attr('y', (d) => rectHeight(d.target) / 2 + 5)

        t.end().then(clearNodes, () => {})
      }
      window.redraw1=(p)=>{
        if (tnode.depth === 1) {
          if (tnode === lastNode) {
            lastNode = null
            if (timer) clearTimeout(timer)
            handleDblClick(tnode)
          } else {
            lastNode = tnode
            timer = setTimeout(() => {
              timer = 0
              lastNode = null
              reclicked(tnode)
            }, 300)
          }
        } else {
          reclicked(tnode)
        }
      }
      return svg.node()
    })()

    tree.appendChild(chart)
  })
  },
)
