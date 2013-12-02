Bub.Mixins.entity = _.extend(
    {
        entityify: function() {
            this.resetDefaults();
            this.initUpdaters();
            this.makeForcable();
        }
    },
    Bub.Mixins.defaultable,
    Bub.Mixins.dynamic,
    Bub.Mixins.forcable,
    Bub.Mixins.tweenable,
    Bub.Mixins.updatable
);
