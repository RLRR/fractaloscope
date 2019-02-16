var Vec2 = require('../Vec2');

class MouseInteraction {
    constructor(scope) {
        this._scope = scope;

        this._onMouseDown = this._onMouseDown.bind(this);
        this._disregard = this._disregard.bind(this);
        this._startInteraction = this._startInteraction.bind(this);
        this._stopInteracion = this._stopInteracion.bind(this);
        this._interact = this._interact.bind(this);

        this._startListening();
    }

    _startListening() {
        console.log('_startListening called');
        this._scope.getContainer().addEventListener('mousedown', this._onMouseDown);
    }

    _stopListening() {
        console.log('_stopListening called');
        this._scope.getContainer().removeEventListener('mousedown', this._onMouseDown);
    }

    _onMouseDown() {
        this._stopListening();

        document.addEventListener('mousemove', this._disregard);
        document.addEventListener('mouseup', this._startInteraction);
    }

    _disregard() {
        document.removeEventListener('mousemove', this._disregard);
        document.removeEventListener('mouseup', this._startInteraction);

        this._startListening();
    }

    _startInteraction(e) {
        console.log('_startInteraction called');
        document.removeEventListener('mousemove', this._disregard);
        document.removeEventListener('mouseup', this._startInteraction);

        document.addEventListener('mousemove', this._interact);
        document.addEventListener('mousedown', this._stopInteracion);

        this._startSeed = this._scope.getSeed();
        this._startPoint = new Vec2(e.clientX, e.clientY);
    }

    _stopInteracion() {
        console.log('_stopInteracion called');
        document.removeEventListener('mousemove', this._interact);
        document.removeEventListener('mousedown', this._stopInteracion);

        this._startListening();
    }

    _interact(e) {
        var startPoint = this._scope.unprojectSeed(this._startPoint);
        var point = this._scope.unprojectSeed(new Vec2(e.clientX, e.clientY));

        var newSeed = this._scope.getSeedCenter().sub(point).add(startPoint);

        this._startPoint = new Vec2(e.clientX, e.clientY);

        this._scope.setSeedCenter(newSeed)
    }
}

module.exports = MouseInteraction;
