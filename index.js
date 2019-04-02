
$(document).ready(function() {
  'use strict';

  //1. Fetch and parse the foods
  var src = $('#foodlist').attr("src");
  $.ajax(src).done(function(text) {
    var foods = parseFoods(text);

    //2. Collate the types of foods listed
    var types = _.map(foods,'types').reduce(function(a,b){return _.union(a,b);},[]);

    //3. Report
    console.log("Parsed "+_.size(foods)+" foods.");
    console.log("Found "+types.length+" categories.");

    //4. Render the food types into the type section
    var $type_container = $('#types');
    types.forEach(function(type) {
      var $type = $(template_type({type:type})).data({type:type});
      $type.data('type',type);
      $type.click(onSelectType);
      $type_container.append($type);
    });

    //5. Render the food items into the items section
    var $items_container = $('#items');
    _.forEach(foods, function(item) {
      var $item = $(template_card(item));
      $item.data(item);
      $items_container.append($item);
    });

    //6. Add other event handlers
    $('#search').keyup(_.debounce(onSearchTerm, 500));
    $('#clear-filter').click(onClearSearch);
    $(window).scroll(function() {
       if ($(this).scrollTop() > 100) $('#back-to-top').fadeIn();
       else $('#back-to-top').fadeOut();
   });
   $('#button-top').click(function() {
       $("html, body").animate({ scrollTop: 0 }, 600);
       return false;
   });
  });

  //============================================================================

  /**
   * Action Handler: Called when a food type is clicked
   */
  function onSelectType(evt) {
    var $type = $(this);
    var type = $(this).data('type');
    //Unselect the previous type button
    $('#types .btn-primary').removeClass('btn-primary').addClass('btn-light');
    //Select this button
    $type.removeClass('btn-light').addClass('btn-primary');
    doSearch($('#search').text(), type);
  };

  /**
   * Action Handler: Called when text is changed in the search bar
   */
  function onSearchTerm(evt) {
    var text = evt.target.value;
    doSearch(text, $('#types .btn-primary').text());
  };

  /**
   * Action Handler: Called when the search bar and filtering should be cleared.
   */
  function onClearSearch() {
    $('#search').val('');
    $('#types .btn-primary').removeClass('btn-primary').addClass('btn-light');
    $('#clear-filter').fadeOut();
    $('#items').children().fadeIn();
    $('#items').unmark();
  }

  //============================================================================

  /**
   * Filter the items to those matching the text and type
   * @param  {string} text Free text entry
   * @param  {string} type Optionally a food type
   */
  function doSearch(text, type) {
    //Filter and validate the inputs
    var keywords = toKeywords(text);
    if(!keywords.length && !type) return onClearSearch();

    //Update visibility of objects
    $('#items').children().each(function() {
      var item = $(this).data();

      //If item does NOT match the filter, hide it! Otherwise show.
      function noMatch(w) { var subj = item.title+' '+item.description; return subj.indexOf(w)===-1; }
      if ((type && !_.includes(item.types, type)) || _.find(keywords, noMatch)) $(this).fadeOut();
      else $(this).fadeIn();
    });

    //Make the 'clear search' button visible
    $('#clear-filter').fadeIn();

    //Update keyword highlighting
    $('#items').unmark({done:function() { $('#items').mark(keywords); }});
  }

  //============================================================================

  /**
   * Parse and validate the food definitions
   * @param  {string} text TSV-format definitions with header row
   * @return {object}      Foods keyed by ID
   */
  function parseFoods(text) {
    var foods = {}, errors = [];

    //Convert the file from TSV, validate, and store by id
    parseTSV(text).forEach(function(f, n) {
      //Require fields
      if (!f.title || !f.status || !f.types) errors.push("Record "+n+": Must define at least title, status, type");

      //Handle list fields
      if (f.types) f.types = f.types.split(/ *, */);
      if (f.exceptions) {
        f.exceptions = f.exceptions.split(/ *, */).map(function(ex) {
          return { id: toId(ex), title: ex };
        });
      }

      //Add extra fields
      f.n = n;
      f.id = toId(f.title);
      f.keywords = toKeywords(f.description||f.title);

      foods[f.id] = f;
    })
    //Validate cross-links between food items
    _.forEach(foods, function(f) {
      //Check that each exception links to a valid food.
      f.exceptions && f.exceptions.forEach(function(ex) {
        if (!foods[ex.id]) errors.push("Record "+f.n+": Exception references item "+ex+", not found in list.");
      });
    });

    //Check the collated errors and report if any failures.
    if (errors.length) throw errors.join("\n");
    else return foods;
  }

  /**
   * Parse the TSV text into an array of objects, with keys determined by the header row.
   * Skips empty rows or empty fields.
   *
   * @param  {string} text       Raw TSV file
   * @return {array}
   */
  function parseTSV(text) {
    //Convert the text into a 2D array of rows and values
    var rows = text.trim().split(/ *\r?\n */).map(function(line) {
      return line && line.split(/ *\t */);
    }).filter(_.identity);

    //Take the top row as keys
    var keys = rows.shift();

    //Combine with the remainder to make an array of records.
    return rows.map(function(values) {
      return _.zipObject(keys, values);
    });
  }

  /**
   * Convert a food name into a normalized ID form
   * @param  {string} name
   * @return {string}
   */
  function toId(name) {
     return name.toLowerCase().trim().replace(/\W+/g,'_');
  }

  /**
   * Convert input text into a list of normalised keywords
   * @param  {string} text
   * @return {array}
   */
  function toKeywords(text) {
    text=text.replace(/\W+/g,' ').trim();
    return text ? _.uniq(text.split(' ')) : [];
  }

  //============================================================================

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

});
