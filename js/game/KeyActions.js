(function() {

Bub.KeyActions = {
    right: {
        keys: ['right', 'd']
    },
    left: {
        keys: ['left', 'a']
    },
    up: {
        keys: ['up', 'w']
    },
    down: {
        keys: ['down', 's']
    },
    pauseToggle: {
        keys: ['space', 'p', 'esc'],
        once: true
    }
};

// Testing stuff
_.extend( Bub.KeyActions, {
    action: {
        once: true,
        keys: ['x']
    },
    birth: {
        once: true,
        keys: ['b']
    },
    powerup: {
        once: true,
        keys: ['p']
    },
    levelAdvance: {
        once: true,
        keys: ['l']
    }
});

}());
