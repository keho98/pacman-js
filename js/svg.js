/*
  We setup all the data for drawing the pacman and the enemies. These are the
  SVG paths used by Raphael's path method to render the SVG elements.
  openPacman and closedPacman are used in agents.js to animate the Pacman
*/

App.openPacman = "M17.257,15l7.766-11.648C22.801,1.867,20.13,1,17.257,1c-7.731,0-14,6.269-14,14c0,7.732,6.269,14,14,14c2.873,0,5.544-0.866,7.766-2.352L17.257,15z";
App.closedPacman = "M15.739,14.867l12.521-6.26c-2.298-4.588-7.04-7.74-12.521-7.74c-7.732,0-14,6.269-14,14c0,7.732,6.268,14,14,14c5.481,0,10.224-3.15,12.521-7.738L15.739,14.867z";

App.GhostSvg = Ember.Object.extend({
  path: "M22.375,24.986c1.771,0,1.852,3.389,3.473,3.688c1.629-0.309,2.256-6.66,2.471-10.315v-2.696h-0.008c-0.238-7.239-6.18-13.034-13.475-13.034c-7.296,0-13.236,5.795-13.475,13.034H1.353v2.696c0.22,3.742,0.871,10.181,2.588,10.331c1.743-0.146,1.781-3.704,3.598-3.704c1.854,0,1.854,3.71,3.708,3.71c1.855,0,1.855-3.71,3.71-3.71c1.854,0,1.854,3.71,3.709,3.71C20.52,28.696,20.52,24.986,22.375,24.986z",
  leftEyeball: {x: 8.637, y: 14.129, r:3.371},
  leftEye: {x:8.862, y:13.005, r:2.248},
  rightEyeball: {x: 22.637, y: 14.129, r:3.371},
  rightEye: {x:22.861, y:13.005, r:2.248}
});

App.blueGhost = App.GhostSvg.create({
  fillColor: "#000C30",
  strokeColor: "#29AB2",
  eyeColor: "2AA5FF",
  eyeballColor: "#FFFFFF"
});

App.greenGhost = App.GhostSvg.create({
  fillColor: "#051500",
  strokeColor: "#006837",
  eyeColor: "2AA5FF",
  eyeballColor: "#FFFFFF"
});

App.orangeGhost = App.GhostSvg.create({
  fillColor: "#2A1200",
  strokeColor: "#F15A24",
  eyeColor: "2AA5FF",
  eyeballColor: "#FFFFFF"
});

App.pinkGhost = App.GhostSvg.create({
  fillColor: "#2A0018",
  strokeColor: "#D4145A",
  eyeColor: "2AA5FF",
  eyeballColor: "#FFFFFF"
});

App.scaredGhost = Ember.Object.create({
  path: "M22.479,24.93c1.769,0,1.847,3.379,3.464,3.678c1.625-0.307,2.25-6.643,2.465-10.288V15.63H28.4C28.163,8.409,22.236,2.629,14.96,2.629c-7.277,0-13.204,5.78-13.44,13.001H1.511v2.689c0.22,3.732,0.87,10.154,2.582,10.305c1.739-0.146,1.776-3.694,3.588-3.694c1.85,0,1.85,3.699,3.699,3.699c1.851,0,1.851-3.699,3.7-3.699c1.85,0,1.85,3.699,3.699,3.699S20.629,24.93,22.479,24.93z",
  fillColor: "#00A9E9",
  strokeColor: "#F2F2F2",
  eyeballColor: "F2F2F2",
  leftEyeball: {x:23.02, y:15.95, r:4.629},
  rightEyeball: {x:6.899, y:15.95, r:4.629}
});
