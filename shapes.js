function sphere(x, y, z, radius, color) {
	var geometry = new THREE.SphereGeometry( radius, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: color} );
	geom = new THREE.Mesh( geometry, material );
	geom.position.set(x, y, z);
	return geom
}

function circle(x, y, z, radius, color, opacity) {
	var geometry = new THREE.CircleGeometry( radius, 32 );
	var material;
	if (opacity ) {
		material = new THREE.MeshBasicMaterial( {color: color, transparent: true, opacity: opacity} );
	} else {
		material = new THREE.MeshBasicMaterial( {color: color} );
	}
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

