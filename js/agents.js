/*
  Controller for Pacman
  Handles the current position of the Pacman as well as all the updates
  to the position

  A basic control loop works as follows:
    1.User presses right arrow
    2."direction" gets updated to equal "right"
    3.dI and dJ update to equal 1,0 due to "direction" changing
    4.move() gets called and sets new values of nextTileI and nextTileJ
    5.x and y get updated to new pixel positions based on nextTileI and nextTileJ
    6.As x and y change, animateMovement in the view gets called and animates the Pacman to move to the right tile
    7.Once Pacman arrives, arrived() in the controller gets called, calling move() again and going back to 4
*/

App.GHOST_HOME_I = 14;
App.GHOST_HOME_J = 10;

/*
  Agent Controller
  Generalized controller for pieces on the game board which move
*/
App.AgentController = Ember.Controller.extend({
  //Indices into the map that represent the current tile  
  currentTileI:null,
  currentTileJ:null,
  //Tile towards which we are moving
  nextTileI:null,
  nextTileJ:null,
  mapBinding: "App.map",
  //Direction that we are moving in: up, down, left, right, stopped
  direction: "stopped",
  gameOverBinding: "App.map.gameOver",
  //Coordinates in pixels of the position we are moving towards
  //This is an example of the Ember.Computed property
  //Each time nextTileI is changed, x updates its value
  //nextTile is only changed in the move() function
  x: function(){
    return this.get('map').getXFromI(this.get('nextTileI'));
  }.property("nextTileI"),

  y: function(){
    return this.get('map').getYFromJ(this.get('nextTileJ'));
  }.property("nextTileJ"),

  gameOver: function(){
    return this.get("map.gameOver");
  }.property('gameOver'),

  //canMove determines whether we should start animating the Pacman movement
  //We only want to move if we have a direction and we are not already moving
  canMove: function(nextTileI, nextTileJ, dI, dJ) {
    var haveNonZeroDirection = (dI !== 0) || (dJ!== 0);
    return haveNonZeroDirection && !this.get('moving') && this.isValidTile(nextTileI,nextTileJ) && !this.get("gameOver") && !this.get("map.win");
  },
  
  isValidTile: function(tileI, tileJ){
    return this.get('map').getTileType(tileI,tileJ) === 'floor';
  }
})

App.PacmanController = App.AgentController.extend({
  itemBinding: "App.item",
  superMode: false,
  //Angle-The angle based on pacman's direction
  angle: function(){
    switch(this.get("direction")){
      case "left": return -180;
      case "right": return 0;
      case "up": return -90;
      case "down": return 90;
      default : return 0;
    }
  }.property("direction"),

  move: function(){
    var dJ = 0;
    var dI = 0;
    switch(this.get("direction")){
      case "left": dI = -1; dJ = 0; break;
      case "right": dI = 1; dJ = 0; break;
      case "up": dI = 0; dJ = -1; break;
      case "down": dI = 0; dJ = 1; break;
    }
    var nextTileI = this.get("currentTileI") + dI;
    var nextTileJ = this.get("currentTileJ") + dJ;
    if(this.canMove(nextTileI, nextTileJ, dI, dJ)){
      this.set("nextTileI", nextTileI);
      this.set("nextTileJ", nextTileJ);
      this.set("map.pacmanNextTileI", this.get("nextTileI"));
      this.set("map.pacmanNextTileJ", this.get("nextTileJ"));
      this.set("moving", true);
    }
    else if(!this.isValidTile(nextTileI, nextTileJ)){
      this.set("moving", false);
    }
  }.observes('direction'),
  
  handleKeyDown: function(event) {
    switch(event.keyCode) {
      case 37: this.set("direction", "left"); event.preventDefault(); break;
      case 38: this.set("direction", "up"); event.preventDefault(); break;
      case 39: this.set("direction", "right"); event.preventDefault(); break;
      case 40: this.set("direction", "down"); event.preventDefault(); break;
    }
  },

  arrived: function(){
    this.set("moving", false);
    this.set("currentTileI", this.get("nextTileI"));
    this.set("currentTileJ", this.get("nextTileJ"));
    if(this.get("item").getItemType(this.get("currentTileI"), this.get("currentTileJ")) === 'super'){
      this.set("superMode", false);
      this.set("map.superPacman", this.get("superMode"));
      this.set("superMode", true);
      this.set("map.superPacman", this.get("superMode"));
    }
    this.set("map.pacmanCurrentTileI", this.get("currentTileI"));
    this.set("map.pacmanCurrentTileJ", this.get("currentTileJ"));
    this.move();
  }
});

