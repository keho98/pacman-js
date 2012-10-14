//Simple map where 1s are walls and 0s are empty tiles
var mapData=[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
             [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1],
             [1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,1],
             [1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1],
             [0,0,0,0,0,0,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
             [1,0,1,1,1,0,1,0,0,0,0,0,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1],
             [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1,1,0,1],
             [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
             [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
/*
  Map object that contains information about the world, right now
  it just contains tile size and location of the walls
*/
App.map = Ember.Object.create({
  tileSize: 36,
  tiles:    $.extend(true,[],mapData),
  getXFromI: function(index) { return index * this.get('tileSize'); },
  getYFromJ: function(index) { return index * this.get('tileSize'); },
  getTileType: function(i,j) { return this.get('tiles')[j][i] === 1 ? 'wall' :'floor'}
});

/*
  View that renders a single tile on the screen
*/
App.TileView = App.RaphaelView.extend({

  //Binding to the map data, example of Ember bindings
  mapBinding: 'App.map',
  wallColor:  '#1e1e1e',
  floorColor: '#000000',

  //Ember computed that given our horizontal index, computes the horizontal
  //coordinate. It uses contentIndex property of Ember.CollectionView
  positionX: function() {
    return this.get('map').getXFromI(this.get('contentIndex'));
  }.property('contentIndex'),

  //We get the Y coordinate by using the contentIndex of our parent
  positionY: function() {
    return this.get('map').getYFromJ(this.get('parentView.contentIndex'));
  }.property('parentView.contentIndex'),

  size: function(){
    return this.get('map.tileSize');
  }.property('map.tileSize'),

  // Render sprite with Raphael
  didInsertElement: function() {
    var paper = this.get('paper');
    var size = this.get('size');
    var sprite = paper.rect(this.get('positionX'),this.get('positionY'),size,size);
    var color = this.get("content") === 1 ? this.get('wallColor') : this.get('floorColor');
    sprite.attr('fill', color);
    sprite.attr('stroke', color);
    this.set("sprite", sprite);
  }
});

//Ember CollectionView that keeps one row of tiles
App.TileRowView = Ember.CollectionView.extend({
  itemViewClass: App.TileView
});

/*
  Ember CollectionView that keeps the 2d collection of TilesView
  Based on itemViewClass, Ember automatically creates a TileRowView
  for each row in mapData
*/
App.TilesView = Ember.CollectionView.extend({
  content: App.map.get("tiles"),
  itemViewClass: App.TileRowView
});

//Basic MapView that contains TilesView and any other views we might need
//It is referenced from index.html
App.MapView = Ember.View.extend();
