// A View that renders a Raphael paper
//Raphael paper is the canvas that allows us to render various SVG elements by calling
//methods such as paper.circle() or paper.path()
App.RaphaelPaper = Ember.View.extend({
    width: 1300,
    height: 700,
    paper: null,
    // This is called when the view element was inserted into the DOM
    didInsertElement: function() {
        //When the element was inserted we pass our elementId(comes from Ember.View by default and width/height to Raphael)
        this.set('paper', Raphael(this.get('elementId'), this.get('width'), this.get('height')));
        //We set the paper on the application namespace because other views will need to access it in order to render themselves
        App.paper = this.get('paper');
    }
});

//This is a base class for all other views that render Raphael objects
//Look at TileView for an example. We subclass RaphaelView so we can just call this.get("paper").path("Some path..")
//in other views to render ourselves
App.RaphaelView = Ember.View.extend({
  //The sprite that was rendered onto the paper
  //Example of a Ember.Computed property for initializing object properties, note that
  //it doesn't depend on any other property so it will only be computed once
  paper: function(){
    return App.paper;
  }.property(),
  //If the view is getting destroyed we need to remove the rendered sprite
  willDestroyElement: function(){
    if(this.get("sprite")) this.get("sprite").remove();
  }
});
