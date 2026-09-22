/* The same MapLibre version, OpenFreeMap style and territory layers as the app.
   Only public map tiles are requested; the companies remain illustrative. */
(() => {
  'use strict';
  const FRANCE = [[-5.2,41.25],[9.7,51.15]];
  const AREA = [[4.24,45.45],[4.97,46.31]];
  const FINALISTS = [[4.73,45.72],[4.93,45.85]];
  const EMPTY = {type:'FeatureCollection',features:[]};
  let library;
  function loadLibrary() {
    if (window.maplibregl) return Promise.resolve(window.maplibregl);
    return library ||= new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = '/assets/vendor/maplibre/maplibre-gl.js';
      script.onload = () => resolve(window.maplibregl);
      script.onerror = () => reject(new Error('Map library unavailable'));
      document.head.append(script);
    });
  }
  const smooth = n => { const t = Math.max(0,Math.min(1,n)); return t*t*(3-2*t); };
  function between(a,b,t) {
    const start = a.center.toArray ? a.center.toArray() : a.center;
    const end = b.center.toArray ? b.center.toArray() : b.center;
    return {center:start.map((n,i) => n+(end[i]-n)*t),zoom:a.zoom+(b.zoom-a.zoom)*t};
  }
  window.createHomeRadarMap = root => {
    const container = document.createElement('div');
    container.className = 'radar-live-map';
    container.setAttribute('aria-hidden','true');
    root.querySelector('.radar-map-window').prepend(container);
    root.classList.add('is-map-loading');
    const stage=root.querySelector('.radar-stage'), results=root.querySelector('.radar-results');
    let canvasWidth=0,canvasHeight=0;
    function sizeCanvas() {
      const width=stage.clientWidth,height=stage.clientHeight;
      if(width===canvasWidth&&height===canvasHeight)return false;
      canvasWidth=width;canvasHeight=height;
      container.style.width=`${width}px`;container.style.height=`${height}px`;
      return true;
    }
    sizeCanvas();
    const noPadding={top:0,bottom:0,left:0,right:0};
    function finalPadding() {
      const stacked=matchMedia('(max-width:700px)').matches;
      return {...noPadding,right:stacked?0:results.offsetWidth,bottom:stacked?results.offsetHeight:0};
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const pins = [...root.querySelectorAll('.radar-pin')].map(element => {
      const x = parseFloat(element.style.getPropertyValue('--pin-x'));
      const y = parseFloat(element.style.getPropertyValue('--pin-y'));
      const featured = [[4.827,45.779],[4.773,45.777],[4.884,45.767]];
      return {element, coordinates:featured[Number(element.dataset.radarProfile)] || [3.8+x*.018,46.45-y*.0115]};
    });
    const longitudes=pins.map(pin=>pin.coordinates[0]), latitudes=pins.map(pin=>pin.coordinates[1]);
    const companyBounds=[[Math.min(...longitudes),Math.min(...latitudes)],[Math.max(...longitudes),Math.max(...latitudes)]];
    let map, loaded = false, camera, settleFrame = 0, last = {phase:'query',progress:0};
    const cameraFor = (bounds,padding,maxZoom=12) => map.cameraForBounds(bounds,{padding,maxZoom});
    function cameras() {
      const insets=finalPadding();
      camera = {
        france:cameraFor(FRANCE,{top:120,bottom:55,left:30,right:30}),
        area:cameraFor(AREA,{top:125,bottom:85,left:40,right:40},9.4),
        companies:cameraFor(companyBounds,{top:155,bottom:100,left:60,right:60},9.6),
        finalists:cameraFor(FINALISTS,{top:110,bottom:75+insets.bottom,left:40,right:40+insets.right},10.8),
      };
      const center=camera.companies.center;
      camera.close = {center:[center.lng+.006,center.lat],zoom:camera.companies.zoom+.035};
    }
    function positionPins() {
      for (const {element,coordinates} of pins) {
        const point = map.project(coordinates);
        element.style.left = `${point.x}px`;
        element.style.top = `${point.y}px`;
      }
    }
    function finalView() { return {center:[4.827,45.786],zoom:camera.finalists.zoom,padding:finalPadding()}; }
    function settle() {
      // Lock the destination for the whole move. The canvas keeps its full stage
      // size; only its visible window and camera padding change with the cards.
      const from={center:map.getCenter(),zoom:map.getZoom(),padding:map.getPadding()};
      const destination=finalView(), started=performance.now();
      const tick=now=>{
        const t=reduced.matches?1:Math.min(1,(now-started)/1800);
        const eased=smooth(t);
        const padding=Object.fromEntries(Object.keys(noPadding).map(side=>[side,from.padding[side]+(destination.padding[side]-from.padding[side])*eased]));
        map.jumpTo({...between(from,destination,eased),padding});
        settleFrame=t<1?requestAnimationFrame(tick):0;
      };
      settleFrame=requestAnimationFrame(tick);
    }
    function render(phase,progress=0) {
      const changed = phase !== last.phase;
      last = {phase,progress};
      if (!loaded) return;
      if (changed) { cancelAnimationFrame(settleFrame);settleFrame=0;map.getSource('territory').setData(phase==='query'?EMPTY:territory); }
      let view;
      if (phase==='query') view=camera.france;
      if (phase==='scope') view=between(camera.france,camera.area,smooth((progress-.14)/.86));
      if (phase==='discover') view=between(camera.area,camera.companies,smooth(progress));
      if (phase==='analyze') view=between(camera.companies,camera.close,smooth(progress));
      if (phase==='complete') {
        if (changed) settle();
      } else if (view) {
        map.jumpTo({...view,bearing:0,pitch:0,padding:noPadding});
      }
      positionPins();
    }
    let territory;
    const ready = Promise.all([
      loadLibrary(),
      fetch('/assets/radar/rhone.geojson').then(response => {if(!response.ok)throw new Error('Territory unavailable');return response.json();}),
    ]).then(async ([lib,geo]) => {
      territory=geo;
      map=new lib.Map({container,style:'https://tiles.openfreemap.org/styles/bright',center:[2.4,46.6],zoom:4.6,interactive:false,attributionControl:false,renderWorldCopies:false,fadeDuration:200,maxTileCacheSize:256,cancelPendingTileRequestsWhileZooming:false});
      map.addControl(new lib.AttributionControl({compact:false,customAttribution:'Contours : Etalab / IGN'}),'bottom-right');
      cameras();map.jumpTo(camera.france);
      await new Promise((resolve,reject) => {
        const timeout=setTimeout(()=>reject(new Error('Map loading timed out')),15000);
        map.once('load',()=>{clearTimeout(timeout);resolve();});
      });
      const before=map.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
      for(const layer of map.getStyle().layers)if(layer.id.includes('poi'))map.setLayoutProperty(layer.id,'visibility','none');
      const tile=document.createElement('canvas');tile.width=tile.height=32;
      const ctx=tile.getContext('2d');
      for(let x=-32;x<=32;x+=16){
        ctx.beginPath();ctx.moveTo(x,32);ctx.lineTo(x+32,0);ctx.strokeStyle='rgba(36,119,89,.32)';ctx.lineWidth=1;ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+1.5,32);ctx.lineTo(x+33.5,0);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.stroke();
      }
      map.addImage('etching',ctx.getImageData(0,0,32,32),{pixelRatio:2});
      map.addSource('territory',{type:'geojson',data:last.phase==='query'?EMPTY:territory});
      for(const [id,type,paint] of [
        ['fill','fill',{'fill-color':'#d0ffe9','fill-opacity':.22}],
        ['hatch','fill',{'fill-pattern':'etching','fill-opacity':.48}],
        ['glow','line',{'line-color':'#3bdc9d','line-width':10,'line-blur':5,'line-opacity':.24}],
        ['line','line',{'line-color':'#399c70','line-width':2.8,'line-opacity':.88}],
        ['light','line',{'line-color':'#e7fff2','line-width':.85,'line-opacity':.95}],
      ])map.addLayer({id:'territory-'+id,type,source:'territory',paint},before);
      loaded=true;
      root.classList.add('has-live-map');root.classList.remove('is-map-loading');
      map.on('render',positionPins);
      const observer=new ResizeObserver(()=>{
        if(!sizeCanvas())return;
        map.resize();cameras();
        if(last.phase==='complete') {
          cancelAnimationFrame(settleFrame);settleFrame=0;map.jumpTo(finalView());
        } else render(last.phase,last.progress);
        positionPins();
      });
      observer.observe(stage);
      const current=last;last={phase:'',progress:0};render(current.phase,current.progress);
    }).catch(error=>{
      map?.remove();container.remove();root.classList.remove('is-map-loading');
      console.warn('Radar basemap unavailable; showing the local fallback.',error);
    });
    return {ready,render,stop:()=>{cancelAnimationFrame(settleFrame);settleFrame=0;map?.stop();if(loaded&&last.phase==='complete')map.jumpTo(finalView());}};
  };
})();
