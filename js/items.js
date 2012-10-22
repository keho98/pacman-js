//Simple item where 1s are walls and 0s are empty tiles
var itemData=[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1],
             [1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,1],
             [1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1],
             [1,0,0,0,0,0,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
             [1,0,1,1,1,0,1,0,0,0,0,0,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1],
             [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1,1,0,1],
             [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
/*
  item object that contains information about the world, right now
  it just contains tile size and location of the walls
*/
App.item = Ember.Object.create({
  tileSize: 36,
  circleRadius: 5,
  itemList:    $.extend(true,[],itemData),
  getXFromI: function(index) { return index * this.get('tileSize') + this.get('tileSize')/2; },
  getYFromJ: function(index) { return index * this.get('tileSize') + this.get('tileSize')/2; },
  getItemType: function(i,j) { return this.get('itemList')[j][i] === 0 ? 'floor' :'wall'},
  setElementTo: function(i,j, value){ this.get('itemList')[j][i] = value}
});

/*
  View that renders a single tile on the screen
*/
App.ItemTileView = App.RaphaelView.extend({

  //Binding to the item data, example of Ember bindings
  itemBinding: 'App.item',
  foodColor: '#2AA5FF',

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

  ateElement: function(){
    if(this.get('sprite')) this.get('sprite').remove();
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
  }
});

//Ember CollectionView that keeps one row of tiles
App.ItemTileRowView = Ember.CollectionView.extend({
  eatenAt: function(x){
    this.get('childViews')[x].ateElement();
  },
  itemViewClass: App.ItemTileView
});

/*
  Ember CollectionView that keeps the 2d collection of TilesView
  Based on itemViewClass, Ember automatically creates a TileRowView
  for each row in itemData
*/
App.ItemTilesView = Ember.CollectionView.extend({
  content: App.item.get("tiles"),
  //By following the map object, we see where pacman moves, and remove the object located at that location.
  removedElement: function(){
    this.get('childViews')[this.get('map.pacmanCurrentTileJ')].eatenAt(this.get('map.pacmanCurrentTileI'));
  }.observes('map.pacmanCurrentTileI', 'map.pacmanCurrentTileJ'),
  itemViewClass: App.ItemTileRowView
});

App.ItemView = Ember.View.extend();
