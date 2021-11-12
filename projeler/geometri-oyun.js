 // classes 
 class ColorGUIHelper { // gui color helper class
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
      }
      get value() {
      return `#${this.object[this.prop].getHexString()}`;
      }
      set value(hexString) {
      this.object[this.prop].set(hexString);
      }
      }


          let camera, scene, renderer;
    let ambientLight, directionalLight, directionalLightHelper;
    let pointer, raycaster, isShiftDown = false, isQDown;
    let rollOverMesh, rollOverMaterial;
    let grid, plane;
    let cubeGeo, cubeMaterial;
    let controls;
    let placed_shapes;


    const objects = [];
    placed_shapes = [];

          init();

          function init() {

      // scene
              scene = new THREE.Scene();
              scene.background = new THREE.Color( 0x191919);

      // lights
      ambientLight = new THREE.AmbientLight( 0x606060 );

      scene.add( ambientLight );
      directionalLight = new THREE.DirectionalLight( 0xffffff );
      directionalLightHelper= new THREE.DirectionalLightHelper( directionalLight);
      scene.add( directionalLightHelper);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);

      // camera
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.set( 500, 800, 1300);
      camera.lookAt(0,0,0)
              scene.add(camera);

      // cubes
      cubeGeo = new THREE.BoxGeometry(50, 50, 50);
      cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffa200});

      // grid
              grid = new THREE.GridHelper(1000, 20, 0xe8fcff, 0xf0f0f0);
      
              scene.add(grid);

      // raycaster
      raycaster = new THREE.Raycaster();
      pointer = new THREE.Vector2();

      // plane
      const plane_geometry = new THREE.PlaneGeometry( 1000, 1000);
      plane_geometry.rotateX( - Math.PI / 2 );
      plane = new THREE.Mesh( plane_geometry, new THREE.MeshBasicMaterial( { visible: false} ) );
      scene.add(plane);
      objects.push(plane);

      // rollOverMaterial
      const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50);
      rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x14ffad, opacity: 0.5, transparent: true } );
      rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
      scene.add(rollOverMesh);

      // renderer
              renderer = new THREE.WebGLRenderer( { antialias: true } );
              renderer.setPixelRatio( window.devicePixelRatio );
              renderer.setSize( window.innerWidth, window.innerHeight );
              document.body.appendChild( renderer.domElement );

      //controls
              controls = new OrbitControls( camera, renderer.domElement );
      //console.log(Object.keys(controls))
      //console.log((controls.enableRotate))
              controls.addEventListener( 'change', render );
              controls.update();
      controls.enableRotate = false;

      
      // eventListeners
      document.addEventListener( 'pointermove', onPointerMove );
      document.addEventListener( 'pointerdown', onPointerDown );
      document.addEventListener( 'keydown', onDocumentKeyDown );
      document.addEventListener( 'keyup', onDocumentKeyUp );
              window.addEventListener( 'resize', onWindowResize );
          }

    // window resize event
          function onWindowResize() {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize( window.innerWidth, window.innerHeight );
              render();
          }

    // main renderer
          function render() {
              renderer.render( scene, camera );
          }

    // pointer move event
    function onPointerMove( event ) {
      if (isQDown)
      {
        controls.enableRotate = true;
        scene.remove(rollOverMesh)
        render()
      }
      else {
      // TODO roll over mesh on key press or on ui
      scene.add(rollOverMesh)
      if (false == false) { //outstanding move
        pointer.set(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( objects, false );
        if ( intersects.length > 0 ) {
          const intersect = intersects[ 0 ];
          rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
          rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          }
        render();  
       }
      }
    }
    // pointer down event
    function onPointerDown( event ) {
      pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1);
      raycaster.setFromCamera( pointer, camera );
      const intersects = raycaster.intersectObjects( objects, false );

      if ( intersects.length > 0 ) {
        const intersect = intersects[ 0 ];

        // delete cube
        if ( isShiftDown ) {
          if ( intersect.object !== plane ) {
          scene.remove( intersect.object );
          objects.splice( objects.indexOf( intersect.object ), 1 );  }

      // create cube
      } else {
          const voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
          voxel.position.copy( intersect.point ).add( intersect.face.normal );
          voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          if (! isQDown && ! isShiftDown) {
            scene.add( voxel );
            controls.enableRotate = false;
            placed_shapes.push(voxel)
            //console.log(typeof(voxel))

           }
          objects.push( voxel ); }
          
          render();
        }
      }
      // key down events 
      function onDocumentKeyDown( event ) {
        switch ( event.keyCode ) {
        case 16: isShiftDown = true; break;
        case 81: isQDown= true; break; }
          }

      // key down events
      function onDocumentKeyUp( event ) {
        switch ( event.keyCode ) {
        case 16: isShiftDown = false; break;
        case 81: isQDown= false; break;
          } 
        }
      
      function clearAllShapes() {
        let i; 
        for (i=0;i<placed_shapes.length;i++) {
          scene.remove(placed_shapes[i])
          render();
        }
        placed_shapes = [];
      }

      function clearLastShape() {
        scene.remove(placed_shapes[placed_shapes.length-1])
        //placed_shapes.(placed_shapes[placed_shapes.length])
        placed_shapes.pop()
        render()

      }

      // UI 
      const gui = new GUI()
    
      // without folders
      var clearAllButton= { add:function(){ clearAllShapes() }};
      gui.add(clearAllButton,"add").name("hepsini temizle");

      var clearLastButton = { add:function(){ clearLastShape() }};
      gui.add(clearLastButton,"add").name("sonuncusunu sil");

      GUI.TEXT_OPEN= "Ayarları Aç"
      gui.__closeButton.innerText = "Ayarları Kapa"
      GUI.TEXT_CLOSED = "Ayarları Kapa"
      // useful stuff DELETE LATER

      //gui.addColor(rollOverMaterial, 'color').onChange(setValue);
      //cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
      //cubeFolder.open()
      
      const shapeFolder = gui.addFolder("Şekil")

      //materials
      const materialFolder = gui.addFolder("Materyaller")
      materialFolder.addColor(new ColorGUIHelper(rollOverMaterial,"color"),"value").name("Highlight Rengi")
      materialFolder.addColor(new ColorGUIHelper(cubeMaterial,"color"),"value").name("Şekil Rengi")

      /*
      const a= new THREE.Mesh( cubeGeo, cubeMaterial );
      placed_shapes.push(a)
      materialFolder.addColor((placed_shapes.at(-1),"color")).name("Şekil Rengi")
      */

      // lights
      const lightFolder = gui.addFolder("Işık")

      const ambientLightFolder = lightFolder.addFolder("Ortam Işığı")
      ambientLightFolder.add(ambientLight,"intensity",0,5).name("yoğunluk")
      ambientLightFolder.addColor(new ColorGUIHelper(ambientLight,"color"),"value").name("renk")

      //console.log(Object.keys(directionalLight))
      const directionalLightFolder= lightFolder.addFolder("Açısal Işık")
      directionalLightFolder.add(directionalLight,"intensity",0,5).name("yoğunluk")
      directionalLightFolder.add(directionalLight.position,"x",-500,500).name("x")
      directionalLightFolder.add(directionalLight.position,"y",-500,500).name("y")
      directionalLightFolder.add(directionalLight.position,"z",-500,500).name("z")
      directionalLightFolder.addColor(new ColorGUIHelper(directionalLight,"color"),"value").name("renk")
      directionalLightFolder.add(directionalLightHelper,"visible").name("görünür")

      // grid
      const gridFolder = gui.addFolder("Izgara")
      gridFolder.addColor(new ColorGUIHelper(grid.material,"color"),"value").name("renk")
      gridFolder.add(grid.scale,"x",1,5,1).name("x ölçeği:")
      gridFolder.add(grid.scale,"z",1,5,1).name("y ölçeği:")
      gridFolder.add(grid,"visible").name("görünür:")

      // camera
      const cameraFolder = gui.addFolder("Kamera")
      //console.log(Object.keys(grid.visible))
      cameraFolder.add(camera.scale,"x",0.1,1)
      cameraFolder.add(camera.scale,"y",0.1,1)
      cameraFolder.add(camera.scale,"z",0.1,1)