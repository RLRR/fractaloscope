import { Scope } from '../Scope';
import { Vec2 } from '../vec2';
import {
    touchpadScrollZoomSpeed,
    macFirefoxMouseZoomSpeed,
    touchpadGestureZoomSpeed,
    minX, maxX,
    minY, maxY,
    minZoom, maxZoom,
} from '../constants';
import { clamp } from '../utils';

export class MouseZoom {
    private scope: Scope;

    constructor(scope: Scope) {
        this.scope = scope;
        this.scope.getContainer().addEventListener('wheel', this.onWheel);
    }

    private onWheel = (e: MouseWheelEvent): void => {
        e.preventDefault();

        const zoomPoint = new Vec2(e.clientX, e.clientY);
        const pointBeforeZoom = this.scope.unproject(zoomPoint);
        this.scope.setZoom(clamp(this.scope.getZoom() + this.getDelta(e), minZoom, maxZoom));
        const pointAfterZoom = this.scope.unproject(zoomPoint);

        const newCenter = this.scope.getCenter()
            .add(pointBeforeZoom)
            .sub(pointAfterZoom)
            .clamp(minX, maxX, minY, maxY);

        this.scope.setCenter(newCenter);
    }

    private getDelta(e: MouseWheelEvent): number {
        if (e.ctrlKey) {
            return -e.deltaY * touchpadGestureZoomSpeed;
        }

        if (e.deltaMode === 1) {
            return -e.deltaY * macFirefoxMouseZoomSpeed;
        }

        return -e.deltaY * touchpadScrollZoomSpeed;
    }
}
