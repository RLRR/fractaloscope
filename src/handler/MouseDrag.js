var Vec2 = require('../Vec2');

class MouseDrag {
    constructor(scope) {
        this._scope = scope;

        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);

        this._scope
            .getContainer()
            .addEventListener('mousedown', this._onMouseDown);
    }

    _onMouseDown(e) {
        if (e.which !== 1) { return; }

        this._mouseDownCenter = this._scope.getCenter();
        this._mouseDownPoint = new Vec2(e.clientX, e.clientY);

        this._isDragging = true;

        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    }

    _onMouseUp(e) {
        if (e.which !== 1) { return; }

        this._isDragging = false;

        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
    }

    _onMouseMove(e) {
        var startPoint = this._scope.unproject(this._mouseDownPoint);
        var point = this._scope.unproject(new Vec2(e.clientX, e.clientY));

        var newCenter = this._mouseDownCenter.sub(point).add(startPoint); 

        this._scope.setCenter(newCenter);
    }
}

module.exports = MouseDrag;