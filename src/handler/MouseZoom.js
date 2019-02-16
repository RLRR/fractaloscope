var Vec2 = require('../Vec2');

class MouseZoom {
    constructor(scope) {
        this._scope = scope;

        this._onWheel = this._onWheel.bind(this);

        this._scope
            .getContainer()
            .addEventListener('wheel', this._onWheel);
    }

    _onWheel(e) {
        var delta = -e.deltaY;

        var zoomPoint = new Vec2(e.clientX, e.clientY);

        var pointBeforeZoom = this._scope.unproject(zoomPoint);
        this._scope.setZoom(this._scope.getZoom() + delta / 100);
        var pointAfterZoom = this._scope.unproject(zoomPoint);

        var newCenter = this._scope.getCenter()
            .add(pointBeforeZoom)
            .sub(pointAfterZoom);

        this._scope.setCenter(newCenter);

        console.log(this._scope.getZoom());
    }
}

module.exports = MouseZoom;
