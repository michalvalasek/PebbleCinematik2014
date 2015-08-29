/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
//var Accel = require('ui/accel');
//var Vibe = require('ui/vibe');

var API_URL = 'http://cinematik-2014.herokuapp.com';
var EVENTS_LIMIT = 10;

// Show splash screen while waiting for data
var splashWindow = new UI.Window({
  backgroundColor: 'black',
  color: 'white'
});

var logo = new UI.Image({
  position: new Vector2(0,30),
  size: new Vector2(144,40),
  image: 'images/cinematik_logo.png'
});
var text_2015 = new UI.Text({
  position: new Vector2(0, 65),
  size: new Vector2(144, 30),
  text: "2015",
  font: 'gothic-28-bold',
  color: 'white',
  textAlign: 'center'
});
var text_loading = new UI.Text({
  position: new Vector2(0, 100),
  size: new Vector2(144, 20),
  text: "Nacitava sa...",
  font: 'gothic-18',
  color: 'white',
  textAlign: 'center'
});
splashWindow.add(logo);
splashWindow.add(text_2015);
splashWindow.add(text_loading);
splashWindow.show();

function buildEventsMenuItems(events) {
  var menu_items = [];
  events.forEach(function(event){
    menu_items.push({
      id: event.id,
      title: event.time + ', ' + event.place,
      subtitle: event.name
    });
  });
  return menu_items;
}

var events_data = [];

// Load list of upcomming events
ajax({ url: API_URL+'/events/upcoming/'+EVENTS_LIMIT, type: 'json' },
  function(data){
    events_data = data;
    var eventsMenu = new UI.Menu({
      sections: [{
        title: 'Najblizsie predstavenia',
        items: buildEventsMenuItems(events_data)
      }]
    });
    
    var detailCard = new UI.Card({
      title: 'Nacitava sa...',
      style: 'small',
      scrollable: true
    });
    
    eventsMenu.on('select', function(e) {
      detailCard.show();
      
      var current_event = events_data.filter(function(evt){ return evt.id == e.item.id; })[0];
      var content = current_event.time + ', ' + current_event.place + 
          "\n" + current_event.original_name + 
          "\nSekcia: " + current_event.section + 
          "\nRezia: " + current_event.director + 
          "\n" + current_event.meta;
      detailCard.title('');
      detailCard.subtitle(current_event.name);
      detailCard.body(content);
    });
    
    eventsMenu.show();
    splashWindow.hide(); // Hide the splashWindow to avoid showing it when the user press Back.
    
    // Refresh events list on shake
    /*eventsMenu.on('accelTap', function(e) {
      ajax(
        { url: API_URL+'/events/upcoming/'+EVENTS_LIMIT, type:'json' },
        function(data) {
          events_data = data;
          // Update the Menu's first section and show it
          eventsMenu.items(0, buildEventsMenuItems(events_data));
          detailsCard.hide();
          // Notify the user
          Vibe.vibrate('short');
        },
        function(error) {
          console.log('Refresh failed: ' + error);
        });
    });*/
  },
  function(error) {
    console.log("Events list loading failed: " + error);
  }
);

// Prepare the accelerometer
//Accel.init();
