const rad90 = Math.PI * .5;
var raycaster = new THREE.Raycaster();
var camera, scene, renderer, mesh, listener;
var updateList = [];
var particles = [];
var particles2 = [];
var creatures = [];
var synth, bgSynth;
var soundActive = false;

const auraOpacity = 0.25;

var chords2 = [
["C2", "E2", "G2"],
["C#2", "F2", "G#2"],
["Db2", "F2", "Ab2"],
["D2", "F#2", "A2"],
["G2", "B2", "D2"],
];

// note that each voice is playing
var voices = [];
var tempo = 1000; // ms to advance note
var playIndex = 0;
var recording = ["", "", ""];

// c major
var chords = [
["D3", "F#3", "A3"],	// II
["E3","G3","B3"],	// III
["F","A","C3"],	      // IV
["G3", "B3", "D3"],   // V
["A3", "C3", "E3"],	// VI
];

var chord = 0;
var notes = ["A3", "B3", "C3", "D3", "E3", "F3", "G3"];

class Creature {
	constructor(pos) {
	}

	onTouch(evt) {
	}

	animate() {
	}
}

class EyeGuy extends Creature {
	constructor(pos, size, note) {
		super();
		var colors = [
			Math.floor( Math.random() * (2<<24) ),
			Math.floor( Math.random() * (2<<24) ),
			Math.floor( Math.random() * (2<<24) ),
		];
		var bodyMat1 = new THREE.MeshBasicMaterial( { color: colors[0], transparent: true, opacity: 0.85 } );
		var bodyGeom1 =  new THREE.SphereGeometry( 80, 32, 32 );
		var bodyMat2 = new THREE.MeshBasicMaterial( { color: colors[1], transparent: true, opacity: 0.55 } );
		var bodyGeom2 =  new THREE.SphereGeometry( 100, 32, 32 );
		var auraMat = new THREE.MeshBasicMaterial( { color: colors[2], transparent: true, opacity: 0.15 } );
		var sphereGeom =  new THREE.SphereGeometry( 140, 32, 32 );

		var body = new THREE.Mesh( bodyGeom1, bodyMat1 );
		var body2 = new THREE.Mesh( bodyGeom2, bodyMat2 );
		var aura = new THREE.Mesh( sphereGeom, auraMat );
		aura.note = note;
		aura.index = note;
		var e1 = circle( -20, 50, 90, 10, 0xffffff);
		var e2 = circle( 20, 50, 90, 10, 0xffffff);
		var cornea1 = circle( -20, 50, 99, 7, 0x5555ff);
		var cornea2 = circle( 20, 50, 99, 7, 0x5555ff);
		var iris1 = circle( -20, 50, 100, 5, 0x000000);
		var iris2 = circle( 20, 50, 100, 5, 0x000000);
		var s = smile( 0, 10, 50, 20, 0xffffff);

		var group = new THREE.Group();
		var tail = makeTail(colors[0]);
		tail.position.y = -130;
		group.add(body);
		group.add(body2);
		group.add(e1);
		group.add(e2);
		group.add(cornea1);
		group.add(cornea2);
		group.add(iris1);
		group.add(iris2);
		group.add(s);
		group.add(aura);
		group.add(tail);
		group.tail = tail;

		this.animate(group, tail, pos, {x: 0, y: 0, z: 0}, size);
		group.aura = aura;
		return group;
	}

	animate(group, tail, pos, rotation, size){
		var target = { z:  rad90 / 8};
		var position = pos;
		var targetPos = {x: pos.x + 50, y: pos.y + 100};
		var scale = {x: size, y: size, z: size };
		var targetScale = {x: scale.x + .2, y: scale.y + .2, z: scale.z + .2};

		var tween = new TWEEN.Tween( rotation ).to( target, Math.random() * 10000 + 9000 ).yoyo(true).repeat(Infinity).onUpdate(function() {
			group.rotation.z = rotation.z;
		}).start();
		var posTween = new TWEEN.Tween( position ).to( targetPos, Math.random() * 6000 + 15000 ).yoyo(true).repeat(Infinity).onUpdate(function() {
			group.position.y = position.y;
			group.position.x = position.x;
		}).start();
		var scaleTween = new TWEEN.Tween( scale ).to( targetScale, Math.random() * 10000 + 29000 ).yoyo(true).repeat(Infinity).onUpdate(function() {
			group.scale.x = scale.x;
			group.scale.y = scale.y;
			group.scale.z = scale.z;
		}).start();

		var time = {t: 0};
		var tailTween = new TWEEN.Tween( time ).to( {t: Math.PI * 2 }, 5000)
		.repeat(Infinity).onUpdate(function() {
			const n = tail.children.length;
			for( var i = 0; i < n; i++ ) {
				tail.children[i].position.x = 50*Math.sin( i / n * (Math.PI*2) + time.t );
			}
		}).start();
	}
}

