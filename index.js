
$(document).ready(function() {
  'use strict';
  function toId(str) { return str.toLowerCase().trim().replace(/\W+/g,'_'); }
  function toKeywords(str) { return _.uniq(str.replace(/\W+/g,' ').trim().split(' ')); }

  //Get the data
  var src = $('#foodlist').attr("src");
  var data;
  $.ajax(src)
  .done(function(text) {
    var data = {};
    text.split("\r\n").forEach(function(line) {
      
    })

    //Prep the data
    var index={};
    _.each(data, function(item,title) {
      //Add missing info
      item.title = title;
      item.id = toId(title);
      item.keywords = toKeywords(item.desc);
      index[item.id] = item;
    });
    //Cross-link item exceptions
    _.each(data, function(item) {
      item.exceptions && (item.exceptions = item.exceptions.map(function(ex) {
        var id = toId(ex), ref = index[id];
        if (!ref) throw "Item "+id+", "+ex+" not found.";
        else return ref;
      }));
    });

    //Insert it into the document
    var $items = $('#items');
    _.each(data, function(item) {
      var html = item.infl ? unsafe_template(item) : safe_template(item);
      $items.append(html);
    });
  });
});

var safe_template = _.template('<div id="<%- id %>" class="card border-success mb-3">'+
  '<div class="card-body">'+
    '<h4 class="card-title"><%- title %> <small class="text-success">SAFE</small></h4>'+
    '<h6 class="card-subtitle mb-2 text-muted"><% print(types.join(", ")) %></h6>'+
    '<p class="card-text"><%- desc %></p>'+
    '<% if (typeof exceptions != "undefined") { %> '+
      '<h6 class="card-text">Exceptions:</h6>'+
      '<% exceptions.forEach(function(ex) { %>'+
        '<a href="#<%- ex.id %>" class="card-link text-danger"><%- ex.title %></a>'+
      '<% }); %>'+
    '<% } %>'+
  '</div>'+
'</div>');
var unsafe_template = _.template('<div id="<%- id %>" class="card border-danger mb-3">'+
  '<div class="card-body">'+
    '<h4 class="card-title"><%- title %> <small class="text-danger">UNSAFE</small></h4>'+
    '<h6 class="card-subtitle mb-2 text-muted"><% print(types.join(", ")) %></h6>'+
    '<p class="card-text"><%- desc %></p>'+
  '</div>'+
'</div>');

};
