let miniGridProjectsImpact = 0
let SSPUImpact = 0

let miniGridProjects = 0
let SSPU = 0
let connectionsLength = 0


//remove map wrapper
$(".locations-map_wrapper").removeClass("is--show");


//-----------MAPBOX SETUP CODE BELOW-----------

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! REPLACE ACCESS TOKEN WITH YOURS HERE !!!
mapboxgl.accessToken = "pk.eyJ1IjoiYnVyaWVkc2lnbmFscyIsImEiOiJjbDBhdmlhZTgwM3dtM2RxOTQ5cndsYXl0In0.Gvcq3DBOKDVRhy3QLjImiA";
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// create empty locations geojson object
let mapLocations = {
	type: "FeatureCollection",
	features: [],
};

let selectedMapLocations = [];

// Initialize map and load in #map wrapper
let map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/buriedsignals/clpsju6cd017001qtapftbsnz",
	center: [24.827817, -6.711618],
	zoom: 1,
});

// Adjust zoom of map for mobile and desktop
let mq = window.matchMedia("(min-width: 600px)");
console.log(map)
if (mq.matches) {
  map.setMinZoom(3.12);
	map.setZoom(3.12); //set map zoom level for desktop size
} else {
  map.setMinZoom(2.12);
	map.setZoom(2.12); //set map zoom level for mobile size
}

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();
map.dragPan.disable();

// Get cms items
let listLocations = document.getElementById("location-list").childNodes;

// For each colleciton item, grab hidden fields and convert to geojson proerty
function getGeoData() {
	listLocations.forEach(function (location, i) {
		let locationLat = location.querySelector("#locationLatitude").value;
		let locationLong = location.querySelector("#locationLongitude").value;
		let locationInfo = location.querySelector(".locations-map_card").innerHTML;
		let coordinates = [locationLong, locationLat];
		let locationID = location.querySelector("#locationID").value;
		// console.log(locationInfo);
    //add array ID
    let arrayID = (i + 1) - 1;
		let geoData = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: coordinates,
			},
			properties: {
				id: locationID,
				description: locationInfo,
        arrayID: arrayID,
			},
     
		};

		if (mapLocations.features.includes(geoData) === false) {
			mapLocations.features.push(geoData);
		}
	});
	console.log(mapLocations);
}

// Invoke function
// getGeoData();

