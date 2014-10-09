var glsl = new Prattle();

glsl.symbol(':');
glsl.symbol(';');
glsl.symbol(',');
glsl.symbol(')');
glsl.symbol(']');
glsl.symbol('}');
glsl.symbol('else');

glsl.symbol('(end)');
glsl.symbol('(name)');

glsl.infix('+', 50);
glsl.infix('-', 50);
glsl.infix('*', 60);
glsl.infix('/', 60);

glsl.infix('===', 40);
glsl.infix('!==', 40);
glsl.infix('<', 40);
glsl.infix('<=', 40);
glsl.infix('>', 40);
glsl.infix('>=', 40);

glsl.infix('?', 20, function( left ) {
    this.first = left;
    this.second = glsl.expression(0);
    this.advance(':');
    this.third = glsl.expression(0);
    this.arity = 'ternary';
    return this;
});

glsl.infix('.', 80, function( left ) {
    this.first = left;
    if (this.token.arity !== 'name') {
        this.token.error('Expected a property name.');
    }
    this.token.arity = 'literal';
    this.second = this.token;
    this.arity = 'binary';
    this.advance();
    return this;
});

glsl.infix('[', 80, function (left) {
    this.first = left;
    this.second = glsl.expression(0);
    this.arity = 'binary';
    this.advance(']');
    return this;
});

glsl.infixr('&&', 30);
glsl.infixr('||', 30);

glsl.prefix('-');
glsl.prefix('!');
glsl.prefix('typeof');

glsl.prefix('(', function () {
    var e = glsl.expression(0);
    this.advance(')');
    return e;
});

glsl.assignment('=');
glsl.assignment('+=');
glsl.assignment('-=');

glsl.constant('true', true);
glsl.constant('false', false);
glsl.constant('null', null);
glsl.constant('pi', 3.141592653589793);

glsl.symbol('(literal)').nud = Prattle.itself;

glsl.stmt('{', function () {
    this.newScope();
    var a = this.statements();
    this.advance('}');
    this.scope = this.scope.pop();
    return a;
});

glsl.stmt('var', function () {
    var a = [], n, t;
    while (true) {
        n = this.token;
        if (n.arity !== 'name') {
            n.error('Expected a new variable name.');
        }
        this.scope.define(n);
        this.advance();
        if (this.token.id === '=') {
            t = this.token;
            this.advance('=');
            t.first = n;
            t.second = this.expression(0);
            t.arity = 'binary';
            a.push(t);
        }
        if (this.token.id !== ',') {
            break;
        }
        this.advance(',');
    }
    this.advance(';');
    return a.length === 0 ? null : a.length === 1 ? a[0] : a;
});

stmt("while", function () {
    advance("(");
    this.first = expression(0);
    advance(")");
    this.second = block();
    this.arity = "statement";
    return this;
});

stmt("if", function () {
    advance("(");
    this.first = expression(0);
    advance(")");
    this.second = block();
    if (token.id === "else") {
        scope.reserve(token);
        advance("else");
        this.third = token.id === "if" ? statement() : block();
    } else {
        this.third = null;
    }
    this.arity = "statement";
    return this;
});

stmt("break", function () {
    advance(";");
    if (token.id !== "}") {
        token.error("Unreachable statement.");
    }
    this.arity = "statement";
    return this;
});

stmt("return", function () {
    if (token.id !== ";") {
        this.first = expression(0);
    }
    advance(";");
    if (token.id !== "}") {
        token.error("Unreachable statement.");
    }
    this.arity = "statement";
    return this;
});

prefix("function", function () {
    var a = [];
    new_scope();
    if (token.arity === "name") {
        scope.define(token);
        this.name = token.value;
        advance();
    }
    advance("(");
    if (token.id !== ")") {
        while (true) {
            if (token.arity !== "name") {
                token.error("Expected a parameter name.");
            }
            scope.define(token);
            a.push(token);
            advance();
            if (token.id !== ",") {
                break;
            }
            advance(",");
        }
    }
    this.first = a;
    advance(")");
    advance("{");
    this.second = statements();
    advance("}");
    this.arity = "function";
    scope.pop();
    return this;
});

infix("(", 80, function (left) {
    var a = [];
    if (left.id === "." || left.id === "[") {
        this.arity = "ternary";
        this.first = left.first;
        this.second = left.second;
        this.third = a;
    } else {
        this.arity = "binary";
        this.first = left;
        this.second = a;
        if ((left.arity !== "unary" || left.id !== "function") &&
                left.arity !== "name" && left.id !== "(" &&
                left.id !== "&&" && left.id !== "||" && left.id !== "?") {
            left.error("Expected a variable name.");
        }
    }
    if (token.id !== ")") {
        while (true)  {
            a.push(expression(0));
            if (token.id !== ",") {
                break;
            }
            advance(",");
        }
    }
    advance(")");
    return this;
});
