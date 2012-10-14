//App is our namespace that Ember creates for us
var App = Ember.Application.create();

//Default Controller
App.ApplicationController = Ember.Controller.extend();

//Default View
//By setting the templateName to application Ember knows to look up
//the Handlebars template with templateName application in index.html
App.ApplicationView = Ember.View.extend({
  classNames: ['application'],
  templateName: 'application'
});

//Ember apps need a default router, but we don't need to use this
App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
});

//Ember initialize will create the basic application objects (controller, view)
//and hook them up together so the instances know about each other
App.initialize();
