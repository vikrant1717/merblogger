/* Authors: Dennis J. Bell && Wayne E. Seguin
 * Licence: MIT
 * Name:    jQuery Models.
 * About:   REST style models objects for jQuery.
 */

Model = Class.extend({

/* Public API
 *
 *   Methods should remain availble on each next release. 
 *   Only subject to change with major release revisions and with notice if posisble.
 */

/* intialize
 *     Method used to setup the model. Overwrite this in extended models and be sure to call parent(id);
 */
  initialize: function(id) {
    this.id = id;

    //Private Members
    var attributes = {id: id};
    var load = function(data) {
      attributes = data;
      for(key in data) {
        // TODO: Skip if is public API method such as: initialize, parent
        if(key != "initialize" && key != "parent") {
          this[key] = data[key];
        }
      }
      
      if(this._after_load) {
        this._after_load();
        this._after_load = null;
      }
    }

    this._fetch();

  },

/*
 *   parent
 *     Used to call the parent method with the same name. Same concept as 'super' in Ruby.
 */

/*   _base_url
 *     Base URL resource is available at.
 */
  _url: function() {
    url = '/';
    if(this.owner && this.owner._resource) { 
      url += this.owner._resource + '/';
      $.app[this.owner._resource] = $.app[this.owner._resource] || {};
      if(this.owner_id) {
        url += this.owner_id + '/';
        $.app[this.owner._resource][this.owner_id] = $.app[this.owner._resource][this.owner_id] || {};
      }
    }
    
    if(this.id) {
      url += this._resource + '/';
     $.app[this._resource] = $.app[this._resource] || {};
      if(this._resource) {
        url += this.id + '/';
        $.app[this._resource][this.id] = $.app[this._resource][this.id] | {};
      }
    } else {
      url = this._resource; // If no id is specified options should be the resource.
    }
    return url;
  },

/*   _resource
 *     Underlying plural model name from the backend. Can be thought of similar to the 'table name'.
 */

/*   _read()
 *   _fetch()
 *     Fetch the data from the backend URL, REST based construction. 
 *     Currently only one level of ownership is enabled.
 */
  _fetch: function (callback) {
    if (callback) {
      this._after_load = callback;
      $.getJSON(this._url(), null, load);
    } else {
      // get the data synchronously and return
      this._after_load = null;
      log(this._url());
      response = $.ajax({ type: "GET", url: this._url(), dataType: "json", async: false });
      load(eval("(" + response.responseText + ")"));
    }
  },

/* _load()
 *   Load the attributes that do not conflict with public API methods into the object directly.
 *   This buffers the object such that a successive call will not query the backend. 
 *   To force a query after this call _reload().
 */
  _load: function() {
    // Go through and unset the existing data.
    data = attributes;
    for(key in data) {
      if(key != "initialize" && key != "parent") {
        this[key] = null;
      }
    }
    // Now load again.
    this._fetch();
  },


/* _reload()
 *   Re-fetch from the backend, remove attributes from the object and then load the attributes.
 */
  _reload: function() {
    // Go through and unset the existing data.
    data = attributes;
    for(key in data) {
      if(key != "initialize" && key != "parent") {
        this[key] = null;
      }
    }
    // Now load again.
    this._fetch();
  },

/*   _update_attributes()
 *     Update a set of attributes, marking them dirty. Save to the backend when done.
 */
  _update_attributes: function(hash) {
    // Send a PUT to the object's URL with attributes to update, "dirty".
    for(key in hash) {
      this._set_attribute(key,hash[key]);
    }
    this._save();
  },

/*   _set_attribute()
 *     Update an attribute, mark it as dirty for later saving.
 */
  _set_attribute: function(key,value) {
    // Set the value and store the key in the "dirty list"
    if (attributes[key] == undefined) {
      // raise error
    }
    attributes[key] = value;
    return attributes[key];
  },

/*
 * _get_attribute()
 *   Get the specified attribute from the attributes hash.
 */
  _get_attribute: function(attr) {
    refresh = arguments[1] 
    return attributes[attr]
  },

/*   _save()
 *     Save the record to the backend if any attributes are dirty. Update any views / return the record itself.
 */
  _save: function() {
    // save to backend if dirty.
  },

/*   _destroy()
 *     Destroy the record. Method returns true if successful, an error message from the backend otherwise.
 */
  _delete: function() {
    // Delete the record in the backend, destroy buffers, views, and forms.
  },

/*   _[]
 *     Retrieves any attribute that does not conflict with a public API method name.
 */
  _[]: function(name) {

  },

/*   _view()
 *     Render teh jQuery Template for the view of the model.
 */
  _view: function(options) {
    return $.templates[self._resource + "_view"](self._attributes);
  },
  

/*   _form()
 *     Render teh jQuery Template for the form of the model.
 */
  _form: function(options) {
    return $.templates[self._resource + "_form"](self._attributes);
  }

/*   _dirty()
 *     true or false based on whether or not attributes have been updated. 
 *     Must use the _update/_set_attribute(s) methods in order for this to 
 *     be used properly instead of direct assignment.
 */
  _dirty: function(options) {
    // TODO: Implement.
    return true;
  }

/*   _to_s()
 *     Used to generate the display for the object. Defaults to the id for the record.
 *     Override in extended model classes as needed.
 */
  _to_s: function() { return this.id; },

/*
 * Private API
 *
 *   Subject to change, do not rely on the below named items being available.
 */

/* _attributes
 *   The attributes hash/object is stored in here.
 */

});

/*
 * Define your application's models below.
 * Examples:
Blog = Class.extend(Model, {  
  initialize: function(id) {
    this._resource = "blogs";
    this.parent(id);
  },
  
  _to_s: function() {
    //return this.parent() + " works in " + this.dept;
    return this.name;
  }
});

Article = Class.extend(Model, {
  initialize: function(id) {
    this._resource = "articles"
    this.parent(id);
  },

  _to_s: function() { return this.title; }
});


Comment = Class.extend(Model, {
  initialize: function(id) {
    this._resource = "comments"
    this.parent(id);
  },

  _to_s: function() { return this.title; }
});

Author = Class.extend(Model, {
  initialize: function(id) {
    this._resource = "authors"
    this.parent(id);
  },

  _to_s: function() { return this.first_name+' '+this.last_name; }
});

//b = new Blog(1);
//b._attributes["name"];
//b._get_attribute("name");
//b._get_name();
*/
