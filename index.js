
$(document).ready(function() {
  'use strict';
  function toId(str) { return str.toLowerCase().replace(' ','_'); }
  function toKeywords(str) { return _.uniq(str.replace(/\W+/g,' ').trim().split(' ')); }

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

var data = {
  'Unsweetened Fresh Fruit': {infl:false, types:['Fruit'], desc:'Fresh fruit without added sugar', exceptions:['Citrus','Grapes']},
  'Unsweetened Frozen Fruit': {infl:false, types:['Fruit'], desc:'Frozen fruit without added sugar', exceptions:['Citrus','Grapes']},
  'Unsweetened Water-Packed Fruit': {infl:false, types:['Fruit'], desc:'Fruit in water without added sugar', exceptions:['Citrus','Grapes']},
  'Unsweetened Fruit Juice': {infl:false, types:['Fruit','Beverage'], desc:'Juice made from 100% fruit', exceptions:['Citrus','Grapes','Fruit drinks']},
  'Citrus': {infl:true, types:['Fruit'], desc:'All citrus fruits; Oranges, Grapefruits, Lemon, Lime'},
  'Grapes': {infl:true, types:['Fruit'], desc:'All grapes or grape-containing products'},
  'Fruit Drinks': {infl:true, types:['Fruit','Beverage'], desc:'Sweetened fruit drinks, usually with only a percentage of fruit.'},
  'Lemonade': {infl:true, types:['Fruit','Beverage'], desc:'Any soda drinks, lemonade limeade etc.'},
  'Dried Fruit': {infl:true, types:['Fruit'], desc:'Any dried fruits'},
  'Brown Rice': {infl:false, types:['Grain'], desc:'Brown rice, prepared in any way.', exceptions:['White Rice']},
  'White Rice': {infl:true, types:['Grain'], desc:'White rice, prepared in any way.'},
  'Rice Noodles': {infl:true, types:['Grain'], desc:'Noodles made from white rice.'},
  'Millet': {infl:false, types:['Grain'], desc:'Millet grain'},
  'Quinoa': {infl:false, types:['Grain'], desc:'Quinoa grain'},
  'Amaranth': {infl:false, types:['Grain'], desc:'Amaranth grain'},
  'Teff': {infl:false, types:['Grain'], desc:'Teff grain'},
  'Tapioca': {infl:false, types:['Grain'], desc:'Tapioca'},
  'Buckwheat': {infl:false, types:['Grain'], desc:'Buckwheat grain'},
  'Wheat': {infl:true, types:['Grain'], desc:'Wheat grain, flour, pasta, noodles.'},
  'Oats': {infl:true, types:['Grain'], desc:'Oats, rolled oats, meusli, oat porridge, bircher meusli.'},
  'Spelt': {infl:true, types:['Grain'], desc:'Spelt grain.'},
  'Barley': {infl:true, types:['Grain'], desc:'Barley grain, beer, some soup'},
  'Rye': {infl:true, types:['Grain'], desc:'Rye grain, beer, crisp bread, crackers, whiskey.'},
  'Corn': {infl:true, types:['Grain'], desc:'Corn grain, steamed corn, polenta, cornstarch, cornflour, corn syrup, maltodextrin'},
  'Gluten Grain': {infl:true, types:['Grain'], desc:'Any gluten-containing grain, grain vinegar, batter'},
  'Fresh Fish': {infl:false, types:['Meat','Protein'], desc:'All fresh fish such as halibut, salmon, cod, sole, trout, and others.', exceptions:['Canned Fish']},
  'Canned Fish': {infl:true, types:['Meat','Protein'], desc:'Any canned fish (sulphites)'},
  'Wild Game': {infl:false, types:['Meat','Protein'], desc:'Other meat birds like game hens, etc'},
  'Chicken': {infl:false, types:['Meat','Protein'], desc:'Freshly prepared chicken, roast chicken, bbq chicken, grilled chicken, chicken mince', exceptions:['Cured Meat','Canned Meat','Sausages']},
  'Turkey': {infl:false, types:['Meat','Protein'], desc:'Freshly prepared turkey, roast turkey', exceptions:['Cured Meat','Canned Meat']},
  'Lamb': {infl:false, types:['Meat','Protein'], desc:'Lamb meat, roast lamb, lamb mince, lamb leg, lamb shanks', exceptions:['Cured Meat','Canned Meat','Sausages']},
  'Cured Meat': {infl:true, types:['Meat','Protein'], desc:'Any cured meat, cold sliced chicken, cold cuts, cold sliced turkey, roast beef, ham, prosciutto, cabanossi, mortadella, bacon, pancetta, crudo, cotto, aw...'},
  'Canned Meat': {infl:true, types:['Meat','Protein'], desc:'Any canned meat, spam, canned chicken, blech...'},
  'Beef': {infl:true, types:['Meat','Protein'], desc:'Beef meat, hamburgers, beef sausages, roast beef, steak, bresaola, beef stew'},
  'Pork': {infl:true, types:['Meat','Protein'], desc:'Pork meat, roast pork, pork sausages, crackling, pulled pork'},
  'Sausages': {infl:true, types:['Meat','Protein'], desc:'Any kind of sausages; beef pork chicken lamb'},
  'Eggs': {infl:true, types:['Protein'], desc:'Eggs as an ingredient or cooked any way, boiled egg, mayonnaise, aioli, hollandaise, custard'},
  'Shellfish': {infl:true, types:['Meat','Protein'], desc:'Shellfish, prawns, clams, lobster, crab, scallops'},
  'Beans': {infl:false, types:['Legume'], desc:'Any kind of dried legume, beans, pulses, lentils', exceptions:['Canned Beans']},
  'Soy': {infl:false, types:['Legume'], desc:'Soy beans, soy milk. (Soy sauce?)', exceptions:['Canned Beans']},
  'Canned Beans': {infl:true, types:['Legume'], desc:'Canned beans? Not sure on this one'},
  'Almonds': {infl:false, types:['Nut'], desc:'Almond nuts, almond milk'},
  'Cashews': {infl:false, types:['Nut'], desc:'Cashew nuts'},
  'Walnuts': {infl:false, types:['Nut'], desc:'Walnuts'},
  'Sesame Seeds': {infl:false, types:['Nut'], desc:'Sesame seeds, tahini'},
  'Sunflower Seeds': {infl:false, types:['Nut'], desc:'Sunflower Seeds'},
  'Pumpkin Seeds': {infl:false, types:['Nut'], desc:'Pumpkin Seeds'},
  'Nut Butter': {infl:false, types:['Nut','Spread'], desc:'Almond Butter, Cashew Butter, Walnut Butter, Sesame Butter, Sunflower Butter, Pumpkin Seed Butter', 'exceptions':['Peanuts','Pistachios']},
  'Hummus': {infl:false, types:['Nut','Spread'], desc:'Hummus, Hommous, Hummous, the spelling is as bad as for yoghurt.'},
  'Peanuts': {infl:true, types:['Nut'], desc:'Peanuts, peanut butter'},
  'Pistachios': {infl:true, types:['Nut'], desc:'Pistachios'},
  'Soy Milk': {infl:false, types:['Milk','Beverage'], desc:'Soy milk'},
  'Almond Milk': {infl:false, types:['Milk','Beverage'], desc:'Almond milk'},
  'Macadamia Milk': {infl:false, types:['Milk','Beverage'], desc:'Macadamia milk'},
  'Milk': {infl:true, types:['Milk','Dairy','Beverage'], desc:'Dairy milk, cream'},
  'Ice Cream': {infl:true, types:['Dairy'], desc:'Ice cream, frozen yoghurt'},
  'Yoghurt': {infl:true, types:['Dairy'], desc:'Yoghurt, yogurt, yoghourt, I\'m sure it\'s spelt like one of these'},
  'Cheese': {infl:true, types:['Dairy'], desc:'Cheese, cottage cheese, mozzarella, burata, parmesan, cheddar, swiss, emmental, pecorino'},
  'Butter': {infl:true, types:['Dairy','Spread'], desc:'Butter, garlic butter, butter biscuits, shortbread'},
  'Raw Vegetables': {infl:false, types:['Vegetable'], desc:'Raw fresh vegetables', exceptions: ['Tomatoes','Potatoes','Eggplant','Capsicum']},
  'Steamed Vegetables': {infl:false, types:['Vegetable'], desc:'Steamed vegetables', exceptions: ['Tomatoes','Potatoes','Eggplant','Capsicum']},
  'Grilled Vegetables': {infl:false, types:['Vegetable'], desc:'Vegetables sauted, grilled, stir fried', exceptions: ['Tomatoes','Potatoes','Eggplant','Capsicum']},
  'Baked Vegetables': {infl:false, types:['Vegetable'], desc:'Baked vegetables', exceptions: ['Tomatoes','Potatoes','Eggplant','Capsicum']},
  'Sweet Potatoes': {infl:false, types:['Vegetable'], desc:'Sweet potato, yam, kumera, in moderation', exceptions:['Canned Vegetables']},
  'Canned Vegetables': {infl:true, types:['Vegetable'], desc:'Canned or preserved vegetables, pickles, capers, cream of corn'},
  'Tomatoes': {infl:true, types:['Vegetable'], desc:'Yes I know the tomato is a fruit. Ketchup, tomato sauce, sugo, bolognese'},
  'Potatoes': {infl:true, types:['Vegetable'], desc:'Potatoes, chips, potato flour, baked potatoes, wedges, hash browns, potato scallops'},
  'Eggplant': {infl:true, types:['Vegetable'], desc:'Eggplant cooked in any way, baba ganoush, lots of other dips'},
  'Capsicum': {infl:true, types:['Vegetable'], desc:'Capsicum, bell peppers, red capsicum, yellow capsicum, peperoni'},
  'Olive Oil': {infl:false, types:['Fat'], desc:'Olive oil, any kind'},
  'Vegetable Oils': {infl:false, types:['Fat'], desc:'Vegetable oils, cold-pressed canola, flax seed oil, safflower oil, sunflower oil, sesame oil, walnut oil, pumpkin oil, almond oil'},
  'Margarine': {infl:true, types:['Fat','Spread'], desc:'Margarine, shortening, blended butter'},
  'Shortening': {infl:true, types:['Fat'], desc:'Lard, animal shortening, packaged animal fat'},
  'Salad Dressings': {infl:true, types:['Fat','Sauce'], desc:'Most commercial salad dressings'},
  'Coffee': {infl:true, types:['Beverage'], desc:'Coffee, caffe, espresso, macchiato, instant coffee, turkish coffee, greek coffee, iced coffee'},
  'Black Tea': {infl:true, types:['Beverage'], desc:'Any kind of black tea or tea-containing blend, english breakfast, chai, earl grey'},
  'Green Tea': {infl:false, types:['Beverage'], desc:'Allowable in moderation.'},
  'Herbal Teas': {infl:false, types:['Beverage'], desc:'All herbal teas, not containing black tea leaves, chamomile, rooibos, honeybush, etc'},
  'Soft Drink': {infl:true, types:['Beverage'], desc:'Any soft drinks, soda water, lemonade, cola'},
  'Alcohol': {infl:true, types:['Beverage'], desc:'Any alcoholic beverages, beer, wine, spirits'},
  'Most Spices': {infl:false, types:['Seasoning'], desc:'Cinnamon, cumin, dill, ginger, organo, parsley, rosemary, tarragon, thyme, tumeric', exceptions:['Chilli','Paprika','Cayenne']},
  'Garlic': {infl:false, types:['Vegetable','Seasoning'], desc:'Garlic, shallots'},
  'Paprika': {infl:true, types:['Seasoning'], desc:'Paprika (comes from the pepper family)'},
  'Chilli': {infl:true, types:['Seasoning'], desc:'Chilli (comes from the pepper family)'},
  'Cayenne': {infl:true, types:['Seasoning'], desc:'Cayenne (comes from the pepper family)'},
  'Molasses': {infl:false, types:['Sweetener'], desc:'Molasses'},
  'Brown Rice Syrup': {infl:false, types:['Sweetener'], desc:'Brown rice syrup'},
  'Fruit Sweetener': {infl:false, types:['Sweetener'], desc:'Not sure what this is. Stevia? Applesauce?'},
  'Honey': {infl:true, types:['Sweetener'], desc:'Honey'},
  'Sugar': {infl:true, types:['Sweetener'], desc:'White sugar, brown sugar, glucose syrup, refined sugar'},
  'Raw Sugar': {infl:true, types:['Sweetener'], desc:'Raw sugar, demerara sugar'},
  'Corn Syrup': {infl:true, types:['Sweetener'], desc:'Corn syrup'},
  'Maple Syrup': {infl:true, types:['Sweetener'], desc:'Maple syrup'},
};
