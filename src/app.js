/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

var API_URL = 'http://cinematik-2014.herokuapp.com';

// Show splash screen while waiting for data
var splashWindow = new UI.Window({
  backgroundColor: 'black',
  color: 'white'
});

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 30),
  size: new Vector2(144, 40),
  text: "CINEMATIK 2014\nLoading...",
  font: 'gothic-28-bold',
  color: 'white',
  textOverflow: 'wrap',
  textAlign: 'center'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

function parseEvents(data) {
  var menu_items = [];
  data.forEach(function(event){
    menu_items.push({
      id: event.id,
      title: event.time + ', ' + event.place,
      subtitle: event.name
    });
  });
  return menu_items;
}

// Load list of 5 upcomming events
ajax({ url: API_URL+'/events/upcoming/5/thumbnails', type: 'json' },
  function(data){
    var eventsMenu = new UI.Menu({
      sections: [{
        title: 'Upcoming events',
        items: parseEvents(data)
      }]
    });
    eventsMenu.on('select', function(e) {
      var detailCard = new UI.Card({
        title: 'Loading...',
        style: 'small',
        scrollable: true
      });
      detailCard.show();
      
      ajax({url: API_URL+'/events/'+e.item.id, type: 'json'},
        function(data){  
          var content = data.time + ', ' + data.place + 
              "\n" + data.original_name + 
              "\nSekcia: " + data.section + 
              "\nRezia: " + data.director + 
              "\n" + data.meta;
          detailCard.title('');
          detailCard.subtitle(data.name);
          detailCard.body(content);
        },
        function(error) {
          console.log("Event loading failed: " + error);
        });
    });
    eventsMenu.show();
    splashWindow.hide(); // Hide the splashWindow to avoid showing it when the user press Back.
    
    // Refresh events list on shake
    eventsMenu.on('accelTap', function(e) {
      ajax(
        { url: API_URL+'/events/upcoming/5/thumbnails', type:'json' },
        function(data) {
          // Update the Menu's first section
          eventsMenu.items(0, parseEvents(data));
          // Notify the user
          Vibe.vibrate('short');
        },
        function(error) {
          console.log('Refresh failed: ' + error);
        });
    });
  },
  function(error) {
    console.log("Events list loading failed: " + error);
  }
);

// Prepare the accelerometer
Accel.init();