Bub.GenericEntity = function() {
    this.entityify();
};

Bub.GenericEntity.prototype.updateFns = [];

_.extend( Bub.GenericEntity.prototype, Bub.Mixins.entity );
