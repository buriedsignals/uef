
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
	zoom: 3.12,
});

// Adjust zoom of map for mobile and desktop
// let mq = window.matchMedia("(min-width: 480px)");
// if (mq.matches) {
// 	map.setZoom(6.59); //set map zoom level for desktop size
// } else {
// 	map.setZoom(6); //set map zoom level for mobile size
// }

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

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

      map.flyTo({
        center: [24.827817, -6.711618],
        zoom: 3.12,
        curve: 1,
        easing(t) {
          return t;
        },
      });

      removePoints()
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
    const locationLat = document.querySelector(`#${ID} #locationLatitude`).value;
    const locationLong = document.querySelector(`#${ID} #locationLongitude`).value;
    const coordinates = [locationLong, locationLat];

		map.flyTo({
			center: coordinates,
      zoom: 5,
			curve: 1,
			easing(t) {
				return t;
			},
		});

    popupCountry.remove();
    onCountry = true
	});

  // Hover stuff

  map.on('mouseenter', 'uef-countries', (e) => {
    if (onCountry) return 
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
    
    //find ID of collection item in array
    const ID = e.features[0].properties.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
    
    // Copy coordinates array.
    const locationLat = document.querySelector(`#${ID} #locationLatitude`).value;
    const locationLong = document.querySelector(`#${ID} #locationLongitude`).value;
    const coordinates = [locationLong, locationLat];
    const description = document.querySelector(`#${ID} .locations-map_card`).innerHTML;
  
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

  map.on('mouseenter', 'uef', (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
    
    //find ID of collection item in array
    const description = `
      <div class="mapbox-header">
        <div class="text-size-large text-weight-light">${ e.features[0].properties['Name'] }</div>
        ${ e.features[0].properties['Organization'] ? `<div class="mapbox-organisation">${ e.features[0].properties['Organization'] }</div>`: '' }
      </div>
      <div class="mapbox_content">
        ${ e.features[0].properties['Customer Category'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="100%" height="100%" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.64656 15.1341C1.01552 15.1341 0.542223 14.5567 0.665981 13.938L1.69281 8.80382C1.78629 8.3364 2.19671 7.99994 2.67339 7.99994H12.4484C12.9251 7.99994 13.3355 8.3364 13.429 8.80382L14.4558 13.938C14.5796 14.5567 14.1063 15.1341 13.4752 15.1341H1.64656ZM1.85358 2.29263C1.45958 2.29263 1.14017 1.97323 1.14017 1.57922C1.14017 1.18521 1.45958 0.865807 1.85358 0.865807H2.567C2.961 0.865807 3.28041 1.18521 3.28041 1.57922C3.28041 1.97323 2.961 2.29263 2.567 2.29263H1.85358ZM2.34529 12.8539C2.25699 13.2954 2.59465 13.7072 3.04484 13.7072H6.13406C6.52807 13.7072 6.84748 13.3878 6.84748 12.9938C6.84748 12.5998 6.52807 12.2804 6.13406 12.2804H3.04484C2.70477 12.2804 2.41198 12.5205 2.34529 12.8539ZM3.869 5.59215C3.59247 5.86868 3.14474 5.87066 2.86578 5.59659C2.5833 5.31907 2.58129 4.86446 2.8613 4.58445L3.36957 4.07619C3.6461 3.79966 4.09382 3.79768 4.37279 4.07175C4.65526 4.34927 4.65727 4.80387 4.37726 5.08388L3.869 5.59215ZM2.91602 10.0003C2.82772 10.4417 3.16538 10.8536 3.61557 10.8536H6.13406C6.52807 10.8536 6.84748 10.5342 6.84748 10.1402C6.84748 9.74617 6.52807 9.42676 6.13406 9.42676H3.61558C3.2755 9.42676 2.98271 9.6668 2.91602 10.0003ZM7.56089 4.43287C6.574 4.43287 5.73265 4.08496 5.03683 3.38915C4.51415 2.86646 4.18791 2.26179 4.05813 1.57512C3.98496 1.18801 4.3131 0.865807 4.70707 0.865807C5.10117 0.865807 5.40511 1.19415 5.53076 1.56769C5.63214 1.86906 5.80351 2.14043 6.04489 2.38181C6.46104 2.79797 6.96638 3.00605 7.56089 3.00605C8.1554 3.00605 8.66074 2.79797 9.07689 2.38181C9.31831 2.14039 9.4897 1.86896 9.59107 1.56752C9.71666 1.19407 10.0205 0.865807 10.4145 0.865807C10.8085 0.865807 11.1366 1.18814 11.0634 1.57527C10.9333 2.26227 10.607 2.86713 10.0842 3.38986C9.38842 4.08568 8.5473 4.43335 7.56089 4.43287ZM7.56089 7.28653C7.16688 7.28653 6.84748 6.96712 6.84748 6.57311V5.8597C6.84748 5.46569 7.16688 5.14629 7.56089 5.14629C7.9549 5.14629 8.2743 5.46569 8.2743 5.8597V6.57311C8.2743 6.96712 7.9549 7.28653 7.56089 7.28653ZM8.2743 12.9938C8.2743 13.3878 8.59371 13.7072 8.98772 13.7072H12.0769C12.5271 13.7072 12.8648 13.2954 12.7765 12.8539C12.7098 12.5205 12.417 12.2804 12.0769 12.2804H8.98772C8.59371 12.2804 8.2743 12.5998 8.2743 12.9938ZM8.2743 10.1402C8.2743 10.5342 8.59371 10.8536 8.98772 10.8536H11.5062C11.9564 10.8536 12.2941 10.4417 12.2058 10.0003C12.1391 9.6668 11.8463 9.42676 11.5062 9.42676H8.98772C8.59371 9.42676 8.2743 9.74617 8.2743 10.1402ZM12.2605 5.58325C11.9803 5.86349 11.5255 5.86215 11.2469 5.58025L10.7505 5.07789C10.4758 4.79998 10.4771 4.35245 10.7534 4.07617C11.0297 3.79988 11.4772 3.79856 11.7551 4.0732L12.2575 4.56965C12.5394 4.84823 12.5407 5.30301 12.2605 5.58325ZM12.5548 2.29263C12.1608 2.29263 11.8414 1.97323 11.8414 1.57922C11.8414 1.18521 12.1608 0.865807 12.5548 0.865807H13.2682C13.6622 0.865807 13.9816 1.18521 13.9816 1.57922C13.9816 1.97323 13.6622 2.29263 13.2682 2.29263H12.5548Z" fill="#DB4405"></path>
              </svg>
            </div>
            <div class="mapbox_label">Category: ${ e.features[0].properties['Customer Category'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['Gender'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="100%" height="100%" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.64656 15.1341C1.01552 15.1341 0.542223 14.5567 0.665981 13.938L1.69281 8.80382C1.78629 8.3364 2.19671 7.99994 2.67339 7.99994H12.4484C12.9251 7.99994 13.3355 8.3364 13.429 8.80382L14.4558 13.938C14.5796 14.5567 14.1063 15.1341 13.4752 15.1341H1.64656ZM1.85358 2.29263C1.45958 2.29263 1.14017 1.97323 1.14017 1.57922C1.14017 1.18521 1.45958 0.865807 1.85358 0.865807H2.567C2.961 0.865807 3.28041 1.18521 3.28041 1.57922C3.28041 1.97323 2.961 2.29263 2.567 2.29263H1.85358ZM2.34529 12.8539C2.25699 13.2954 2.59465 13.7072 3.04484 13.7072H6.13406C6.52807 13.7072 6.84748 13.3878 6.84748 12.9938C6.84748 12.5998 6.52807 12.2804 6.13406 12.2804H3.04484C2.70477 12.2804 2.41198 12.5205 2.34529 12.8539ZM3.869 5.59215C3.59247 5.86868 3.14474 5.87066 2.86578 5.59659C2.5833 5.31907 2.58129 4.86446 2.8613 4.58445L3.36957 4.07619C3.6461 3.79966 4.09382 3.79768 4.37279 4.07175C4.65526 4.34927 4.65727 4.80387 4.37726 5.08388L3.869 5.59215ZM2.91602 10.0003C2.82772 10.4417 3.16538 10.8536 3.61557 10.8536H6.13406C6.52807 10.8536 6.84748 10.5342 6.84748 10.1402C6.84748 9.74617 6.52807 9.42676 6.13406 9.42676H3.61558C3.2755 9.42676 2.98271 9.6668 2.91602 10.0003ZM7.56089 4.43287C6.574 4.43287 5.73265 4.08496 5.03683 3.38915C4.51415 2.86646 4.18791 2.26179 4.05813 1.57512C3.98496 1.18801 4.3131 0.865807 4.70707 0.865807C5.10117 0.865807 5.40511 1.19415 5.53076 1.56769C5.63214 1.86906 5.80351 2.14043 6.04489 2.38181C6.46104 2.79797 6.96638 3.00605 7.56089 3.00605C8.1554 3.00605 8.66074 2.79797 9.07689 2.38181C9.31831 2.14039 9.4897 1.86896 9.59107 1.56752C9.71666 1.19407 10.0205 0.865807 10.4145 0.865807C10.8085 0.865807 11.1366 1.18814 11.0634 1.57527C10.9333 2.26227 10.607 2.86713 10.0842 3.38986C9.38842 4.08568 8.5473 4.43335 7.56089 4.43287ZM7.56089 7.28653C7.16688 7.28653 6.84748 6.96712 6.84748 6.57311V5.8597C6.84748 5.46569 7.16688 5.14629 7.56089 5.14629C7.9549 5.14629 8.2743 5.46569 8.2743 5.8597V6.57311C8.2743 6.96712 7.9549 7.28653 7.56089 7.28653ZM8.2743 12.9938C8.2743 13.3878 8.59371 13.7072 8.98772 13.7072H12.0769C12.5271 13.7072 12.8648 13.2954 12.7765 12.8539C12.7098 12.5205 12.417 12.2804 12.0769 12.2804H8.98772C8.59371 12.2804 8.2743 12.5998 8.2743 12.9938ZM8.2743 10.1402C8.2743 10.5342 8.59371 10.8536 8.98772 10.8536H11.5062C11.9564 10.8536 12.2941 10.4417 12.2058 10.0003C12.1391 9.6668 11.8463 9.42676 11.5062 9.42676H8.98772C8.59371 9.42676 8.2743 9.74617 8.2743 10.1402ZM12.2605 5.58325C11.9803 5.86349 11.5255 5.86215 11.2469 5.58025L10.7505 5.07789C10.4758 4.79998 10.4771 4.35245 10.7534 4.07617C11.0297 3.79988 11.4772 3.79856 11.7551 4.0732L12.2575 4.56965C12.5394 4.84823 12.5407 5.30301 12.2605 5.58325ZM12.5548 2.29263C12.1608 2.29263 11.8414 1.97323 11.8414 1.57922C11.8414 1.18521 12.1608 0.865807 12.5548 0.865807H13.2682C13.6622 0.865807 13.9816 1.18521 13.9816 1.57922C13.9816 1.97323 13.6622 2.29263 13.2682 2.29263H12.5548Z" fill="#DB4405"></path>
              </svg>
            </div>
            <div class="mapbox_label">Gender: ${ e.features[0].properties['Gender'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['SSPU Total Wattage'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="100%" height="100%" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.64656 15.1341C1.01552 15.1341 0.542223 14.5567 0.665981 13.938L1.69281 8.80382C1.78629 8.3364 2.19671 7.99994 2.67339 7.99994H12.4484C12.9251 7.99994 13.3355 8.3364 13.429 8.80382L14.4558 13.938C14.5796 14.5567 14.1063 15.1341 13.4752 15.1341H1.64656ZM1.85358 2.29263C1.45958 2.29263 1.14017 1.97323 1.14017 1.57922C1.14017 1.18521 1.45958 0.865807 1.85358 0.865807H2.567C2.961 0.865807 3.28041 1.18521 3.28041 1.57922C3.28041 1.97323 2.961 2.29263 2.567 2.29263H1.85358ZM2.34529 12.8539C2.25699 13.2954 2.59465 13.7072 3.04484 13.7072H6.13406C6.52807 13.7072 6.84748 13.3878 6.84748 12.9938C6.84748 12.5998 6.52807 12.2804 6.13406 12.2804H3.04484C2.70477 12.2804 2.41198 12.5205 2.34529 12.8539ZM3.869 5.59215C3.59247 5.86868 3.14474 5.87066 2.86578 5.59659C2.5833 5.31907 2.58129 4.86446 2.8613 4.58445L3.36957 4.07619C3.6461 3.79966 4.09382 3.79768 4.37279 4.07175C4.65526 4.34927 4.65727 4.80387 4.37726 5.08388L3.869 5.59215ZM2.91602 10.0003C2.82772 10.4417 3.16538 10.8536 3.61557 10.8536H6.13406C6.52807 10.8536 6.84748 10.5342 6.84748 10.1402C6.84748 9.74617 6.52807 9.42676 6.13406 9.42676H3.61558C3.2755 9.42676 2.98271 9.6668 2.91602 10.0003ZM7.56089 4.43287C6.574 4.43287 5.73265 4.08496 5.03683 3.38915C4.51415 2.86646 4.18791 2.26179 4.05813 1.57512C3.98496 1.18801 4.3131 0.865807 4.70707 0.865807C5.10117 0.865807 5.40511 1.19415 5.53076 1.56769C5.63214 1.86906 5.80351 2.14043 6.04489 2.38181C6.46104 2.79797 6.96638 3.00605 7.56089 3.00605C8.1554 3.00605 8.66074 2.79797 9.07689 2.38181C9.31831 2.14039 9.4897 1.86896 9.59107 1.56752C9.71666 1.19407 10.0205 0.865807 10.4145 0.865807C10.8085 0.865807 11.1366 1.18814 11.0634 1.57527C10.9333 2.26227 10.607 2.86713 10.0842 3.38986C9.38842 4.08568 8.5473 4.43335 7.56089 4.43287ZM7.56089 7.28653C7.16688 7.28653 6.84748 6.96712 6.84748 6.57311V5.8597C6.84748 5.46569 7.16688 5.14629 7.56089 5.14629C7.9549 5.14629 8.2743 5.46569 8.2743 5.8597V6.57311C8.2743 6.96712 7.9549 7.28653 7.56089 7.28653ZM8.2743 12.9938C8.2743 13.3878 8.59371 13.7072 8.98772 13.7072H12.0769C12.5271 13.7072 12.8648 13.2954 12.7765 12.8539C12.7098 12.5205 12.417 12.2804 12.0769 12.2804H8.98772C8.59371 12.2804 8.2743 12.5998 8.2743 12.9938ZM8.2743 10.1402C8.2743 10.5342 8.59371 10.8536 8.98772 10.8536H11.5062C11.9564 10.8536 12.2941 10.4417 12.2058 10.0003C12.1391 9.6668 11.8463 9.42676 11.5062 9.42676H8.98772C8.59371 9.42676 8.2743 9.74617 8.2743 10.1402ZM12.2605 5.58325C11.9803 5.86349 11.5255 5.86215 11.2469 5.58025L10.7505 5.07789C10.4758 4.79998 10.4771 4.35245 10.7534 4.07617C11.0297 3.79988 11.4772 3.79856 11.7551 4.0732L12.2575 4.56965C12.5394 4.84823 12.5407 5.30301 12.2605 5.58325ZM12.5548 2.29263C12.1608 2.29263 11.8414 1.97323 11.8414 1.57922C11.8414 1.18521 12.1608 0.865807 12.5548 0.865807H13.2682C13.6622 0.865807 13.9816 1.18521 13.9816 1.57922C13.9816 1.97323 13.6622 2.29263 13.2682 2.29263H12.5548Z" fill="#DB4405"></path>
              </svg>
            </div>
            <div class="mapbox_label">Total Wattage: ${ e.features[0].properties['SSPU Total Wattage'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['SSPU PUE Appliances'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="100%" height="100%" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.64656 15.1341C1.01552 15.1341 0.542223 14.5567 0.665981 13.938L1.69281 8.80382C1.78629 8.3364 2.19671 7.99994 2.67339 7.99994H12.4484C12.9251 7.99994 13.3355 8.3364 13.429 8.80382L14.4558 13.938C14.5796 14.5567 14.1063 15.1341 13.4752 15.1341H1.64656ZM1.85358 2.29263C1.45958 2.29263 1.14017 1.97323 1.14017 1.57922C1.14017 1.18521 1.45958 0.865807 1.85358 0.865807H2.567C2.961 0.865807 3.28041 1.18521 3.28041 1.57922C3.28041 1.97323 2.961 2.29263 2.567 2.29263H1.85358ZM2.34529 12.8539C2.25699 13.2954 2.59465 13.7072 3.04484 13.7072H6.13406C6.52807 13.7072 6.84748 13.3878 6.84748 12.9938C6.84748 12.5998 6.52807 12.2804 6.13406 12.2804H3.04484C2.70477 12.2804 2.41198 12.5205 2.34529 12.8539ZM3.869 5.59215C3.59247 5.86868 3.14474 5.87066 2.86578 5.59659C2.5833 5.31907 2.58129 4.86446 2.8613 4.58445L3.36957 4.07619C3.6461 3.79966 4.09382 3.79768 4.37279 4.07175C4.65526 4.34927 4.65727 4.80387 4.37726 5.08388L3.869 5.59215ZM2.91602 10.0003C2.82772 10.4417 3.16538 10.8536 3.61557 10.8536H6.13406C6.52807 10.8536 6.84748 10.5342 6.84748 10.1402C6.84748 9.74617 6.52807 9.42676 6.13406 9.42676H3.61558C3.2755 9.42676 2.98271 9.6668 2.91602 10.0003ZM7.56089 4.43287C6.574 4.43287 5.73265 4.08496 5.03683 3.38915C4.51415 2.86646 4.18791 2.26179 4.05813 1.57512C3.98496 1.18801 4.3131 0.865807 4.70707 0.865807C5.10117 0.865807 5.40511 1.19415 5.53076 1.56769C5.63214 1.86906 5.80351 2.14043 6.04489 2.38181C6.46104 2.79797 6.96638 3.00605 7.56089 3.00605C8.1554 3.00605 8.66074 2.79797 9.07689 2.38181C9.31831 2.14039 9.4897 1.86896 9.59107 1.56752C9.71666 1.19407 10.0205 0.865807 10.4145 0.865807C10.8085 0.865807 11.1366 1.18814 11.0634 1.57527C10.9333 2.26227 10.607 2.86713 10.0842 3.38986C9.38842 4.08568 8.5473 4.43335 7.56089 4.43287ZM7.56089 7.28653C7.16688 7.28653 6.84748 6.96712 6.84748 6.57311V5.8597C6.84748 5.46569 7.16688 5.14629 7.56089 5.14629C7.9549 5.14629 8.2743 5.46569 8.2743 5.8597V6.57311C8.2743 6.96712 7.9549 7.28653 7.56089 7.28653ZM8.2743 12.9938C8.2743 13.3878 8.59371 13.7072 8.98772 13.7072H12.0769C12.5271 13.7072 12.8648 13.2954 12.7765 12.8539C12.7098 12.5205 12.417 12.2804 12.0769 12.2804H8.98772C8.59371 12.2804 8.2743 12.5998 8.2743 12.9938ZM8.2743 10.1402C8.2743 10.5342 8.59371 10.8536 8.98772 10.8536H11.5062C11.9564 10.8536 12.2941 10.4417 12.2058 10.0003C12.1391 9.6668 11.8463 9.42676 11.5062 9.42676H8.98772C8.59371 9.42676 8.2743 9.74617 8.2743 10.1402ZM12.2605 5.58325C11.9803 5.86349 11.5255 5.86215 11.2469 5.58025L10.7505 5.07789C10.4758 4.79998 10.4771 4.35245 10.7534 4.07617C11.0297 3.79988 11.4772 3.79856 11.7551 4.0732L12.2575 4.56965C12.5394 4.84823 12.5407 5.30301 12.2605 5.58325ZM12.5548 2.29263C12.1608 2.29263 11.8414 1.97323 11.8414 1.57922C11.8414 1.18521 12.1608 0.865807 12.5548 0.865807H13.2682C13.6622 0.865807 13.9816 1.18521 13.9816 1.57922C13.9816 1.97323 13.6622 2.29263 13.2682 2.29263H12.5548Z" fill="#DB4405"></path>
              </svg>
            </div>
            <div class="mapbox_label">Appliances: ${ e.features[0].properties['SSPU PUE Appliances'] }</div>
          </div>
        ` : ''}
        ${ e.features[0].properties['Previous Energy Source'] ? `
          <div class="mapbox_row">
            <div class="icon-embed-xxsmall w-embed">
              <svg width="100%" height="100%" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.64656 15.1341C1.01552 15.1341 0.542223 14.5567 0.665981 13.938L1.69281 8.80382C1.78629 8.3364 2.19671 7.99994 2.67339 7.99994H12.4484C12.9251 7.99994 13.3355 8.3364 13.429 8.80382L14.4558 13.938C14.5796 14.5567 14.1063 15.1341 13.4752 15.1341H1.64656ZM1.85358 2.29263C1.45958 2.29263 1.14017 1.97323 1.14017 1.57922C1.14017 1.18521 1.45958 0.865807 1.85358 0.865807H2.567C2.961 0.865807 3.28041 1.18521 3.28041 1.57922C3.28041 1.97323 2.961 2.29263 2.567 2.29263H1.85358ZM2.34529 12.8539C2.25699 13.2954 2.59465 13.7072 3.04484 13.7072H6.13406C6.52807 13.7072 6.84748 13.3878 6.84748 12.9938C6.84748 12.5998 6.52807 12.2804 6.13406 12.2804H3.04484C2.70477 12.2804 2.41198 12.5205 2.34529 12.8539ZM3.869 5.59215C3.59247 5.86868 3.14474 5.87066 2.86578 5.59659C2.5833 5.31907 2.58129 4.86446 2.8613 4.58445L3.36957 4.07619C3.6461 3.79966 4.09382 3.79768 4.37279 4.07175C4.65526 4.34927 4.65727 4.80387 4.37726 5.08388L3.869 5.59215ZM2.91602 10.0003C2.82772 10.4417 3.16538 10.8536 3.61557 10.8536H6.13406C6.52807 10.8536 6.84748 10.5342 6.84748 10.1402C6.84748 9.74617 6.52807 9.42676 6.13406 9.42676H3.61558C3.2755 9.42676 2.98271 9.6668 2.91602 10.0003ZM7.56089 4.43287C6.574 4.43287 5.73265 4.08496 5.03683 3.38915C4.51415 2.86646 4.18791 2.26179 4.05813 1.57512C3.98496 1.18801 4.3131 0.865807 4.70707 0.865807C5.10117 0.865807 5.40511 1.19415 5.53076 1.56769C5.63214 1.86906 5.80351 2.14043 6.04489 2.38181C6.46104 2.79797 6.96638 3.00605 7.56089 3.00605C8.1554 3.00605 8.66074 2.79797 9.07689 2.38181C9.31831 2.14039 9.4897 1.86896 9.59107 1.56752C9.71666 1.19407 10.0205 0.865807 10.4145 0.865807C10.8085 0.865807 11.1366 1.18814 11.0634 1.57527C10.9333 2.26227 10.607 2.86713 10.0842 3.38986C9.38842 4.08568 8.5473 4.43335 7.56089 4.43287ZM7.56089 7.28653C7.16688 7.28653 6.84748 6.96712 6.84748 6.57311V5.8597C6.84748 5.46569 7.16688 5.14629 7.56089 5.14629C7.9549 5.14629 8.2743 5.46569 8.2743 5.8597V6.57311C8.2743 6.96712 7.9549 7.28653 7.56089 7.28653ZM8.2743 12.9938C8.2743 13.3878 8.59371 13.7072 8.98772 13.7072H12.0769C12.5271 13.7072 12.8648 13.2954 12.7765 12.8539C12.7098 12.5205 12.417 12.2804 12.0769 12.2804H8.98772C8.59371 12.2804 8.2743 12.5998 8.2743 12.9938ZM8.2743 10.1402C8.2743 10.5342 8.59371 10.8536 8.98772 10.8536H11.5062C11.9564 10.8536 12.2941 10.4417 12.2058 10.0003C12.1391 9.6668 11.8463 9.42676 11.5062 9.42676H8.98772C8.59371 9.42676 8.2743 9.74617 8.2743 10.1402ZM12.2605 5.58325C11.9803 5.86349 11.5255 5.86215 11.2469 5.58025L10.7505 5.07789C10.4758 4.79998 10.4771 4.35245 10.7534 4.07617C11.0297 3.79988 11.4772 3.79856 11.7551 4.0732L12.2575 4.56965C12.5394 4.84823 12.5407 5.30301 12.2605 5.58325ZM12.5548 2.29263C12.1608 2.29263 11.8414 1.97323 11.8414 1.57922C11.8414 1.18521 12.1608 0.865807 12.5548 0.865807H13.2682C13.6622 0.865807 13.9816 1.18521 13.9816 1.57922C13.9816 1.97323 13.6622 2.29263 13.2682 2.29263H12.5548Z" fill="#DB4405"></path>
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


//When map is loaded initialize with data
map.on("load", function (e) {
	addMapPoints();
});


//close side nav with button
$(".close-block").click(function(){
	$(".locations-map_wrapper").removeClass("is--show");
});
