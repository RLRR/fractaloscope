import { Scope } from '../scope';
import { Vec2 } from '../vec2';

export class GestureZoom {
    private scope: Scope;

    private gestureStartZoom: number;

    constructor(scope: Scope) {
        this.scope = scope;
        this.gestureStartZoom = 0;

        this.scope.getContainer().addEventListener('gesturestart', this.onGestureStart);
        this.scope.getContainer().addEventListener('gesturechange', this.onGestureChange);
        this.scope.getContainer().addEventListener('gestureend', this.onGestureEnd);
    }

    private onGestureStart = (e: GestureEvent): void => {
        e.preventDefault();
        this.gestureStartZoom = this.scope.getZoom();
    }

    private onGestureEnd = (e: GestureEvent): void => {
        e.preventDefault();
    }

    private onGestureChange = (e: GestureEvent): void => {
        e.preventDefault();

        const zoomDelta = e.scale > 1 ? e.scale - 1 : -1 / e.scale + 1;
        const zoomPoint = new Vec2(e.clientX, e.clientY);

        const pointBeforeZoom = this.scope.unproject(zoomPoint);
        this.scope.setZoom(this.gestureStartZoom + zoomDelta);
        const pointAfterZoom = this.scope.unproject(zoomPoint);

        const newCenter = this.scope.getCenter().add(pointBeforeZoom).sub(pointAfterZoom);
        this.scope.setCenter(newCenter);
        this.scope.fire('zoom');
    }
}

declare global {
    interface GestureEvent extends MouseEvent {
        scale: number;
        rotation: number;
    }

    interface HTMLElementEventMap {
        gesturestart: GestureEvent;
        gestureend: GestureEvent;
        gesturechange: GestureEvent;
    }
}