//Base class for an Agent View that renders it
App.AgentView = App.RaphaelView.extend({
  xBinding: "controller.x",
  yBinding: "controller.y",
  angleBinding: "controller.angle",
  time: 600,
  //Each time x or y are changed we animate the sprite to move
  //to the new position
  animateMovement: function(){
      //Once we finished moving we want to let the controller know we arrived, so we setup the callback
      var callback = _.bind(this.get("controller.arrived"), this.get("controller"));
      //We use Raphael's transform property which allows us to both animate eating by changing the path, and animate
      //moving by changing the Translation
      this.get("sprite").animate({"transform": ""+ ["R", this.get("angle")] + ["T",this.get("x"), this.get("y")]}, this.get('time'), callback);
  }.observes("x","y")
});


App.PacmanView = App.AgentView.extend({
   //Controller that corresponds to this particular view
   //This is an Ember.Computed because if we did not evaluate it each time it would be a static property
   //and one controller would be used for each view
   controller: function(){return App.PacmanController.create({
      currentTileI:1,
      currentTileJ:1,
      nextTileI:1,
      nextTileJ:1
   });}.property(),

   openPacmanBinding: "App.openPacman",
   closedPacmanBinding: "App.closedPacman",
   superModeBinding: "controller.superMode",
   fillColor:   "#201A00",
   strokeColor: "#FFCC00",
    //This is called when we insert the view into the DOM
   didInsertElement: function() {
      var _this = this;
      $('body').keydown(function(event) {
        _this.get("controller").handleKeyDown(event);
      });
      //We render the Pacman by calling Raphael.Paper path method which draws a path we setup before in svg.js
      this.set("sprite", this.get('paper').path(this.get("openPacman")));
      this.get("sprite").attr({
       fill: this.get('fillColor'),
       stroke: this.get('strokeColor')
      });
      //Move the Pacman to its starting x,y
      this.get("sprite").transform(""+ ["T",this.get("x"), this.get("y")]);
      this.animateOpen();
      console.log( this.get("x"));
   },

   animateGameOver: function(){
      this.get("sprite").animate({"opacity": 0, "transform": ""+ ["R", -1800] + ["T",this.get("x"), this.get("y")]}, 3000);
   }.observes("controller.gameOver"),

   toggleSuper: function(){
    if(this.get("super")) this.get("sprite").toFront();
   }.observes("superMode"),
   //These two functions animate between an open and a closed pacman
   animateOpen: function(){
     var callback = _.bind(this.animateClosed, this);
     this.get("sprite").animate({"path":this.get("closedPacman")}, 300, null, callback);
   },
   animateClosed: function(){
     var callback = _.bind(this.animateOpen, this);
     this.get("sprite").animate({"path":this.get("openPacman")}, 300, null, callback);
   }
});

/*
 * For the Ghost class, the agent will continuously move through the board, looping through
 the arrived -> moveNext -> moveChain. The animation of movement/resolution of map position
 to pixel coordinates is resolved identically to the pacman controller.
 */

