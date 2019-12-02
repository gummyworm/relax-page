const rad90 = Math.PI * .5;
var raycaster = new THREE.Raycaster();
var camera, scene, renderer, mesh, listener;
var updateList = [];
var particles = [];
var creatures = [];
var synth;

init();
animate();

var soundActive = false;

function sphere(x, y, z, radius, color) {
	var geometry = new THREE.SphereGeometry( radius, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: color} );
	geom = new THREE.Mesh( geometry, material );
	geom.position.set(x, y, z);
	return geom
}

function circle(x, y, z, radius, color) {
	var geometry = new THREE.CircleGeometry( radius, 32 );
	var material = new THREE.MeshBasicMaterial( {color: color} );
	geom = new THREE.Mesh( geometry, material );
	geom.position.set(x, y, z);
	return geom
}

function triangle(x, y, z, color) {
	v0 = new THREE.Vector3(0,0,0);
	v1 = new THREE.Vector3(1,1,0);
	v2 = new THREE.Vector3(0,1,0);
	var geometry = new THREE.Face3( v0, v1, v2 );
	var material = new THREE.MeshBasicMaterial( {color: color} );
	geom = new THREE.Mesh( geometry, material );
	geom.position.set(x, y, z);
	return geom
}

function smile(x, y, z, radius, color ) {
	var geom = new THREE.Geometry();
	for( var j = Math.PI; j < Math.PI * 2; j += 2 * Math.PI / 100 ) {
		var v = new THREE.Vector3( radius * Math.cos( j ), radius * Math.sin( j ), z );
		geom.vertices.push( v );
	}

	var line = new MeshLine();
	line.setGeometry( geom, function(p) {return 2;} );
	var material = new MeshLineMaterial( {color: color} );
	mesh = new THREE.Mesh( line.geometry, material );
	mesh.position.set(x, y, z);
	return mesh;
}

function flyer(pos, rotation, size) {
	var color = Math.floor( Math.random() * (2<<24) );
	var body = circle(pos.x, pos.y, pos.z, size, color);
	color = Math.floor( Math.random() * (2<<24) );
	var arm1 = leaf({x: pos.x + size/4, y: pos.y-size/4, z: pos.z}, {}, size/70, color);
	var arm2 = leaf({x: pos.x - size/4, y: pos.y-size/4, z: pos.z}, {}, size/70, color);
	var group = new THREE.Group();
	group.add(arm1);
	group.add(arm2);
	group.add(body);
	animFlyer(group, arm1, arm2, pos, rotation, size);
	return group;
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

function animEyeGuy(group, pos, rotation, size){
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
}

function eyeGuy(pos, size) {
	/*
	var sound = new THREE.Audio(listener);
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.5 );
			sound.play();
	});
	*/

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
	var e1 = circle( -20, 50, 90, 10, 0xffffff);
	var e2 = circle( 20, 50, 90, 10, 0xffffff);
	var cornea1 = circle( -20, 50, 99, 7, 0x5555ff);
	var cornea2 = circle( 20, 50, 99, 7, 0x5555ff);
	var iris1 = circle( -20, 50, 100, 5, 0x000000);
	var iris2 = circle( 20, 50, 100, 5, 0x000000);
	var s = smile( 0, 10, 50, 20, 0xffffff);

	var group = new THREE.Group();
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

	animEyeGuy(group, pos, {x: 0, y: 0, z: 0}, size);
	return group;
}

function heart(pos, rotation, scale, color) {
	var x = pos.x, y = pos.y;
	var heartShape = new THREE.Shape();

	heartShape.moveTo( .26, .26 );
	heartShape.bezierCurveTo( .26, .26, .21, 0, 0, 0 );
	heartShape.bezierCurveTo( -.31, 0, -.31, .37, -.31, .36 );
	heartShape.bezierCurveTo( -.31, .579, -.158, .81, .26, 1 );
	heartShape.bezierCurveTo( .63, .81, .84, .58, .84, .36 );
	heartShape.bezierCurveTo( .84, .36, .84, 0, .53, 0 );
	heartShape.bezierCurveTo( .36, 0, .26, .26, .26, .26 );

	var geometry = new THREE.ShapeGeometry( heartShape );
	var material = new THREE.MeshBasicMaterial( { color: color } );
	mesh = new THREE.Mesh( geometry, material ) ;
	mesh.scale.x = scale;
	mesh.scale.y = scale;
	mesh.position.set( pos.x, pos.y, pos.z );
	return mesh;
}

function leaf(pos, rotation, scale, color) {
	var x = pos.x, y = pos.y;
	var leafShape = new THREE.Shape();

	leafShape.moveTo( x + 5, y + 5 );
	leafShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
	leafShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
	leafShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
	leafShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
	leafShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
	leafShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

	var geometry = new THREE.ShapeGeometry( leafShape );
	var material = new THREE.MeshBasicMaterial( { color: color } );
	mesh = new THREE.Mesh( geometry, material ) ;
	mesh.scale.x = scale;
	mesh.scale.y = scale;
	return mesh;
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

function init() {
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	scene = new THREE.Scene();
	//scene.background = new THREE.Color( 0x2289f0 );
	renderer.autoClear = false;
	renderer.setClearColor(0x000000, 0.0);

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 500 );

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.PointLight( 0xffffff );
	light.position.copy( camera.position );
	scene.add( light );

	var guy1 = eyeGuy({x: 200, y: 130, z: -30}, .3);
	var guy2 = eyeGuy({x: 0, y: 0, z: 0}, 1);
	var guy3 = eyeGuy({x: -300, y: -30, z: -30}, .5);
	scene.add(guy1);
	scene.add(guy2);
	scene.add(guy3);
	creatures.push(guy1, guy2, guy3);

	scene.add(flyer ({x: -20, y: -100, z: 0}, {x: 0, y: 0, z: 0}, 80));
	particles = rain();

	document.getElementById('canvas').appendChild(renderer.domElement);
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'click', onDocumentClick, false );
	document.addEventListener("touchstart", onTouch, false);
}

function animate() {
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

function onDocumentMouseMove( event ) {
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );   
	var intersects = raycaster.intersectObjects( creatures, true );
	intersects.forEach( function(i) {
		if (i.object.tweening) {
			return;
		}
		if (soundActive && synth) {
			synth.triggerAttackRelease('C4', '8n');
		}
		i.object.tweening = true;
		const o = {opacity: i.object.material.opacity};
		const tween = new TWEEN.Tween( o ).to( {opacity: Math.max(o.opacity + 0.5, 1)}, 500 )
		.repeat(1)
		.yoyo(true)
		.onUpdate(function() {
			i.object.material.opacity = o.opacity;
		}).onComplete(function() {
			i.object.tweening = false;
		}).start();
	});
}

function startAudio() {
	soundActive = true;
	var synth = new Tone.Synth().toDestination();
	var stream = "sounds/healing.mp3";
	listener = new THREE.AudioListener();
	camera.add( listener );
	// create a global audio source
	var sound = new THREE.Audio( listener );
	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( stream, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		sound.play();
	});
}

function onDocumentClick( event ) {
	if ( soundActive === false ) {
		startAudio();
	}
}

function onTouch( event ) {
	if ( soundActive === false ) {
		startAudio();
	}
}
