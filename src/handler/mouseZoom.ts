import { Scope } from '../Scope';
import { Vec2 } from '../vec2';

export class MouseZoom {
    private scope: Scope;

    constructor(scope: Scope) {
        this.scope = scope;

        this.onWheel = this.onWheel.bind(this);

        this.scope.getContainer()
            .addEventListener('wheel', this.onWheel);
    }

    private onWheel(e: MouseWheelEvent): void {
        const delta = -e.deltaY;
        const zoomPoint = new Vec2(e.clientX, e.clientY);

        const pointBeforeZoom = this.scope.unproject(zoomPoint);
        this.scope.setZoom(this.scope.getZoom() + delta / 100);
        const pointAfterZoom = this.scope.unproject(zoomPoint);

        const newCenter = this.scope.getCenter()
            .add(pointBeforeZoom)
            .sub(pointAfterZoom);

        this.scope.setCenter(newCenter);
    }
}