// define mapping function to be invoked later
function addMapPoints() {
  removePoints()

  allPoints = map.queryRenderedFeatures({
    layers: ['uef'],
  })
  miniGridProjectsImpact = allPoints.filter(point => {
    return point.properties['Project Type'] == "MG"
  }).length
  SSPUImpact = allPoints.filter(point => {
    return point.properties['Project Type'] == "SSPU"
  }).length

  const elImpact = document.querySelector('.map_list')
  const elMG = elImpact.querySelectorAll('.map_item')[0].querySelector('.map_title-wrapper h3')
  elMG.innerHTML = miniGridProjectsImpact
  const elSSPU = elImpact.querySelectorAll('.map_item')[1].querySelector('.map_title-wrapper h3')
  elSSPU.innerHTML = SSPUImpact

  //set hover popup
  const popupCountry = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });
  let onCountry = false

  // add points of the country
  function addPoints(e) {
    let filter = ['in', 'Country', e.features[0].properties.name];
    map.setFilter('uef', filter);
  }

  // add points of the country
  function removePoints() {
    let filter = ['in', 'Country', ''];
    map.setFilter('uef', filter);
  }

  map.on("click", (e) => {
    map.setLayoutProperty('uef', 'icon-image', 'marker_unselected');
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['uef-countries', 'uef'],
    })
    if (features.length == 0) {
      onCountry = false

      if ($(".locations-map_item.is--show").length) {
        $(".locations-map_item").removeClass("is--show");
      } 

      let zoom = 1
      if (mq.matches) {
        zoom = 3.12
      } else {
        zoom = 2.12
      }

      map.flyTo({
        center: [24.827817, -6.711618],
        zoom: zoom,
        curve: 1,
        easing(t) {
          return t;
        },
      });

      removePoints()

      map.getCanvas().style.cursor = '';
      popupCountry.remove();
    }
  })

	// When a click event occurs on a feature in the places layer, open a popup at the
	// location of the feature, with description HTML from its properties.
	map.on("click", "uef-countries", (e) => {
    if (onCountry) return
  	//find ID of collection item in array
    const ID = e.features[0].properties.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
    //add popup 
    addPoints(e);
    //show webflow Collection module
    $(".locations-map_wrapper").addClass("is--show");
    
    //Check if an item is currently there
    if ($(".locations-map_item.is--show").length) {
      $(".locations-map_item").removeClass("is--show");
    } 
  	//find collection item by array ID and show it
    $(`#${ID}.location-map_card-wrap`).parent().addClass("is--show");

    // Copy coordinates array.
    const el = document.querySelector(`#${ID}`)
    const locationLat = el.getAttribute("latitude");
    const locationLong = el.getAttribute("longitude");
    const coordinates = [locationLong, locationLat];

    function formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num;
    }

    if (miniGridProjects) {
      const elTitle = el.querySelectorAll('.map_title-wrapper h3')
      elTitle[0].innerHTML = miniGridProjects
      elTitle[1].innerHTML = "Mini-grid projects"
    } else if (SSPU) {
      const elTitle = el.querySelectorAll('.map_title-wrapper h3')
      elTitle[0].innerHTML = SSPU
      elTitle[1].innerHTML = "SSPU"
    }
    const elConnections = el.querySelectorAll('.map_item')[1].querySelectorAll('div')[2]
    elConnections.innerHTML = formatNumber(connectionsLength)
      
    let zoom = 1
    if (mq.matches) {
      zoom = 5
    } else {
      zoom = 4
    }

		map.flyTo({
			center: coordinates,
      zoom: zoom,
			curve: 1,
			easing(t) {
				return t;
			},
		});

    popupCountry.remove();
    onCountry = true
	});

  // Hover stuff

  if (mq.matches) {
    map.off('click', 'uef-countries', (e) => {
      if (onCountry) return 
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
      //find ID of collection item in array
      const ID = e.features[0].properties.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      
      miniGridProjects = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "MG"
      }).length
      SSPU = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "SSPU"
      }).length
      let connections = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        const totalWattage = point.properties['SSPU Total Wattage']
        return country == ID && totalWattage
      })
      connectionsLength = 0
      connections.map(connection => {
        connectionsLength += connection.properties['SSPU Total Wattage']
      })

      function formatNumber(num) {
        if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'k';
        }
        return num;
      }
      
      // Copy coordinates array.
      const el = document.querySelector(`#${ID}`)
      const locationLat = el.getAttribute("latitude");
      const locationLong = el.getAttribute("longitude");
      const coordinates = [locationLong, locationLat];
      
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light mapbox-title">${ e.features[0].properties['name'] }</div>
      </div>
      <div class="mapbox_content">
        ${ miniGridProjects ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ miniGridProjects } Mini-grid Projects</div>
          </div>
        ` : ''}
        ${ SSPU ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ SSPU } SSPU</div>
          </div>
        ` : ''}
        ${ connectionsLength ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.2669 5C14.8003 5.53334 14.8003 6.4 14.2669 6.86667L12.7538 8.37978C12.5586 8.57504 12.242 8.57504 12.0467 8.37978L7.55381 3.88689C7.35855 3.69163 7.35855 3.37504 7.55381 3.17978L9.06693 1.66667C9.60026 1.13334 10.4669 1.13334 10.9336 1.66667L12.1336 2.86667L13.78 1.22022C13.9753 1.02496 14.2919 1.02496 14.4871 1.22022L14.7134 1.44645C14.9086 1.64171 14.9086 1.95829 14.7134 2.15356L13.0669 3.8L14.2669 5ZM10.4003 8.86667L9.46693 7.93334L7.60026 9.8L6.20026 8.4L8.06693 6.53334L7.13359 5.6L5.26693 7.46667L4.62007 6.86293C4.4231 6.67909 4.11588 6.68439 3.92536 6.87491L2.40026 8.4C1.86693 8.93334 1.86693 9.8 2.40026 10.2667L3.60026 11.4667L1.28715 13.7798C1.09188 13.975 1.09189 14.2916 1.28715 14.4869L1.51337 14.7131C1.70864 14.9084 2.02522 14.9084 2.22048 14.7131L4.53359 12.4L5.73359 13.6C6.26693 14.1333 7.13359 14.1333 7.60026 13.6L9.11337 12.0869C9.30864 11.8916 9.30864 11.575 9.11337 11.3798L8.53359 10.8L10.4003 8.86667Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ formatNumber(connectionsLength) } Total Connections</div>
          </div>
        ` : ''}
      </div>
    `
    
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
    
      // Populate the popup and set its coordinates
      // based on the feature found.
      popupCountry.setLngLat(coordinates).setHTML(description).addTo(map);
    });
    map.on('mouseenter', 'uef-countries', (e) => {
      if (onCountry) return 
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
      
      //find ID of collection item in array
      const ID = e.features[0].properties.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      
      miniGridProjects = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "MG"
      }).length
      SSPU = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "SSPU"
      }).length
      let connections = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        const totalWattage = point.properties['SSPU Total Wattage']
        return country == ID && totalWattage
      })
      connectionsLength = 0
      connections.map(connection => {
        connectionsLength += connection.properties['SSPU Total Wattage']
      })

      function formatNumber(num) {
        if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'k';
        }
        return num;
      }
      
      // Copy coordinates array.
      const el = document.querySelector(`#${ID}`)
      const locationLat = el.getAttribute("latitude");
      const locationLong = el.getAttribute("longitude");
      const coordinates = [locationLong, locationLat];
      
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light mapbox-title">${ e.features[0].properties['name'] }</div>
      </div>
      <div class="mapbox_content">
        ${ miniGridProjects ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ miniGridProjects } Mini-grid Projects</div>
          </div>
        ` : ''}
        ${ SSPU ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ SSPU } SSPU</div>
          </div>
        ` : ''}
        ${ connectionsLength ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.2669 5C14.8003 5.53334 14.8003 6.4 14.2669 6.86667L12.7538 8.37978C12.5586 8.57504 12.242 8.57504 12.0467 8.37978L7.55381 3.88689C7.35855 3.69163 7.35855 3.37504 7.55381 3.17978L9.06693 1.66667C9.60026 1.13334 10.4669 1.13334 10.9336 1.66667L12.1336 2.86667L13.78 1.22022C13.9753 1.02496 14.2919 1.02496 14.4871 1.22022L14.7134 1.44645C14.9086 1.64171 14.9086 1.95829 14.7134 2.15356L13.0669 3.8L14.2669 5ZM10.4003 8.86667L9.46693 7.93334L7.60026 9.8L6.20026 8.4L8.06693 6.53334L7.13359 5.6L5.26693 7.46667L4.62007 6.86293C4.4231 6.67909 4.11588 6.68439 3.92536 6.87491L2.40026 8.4C1.86693 8.93334 1.86693 9.8 2.40026 10.2667L3.60026 11.4667L1.28715 13.7798C1.09188 13.975 1.09189 14.2916 1.28715 14.4869L1.51337 14.7131C1.70864 14.9084 2.02522 14.9084 2.22048 14.7131L4.53359 12.4L5.73359 13.6C6.26693 14.1333 7.13359 14.1333 7.60026 13.6L9.11337 12.0869C9.30864 11.8916 9.30864 11.575 9.11337 11.3798L8.53359 10.8L10.4003 8.86667Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ formatNumber(connectionsLength) } Total Connections</div>
          </div>
        ` : ''}
      </div>
    `

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
    
      // Populate the popup and set its coordinates
      // based on the feature found.
      popupCountry.setLngLat(coordinates).setHTML(description).addTo(map);
    });
    map.on('mouseleave', 'uef-countries', () => {
      if (onCountry) return 
      map.getCanvas().style.cursor = '';
      popupCountry.remove();
    });
  } else {
    map.on('click', 'uef-countries', (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
      //find ID of collection item in array
      const ID = e.features[0].properties.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      
      miniGridProjects = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "MG"
      }).length
      SSPU = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "SSPU"
      }).length
      let connections = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        const totalWattage = point.properties['SSPU Total Wattage']
        return country == ID && totalWattage
      })
      connectionsLength = 0
      connections.map(connection => {
        connectionsLength += connection.properties['SSPU Total Wattage']
      })

      function formatNumber(num) {
        if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'k';
        }
        return num;
      }
      
      // Copy coordinates array.
      const el = document.querySelector(`#${ID}`)
      const locationLat = el.getAttribute("latitude");
      const locationLong = el.getAttribute("longitude");
      const coordinates = [locationLong, locationLat];
      
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light mapbox-title">${ e.features[0].properties['name'] }</div>
      </div>
      <div class="mapbox_content">
        ${ miniGridProjects ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ miniGridProjects } Mini-grid Projects</div>
          </div>
        ` : ''}
        ${ SSPU ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ SSPU } SSPU</div>
          </div>
        ` : ''}
        ${ connectionsLength ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.2669 5C14.8003 5.53334 14.8003 6.4 14.2669 6.86667L12.7538 8.37978C12.5586 8.57504 12.242 8.57504 12.0467 8.37978L7.55381 3.88689C7.35855 3.69163 7.35855 3.37504 7.55381 3.17978L9.06693 1.66667C9.60026 1.13334 10.4669 1.13334 10.9336 1.66667L12.1336 2.86667L13.78 1.22022C13.9753 1.02496 14.2919 1.02496 14.4871 1.22022L14.7134 1.44645C14.9086 1.64171 14.9086 1.95829 14.7134 2.15356L13.0669 3.8L14.2669 5ZM10.4003 8.86667L9.46693 7.93334L7.60026 9.8L6.20026 8.4L8.06693 6.53334L7.13359 5.6L5.26693 7.46667L4.62007 6.86293C4.4231 6.67909 4.11588 6.68439 3.92536 6.87491L2.40026 8.4C1.86693 8.93334 1.86693 9.8 2.40026 10.2667L3.60026 11.4667L1.28715 13.7798C1.09188 13.975 1.09189 14.2916 1.28715 14.4869L1.51337 14.7131C1.70864 14.9084 2.02522 14.9084 2.22048 14.7131L4.53359 12.4L5.73359 13.6C6.26693 14.1333 7.13359 14.1333 7.60026 13.6L9.11337 12.0869C9.30864 11.8916 9.30864 11.575 9.11337 11.3798L8.53359 10.8L10.4003 8.86667Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ formatNumber(connectionsLength) } Total Connections</div>
          </div>
        ` : ''}
      </div>
    `
    
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
    
      // Populate the popup and set its coordinates
      // based on the feature found.
      popupCountry.setLngLat(coordinates).setHTML(description).addTo(map);
    });
    map.off('mouseenter', 'uef-countries', (e) => {
      if (onCountry) return 
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
      //find ID of collection item in array
      const ID = e.features[0].properties.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      
      miniGridProjects = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "MG"
      }).length
      SSPU = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        return country == ID && point.properties['Project Type'] == "SSPU"
      }).length
      let connections = allPoints.filter(point => {
        const country = point.properties['Country'].toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        const totalWattage = point.properties['SSPU Total Wattage']
        return country == ID && totalWattage
      })
      connectionsLength = 0
      connections.map(connection => {
        connectionsLength += connection.properties['SSPU Total Wattage']
      })

      function formatNumber(num) {
        if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'k';
        }
        return num;
      }
      
      // Copy coordinates array.
      const el = document.querySelector(`#${ID}`)
      const locationLat = el.getAttribute("latitude");
      const locationLong = el.getAttribute("longitude");
      const coordinates = [locationLong, locationLat];
      
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light mapbox-title">${ e.features[0].properties['name'] }</div>
      </div>
      <div class="mapbox_content">
        ${ miniGridProjects ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ miniGridProjects } Mini-grid Projects</div>
          </div>
        ` : ''}
        ${ SSPU ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.64656 16.1341C2.01552 16.1341 1.54222 15.5567 1.66598 14.938L2.69281 9.80382C2.78629 9.3364 3.19671 8.99994 3.67339 8.99994H13.4484C13.9251 8.99994 14.3355 9.3364 14.429 9.80382L15.4558 14.938C15.5796 15.5567 15.1063 16.1341 14.4752 16.1341H2.64656ZM2.85358 3.29263C2.45958 3.29263 2.14017 2.97323 2.14017 2.57922C2.14017 2.18521 2.45958 1.86581 2.85358 1.86581H3.567C3.961 1.86581 4.28041 2.18521 4.28041 2.57922C4.28041 2.97323 3.961 3.29263 3.567 3.29263H2.85358ZM3.34529 13.8539C3.25699 14.2954 3.59465 14.7072 4.04484 14.7072H7.13406C7.52807 14.7072 7.84748 14.3878 7.84748 13.9938C7.84748 13.5998 7.52807 13.2804 7.13406 13.2804H4.04484C3.70477 13.2804 3.41198 13.5205 3.34529 13.8539ZM4.869 6.59215C4.59247 6.86868 4.14474 6.87066 3.86578 6.59659C3.5833 6.31907 3.58129 5.86446 3.8613 5.58445L4.36957 5.07619C4.6461 4.79966 5.09382 4.79768 5.37279 5.07175C5.65526 5.34927 5.65727 5.80387 5.37726 6.08388L4.869 6.59215ZM3.91602 11.0003C3.82772 11.4417 4.16538 11.8536 4.61557 11.8536H7.13406C7.52807 11.8536 7.84748 11.5342 7.84748 11.1402C7.84748 10.7462 7.52807 10.4268 7.13406 10.4268H4.61558C4.2755 10.4268 3.98271 10.6668 3.91602 11.0003ZM8.56089 5.43287C7.574 5.43287 6.73265 5.08496 6.03683 4.38915C5.51415 3.86646 5.18791 3.26179 5.05813 2.57512C4.98496 2.18801 5.3131 1.86581 5.70707 1.86581C6.10117 1.86581 6.40511 2.19415 6.53076 2.56769C6.63214 2.86906 6.80351 3.14043 7.04489 3.38181C7.46104 3.79797 7.96638 4.00605 8.56089 4.00605C9.1554 4.00605 9.66074 3.79797 10.0769 3.38181C10.3183 3.14039 10.4897 2.86896 10.5911 2.56752C10.7167 2.19407 11.0205 1.86581 11.4145 1.86581C11.8085 1.86581 12.1366 2.18814 12.0634 2.57527C11.9333 3.26227 11.607 3.86713 11.0842 4.38986C10.3884 5.08568 9.5473 5.43335 8.56089 5.43287ZM8.56089 8.28653C8.16688 8.28653 7.84748 7.96712 7.84748 7.57311V6.8597C7.84748 6.46569 8.16688 6.14629 8.56089 6.14629C8.9549 6.14629 9.2743 6.46569 9.2743 6.8597V7.57311C9.2743 7.96712 8.9549 8.28653 8.56089 8.28653ZM9.2743 13.9938C9.2743 14.3878 9.59371 14.7072 9.98772 14.7072H13.0769C13.5271 14.7072 13.8648 14.2954 13.7765 13.8539C13.7098 13.5205 13.417 13.2804 13.0769 13.2804H9.98772C9.59371 13.2804 9.2743 13.5998 9.2743 13.9938ZM9.2743 11.1402C9.2743 11.5342 9.59371 11.8536 9.98772 11.8536H12.5062C12.9564 11.8536 13.2941 11.4417 13.2058 11.0003C13.1391 10.6668 12.8463 10.4268 12.5062 10.4268H9.98772C9.59371 10.4268 9.2743 10.7462 9.2743 11.1402ZM13.2605 6.58325C12.9803 6.86349 12.5255 6.86215 12.2469 6.58025L11.7505 6.07789C11.4758 5.79998 11.4771 5.35245 11.7534 5.07617C12.0297 4.79988 12.4772 4.79856 12.7551 5.0732L13.2575 5.56965C13.5394 5.84823 13.5407 6.30301 13.2605 6.58325ZM13.5548 3.29263C13.1608 3.29263 12.8414 2.97323 12.8414 2.57922C12.8414 2.18521 13.1608 1.86581 13.5548 1.86581H14.2682C14.6622 1.86581 14.9816 2.18521 14.9816 2.57922C14.9816 2.97323 14.6622 3.29263 14.2682 3.29263H13.5548Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ SSPU } SSPU</div>
          </div>
        ` : ''}
        ${ connectionsLength ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.2669 5C14.8003 5.53334 14.8003 6.4 14.2669 6.86667L12.7538 8.37978C12.5586 8.57504 12.242 8.57504 12.0467 8.37978L7.55381 3.88689C7.35855 3.69163 7.35855 3.37504 7.55381 3.17978L9.06693 1.66667C9.60026 1.13334 10.4669 1.13334 10.9336 1.66667L12.1336 2.86667L13.78 1.22022C13.9753 1.02496 14.2919 1.02496 14.4871 1.22022L14.7134 1.44645C14.9086 1.64171 14.9086 1.95829 14.7134 2.15356L13.0669 3.8L14.2669 5ZM10.4003 8.86667L9.46693 7.93334L7.60026 9.8L6.20026 8.4L8.06693 6.53334L7.13359 5.6L5.26693 7.46667L4.62007 6.86293C4.4231 6.67909 4.11588 6.68439 3.92536 6.87491L2.40026 8.4C1.86693 8.93334 1.86693 9.8 2.40026 10.2667L3.60026 11.4667L1.28715 13.7798C1.09188 13.975 1.09189 14.2916 1.28715 14.4869L1.51337 14.7131C1.70864 14.9084 2.02522 14.9084 2.22048 14.7131L4.53359 12.4L5.73359 13.6C6.26693 14.1333 7.13359 14.1333 7.60026 13.6L9.11337 12.0869C9.30864 11.8916 9.30864 11.575 9.11337 11.3798L8.53359 10.8L10.4003 8.86667Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">${ formatNumber(connectionsLength) } Total Connections</div>
          </div>
        ` : ''}
      </div>
    `
    
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
    
      // Populate the popup and set its coordinates
      // based on the feature found.
      popupCountry.setLngLat(coordinates).setHTML(description).addTo(map);
    });
    map.off('mouseleave', 'uef-countries', () => {
      if (onCountry) return 
      map.getCanvas().style.cursor = '';
      popupCountry.remove();
    });
  }

  map.on('click', 'uef', (e) => {
    map.setLayoutProperty('uef', 'icon-image', 'marker_unselected');
    map.getCanvas().style.cursor = '';
    popupCountry.remove();

    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
    
    //find ID of collection item in array
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light mapbox-title">${ e.features[0].properties['Name'] }</div>
        ${ e.features[0].properties['Organization'] ? `<div class="mapbox-organisation">${ e.features[0].properties['Organization'] }</div>`: '' }
      </div>
      <div class="mapbox_content">
        ${ e.features[0].properties['Customer Category'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.0241 14.9998H2.90723M2.90723 7.46783L7.83033 3.52983C8.1526 3.27204 8.553 3.13159 8.96569 3.13159C9.37838 3.13159 9.77878 3.27204 10.101 3.52983L15.0241 7.46783" stroke="#DB4405" stroke-width="1.47506" stroke-linecap="round"/>
                <path d="M11.0859 4.13571V2.92402C11.0859 2.84368 11.1179 2.76663 11.1747 2.70982C11.2315 2.65301 11.3085 2.62109 11.3889 2.62109H12.9035C12.9838 2.62109 13.0609 2.65301 13.1177 2.70982C13.1745 2.76663 13.2064 2.84368 13.2064 2.92402V5.95325" stroke="#DB4405" stroke-width="1.47506" stroke-linecap="round"/>
                <path d="M4.11621 14.6863V6.8772M13.6607 14.6863V6.8772" stroke="#DB4405" stroke-width="1.47506" stroke-linecap="round"/>
                <path d="M10.7835 14.9999V12.8383C10.7835 11.9816 10.7835 11.5533 10.5169 11.2873C10.2516 11.0208 9.82325 11.0208 8.96598 11.0208C8.10931 11.0208 7.68098 11.0208 7.41501 11.2873C7.14844 11.5527 7.14844 11.981 7.14844 12.8383V14.9999M10.1777 7.42678C10.1777 7.74814 10.05 8.05634 9.82277 8.28358C9.59553 8.51081 9.28734 8.63847 8.96598 8.63847C8.64461 8.63847 8.33642 8.51081 8.10918 8.28358C7.88194 8.05634 7.75428 7.74814 7.75428 7.42678C7.75428 7.10542 7.88194 6.79722 8.10918 6.56998C8.33642 6.34275 8.64461 6.21509 8.96598 6.21509C9.28734 6.21509 9.59553 6.34275 9.82277 6.56998C10.05 6.79722 10.1777 7.10542 10.1777 7.42678Z" stroke="#DB4405" stroke-width="1.47506"/>
              </svg>
            </div>
            <div class="mapbox_label">Category: ${ e.features[0].properties['Customer Category'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['Gender'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.36321 10.3841C11.4024 10.3841 13.0555 8.73102 13.0555 6.69182C13.0555 4.65261 11.4024 2.99951 9.36321 2.99951C7.324 2.99951 5.6709 4.65261 5.6709 6.69182C5.6709 8.73102 7.324 10.3841 9.36321 10.3841ZM9.36321 10.3841V14.9995M12.1324 12.689H6.59398" stroke="#DB4405" stroke-width="1.75" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="mapbox_label">Gender: ${ e.features[0].properties['Gender'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['SSPU Total Wattage'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6956 5.00003C15.229 5.53337 15.229 6.40003 14.6956 6.8667L13.1825 8.37981C12.9873 8.57507 12.6707 8.57507 12.4754 8.37981L7.98253 3.88692C7.78726 3.69166 7.78726 3.37507 7.98253 3.17981L9.49564 1.6667C10.029 1.13337 10.8956 1.13337 11.3623 1.6667L12.5623 2.8667L14.2088 1.22025C14.404 1.02499 14.7206 1.02499 14.9159 1.22025L15.1421 1.44648C15.3373 1.64174 15.3373 1.95832 15.1421 2.15359L13.4956 3.80003L14.6956 5.00003ZM10.829 8.8667L9.89564 7.93337L8.02897 9.80003L6.62897 8.40003L8.49564 6.53337L7.5623 5.60003L5.69564 7.4667L5.04878 6.86296C4.85181 6.67912 4.54459 6.68442 4.35407 6.87494L2.82897 8.40003C2.29564 8.93337 2.29564 9.80003 2.82897 10.2667L4.02897 11.4667L1.71586 13.7798C1.5206 13.9751 1.5206 14.2917 1.71586 14.4869L1.94208 14.7131C2.13735 14.9084 2.45393 14.9084 2.64919 14.7131L4.9623 12.4L6.1623 13.6C6.69564 14.1334 7.5623 14.1334 8.02897 13.6L9.54208 12.0869C9.73735 11.8917 9.73735 11.5751 9.54208 11.3798L8.96231 10.8L10.829 8.8667Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">Total Wattage: ${ e.features[0].properties['SSPU Total Wattage'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['SSPU PUE Appliances'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.40519 8.75H1.49219C1.35419 8.75 1.24219 8.862 1.24219 9C1.24219 11.0005 2.86669 12.625 4.86719 12.625C6.19769 12.625 7.36169 11.9065 7.99219 10.837V15.75C7.99219 15.888 8.10419 16 8.24219 16C10.2427 16 11.8672 14.3755 11.8672 12.375C11.8672 11.0445 11.1487 9.8805 10.0792 9.25H14.9922C15.1302 9.25 15.2422 9.138 15.2422 9C15.2422 6.9995 13.6177 5.375 11.6172 5.375C10.2867 5.375 9.12269 6.0935 8.49219 7.163V2.25C8.49219 2.112 8.38019 2 8.24219 2C6.24169 2 4.61719 3.6245 4.61719 5.625C4.61719 6.9555 5.33569 8.1195 6.40519 8.75ZM8.24219 7.375C7.34519 7.375 6.61719 8.103 6.61719 9C6.61719 9.897 7.34519 10.625 8.24219 10.625C9.13919 10.625 9.86719 9.897 9.86719 9C9.86719 8.103 9.13919 7.375 8.24219 7.375ZM8.24219 7.925C8.83569 7.925 9.31718 8.4065 9.31718 9C9.31718 9.5935 8.83569 10.075 8.24219 10.075C7.64869 10.075 7.16719 9.5935 7.16719 9C7.16719 8.4065 7.64869 7.925 8.24219 7.925Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">Appliances: ${ e.features[0].properties['SSPU PUE Appliances'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['Previous Energy Source'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.2422 9.93757C13.2422 12.1812 11.4743 14 9.29347 14C7.11265 14 5.34475 12.1812 5.34475 9.93757C5.34475 8.29383 7.46419 4.38615 8.59755 2.41402C8.9148 1.86199 9.67214 1.86199 9.98939 2.41402C11.1228 4.38615 13.2422 8.29383 13.2422 9.93757Z" fill="#DB4405"/>
                <path d="M6.45175 4.5675C6.13086 3.96392 5.81135 3.4034 5.55987 2.97381C5.33318 2.58672 4.79222 2.58672 4.56553 2.97381C3.75601 4.35667 2.24219 7.09745 2.24219 8.24965C2.24219 9.67275 3.27481 10.8521 4.6242 11.0647C4.54212 10.7031 4.4986 10.3256 4.4986 9.93798C4.4986 9.3718 4.67268 8.70361 4.89606 8.05525C4.95721 7.8773 5.02441 7.6948 5.09658 7.50891C5.296 6.99487 5.5326 6.4559 5.78435 5.92032C5.99727 5.46693 6.22368 5.01126 6.45175 4.5675Z" fill="#DB4405"/>
                <path d="M6.93129 5.50433C7.45435 6.57321 7.88321 7.63643 7.88321 8.24965C7.88321 9.67388 6.84948 10.8533 5.49872 11.0647C5.39846 10.7071 5.34475 10.3286 5.34475 9.93757C5.34475 8.96333 6.08899 7.19437 6.93129 5.50433Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">Previous: ${ e.features[0].properties['Previous Energy Source'] }</div>
          </div>
        ` : ''}
      </div>
    `

    // Copy coordinates array.
    // e.features[0].layer.layout["icon-image"] = "marker_selected";
    // console.log(e.features[0].layer.layout["icon-image"])
    map.setLayoutProperty('uef', 'icon-image', [
      'match',
      ['id'],
      e.features[0].id, 'marker_selected',
      'marker_unselected'
    ]);
    const coordinates = e.features[0].geometry.coordinates;
  
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
  
    // Populate the popup and set its coordinates
    // based on the feature found.
    popupCountry.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseenter', 'uef', (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
    
    //find ID of collection item in array
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light mapbox-title">${ e.features[0].properties['Name'] }</div>
        ${ e.features[0].properties['Organization'] ? `<div class="mapbox-organisation">${ e.features[0].properties['Organization'] }</div>`: '' }
      </div>
      <div class="mapbox_content">
        ${ e.features[0].properties['Customer Category'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.0241 14.9998H2.90723M2.90723 7.46783L7.83033 3.52983C8.1526 3.27204 8.553 3.13159 8.96569 3.13159C9.37838 3.13159 9.77878 3.27204 10.101 3.52983L15.0241 7.46783" stroke="#DB4405" stroke-width="1.47506" stroke-linecap="round"/>
                <path d="M11.0859 4.13571V2.92402C11.0859 2.84368 11.1179 2.76663 11.1747 2.70982C11.2315 2.65301 11.3085 2.62109 11.3889 2.62109H12.9035C12.9838 2.62109 13.0609 2.65301 13.1177 2.70982C13.1745 2.76663 13.2064 2.84368 13.2064 2.92402V5.95325" stroke="#DB4405" stroke-width="1.47506" stroke-linecap="round"/>
                <path d="M4.11621 14.6863V6.8772M13.6607 14.6863V6.8772" stroke="#DB4405" stroke-width="1.47506" stroke-linecap="round"/>
                <path d="M10.7835 14.9999V12.8383C10.7835 11.9816 10.7835 11.5533 10.5169 11.2873C10.2516 11.0208 9.82325 11.0208 8.96598 11.0208C8.10931 11.0208 7.68098 11.0208 7.41501 11.2873C7.14844 11.5527 7.14844 11.981 7.14844 12.8383V14.9999M10.1777 7.42678C10.1777 7.74814 10.05 8.05634 9.82277 8.28358C9.59553 8.51081 9.28734 8.63847 8.96598 8.63847C8.64461 8.63847 8.33642 8.51081 8.10918 8.28358C7.88194 8.05634 7.75428 7.74814 7.75428 7.42678C7.75428 7.10542 7.88194 6.79722 8.10918 6.56998C8.33642 6.34275 8.64461 6.21509 8.96598 6.21509C9.28734 6.21509 9.59553 6.34275 9.82277 6.56998C10.05 6.79722 10.1777 7.10542 10.1777 7.42678Z" stroke="#DB4405" stroke-width="1.47506"/>
              </svg>
            </div>
            <div class="mapbox_label">Category: ${ e.features[0].properties['Customer Category'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['Gender'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.36321 10.3841C11.4024 10.3841 13.0555 8.73102 13.0555 6.69182C13.0555 4.65261 11.4024 2.99951 9.36321 2.99951C7.324 2.99951 5.6709 4.65261 5.6709 6.69182C5.6709 8.73102 7.324 10.3841 9.36321 10.3841ZM9.36321 10.3841V14.9995M12.1324 12.689H6.59398" stroke="#DB4405" stroke-width="1.75" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="mapbox_label">Gender: ${ e.features[0].properties['Gender'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['SSPU Total Wattage'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6956 5.00003C15.229 5.53337 15.229 6.40003 14.6956 6.8667L13.1825 8.37981C12.9873 8.57507 12.6707 8.57507 12.4754 8.37981L7.98253 3.88692C7.78726 3.69166 7.78726 3.37507 7.98253 3.17981L9.49564 1.6667C10.029 1.13337 10.8956 1.13337 11.3623 1.6667L12.5623 2.8667L14.2088 1.22025C14.404 1.02499 14.7206 1.02499 14.9159 1.22025L15.1421 1.44648C15.3373 1.64174 15.3373 1.95832 15.1421 2.15359L13.4956 3.80003L14.6956 5.00003ZM10.829 8.8667L9.89564 7.93337L8.02897 9.80003L6.62897 8.40003L8.49564 6.53337L7.5623 5.60003L5.69564 7.4667L5.04878 6.86296C4.85181 6.67912 4.54459 6.68442 4.35407 6.87494L2.82897 8.40003C2.29564 8.93337 2.29564 9.80003 2.82897 10.2667L4.02897 11.4667L1.71586 13.7798C1.5206 13.9751 1.5206 14.2917 1.71586 14.4869L1.94208 14.7131C2.13735 14.9084 2.45393 14.9084 2.64919 14.7131L4.9623 12.4L6.1623 13.6C6.69564 14.1334 7.5623 14.1334 8.02897 13.6L9.54208 12.0869C9.73735 11.8917 9.73735 11.5751 9.54208 11.3798L8.96231 10.8L10.829 8.8667Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">Total Wattage: ${ e.features[0].properties['SSPU Total Wattage'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['SSPU PUE Appliances'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.40519 8.75H1.49219C1.35419 8.75 1.24219 8.862 1.24219 9C1.24219 11.0005 2.86669 12.625 4.86719 12.625C6.19769 12.625 7.36169 11.9065 7.99219 10.837V15.75C7.99219 15.888 8.10419 16 8.24219 16C10.2427 16 11.8672 14.3755 11.8672 12.375C11.8672 11.0445 11.1487 9.8805 10.0792 9.25H14.9922C15.1302 9.25 15.2422 9.138 15.2422 9C15.2422 6.9995 13.6177 5.375 11.6172 5.375C10.2867 5.375 9.12269 6.0935 8.49219 7.163V2.25C8.49219 2.112 8.38019 2 8.24219 2C6.24169 2 4.61719 3.6245 4.61719 5.625C4.61719 6.9555 5.33569 8.1195 6.40519 8.75ZM8.24219 7.375C7.34519 7.375 6.61719 8.103 6.61719 9C6.61719 9.897 7.34519 10.625 8.24219 10.625C9.13919 10.625 9.86719 9.897 9.86719 9C9.86719 8.103 9.13919 7.375 8.24219 7.375ZM8.24219 7.925C8.83569 7.925 9.31718 8.4065 9.31718 9C9.31718 9.5935 8.83569 10.075 8.24219 10.075C7.64869 10.075 7.16719 9.5935 7.16719 9C7.16719 8.4065 7.64869 7.925 8.24219 7.925Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">Appliances: ${ e.features[0].properties['SSPU PUE Appliances'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['Previous Energy Source'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.2422 9.93757C13.2422 12.1812 11.4743 14 9.29347 14C7.11265 14 5.34475 12.1812 5.34475 9.93757C5.34475 8.29383 7.46419 4.38615 8.59755 2.41402C8.9148 1.86199 9.67214 1.86199 9.98939 2.41402C11.1228 4.38615 13.2422 8.29383 13.2422 9.93757Z" fill="#DB4405"/>
                <path d="M6.45175 4.5675C6.13086 3.96392 5.81135 3.4034 5.55987 2.97381C5.33318 2.58672 4.79222 2.58672 4.56553 2.97381C3.75601 4.35667 2.24219 7.09745 2.24219 8.24965C2.24219 9.67275 3.27481 10.8521 4.6242 11.0647C4.54212 10.7031 4.4986 10.3256 4.4986 9.93798C4.4986 9.3718 4.67268 8.70361 4.89606 8.05525C4.95721 7.8773 5.02441 7.6948 5.09658 7.50891C5.296 6.99487 5.5326 6.4559 5.78435 5.92032C5.99727 5.46693 6.22368 5.01126 6.45175 4.5675Z" fill="#DB4405"/>
                <path d="M6.93129 5.50433C7.45435 6.57321 7.88321 7.63643 7.88321 8.24965C7.88321 9.67388 6.84948 10.8533 5.49872 11.0647C5.39846 10.7071 5.34475 10.3286 5.34475 9.93757C5.34475 8.96333 6.08899 7.19437 6.93129 5.50433Z" fill="#DB4405"/>
              </svg>
            </div>
            <div class="mapbox_label">Previous: ${ e.features[0].properties['Previous Energy Source'] }</div>
          </div>
        ` : ''}
      </div>
    `

    // Copy coordinates array.
    // e.features[0].layer.layout["icon-image"] = "marker_selected";
    // console.log(e.features[0].layer.layout["icon-image"])
    map.setLayoutProperty('uef', 'icon-image', [
      'match',
      ['id'],
      e.features[0].id, 'marker_selected',
      'marker_unselected'
    ]);
    const coordinates = e.features[0].geometry.coordinates;
  
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
  
    // Populate the popup and set its coordinates
    // based on the feature found.
    popupCountry.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseleave', 'uef', () => {
    map.setLayoutProperty('uef', 'icon-image', 'marker_unselected');
    map.getCanvas().style.cursor = '';
    popupCountry.remove();
  });
}

let allPoints = []
//When map is loaded initialize with data
map.on("load", function (e) {
	addMapPoints();
});


//close side nav with button
$(".close-block").click(function(){
	$(".locations-map_wrapper").removeClass("is--show");
});
