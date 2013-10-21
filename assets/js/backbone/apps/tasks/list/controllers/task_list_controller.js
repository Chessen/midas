define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'bootstrap',
  'tasks_collection',
  'task_collection_view',
  'task_form_view',
  'modal_wizard_component'
], function ($, _, Backbone, Utilities, Bootstrap, TasksCollection, TaskCollectionView, TaskFormView, ModalWizardComponent) {

  Application.Controller.TaskList = Backbone.View.extend({

    el: "#task-list-wrapper",

    events: {
      'click .add-task': 'add',
      'click .wizard' : 'wizard'
    },

    initialize: function (settings) {
      this.options = _.extend(settings, this.defaults);
      var self = this;

      this.fireUpTasksCollection();
      this.requestTasksCollectionData();

      this.collection.on("tasks:render", function () {
        self.requestTasksCollectionData()
      })
    },

    fireUpTasksCollection: function () {
      if (this.collection) {
        this.collection.initialize();
      } else {
        this.collection = new TasksCollection();
      }
    },

    requestTasksCollectionData: function () {
      var self = this;

      this.collection.fetch({
        url: '/api/task/findAllByProjectId/' + parseInt(this.options.projectId),
        success: function (collection) {
          self.tasks = collection;
          self.renderTaskCollectionView()
        }
      });
    },

    renderTaskCollectionView: function () {
      var self = this;

      $(".modal-backdrop").hide();
      $(".modal").modal('hide');
      $("body").removeClass("modal-open")

      if (this.taskCollectionView) {
        this.taskCollectionView.cleanup();
      }
      this.taskCollectionView = new TaskCollectionView({
        el: "#task-list-wrapper",
        onRender: true,
        collection: self.tasks
      });

    },

    add: function (e) {
      var self = this;
      if (e.preventDefault()) e.preventDefault();

      if (this.modalWizardComponent) this.modalWizardComponent;
      this.modalWizardComponent = new ModalWizardComponent({
        el: "#task-list-wrapper",
        id: "addTask",
        modalTitle: 'New Opportunity'
      }).render();

      if (!_.isUndefined(this.modalWizardComponent)) {
        if (this.taskFormView) this.taskFormView;
        this.taskFormView = new TaskFormView({
          el: ".modal-body",
          projectId: this.options.projectId,
          tasks: self.tasks
        }).render();
      }
    },

    cleanup: function () {
      if (this.taskCollectionView) this.taskCollectionView.cleanup();
      removeView(this);
    }

  });

  return Application.Controller.TaskList;
})