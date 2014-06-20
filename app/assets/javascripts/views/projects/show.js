/*global JST, Freelancer, Backbone, $ */

Freelancer.Views.ShowProject = Backbone.CompositeView.extend({
  initialize: function() {
    this.listenTo(this.model.deliverables(), 'add', this.addDeliverable);
    this.listenTo(this.model.deliverables(), 'remove', this.resetSubviews);
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(Freelancer.Collections.clients, 'sync', this.render);
    this.listenTo(this.model.deliverables(), 'add-hour', this.addHour);
    this.listenTo(this.model.deliverables(), 'remove-hour', this.removeHour);
    
    this.addHoursDisplay();
    this.resetSubviews();
  },
  
  resetSubviews: function() {
    this.removeSubviews('.deliverables');
    this.model.deliverables().each(this.addDeliverable.bind(this));
  },
  
  events: {
    'click .delete-project': 'deleteProject',
    'submit .new-deliverable': 'newDeliverable',
    'click .make-invoice': 'makeInvoice'
  },
  
  template: JST['projects/show'],
  
  addDeliverable: function(deliverable) {
    var selector = '.deliverables';
    if(!deliverable.get('parent_deliverable_id')) {
      var subview = new Freelancer.Views.DeliverableListView({
        model: deliverable,
        collection: this.model.deliverables()
      });
      this.addSubview(selector, subview);
    }
  },
  
  addHoursDisplay: function() {
    var hoursDisplay = new Freelancer.Views.HoursDisplay({
      model: this.model
    });
    this.addSubview('.hours', hoursDisplay);
  },
  
  deleteProject: function(event) {
    event.preventDefault();
    this.model.destroy({
      wait: true, 
      success: function() {
        // wait to navigate to projects index until model has been destroyed + removed from collection
        Backbone.history.navigate('#/projects', { 
          trigger: true 
        });      
      }
    });
  },
  
  makeInvoice: function(event) {
    // show modal
    this.waitingGif();
    
    $.ajax({
      url: this.model.url() + '/invoice',
      method: 'POST',
      success: function(model, response) {
        alert('success!');
        Backbone.history.navigate('#/invoices/' + model.id, { 
          trigger: true
        })
      },
      error: function(model, response) {
        // render error messages
        debugger
      }
    })
  },
  
  newDeliverable: function(event) {
    event.preventDefault();
    var data = $(event.target).serializeJSON().deliverable;
    
    var view = this;
    this.model.deliverables().create(data, {
      wait: true,
      success: function() {
        view.$('[name="deliverable[name]"]').val('');
      }
    });
  },
  
  render: function() {
    var renderedContent = this.template({
      project: this.model,
      client: Freelancer.Collections.clients.getOrFetch(this.model.get('client_id'))
    });
    this.$el.html(renderedContent);
    
    this.attachSubviews();
    return this;
  },
  
  addHour: function() {
    this.model.set('uninvoiced_hours_count', 
        this.model.get('uninvoiced_hours_count') + 1);
    this.model.set('total_hours', 
        this.model.get('total_hours') + 1);
  },
  
  removeHour: function() {
    this.model.set('uninvoiced_hours_count', 
        this.model.get('uninvoiced_hours_count') - 1);
    this.model.set('total_hours', 
        this.model.get('total_hours') - 1);
  },
  
  waitingGif: function() {
    this.$el.html('<div id="canvasloader"></div>');
    var cl = new CanvasLoader('canvasloader');
    cl.setColor('#e01234'); // default is '#000000'
    cl.setShape('spiral'); // default is 'oval'
    cl.setDiameter(58); // default is 40
    cl.setDensity(95); // default is 40
    cl.setRange(1); // default is 1.3
    cl.setSpeed(4); // default is 2
    cl.setFPS(49); // default is 24
    cl.show(); // Hidden by default
  }
});