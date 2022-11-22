/* global dataPromise L d3 switchPage */
window.reHighlightPromise = dataPromise.then(
  ([dataCollection, PhylumClassOrderFamilyGenusSpecies]) => {
    // var mymap = L.map("map-id").setView([37.595, 112.069], 2);
    // var myIcon = L.icon({
    //   iconUrl: "leaflet/images/marker-icon-2x.png",
    //
    //   iconSize: [12, 20], // size of the icon
    //   iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    //   popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
    // });

    // const temporary=L.tileLayer(
    //   "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    //   {
    //     attribution:
    //       'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     maxZoom: 18,
    //     id: "mapbox/streets-v11",
    //     tileSize: 512,
    //     zoomOffset: -1,
    //     accessToken:
    //       "pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg",
    //   }
    // ).addTo(mymap);
    //
    // const ancient=L.tileLayer('./img/Map_200.jpg',
    // {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors',
    //     tileSize: 512,
    //     zoomOffset: -1,
    //     maxZoom: 18
    // }
    //     ).addTo(mymap);
    //
    // L.control.sideBySide(temporary, ancient).addTo(mymap);

    var center = [37.595, 112.069]

    const stamenOptions = {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
        '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
        'Map data OpenStreetmap',
      subdomains: 'abcd',
      minZoom: 1,
      maxZoom: 20,
    }

    const layer1 = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          'pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg',
      },
      stamenOptions,
    )

    /* var layer2 = L.tileLayer('./img/Map_200.jpg', stamenOptions) */

    const map1 = L.map('map-1', {
      layers: [layer1],
      crs: L.CRS.EPSG3857,
      minZoom: 1, // mapbox will give a 404 when zoom level sets to 0
      zoomControl: false,
      scrollWheelZoom: true,
    })

    map1.setView(center, 1)

    const imageBoundsArr = [
      [
        [-90, -540],
        [90, -180],
      ],
      [
        [-90, -180],
        [90, 180],
      ],
      [
        [-90, 180],
        [90, 540],
      ],
    ]
    const maxBounds = [
      [-90, -360],
      [90, 360],
    ]
    const mapImgs = [
      './static/js/img/Map48a ETr Induan-Olenekian_245.jpg',
      './static/js/img/Map47a MTr Anisian_240.jpg',
      './static/js/img/Map44a LtTr Norian_210.jpg',
      './static/js/img/Map42a EJ Hettangian_195.jpg',
      './static/js/img/Map38a MJ Aalenian_175.jpg',
      './static/js/img/Map34a LtJ Kimmeridgian_155.jpg',
      './static/js/img/Map27a EK Early Albian_120.jpg',
      './static/js/img/Map21a LtK Turonian_090.jpg',
    ]
    const ancientMaps = mapImgs.map((url, i) => {
      const layers = imageBoundsArr.map((imageBounds) => L.imageOverlay(url, imageBounds))
      return L.map('map-' + (i + 2), {
        layers,
        maxBounds,
        crs: L.CRS.EPSG4326,
        zoomControl: false,
        minZoom: 1,
      }).setView(center, 0)
    })
    const maps = [map1, ...ancientMaps]

    // var map2 = L.map('map2', {
    //         layers: [layer2],
    //         center: center,
    //         maxBounds: imageBounds,
    //         zoomControl: false
    //     });

    //   map2.setView([10, 0], 1);
    for (const map of maps) {
      for (const anotherMap of maps) {
        if (anotherMap !== map) map.sync(anotherMap, { syncCursor: true })
      }
    }

    const myGroup = L.layerGroup().addTo(map1)

    const leafletConfig = {
      radius: 1,
      color: '#ff0000',
      keyboard: false,
      interactive: false,
      pane: 'markerPane',
    }

    const heatmapOptions = {
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      radius: 10,
      minOpacity: 0.7,
    }

    const myHeatMaps = ancientMaps.map((map) => L.heatLayer([], heatmapOptions).addTo(map))

    let ancientLatLng = myHeatMaps.map(() => [])
    let modernLatLng = []

    const largeMap = new (class LargeMap {
      constructor() {
        this.map = null
        this.mapId = null
        this.layer = null
        const ALLOWED_MOVING_DISTANCE = 5 // 鼠标移动 5px 及以内算作点击
        let lastMousePos = null
        d3.selectAll('.select-map')
          .on('mousedown', function () {
            lastMousePos = d3.mouse(this)
          })
          .on('click', function () {
            const movedDistance = d3
              .mouse(this)
              .reduce((acc, val, i) => acc + (val - lastMousePos[i]) ** 2, 0)
            if (movedDistance > ALLOWED_MOVING_DISTANCE) {
              return
            }
            const id = Number(this.id.slice(4))
            switchPage('large-map', largeMap.destroy)
            largeMap.init(id)
          })
      }

      hasMap() {
        return !!largeMap.map
      }

      init(id) {
        largeMap.mapId = id
        let options
        if (id === 1) {
          const layer1 = L.tileLayer(
            'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
            {
              maxZoom: 18,
              id: 'mapbox/streets-v11',
              tileSize: 512,
              zoomOffset: -1,
              accessToken:
                'pk.eyJ1IjoidGF5dGF5dGF5dGF5bG9yIiwiYSI6ImNqeGZkMWxpZTBsNDYzb29nNnh4Nm5wOTIifQ.wqEeGFygVQ-Uor1_rWvVNg',
            },
            stamenOptions,
          )
          largeMap.layer = L.layerGroup()
          options = {
            layers: [layer1, largeMap.layer],
            crs: L.CRS.EPSG3857,
            minZoom: 1, // mapbox will give a 404 when zoom level sets to 0
            zoomControl: false,
          }
        } else {
          const layers = imageBoundsArr.map((imageBounds) =>
            L.imageOverlay(mapImgs[id - 2], imageBounds),
          )
          largeMap.layer = L.heatLayer([], heatmapOptions)
          layers.push(largeMap.layer)
          options = {
            layers,
            maxBounds,
            crs: L.CRS.EPSG4326,
            minZoom: 1,
            zoomControl: false,
          }
        }
        largeMap.map = L.map('map-10', options).setView(
          maps[id - 1].getCenter(),
          maps[id - 1].getZoom(),
        )
        for (const anotherMap of maps) {
          largeMap.map.sync(anotherMap, { syncCursor: true })
          anotherMap.sync(largeMap.map, { syncCursor: true })
        }
        largeMap.updateLayer()
      }

      updateLayer() {
        if (largeMap.mapId === 1) {
          largeMap.map.removeLayer(largeMap.layer)
          largeMap.layer.clearLayers()
          for (const data of modernLatLng) {
            L.circleMarker(data, leafletConfig).addTo(largeMap.layer)
          }
          largeMap.layer.addTo(largeMap.map)
        } else {
          largeMap.layer.setLatLngs(ancientLatLng[largeMap.mapId - 2])
        }
      }

      destroy() {
        for (const anotherMap of maps) {
          largeMap.map.unsync(anotherMap)
          anotherMap.unsync(largeMap.map)
        }
        largeMap.map.remove()
        largeMap.map = null
        largeMap.mapId = null
        largeMap.layer = null
      }
    })()

    function reHighlight(dataCollection) {
      const skip = false
      if (skip) return
      requestAnimationFrame(() => {
        ancientLatLng = myHeatMaps.map(() => [])
        const modernSet = new Set()
        modernLatLng = []
        var s = ''
        for (const data of dataCollection) {
          const key = data.modern_latitude + ' ' + data.modern_longitude
          if (!modernSet.has(key)) {
            modernSet.add(key)
            modernLatLng.push([data.modern_latitude, data.modern_longitude])
          }
          if(s.indexOf(data.Phylum+data.Class+data.Order+data.Family+data.Genus+data.Species+"+"+data.era+"+"+data.ancient_latitude+"+"+data.ancient_longitude)!=-1){
            continue
          }
          s = s+data.Phylum+data.Class+data.Order+data.Family+data.Genus+data.Species+"+"+data.era+"+"+data.ancient_latitude+"+"+data.ancient_longitude+","
          ancientLatLng[data.era].push([data.ancient_latitude, data.ancient_longitude])
        }
        for (const [i, data] of ancientLatLng.entries()) {
          myHeatMaps[i].setLatLngs(data)
        }
        map1.removeLayer(myGroup)
        myGroup.clearLayers()
        for (const data of modernLatLng) {
          L.circleMarker(data, leafletConfig).addTo(myGroup)
        }
        myGroup.addTo(map1)
        if (largeMap.hasMap()) largeMap.updateLayer()
      })
    }
    return reHighlight
  },
)
