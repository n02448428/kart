function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
export var AudioManager = /*#__PURE__*/ function() {
    "use strict";
    function AudioManager(game) {
        _class_call_check(this, AudioManager);
        this.game = game;
        this.sounds = {};
    }
    _create_class(AudioManager, [
        {
            // Placeholder for audio implementation
            // Using a minimal implementation to save on code space
            key: "playSound",
            value: function playSound(name) {
                console.log("Sound played: ".concat(name));
            }
        }
    ]);
    return AudioManager;
}();
