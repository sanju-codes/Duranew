/* =========================================================
   DURA ROOF — script.js
   Three.js scenes, GSAP scroll reveals, UI interactions.
   ========================================================= */
(function(){
  'use strict';

  var IS_MOBILE = window.matchMedia('(max-width: 760px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
  var DPR = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2);
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function supportsWebGL(){
    try{
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    }catch(e){ return false; }
  }
  var WEBGL_OK = supportsWebGL() && typeof THREE !== 'undefined';
  if(!WEBGL_OK){ document.body.classList.add('no-webgl'); }

  /* ---------------------------------------------------------
     Loader
     --------------------------------------------------------- */
  window.addEventListener('load', function(){
    var loader = document.getElementById('loader');
    setTimeout(function(){ loader.classList.add('hidden'); }, 500);
    playHeroIntro();
  });

  /* ---------------------------------------------------------
     Nav: scroll state + mobile toggle + smooth active link
     --------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function onScrollNav(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, {passive:true});

  navToggle.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  Array.prototype.forEach.call(document.querySelectorAll('#navLinks a'), function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     GSAP scroll reveals
     --------------------------------------------------------- */
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
  }
  var revealTargets = document.querySelectorAll('.reveal, .reveal-item');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealTargets.forEach(function(el){ io.observe(el); });
  } else {
    revealTargets.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Hero intro animation (headline / actions)
     --------------------------------------------------------- */
  function playHeroIntro(){
    var els = ['.hero-kicker','.hero-title','.hero-tag','.hero-sub','.hero-actions'];
    if(window.gsap){
      gsap.timeline({defaults:{ease:'power3.out'}})
        .to('.hero-kicker', {opacity:1, y:0, duration:.7}, .1)
        .fromTo('.hero-title', {opacity:0, y:40}, {opacity:1, y:0, duration:1}, .2)
        .to('.hero-tag', {opacity:1, y:0, duration:.7}, .5)
        .to('.hero-sub', {opacity:1, y:0, duration:.7}, .65)
        .to('.hero-actions', {opacity:1, y:0, duration:.7}, .8);
    } else {
      els.forEach(function(sel){
        var el = document.querySelector(sel);
        if(el) el.style.opacity = 1;
      });
    }
  }

  /* ---------------------------------------------------------
     Number counters
     --------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  var counted = false;
  function runCounters(){
    if(counted) return;
    counted = true;
    counters.forEach(function(el){
      var target = parseInt(el.getAttribute('data-count'), 10);
      var obj = {v:0};
      if(window.gsap){
        gsap.to(obj, {
          v: target, duration: 1.6, ease:'power2.out',
          onUpdate:function(){ el.textContent = Math.round(obj.v).toLocaleString('en-IN'); }
        });
      } else {
        el.textContent = target.toLocaleString('en-IN');
      }
    });
  }
  var statsEl = document.querySelector('.hero-stats');
  if(statsEl && 'IntersectionObserver' in window){
    var statsIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ runCounters(); statsIO.disconnect(); } });
    }, {threshold:.4});
    statsIO.observe(statsEl);
  } else { runCounters(); }

  /* ---------------------------------------------------------
     Tilt cards
     --------------------------------------------------------- */
  if(!IS_MOBILE && !REDUCED_MOTION){
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (-y*8) + 'deg) rotateY(' + (x*8) + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = 'perspective(700px) rotateX(0) rotateY(0)';
      });
    });
  }

  /* ---------------------------------------------------------
     Magnetic buttons
     --------------------------------------------------------- */
  if(!IS_MOBILE && !REDUCED_MOTION){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * 0.25;
        var y = (e.clientY - r.top - r.height/2) * 0.4;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------------------------------------------------------
     Contact form (static site — no backend)
     --------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var note = document.getElementById('formNote');
      var name = document.getElementById('name').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var loc = document.getElementById('location').value.trim();
      var msg = document.getElementById('message').value.trim();
      var text = 'Hi Dura Roof, I would like a quote.%0AName: ' + encodeURIComponent(name) +
                 '%0APhone: ' + encodeURIComponent(phone) +
                 '%0ALocation: ' + encodeURIComponent(loc) +
                 '%0ADetails: ' + encodeURIComponent(msg);
      note.textContent = 'Opening WhatsApp to send your request…';
      window.open('https://wa.me/910000000000?text=' + text, '_blank');
    });
  }

  /* =========================================================
     THREE.JS — shared helpers
     ========================================================= */
  function makeRenderer(canvas, alpha){
    var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:!!alpha, powerPreference:'high-performance'});
    renderer.setPixelRatio(DPR);
    renderer.shadowMap.enabled = !IS_MOBILE;
    if(renderer.shadowMap.enabled) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if('outputColorSpace' in renderer) renderer.outputColorSpace = 'srgb';
    return renderer;
  }

  function resizeToContainer(renderer, camera, canvas){
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if(w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* =========================================================
     HERO 3D SCENE — cinematic house + metal roof
     ========================================================= */
  function buildHeroScene(){
    var canvas = document.getElementById('heroCanvas');
    if(!canvas || !WEBGL_OK) return;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.028);

    var camera = new THREE.PerspectiveCamera(42, canvas.clientWidth/canvas.clientHeight, 0.1, 200);
    var renderer = makeRenderer(canvas);

    // Lighting — realistic sunlight + ambient + rim
    var hemi = new THREE.HemisphereLight(0x8891a0, 0x0a0a0b, 0.55);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffd9a8, 1.6);
    sun.position.set(18, 22, 10);
    sun.castShadow = !IS_MOBILE;
    if(sun.castShadow){
      sun.shadow.mapSize.set(1024,1024);
      sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
      sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
      sun.shadow.bias = -0.001;
    }
    scene.add(sun);
    var rim = new THREE.DirectionalLight(0x5a7ea8, 0.6);
    rim.position.set(-14, 8, -12);
    scene.add(rim);

    // Ground
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200,200),
      new THREE.MeshStandardMaterial({color:0x111214, roughness:1, metalness:0})
    );
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    scene.add(ground);

    // House group
    var house = new THREE.Group();
    scene.add(house);

    var wallMat = new THREE.MeshStandardMaterial({color:0x2b2d31, roughness:0.85, metalness:0.05});
    var body = new THREE.Mesh(new THREE.BoxGeometry(10,4,7), wallMat);
    body.position.y = 2; body.castShadow = body.receiveShadow = true;
    house.add(body);

    var wing = new THREE.Mesh(new THREE.BoxGeometry(5,3,5), wallMat);
    wing.position.set(6.2,1.5,-2); wing.castShadow = wing.receiveShadow = true;
    house.add(wing);

    // Glass strip
    var glassMat = new THREE.MeshPhysicalMaterial({color:0x1c2733, roughness:0.15, metalness:0.2, transparent:true, opacity:0.75});
    var glass = new THREE.Mesh(new THREE.BoxGeometry(9.4,1.3,0.05), glassMat);
    glass.position.set(0,2.2,3.53);
    house.add(glass);

    // Roof — metallic trapezoidal profile using ribbed geometry group
    var roofMat = new THREE.MeshStandardMaterial({color:0x9aa1a8, roughness:0.32, metalness:0.85});
    var roofGroup = new THREE.Group();
    var roofSlope = new THREE.Mesh(new THREE.BoxGeometry(11.4,0.18,5.4), roofMat);
    roofSlope.position.set(0,4.35,1.2);
    roofSlope.rotation.x = -0.32;
    roofSlope.castShadow = true;
    roofGroup.add(roofSlope);
    var roofSlope2 = roofSlope.clone();
    roofSlope2.position.set(0,4.35,-1.2);
    roofSlope2.rotation.x = 0.32;
    roofGroup.add(roofSlope2);
    // ribs
    for(var i=-5; i<=5; i++){
      var rib = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.05,5.3), new THREE.MeshStandardMaterial({color:0x6d7379, roughness:0.3, metalness:0.9}));
      rib.position.set(i*1.03, 4.44, 1.2);
      rib.rotation.x = -0.32;
      roofGroup.add(rib);
      var rib2 = rib.clone();
      rib2.position.set(i*1.03, 4.44, -1.2);
      rib2.rotation.x = 0.32;
      roofGroup.add(rib2);
    }
    house.add(roofGroup);

    var wingRoof = new THREE.Mesh(new THREE.BoxGeometry(5.6,0.15,5.6), roofMat);
    wingRoof.position.set(6.2,3.35,-2);
    wingRoof.rotation.z = 0.12;
    wingRoof.castShadow = true;
    house.add(wingRoof);

    house.position.y = -1;

    // Camera cinematic path
    var camStart = new THREE.Vector3(28, 16, 30);
    var camEnd = new THREE.Vector3(11, 6.5, 13);
    camera.position.copy(camStart);
    camera.lookAt(0,2,0);

    var clock = new THREE.Clock();
    var scrollProgress = 0;

    function updateFromScroll(){
      var heroEl = document.getElementById('home');
      var rect = heroEl.getBoundingClientRect();
      var p = Math.min(Math.max(-rect.top / (rect.height*0.9), 0), 1);
      scrollProgress = p;
    }
    window.addEventListener('scroll', updateFromScroll, {passive:true});

    var introT = 0;
    var running = true;
    document.addEventListener('visibilitychange', function(){ running = !document.hidden; });

    function animate(){
      if(!running){ requestAnimationFrame(animate); return; }
      var dt = Math.min(clock.getDelta(), 0.05);
      introT = Math.min(introT + dt/6, 1);
      var ease = 1 - Math.pow(1-introT, 3);

      var camPos = camStart.clone().lerp(camEnd, ease);
      // orbit slightly with scroll + gentle continuous drift
      var angle = -0.5 + scrollProgress*0.7 + Math.sin(clock.elapsedTime*0.08)*0.05;
      var radius = camPos.length();
      camera.position.set(
        Math.sin(angle)*radius*0.32 + camPos.x*0.68,
        camPos.y - scrollProgress*3,
        Math.cos(angle)*radius*0.32 + camPos.z*0.68
      );
      camera.lookAt(0, 2.6 - scrollProgress*1.5, 0);

      house.rotation.y = Math.sin(clock.elapsedTime*0.05)*0.03;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    resizeToContainer(renderer, camera, canvas);
    window.addEventListener('resize', function(){ resizeToContainer(renderer, camera, canvas); });
    animate();
  }

  /* =========================================================
     PRODUCT 3D VIEWER — draggable roofing sheet
     ========================================================= */
  var PRODUCTS = [
    {
      name:'PPGL / Aluminium Roofing Sheet',
      color:0xb9c0c6, metalness:0.9, roughness:0.28, ribs:9,
      specs:['0.25–0.50mm thickness','AZ-70 – AZ-150 coating','Anti-capillary groove']
    },
    {
      name:'Architectural Cladding Sheet',
      color:0x6b4a30, metalness:0.35, roughness:0.6, ribs:21, fluted:true,
      specs:['21 rib profile','Fluted geometry','Wood grain / matte black']
    },
    {
      name:'Smart Clad / Box Cladding',
      color:0x2a2c30, metalness:0.75, roughness:0.35, ribs:7, box:true,
      specs:['Hidden screw fixing','Interior & exterior elevation','Custom profiles']
    }
  ];

  var productViewer = { scene:null, sheetGroup:null, camera:null, renderer:null, autoRotate:true };

  function buildSheetMesh(spec){
    var group = new THREE.Group();
    var w = 6, d = 3.6;
    var mat = new THREE.MeshStandardMaterial({color:spec.color, metalness:spec.metalness, roughness:spec.roughness});
    var base = new THREE.Mesh(new THREE.BoxGeometry(w,0.12,d), mat);
    group.add(base);
    var ribCount = spec.ribs;
    var ribMat = new THREE.MeshStandardMaterial({color:spec.color, metalness:Math.min(spec.metalness+0.1,1), roughness:Math.max(spec.roughness-0.1,0.05)});
    for(var i=0;i<ribCount;i++){
      var x = -w/2 + (w/(ribCount-1))*i;
      var geo = spec.box ? new THREE.BoxGeometry(0.16,0.16,d) : new THREE.CylinderGeometry(0.09,0.09,d,10);
      var rib = new THREE.Mesh(geo, ribMat);
      if(!spec.box) rib.rotation.x = Math.PI/2;
      rib.position.set(x, 0.13, 0);
      group.add(rib);
    }
    return group;
  }

  function buildProductViewer(){
    var canvas = document.getElementById('productCanvas');
    if(!canvas || !WEBGL_OK) return;

    var scene = new THREE.Scene();
    productViewer.scene = scene;
    var camera = new THREE.PerspectiveCamera(38, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 3.2, 7);
    camera.lookAt(0,0,0);
    productViewer.camera = camera;

    var renderer = makeRenderer(canvas, true);
    productViewer.renderer = renderer;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x111214, 0.5));
    var key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(6,8,6);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xffa965, 0.5);
    fill.position.set(-6,2,-4);
    scene.add(fill);
    var rim = new THREE.PointLight(0x6d9fff, 0.6, 20);
    rim.position.set(0,-2,-6);
    scene.add(rim);

    var sheetGroup = buildSheetMesh(PRODUCTS[0]);
    scene.add(sheetGroup);
    productViewer.sheetGroup = sheetGroup;

    var dragging = false, lastX = 0, lastY = 0, rotY = 0.4, rotX = -0.15, velY = 0.002;

    function pointerDown(x,y){ dragging = true; lastX = x; lastY = y; }
    function pointerMove(x,y){
      if(!dragging) return;
      var dx = x - lastX, dy = y - lastY;
      rotY += dx * 0.008;
      rotX += dy * 0.006;
      rotX = Math.max(Math.min(rotX, 0.7), -0.7);
      velY = dx * 0.0006;
      lastX = x; lastY = y;
    }
    function pointerUp(){ dragging = false; }

    canvas.addEventListener('mousedown', function(e){ pointerDown(e.clientX,e.clientY); });
    window.addEventListener('mousemove', function(e){ pointerMove(e.clientX,e.clientY); });
    window.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('touchstart', function(e){ var t=e.touches[0]; pointerDown(t.clientX,t.clientY); }, {passive:true});
    canvas.addEventListener('touchmove', function(e){ var t=e.touches[0]; pointerMove(t.clientX,t.clientY); e.preventDefault(); }, {passive:false});
    canvas.addEventListener('touchend', pointerUp);

    canvas.addEventListener('wheel', function(e){
      e.preventDefault();
      camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY*0.003, 4), 11);
    }, {passive:false});

    document.getElementById('btn360') && document.getElementById('btn360').addEventListener('click', function(){
      productViewer.autoRotate = true;
      velY = 0.02;
    });

    function animate(){
      if(!dragging){
        rotY += velY;
        velY *= 0.96;
        if(Math.abs(velY) < 0.0008 && productViewer.autoRotate) velY = 0.0025;
      }
      sheetGroup.rotation.y = rotY;
      sheetGroup.rotation.x = rotX;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    resizeToContainer(renderer, camera, canvas);
    window.addEventListener('resize', function(){ resizeToContainer(renderer, camera, canvas); });
    animate();
  }

  function swapProduct(idx){
    if(!productViewer.scene || !productViewer.sheetGroup) return;
    productViewer.scene.remove(productViewer.sheetGroup);
    var group = buildSheetMesh(PRODUCTS[idx]);
    productViewer.scene.add(group);
    productViewer.sheetGroup = group;
  }

  function initProductTabs(){
    var tabs = document.querySelectorAll('#productTabs .tab');
    var specsEl = document.getElementById('productSpecs');
    function render(idx){
      tabs.forEach(function(t,i){ t.classList.toggle('active', i===idx); });
      specsEl.innerHTML = '';
      PRODUCTS[idx].specs.forEach(function(s){
        var span = document.createElement('span');
        span.textContent = s;
        specsEl.appendChild(span);
      });
      swapProduct(idx);
    }
    tabs.forEach(function(tab, i){
      tab.addEventListener('click', function(){ render(i); });
    });
    render(0);
  }

  /* =========================================================
     CONFIGURATOR 3D SCENE — colour / profile / finish / day-night
     ========================================================= */
  var configState = {
    roofColour:'#1c1d1f', wallColour:'#e9e6df', profile:'trapezoidal', finish:'matte', night:false
  };
  var configRefs = { roofMat:null, wallMat:null, sun:null, ambient:null, scene:null };

  function buildConfiguratorScene(){
    var canvas = document.getElementById('configCanvas');
    if(!canvas || !WEBGL_OK) return;

    var scene = new THREE.Scene();
    configRefs.scene = scene;
    var camera = new THREE.PerspectiveCamera(40, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
    camera.position.set(8,5,9);
    camera.lookAt(0,1.5,0);

    var renderer = makeRenderer(canvas);

    var ambient = new THREE.HemisphereLight(0x9aa4b0, 0x0a0a0b, 0.6);
    scene.add(ambient);
    configRefs.ambient = ambient;
    var sun = new THREE.DirectionalLight(0xffe2b8, 1.5);
    sun.position.set(10,12,6);
    sun.castShadow = !IS_MOBILE;
    scene.add(sun);
    configRefs.sun = sun;

    var ground = new THREE.Mesh(new THREE.PlaneGeometry(60,60), new THREE.MeshStandardMaterial({color:0x121316, roughness:1}));
    ground.rotation.x = -Math.PI/2; ground.position.y = -0.01; ground.receiveShadow = true;
    scene.add(ground);

    var wallMat = new THREE.MeshStandardMaterial({color: configState.wallColour, roughness:0.85, metalness:0.02});
    configRefs.wallMat = wallMat;
    var roofMat = new THREE.MeshStandardMaterial({color: configState.roofColour, roughness:0.35, metalness:0.8});
    configRefs.roofMat = roofMat;

    var house = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(6,3,4.5), wallMat);
    body.position.y = 1.5; body.castShadow = body.receiveShadow = true;
    house.add(body);

    var roofGroup = new THREE.Group();
    var slopeGeo = new THREE.BoxGeometry(6.8,0.15,3.2);
    var slopeA = new THREE.Mesh(slopeGeo, roofMat);
    slopeA.position.set(0,3.15,0.9); slopeA.rotation.x = -0.34; slopeA.castShadow = true;
    var slopeB = slopeA.clone(); slopeB.position.set(0,3.15,-0.9); slopeB.rotation.x = 0.34;
    roofGroup.add(slopeA, slopeB);
    house.add(roofGroup);
    configRefs.roofGroup = roofGroup;
    configRefs.house = house;

    scene.add(house);

    var clock = new THREE.Clock();
    function animate(){
      var dt = clock.getDelta();
      house.rotation.y += dt * 0.15;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    resizeToContainer(renderer, camera, canvas);
    window.addEventListener('resize', function(){ resizeToContainer(renderer, camera, canvas); });
    animate();
  }

  function rebuildRoofProfile(){
    if(!configRefs.roofGroup || !configRefs.roofMat) return;
    var group = configRefs.roofGroup;
    while(group.children.length) group.remove(group.children[0]);
    var mat = configRefs.roofMat;
    var slopeGeo = new THREE.BoxGeometry(6.8,0.15,3.2);
    var slopeA = new THREE.Mesh(slopeGeo, mat);
    slopeA.position.set(0,3.15,0.9); slopeA.rotation.x = -0.34; slopeA.castShadow = true;
    var slopeB = slopeA.clone(); slopeB.position.set(0,3.15,-0.9); slopeB.rotation.x = 0.34;
    group.add(slopeA, slopeB);

    var ribCount = configState.profile === 'corrugated' ? 16 : (configState.profile === 'standing-seam' ? 6 : 10);
    var ribGeo = configState.profile === 'standing-seam'
      ? new THREE.BoxGeometry(0.1,0.14,3.2)
      : new THREE.CylinderGeometry(0.05,0.05,3.2,8);
    for(var i=0;i<ribCount;i++){
      var x = -3.3 + (6.6/(ribCount-1))*i;
      [0.9,-0.9].forEach(function(z, zi){
        var rib = new THREE.Mesh(ribGeo, mat);
        if(configState.profile !== 'standing-seam') rib.rotation.x = Math.PI/2;
        rib.position.set(x, 3.24, z);
        rib.rotation.x += (zi===0 ? -0.34 : 0.34);
        group.add(rib);
      });
    }
  }

  function applyFinish(){
    if(!configRefs.roofMat) return;
    var f = configState.finish;
    if(f === 'matte'){ configRefs.roofMat.roughness = 0.55; configRefs.roofMat.metalness = 0.6; }
    else if(f === 'glossy'){ configRefs.roofMat.roughness = 0.12; configRefs.roofMat.metalness = 0.9; }
    else { configRefs.roofMat.roughness = 0.8; configRefs.roofMat.metalness = 0.35; }
    configRefs.roofMat.needsUpdate = true;
  }

  function applyDayNight(){
    if(!configRefs.sun || !configRefs.ambient) return;
    if(configState.night){
      configRefs.sun.intensity = 0.25; configRefs.sun.color.set(0x6f8fd6);
      configRefs.ambient.intensity = 0.25; configRefs.ambient.color.set(0x2b3550);
    } else {
      configRefs.sun.intensity = 1.5; configRefs.sun.color.set(0xffe2b8);
      configRefs.ambient.intensity = 0.6; configRefs.ambient.color.set(0x9aa4b0);
    }
  }

  function initConfiguratorUI(){
    var roofSwatches = document.querySelectorAll('#roofColourSwatches .swatch');
    var wallSwatches = document.querySelectorAll('#wallColourSwatches .swatch');
    var profileChips = document.querySelectorAll('#roofProfileChips .chip');
    var finishChips = document.querySelectorAll('#roofFinishChips .chip');
    var dayNightBtn = document.getElementById('dayNightToggle');

    if(roofSwatches[0]) roofSwatches[0].classList.add('active');
    if(wallSwatches[0]) wallSwatches[0].classList.add('active');

    roofSwatches.forEach(function(sw){
      sw.addEventListener('click', function(){
        roofSwatches.forEach(function(s){ s.classList.remove('active'); });
        sw.classList.add('active');
        configState.roofColour = sw.getAttribute('data-colour');
        if(configRefs.roofMat) configRefs.roofMat.color.set(configState.roofColour);
      });
    });
    wallSwatches.forEach(function(sw){
      sw.addEventListener('click', function(){
        wallSwatches.forEach(function(s){ s.classList.remove('active'); });
        sw.classList.add('active');
        configState.wallColour = sw.getAttribute('data-colour');
        if(configRefs.wallMat) configRefs.wallMat.color.set(configState.wallColour);
      });
    });
    profileChips.forEach(function(chip){
      chip.addEventListener('click', function(){
        profileChips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        configState.profile = chip.getAttribute('data-profile');
        rebuildRoofProfile();
      });
    });
    finishChips.forEach(function(chip){
      chip.addEventListener('click', function(){
        finishChips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        configState.finish = chip.getAttribute('data-finish');
        applyFinish();
      });
    });
    if(dayNightBtn){
      dayNightBtn.addEventListener('click', function(){
        configState.night = !configState.night;
        dayNightBtn.setAttribute('aria-pressed', configState.night ? 'true':'false');
        dayNightBtn.innerHTML = configState.night
          ? '<i class="fa-solid fa-moon"></i><span>Night</span>'
          : '<i class="fa-solid fa-sun"></i><span>Day</span>';
        applyDayNight();
      });
    }
  }

  /* =========================================================
     ABOUT — small ambient spinning roof panel
     ========================================================= */
  function buildAboutScene(){
    var canvas = document.getElementById('aboutCanvas');
    if(!canvas || !WEBGL_OK) return;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, canvas.clientWidth/canvas.clientHeight, 0.1, 50);
    camera.position.set(0,1.5,6);
    var renderer = makeRenderer(canvas, true);

    scene.add(new THREE.HemisphereLight(0xffffff,0x0a0a0b,0.6));
    var key = new THREE.DirectionalLight(0xffd9a8,1.3); key.position.set(5,6,4); scene.add(key);
    var rim = new THREE.DirectionalLight(0x5a7ea8,0.7); rim.position.set(-5,2,-4); scene.add(rim);

    var group = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({color:0xb9c0c6, metalness:0.88, roughness:0.25});
    for(var i=0;i<6;i++){
      var panel = new THREE.Mesh(new THREE.BoxGeometry(0.6,2.6,0.08), mat);
      panel.position.x = -1.5 + i*0.6;
      panel.rotation.y = 0.05;
      group.add(panel);
    }
    scene.add(group);

    var clock = new THREE.Clock();
    function animate(){
      var dt = clock.getDelta();
      group.rotation.y += dt*0.35;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    resizeToContainer(renderer, camera, canvas);
    window.addEventListener('resize', function(){ resizeToContainer(renderer, camera, canvas); });
    animate();
  }

  /* =========================================================
     Spec table data
     ========================================================= */
  var SPEC_DATA = [
    [
      ['Material','PPGL / Aluminium coated steel'],
      ['Thickness','0.25 – 0.50 mm'],
      ['Coating','AZ-70 – AZ-150 (Aluminium-Zinc)'],
      ['Profile','Trapezoidal / Corrugated'],
      ['Finish','Matte, Glossy, Textured'],
      ['Coverage','1000 – 1050 mm effective width'],
      ['Application','Residential, Commercial, Industrial roofing'],
      ['Customization','Custom lengths, colours on request']
    ],
    [
      ['Material','Aluminium / Steel composite'],
      ['Thickness','0.30 – 0.45 mm'],
      ['Coating','PVDF / PVC laminate'],
      ['Profile','21-Rib fluted'],
      ['Finish','Wood Grain, Matte Black'],
      ['Coverage','900 – 1000 mm effective width'],
      ['Application','Facades, elevation cladding'],
      ['Customization','Custom textures &amp; profiles']
    ],
    [
      ['Material','High-tensile galvanised steel'],
      ['Thickness','0.35 – 0.55 mm'],
      ['Coating','AZ-100 – AZ-150'],
      ['Profile','Box / Standing Seam'],
      ['Finish','Matte, Metallic'],
      ['Coverage','300 – 600 mm panel width'],
      ['Application','Interior &amp; exterior elevation'],
      ['Customization','Hidden-fastener custom profiles']
    ]
  ];

  function initSpecTable(){
    var tabs = document.querySelectorAll('#specTabs .tab');
    var tbody = document.querySelector('#specTable tbody');
    function render(idx){
      tabs.forEach(function(t,i){ t.classList.toggle('active', i===idx); });
      tbody.innerHTML = '';
      SPEC_DATA[idx].forEach(function(row){
        var tr = document.createElement('tr');
        var td1 = document.createElement('td'); td1.textContent = row[0];
        var td2 = document.createElement('td'); td2.innerHTML = row[1];
        tr.appendChild(td1); tr.appendChild(td2);
        tbody.appendChild(tr);
      });
    }
    tabs.forEach(function(tab,i){ tab.addEventListener('click', function(){ render(i); }); });
    render(0);
  }

  /* =========================================================
     Init
     ========================================================= */
  function init(){
    if(WEBGL_OK){
      buildHeroScene();
      buildProductViewer();
      buildConfiguratorScene();
      buildAboutScene();
    }
    initProductTabs();
    initConfiguratorUI();
    initSpecTable();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------------------------------------------------------
     Service worker (progressive offline support)
     --------------------------------------------------------- */
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('service-worker.js').catch(function(){ /* non-fatal */ });
    });
  }

})();

