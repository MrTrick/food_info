
$(document).ready(function() {
  'use strict';
  /**
   * Store food data for the application
   * @type {object}
   */
  var data;

  function toId(str) { return str.toLowerCase().trim().replace(/\W+/g,'_'); }
  function toKeywords(str) { str=str.replace(/\W+/g,' ').trim(); return str?_.uniq(str.split(' ')):[]; }
  function parseList(str) { return str.trim().split(/ *, */); }
  /**
   * Parse the data file into the final form for display
   * @param  {string} text Text body
   * @param  {string} name Name of the text file, for error reporting
   * @return {object}      Large map of data keyed by id
   */
  function parseData(text, name) {
    var errors = [];
    var data = {};
    //Split into lines
    text.trim().split(/\r?\n/).forEach(function(line,n) {
      //Split into fields
      if (!(line = line.trim())) return;
      var f = line.split('\t');
      if (f.length < 3) { errors.push(name+":"+n+" Must have at least 3 fields with '|' characters between."); return; }
      //Parse fields
      var id=toId(f[0]), title=f[0];
      var status=f[1];
      var types=parseList(f[2]);
      var description=f[3] || false;
      var exceptions=f[4] ? parseList(f[4]) : false;
      var keywords = toKeywords(description||title);
      //Create entry
      data[id] = {id:id,title:title,n:n,status:status,description:description,keywords:keywords,types:types,exceptions};
    });
    //Cross-link item exceptions
    _.each(data, function(item) {
      item.exceptions && (item.exceptions = item.exceptions.map(function(ex) {
        var id = toId(ex);
        if (!(id in data))errors.push(name+":"+item.n+" Exception references item "+ex+", not found in list.");
        else return data[id];
      }));
    });
    if (errors.length) throw errors.join("\n");
    else return data;
  }

  //Handle actions
  function onSelectType(evt) {
    var $type = $(this), type=evt.target.innerText;
    $('#types .btn-primary').removeClass('btn-primary').addClass('btn-light');
    $type.removeClass('btn-light').addClass('btn-primary');
    doSearch($('#search').text(), type);
  };
  function onSearchTerm(evt) {
    var text = evt.target.value;
    doSearch(text, $('#types .btn-primary').text());
  };

  function doSearch(text, type) {
    var keywords = toKeywords(text);
    if(!keywords.length && !type) return clearSearch();

    //Update visibility of objects
    $('#items').children().each(function() {
      var id = this.id, item = data[id];
      //Does item match the filter?
      function noMatch(w) { var subj =item.title+' '+item.description; return subj.indexOf(w)===-1; }
      if ((type && !_.includes(item.types, type)) || _.find(keywords, noMatch)) $(this).fadeOut();
      else $(this).fadeIn();
    });
    //Show the 'clear search' button
    $('#clear-filter').fadeIn();
    //Update the highlighting
    $('#items').unmark({done:function() { $('#items').mark(keywords); }});
  }

  function clearSearch() {
    $('#search').val('');
    $('#types .btn-primary').removeClass('btn-primary').addClass('btn-light');
    $('#clear-filter').fadeOut();
    $('#items').children().fadeIn();
    $('#items').unmark();
  }

  //Fetch the data and render cards
  var src = $('#foodlist').attr("src");
  $.ajax(src)
  .done(function(text) {
    //Ooh, data
    data = parseData(text,src);
    var types = _.reduce(_.map(data,'types'),function(a,b){return _.union(a,b);},[]);
    console.log("Parsed "+_.size(data)+" foods.");
    console.log("Found "+types.length+" categories.");

    //Populate the types
    var $types = $('#types');
    _.each(types,function(type) { type = {id:toId(type),name:type};
      var $type = $(template_type(type));
      $type.click(onSelectType);
      $types.append($type);
    });

    //Insert items into the document
    var $items = $('#items');
    _.each(data, function(item) {
      var $item = $(template_card(item));
      $items.append($item);
    });

    //Other event handlers
    $('#search').keyup(_.debounce(onSearchTerm, 500));
    $('#clear-filter').click(clearSearch);
    $(window).scroll(function(){
       if ($(this).scrollTop() > 100) $('#back-to-top').fadeIn();
       else $('#back-to-top').fadeOut();
   });
   $('#button-top').click(function(){
       $("html, body").animate({ scrollTop: 0 }, 600);
       return false;
   });
  });
});

//Compile the templates
var template_card = _.template(
  $('#template_card').html(),
  {imports: {
    border_class: {good:"border-success", maybe:"border-warning", bad:"border-danger"},
    label_class: {good:"text-success", maybe:"text-warning", bad:"text-danger"},
    label: {good:"SAFE", maybe:"MODERATION", bad:"UNSAFE"},
    exception_class: {good:"text-danger", maybe:"", bad:"text-success"},
  }}
);
var template_type = _.template(
  $('#template_type').html()
);
