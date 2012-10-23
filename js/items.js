/*
 * itemGrid of identical dimension of map
 * 0 = Normal food
 * 1 = No item
 * 2 = Super food
 */
var itemData=[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,0,0,2,1,0,0,0,1,0,2,0,1,0,2,1,0,0,2,1,0,0,0,1,2,0,0,1,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1],
             [1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,1],
             [1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1],
             [0,0,0,0,0,0,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
             [1,0,1,1,1,0,1,0,0,0,0,0,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1],
             [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
             [1,0,0,2,0,0,1,0,0,0,2,0,1,1,1,1,1,0,2,0,0,0,0,1,0,0,2,0,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
/*
  item object that contains information about the world, right now
  it just contains tile size and location of the walls
*/
App.item = Ember.Object.create({
  tileSize: 36,
  circleRadius: 5,
  itemList:    $.extend(true,[],itemData),
  mapBinding: "App.map",
  totalItems: null,

  setWin: function(){
    if(this.get("totalItems") === 0) this.set("map.win", true);
  }.observes("totalItems"),

  getTotalItems: function(){
    var total = 0;
    for(var i = 0; i < this.get('itemList').length; i++){
      for(var j = 0; j < this.get('itemList')[i].length; j++){
        if((this.get('itemList')[i][j] === 0) || (this.get('itemList')[i][j] === 2)) total += 1;
      }
    }
    return total;
  },
  getXFromI: function(index) { return index * this.get('tileSize') + this.get('tileSize')/2; },
  getYFromJ: function(index) { return index * this.get('tileSize') + this.get('tileSize')/2; },
  getItemType: function(i,j) { 
    switch(this.get('itemList')[j][i]){
      case 0: return "normal"; break;
      case 2: return "super"; break;
      default: return "nothing"; break;
    }
  },
  //Checks any element value changes and updates totalItems based on that.
  setElementTo: function(i,j, value){ 
    this.get('itemList')[j][i] = value;
    if(value === 1){
      this.set("totalItems", this.getTotalItems());
    }
    else this.set("totalItems", this.getTotalItems());
   }
});

/*
  View that renders a single tile on the screen
*/
App.ItemTileView = App.RaphaelView.extend({

  //Binding to the item data, example of Ember bindings
  itemBinding: 'App.item',
  foodColor: '#2AA5FF',
  superFoodColor: 'yellow',
  //Ember computed that given our horizontal index, computes the horizontal
  //coordinate. It uses contentIndex property of Ember.CollectionView
  positionX: function() {
    return this.get('item').getXFromI(this.get('contentIndex'));
  }.property('contentIndex'),

  //We get the Y coordinate by using the contentIndex of our parent
  positionY: function() {
    return this.get('item').getYFromJ(this.get('parentView.contentIndex'));
  }.property('parentView.contentIndex'),

  size: function(){
    return this.get('item.tileSize');
  }.property('item.tileSize'),

  removeElement: function(){
    if(this.get('sprite')) this.get('sprite').remove();
    this.get('item').setElementTo(this.get('contentIndex'), this.get('parentView.contentIndex'),1);
  },

  // Render sprite with Raphael
  didInsertElement: function() {
    if(this.get("content") === 0){
      var paper = this.get('paper');
      var size = this.get('item.circleRadius');
      var color = this.get('foodColor');
      var sprite = paper.circle(this.get('positionX'),this.get('positionY'),size);
      this.set('sprite', sprite);
      this.get('sprite').attr('stroke', color);
    }
    else if(this.get("content") === 2){
      var paper = this.get('paper');
      var size = this.get('item.circleRadius');
      var color = this.get('superFoodColor');
      var sprite = paper.circle(this.get('positionX'),this.get('positionY'),size*2);
      this.set('sprite', sprite);
      this.get('sprite').attr('stroke', color);
    }
  }
});

//Ember CollectionView that keeps one row of item tiles
App.ItemTileRowView = Ember.CollectionView.extend({
  eatenAt: function(x){
    this.get('childViews')[x].removeElement();
  },
  itemViewClass: App.ItemTileView
});

App.ItemTilesView = Ember.CollectionView.extend({
  content: App.item.get("itemList"),
  mapBinding: "App.map",
  //By following the map object, we see where pacman moves, and remove the object located at that location.
  //The event is captured once then 'bubbled down' to the child ItemTileViews.
  removedElement: function(){
    this.get('childViews')[this.get('map.pacmanCurrentTileJ')].eatenAt(this.get('map.pacmanCurrentTileI'));
  }.observes('map.pacmanCurrentTileI', 'map.pacmanCurrentTileJ'),
  itemViewClass: App.ItemTileRowView
});

App.ItemView = Ember.View.extend();
