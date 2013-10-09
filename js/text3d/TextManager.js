(function() {

var TextManager = function() {
    var me = this;

    this.strings = [];
    this.id = 0;

    Bub.bind( 'textCreated', function( text ) {
        text.id = me.id++;
        me.strings.push( text );
    });
    Bub.bind( 'textFree', function( text ) {
        me.strings.splice( me.strings.indexOf( text ), 1 );
    });
};

TextManager.prototype.update = function() {
    _.each( this.strings, function( text ) {
        text.update();
    });
};

Bub.TextManager = new TextManager();

}());
