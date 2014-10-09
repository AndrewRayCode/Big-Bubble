(function() {

var symbol = {
    // A “null denotation” (nud) which is a scary name for the action
    // that should happen when the symbol is encountered as start of an
    // expression (most notably, prefix operators)
    parseRight: function() {
        this.error( 'Undefined.' );
    },
    // A “left denotation” (led) which is a scary name for the action
    // that should happen when the symbol is encountered after the start of an
    // expression (most notably, infix and postfix operators)
    parseLeft: function( left ) {
        this.error( 'Missing operator.' );
    }
};

var scope = {
    define: function( n ) {
        var t = this.def[n.value];
        if (typeof t === 'object' ) {
            n.error(t.reserved ?
                'Already reserved.' :
                'Already defined.');
        }
        this.def[n.value] = n;
        n.reserved = false;
        n.parseRight  = Prattle.itself;
        n.parseLeft      = null;
        n.std      = null;
        n.lbp      = 0;
        n.scope    = this;
        return n;
    },
    find: function( n ) {
        var e = this, o;
        while (true ) {
            o = e.def[n];
            if (o && typeof o !== 'function' ) {
                return e.def[n];
            }
            e = e.parent;
            if (!e ) {
                o = this.symbol_table[n];
                return o && typeof o !== 'function' ?
                        o : this.symbol_table['(name)'];
            }
        }
    },
    pop: function() {
        return this.parent;
    },
    reserve: function( n ) {
        if (n.arity !== 'name' || n.reserved ) {
            return;
        }
        var t = this.def[n.value];
        if (t ) {
            if (t.reserved ) {
                return;
            }
            if (t.arity === 'name' ) {
                n.error('Already defined.');
            }
        }
        this.def[n.value] = n;
        n.reserved = true;
    }
};

var Prattle = function() {
    this.symbol_table = {};
    this.token = null;
    this.tokens = null;
    this.scope = null;
};

Prattle.itself = function() {
    return this;
};

Prattle.prototype.symbol = function( id, bp ) {
    var s = this.symbol_table[id];
    bp = bp || 0;
    if (s ) {
        if (bp >= s.lbp ) {
            s.lbp = bp;
        }
    } else {
        s = Object.create( symbol );
        s.id = s.value = id;
        s.lbp = bp;
        this.symbol_table[id] = s;
    }
    return s;
},

Prattle.prototype.advance = function( id ) {
    var type, o, t, value,
        tokens = this.tokens,
        token = this.token,
        token_nr = 0;

    if ( id && token.id !== id  ) {
        token.error('Expected "' + id + '".');
    }
    if (token_nr >= tokens.length ) {
        token = this.symbol_table['(end)'];
        return;
    }
    t = tokens[token_nr];
    token_nr += 1;
    value = t.value;
    type = t.type;
    if (type === 'name' ) {
        o = this.scope.find(value);
    } else if (type === 'operator' ) {
        o = this.symbol_table[value];
        if (!o ) {
            t.error('Unknown operator.');
        }
    } else if (type === 'string' || type ===  'number' ) {
        type = 'literal';
        o = this.symbol_table['(literal)'];
    } else {
        t.error('Unexpected token.');
    }
    token = Object.create( o );
    token.value = value;
    token.arity = type;
    return token;
},

Prattle.prototype.expression = function( rbp ) {
    var left,
        token = this.token,
        t = token;

    this.advance();
    left = t.parseRight();
    while (rbp < token.lbp ) {
        t = token;
        this.advance();
        left = t.parseLeft(left);
    }
    return left;
};

Prattle.prototype.newScope = function() {
    var s = this.scope;
    this.scope = Object.create( this.scope );
    this.scope.symbol_table = this.symbol_table;
    this.scope.def = {};
    this.scope.parent = s;
    return this.scope;
};

Prattle.prototype.infix = function( id, bp, parseLeft ) {
    var s = this.symbol(id, bp);
    s.parseLeft = parseLeft || function( left ) {
        this.first = left;
        this.second = this.expression(bp);
        this.arity = 'binary';
        return this;
    };
    return s;
};

Prattle.prototype.infixr = function (id, bp, led) {
    var s = symbol(id, bp);
    s.led = led || function (left) {
        this.first = left;
        this.second = this.expression(bp - 1);
        this.arity = 'binary';
        return this;
    };
    return s;
};

Prattle.prototype.prefix = function (id, nud) {
    var s = symbol(id);
    s.nud = nud || function () {
        this.scope.reserve(this);
        this.first = this.expression(70);
        this.arity = 'unary';
        return this;
    };
    return s;
};

Prattle.prototype.assignment = function (id) {
    return this.infixr(id, 10, function (left) {
        if (left.id !== "." && left.id !== "[" &&
                left.arity !== "name") {
            left.error("Bad lvalue.");
        }
        this.first = left;
        this.second = this.expression(9);
        this.assignment = true;
        this.arity = 'binary';
        return this;
    });
};

Prattle.prototype.constant = function (s, v) {
    var x = symbol(s);
    x.nud = function () {
        this.scope.reserve(this);
        this.value = this.symbol_table[this.id].value;
        this.arity = "literal";
        return this;
    };
    x.value = v;
    return x;
};

Prattle.prototype.statement = function () {
    var n = this.token, v;
    if (n.std) {
        this.advance();
        this.scope.reserve(n);
        return n.std();
    }
    v = this.expression(0);
    if (!v.assignment && v.id !== "(") {
        v.error("Bad expression statement.");
    }
    this.advance(";");
    return v;
};

Prattle.prototype.statements = function () {
    var a = [], s;
    while (true) {
        if (this.token.id === "}" || this.token.id === "(end)") {
            break;
        }
        s = this.statement();
        if (s) {
            a.push(s);
        }
    }
    return a.length === 0 ? null : a.length === 1 ? a[0] : a;
};

Prattle.prototype.stmt = function (s, f) {
    var x = symbol(s);
    x.std = f;
    return x;
};

Prattle.prototype.block = function () {
    var t = this.token;
    this.advance("{");
    return t.std();
};


}());
