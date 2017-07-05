'use strict';
var _ = require('lodash');
var Interface = require('forest-express');
var CompositeKeysManager = require('./composite-keys-manager');

function ResourceFinder(model, params, withIncludes) {
  var schema = Interface.Schemas.schemas[model.name];
  var compositeKeysManager = new CompositeKeysManager(model, schema, params);

  function getIncludes() {
    var includes = [];

    _.values(model.associations).forEach(function (association) {
      if (['HasOne', 'BelongsTo'].indexOf(association.associationType) > -1) {
        includes.push({
          model: association.target.unscoped(),
          as: association.associationAccessor
        });
      }
    });
    return includes;
  }

  this.perform = function () {
    var conditions = { where: {} };

    if (withIncludes) {
      conditions.include = getIncludes();
    }

    if (schema.isCompositePrimary) {
      conditions.where = compositeKeysManager
        .getRecordConditions(params.recordId);
    } else {
      conditions.where[schema.idField] = params.recordId;
    }

    return model.find(conditions);
  };
}

module.exports = ResourceFinder;