App.GhostController = App.AgentController.extend({
  scared: false,
  blink: false,
  eaten: false,
  checkPacman: function(){
    if(((this.get("map.pacmanNextTileI") === this.get("nextTileI") 
      && this.get("map.pacmanNextTileJ") === this.get("nextTileJ"))
      || (this.get("map.pacmanCurrentTileI") === this.get("nextTileI") 
      && this.get("map.pacmanCurrentTileJ") === this.get("nextTileJ")))
      && this.get("moving")){
      if(this.get("scared")){
        this.set("nextTileI", App.GHOST_HOME_I);
        this.set("nextTileJ", App.GHOST_HOME_J);
        this.set("currentTileI", App.GHOST_HOME_I);
        this.set("currentTileJ", App.GHOST_HOME_J);
        this.set("eaten", true);       
      }
      else{
        this.set("map.gameOver", true);
      }
    }
  }.observes("map.pacmanNextTileI", "map.pacmanNextTileJ"),

  move: function(){
    var dJ = 0;
    var dI = 0;
    switch(this.get("direction")){
      case "left": dI = -1; dJ = 0; break;
      case "right": dI = 1; dJ = 0; break;
      case "up": dI = 0; dJ = -1; break;
      case "down": dI = 0; dJ = 1; break;
    }
    var nextTileI = this.get("currentTileI") + dI;
    var nextTileJ = this.get("currentTileJ") + dJ;
    if(this.canMove(nextTileI, nextTileJ, dI, dJ)){
      this.set("nextTileI", nextTileI);
      this.set("nextTileJ", nextTileJ);
      this.set("moving", true);
    }
    else if(!this.isValidTile(nextTileI, nextTileJ)){
      this.set("moving", false);
    }
  }.observes('direction'),

  /*
   * moveNext decides where the ghost will move next
   * Based on probability and whether the ghost is scared
   */
  moveNext: function(){
    var dI = 0, dJ = 0; 
    var nextTileI, nextTileJ;
    var validDirections = new Array();
    var pacmanDirections = new Array();
    for(var i = 0; i< 4; i++){
      var currentDirection;
      dI = 0; dJ = 0;
      switch(i){
        case 0: dI = -1; currentDirection = "left"; break;
        case 1: dI = 1; currentDirection = "right"; break;
        case 2: dJ = -1; currentDirection = "up"; break;
        case 3: dJ = 1; currentDirection = "down"; break;
        default: currentDirection = "none"; break;
      }
      nextTileI = this.get("currentTileI") + dI;
      nextTileJ = this.get("currentTileJ") + dJ;
      if(this.isValidTile(nextTileI, nextTileJ)) {
        validDirections.push(currentDirection);
        if(Math.abs(this.get("map.pacmanCurrentTileI") - nextTileI) < Math.abs(this.get("map.pacmanCurrentTileI") - this.get("currentTileI"))
          || Math.abs(this.get("map.pacmanCurrentTileJ") - nextTileJ) < Math.abs(this.get("map.pacmanCurrentTileJ") - this.get("currentTileJ"))){
            pacmanDirections.push(currentDirection);
          }
      }
    }
    if(Math.random() < this.get("aggression") && pacmanDirections.length != 0){
      var selection = Math.floor((Math.random()*pacmanDirections.length));
      this.set("direction", pacmanDirections[selection]);
    }
    else{
      var selection = Math.floor((Math.random()*validDirections.length));
      this.set("direction", validDirections[selection]);
    }
    this.move();
  },

  arrived: function(){
    //If Pacman is in super mode, transform into scared
    if(this.get("map.superPacman")){
      this.set("scared", true);
    }
    else if(this.get("scared") && !this.get("map.superPacman")){
      this.set("scared", false);
    }
    this.set("currentTileI", this.get("nextTileI"));
    this.set("currentTileJ", this.get("nextTileJ"));
    this.set("moving", false);
    this.checkPacman();
    this.moveNext();
  },

  /*
   * handleEaten moves the ghost back to the home set
   * by constants.
   */
  handleEaten: function(){
    if(this.get("eaten")){
      this.set("nextTileI", App.GHOST_HOME_I);
      this.set("nextTileJ", App.GHOST_HOME_J);
    }
  }.observes('eaten'),

  handleKeyDown: function(event) {
    //Start movement on keypress
    this.moveNext();
  },

  startBlink: function(){
    if(this.get("map.finalCount")) this.set("blink", true);
    else this.set("blink", false);
  }.observes("map.finalCount")

});