function animFlyer(group, arm1, arm2, pos, rotation, size){
	var rot1 = {z: arm1.rotation.z};
	var rot2 = {z: arm2.rotation.z};
	var target = { z:  rad90 / 8};
	new TWEEN.Tween( rot1 ).to( target, Math.random() * 10000 + 9000 ).yoyo(true).repeat(Infinity).onUpdate(function() {
		arm1.rotation.z = rot1.z;
	}).start();
	new TWEEN.Tween( rot2 ).to( target, Math.random() * 10000 + 9000 ).yoyo(true).repeat(Infinity).onUpdate(function() {
		arm2.rotation.z = rot2.z;
	}).start();
	var targetPos = {x: pos.x + 50, y: pos.y + 100};
	var posTween = new TWEEN.Tween( pos).to( targetPos, Math.random() * 6000 + 15000 ).yoyo(true).repeat(Infinity).onUpdate(function() {
		group.position.y = pos.y;
		group.position.x = pos.x;
	}).start();
}

// returns an array of geometry to make up a sphere "tail"
function makeTail(color) {
	var group = new THREE.Group();
	var y = 0;
	var colorAdd = 0x01;
	for (var i = 0; i < 10; i++) {
		var size = 50 + Math.random() * 20;
		y -= size*1.5;
		
		color = color | ((color - (colorAdd<<16)) & 0xff0000);
		color = color | ((color - (colorAdd<<8)) & 0xff00);
		color = color | ((color - (colorAdd)) & 0xff);

		var mat = new THREE.MeshBasicMaterial( { color: color, transparent: true, opacity: 0.65 } );
		var geom = new THREE.SphereGeometry( size, 32, 32 );
		mesh = new THREE.Mesh( geom, mat );
		mesh.position.x = Math.sin( i / 10 * Math.PI * 2 ) * size;
		mesh.position.y = y;
		mesh.renderOrder = -1;
		mesh.note = notes[i % notes.length];
		group.add(mesh);
	}
	return group;
}

function rain() {
	var group = new THREE.Group();
	var particles = [];
	for (var i = -10; i < 10; i++ ) {
		for (var j = -10; j < 10; j++) {
			var color = 0xffffff; //Math.floor( Math.random() * (2<<24) );
			var shape;
			if ( Math.random() < 0.85 ) {
				shape = circle(i*50 + Math.random()*20, j*50 + Math.random()*20, 0, Math.random()*2, color);
			} else {
				shape = heart({x: i*50 + Math.random()*20, y: j*50 + Math.random()*20, z: 0}, {}, Math.random()*4+4, color);
			}
			group.add(shape);
			particles.push(shape);
		}
	}
	scene.add(group);
	return particles;
}

function spawnHeart(scene) {
	var color = 0xffffff;
	var pos = {x: Math.random() * window.innerWidth - window.innerWidth/2.0, y: window.innerHeight/3.0, z: -50};
	var shape = circle(pos.x, pos.y, pos.z, Math.random()*10+15, color, 0.6);

	shape.note = chords[chord][Math.floor(Math.random() * 3)];
	scene.add(shape);
	particles2.push(shape);

	new TWEEN.Tween( pos ).to( {x: pos.x, y: -window.innerHeight/2.0}, 20000 ).onUpdate(function() {
		shape.position.x = pos.x;
		shape.position.y = pos.y;
	}).onComplete(function() {
		scene.remove(shape);
	}).start();
}

function init() {
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	scene = new THREE.Scene();
	//scene.background = new THREE.Color( 0x2289f0 );
	//renderer.setClearColor(0x000000, 0.0);
	renderer.autoClear = false;

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 500 );

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.PointLight( 0xffffff );
	light.position.copy( camera.position );
	scene.add( light );

	var guy1 = new EyeGuy({x: 200, y: 130, z: -30}, .3, 0);
	var guy2 = new EyeGuy({x: 0, y: 0, z: 0}, 1, 1);
	var guy3 = new EyeGuy({x: -300, y: -30, z: -30}, .5, 2);
	scene.add(guy1);
	scene.add(guy2);
	scene.add(guy3);
	creatures.push(guy1, guy2, guy3);

	//scene.add(flyer ({x: -20, y: -100, z: 0}, {x: 0, y: 0, z: 0}, 80));
	particles = rain();
	
	setInterval(function() {
		spawnHeart(scene);
	}, 1000);

	setInterval(function() {
		play();
	}, tempo);

	document.getElementById('canvas').appendChild(renderer.domElement);
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentClick, false );
	document.addEventListener( 'mouseup', untouchGuys, false );
	document.addEventListener("touchstart", onTouch, false);
}

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function animate() {
	resize(renderer);
	particles.forEach( function(p) {
		p.position.x += .1 * Math.random();
		p.position.y -= .1 + Math.random()*.1;
		p.rotation.z += Math.random()*.01;
		if ( p.position.y < -500 ) {
			p.position.y = 500;
		}
		if ( p.position.x > 500 ) {
			p.position.x = -500;
		}
	});

	requestAnimationFrame( animate );
	TWEEN.update();
	renderer.clear();
	renderer.render( scene, camera );
}

function untouchGuys( mouse ) { 
	for ( i = 0; i < creatures.length; i++ ) {
		recording[i] = null;
	};
}

function tweenOpacityAll( mesh ) {
	mesh.traverse( function( node ) {
	    if( node.material ) {
		const o = {opacity: 1.0};
		new TWEEN.Tween( o ).to( {opacity: node.material.opacity}, tempo/2 )
		.onUpdate(function() {
			node.material.opacity = o.opacity;
		}).start();
	    }
	});
}

function playTail( tail, voice ) {
	var i = 0;
	setIntervalX(function() {
		var mesh = tail.children[i];
		tweenOpacityAll( mesh );
		console.log( mesh.note );
		synth.triggerAttackRelease(mesh.note, tempo / 4000.0);
		i++;
	}, tempo/4, tail.children.length)

	mesh.traverse( function( node ) {
	    if( node.material ) {
		const o = {opacity: 1.0};
		new TWEEN.Tween( o ).to( {opacity: node.material.opacity}, tempo/2 )
		.onUpdate(function() {
			node.material.opacity = o.opacity;
		}).start();
	    }
	});
}

function touchGuys( mouse ) {
	raycaster.setFromCamera( mouse, camera );   
	var intersects = raycaster.intersectObjects( creatures, true );
	intersects.forEach( function(i) {
		if (soundActive && synth) {
			//play a chord
			if (i.object.note !== undefined) {
				synth.triggerAttackRelease(chords[0][i.object.note], 2.0);
			}
		}
		if ( i.object.parent.aura ) {
			tweenOpacityAll( i.object.parent.aura );
			playTail(i.object.parent.tail, i.object.index );
		}
	});
}

function onDocumentMouseMove( event ) {
}

StartAudioContext(Tone.context).then(function(){
	document.getElementById("click-message").remove();
	//a polysynth composed of 6 Voices of Synth
	synth = new Tone.Synth({
	  envelope: {
	    attack: 0.001,
	    decay: 0.3,
	    sustain: 0.2,
	    release: 0.4
	  },
	}).toMaster();
	bgSynth = new Tone.PolySynth(6, Tone.Synth, {
	volume: -9,
	oscillator : {
		type : "sine"
	},
	  envelope: {
	    attack: 0.01,
	    decay: 0.1,
	    sustain: 0.3,
	    release: 0.4
	  }
	}).toMaster();

	chord = 0;
	bgSynth.triggerAttackRelease(chords[0], 9);
	setInterval(function() {
		chord += 3 % chords.length;
		if ( chord >= chords.length) {
			chord = 0;
		}
		bgSynth.triggerAttackRelease(chords[chord], 4.5);
	}, 5000);
		
	soundActive = true;
	listener = new THREE.AudioListener();
	camera.add( listener );
})

function onDocumentClick( event ) {
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	touchGuys(mouse);
}

function onTouch( event ) {
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	touchGuys(mouse);
}

init();
animate();