//GhostView is almost the same as the Pacman view, however because the ghosts consist of mulitple
//svg elements, we need to have additional logic to create all of them
App.GhostView = App.AgentView.extend({

  scaredSvgBinding: "App.scaredGhost",
  scaredBinding: "controller.scared",
  blinkBinding: "controller.blink",
  eatenBinding: "controller.eaten",
  time: 400,
  didInsertElement: function() {
    var _this = this;
    $('body').keydown(function(event) {
      _this.get("controller").handleKeyDown(event);
    });
    this.renderGhost("ghostSvg");
  },

  renderGhost: function(ghostType){
    if(this.get("sprite")) this.get("sprite").remove();
    var paper = this.get("paper");
    var sprite = paper.set();
    this.set("sprite", sprite);
    var ghostBody = paper.path(this.get(ghostType).path);
    ghostBody.attr({
       fill: this.get(ghostType).fillColor,
       stroke: this.get(ghostType).strokeColor,
    })
    sprite.push(ghostBody);
    if(this.get(ghostType).eyeballColor) {
      var eyeballColor = this.get(ghostType).eyeballColor;
      this.renderGhostEye(this.get(ghostType).leftEyeball, eyeballColor); 
      this.renderGhostEye(this.get(ghostType).rightEyeball, eyeballColor);
    }
    if(this.get(ghostType).eyeColor) {
      var eyeColor = this.get(ghostType).eyeColor;
      this.renderGhostEye(this.get(ghostType).leftEyeball, eyeballColor); 
      this.renderGhostEye(this.get(ghostType).leftEye, eyeColor);
      this.renderGhostEye(this.get(ghostType).rightEye, eyeColor);
    }
    //The Translation transform will be applied to each element in the set
    this.get("sprite").transform(""+ ["T",this.get("x"), this.get("y")]);
    //On render, start ghost movement
  },

  renderGhostEye: function(eyeSvg, color){
    var eye = this.get("paper").circle(eyeSvg.x, eyeSvg.y, eyeSvg.r);
    eye.attr("fill", color);
    this.get("sprite").push(eye);
  },

  // For animate on/off, since the path is the first object pushed, we simply select it.
  animateOn: function(){
     var callback = _.bind(this.animateOff, this);
     this.get("sprite")[0].animate({"fill-opacity":.8}, 20, null, callback);
  },

  animateOff: function(){
     var callback = _.bind(this.animateOn, this);
     if(this.get('blink')) this.get("sprite")[0].animate({"fill-opacity":.2}, 20, null, callback);
  }.observes('blink'),


  //Callback for after ghost is eaten, reset opacity and restart move loop
  reset: function(){
    this.set("eaten", false);
    this.get("sprite")[0].attr("fill-opacity", 1);
    this.get("controller").arrived();
  },

  returnToHome: function(){
    if(this.get("eaten")){
      var callback = _.bind(this.reset, this);
      this.get("sprite")[0].attr("fill-opacity", .2);
      this.get("sprite").animate({"transform": ""+ ["R", this.get("angle")] + ["T",this.get("x"), this.get("y")]}, 4000, "linear",callback);
    }
  }.observes("eaten"),

  toggleScared: function(){
    if(this.get("scared")){
      this.set("time", 800);
      this.renderGhost("scaredSvg");
    }
    else{
      this.set("time", 400);
      this.renderGhost("ghostSvg");
      this.get("sprite").toFront();
    }
  }.observes("scared")
});

App.GreenGhostView = App.GhostView.extend({
  controller: function(){ return App.GhostController.create({
    currentTileI:14,
    currentTileJ:10,
    nextTileI:14,
    nextTileJ:10,
    aggression: .6
  });}.property(),
  ghostSvgBinding: "App.greenGhost"
});

App.BlueGhostView = App.GhostView.extend({
  controller: function(){ return App.GhostController.create({
    currentTileI:13,
    currentTileJ:10,
    nextTileI:13,
    nextTileJ:10,
    aggression: .5
  });}.property(),
  ghostSvgBinding: "App.blueGhost"
});

App.OrangeGhostView = App.GhostView.extend({
  controller: function(){ return App.GhostController.create({
    currentTileI:15,
    currentTileJ:10,
    nextTileI:15,
    nextTileJ:10,
    aggression: .7
  });}.property(),
  ghostSvgBinding: "App.orangeGhost"
});

App.PinkGhostView = App.GhostView.extend({
  controller: function(){ return App.GhostController.create({
    currentTileI:14,
    currentTileJ:11,
    nextTileI:14,
    nextTileJ:11,
    aggression: .6
  });}.property(),
  ghostSvgBinding: "App.pinkGhost"
});
