import { Scope } from '../scope';
import { Vec2 } from '../vec2';
import { minFingerDistance } from '../constants';
import { getDistance, getMidpoint, getTouchPoints, isZoomGesture } from '../utils';

export class TouchZoom {
    private scope: Scope;

    private touchStartZoom: number;
    private touchStartPoints: [Vec2, Vec2];

    private prevTouchPoints?: [Vec2, Vec2];

    private isActive: boolean;

    constructor(scope: Scope) {
        this.scope = scope;

        this.touchStartPoints = [new Vec2(0, 0), new Vec2(0, 0)];
        this.touchStartZoom = 0;

        this.isActive = false;

        this.scope.getContainer().addEventListener('touchstart', this.handle);
        this.scope.getContainer().addEventListener('touchend', this.handle);
        this.scope.getContainer().addEventListener('touchmove', this.handle);
    }

    private startOrStop(e: TouchEvent): void {
        const touchPoints = e.touches.length === 2
            ? getTouchPoints(e)
            : undefined;

        const isZoom = this.prevTouchPoints === undefined
            || touchPoints === undefined
            || isZoomGesture(this.prevTouchPoints, touchPoints);

        if (this.canRun(e) && isZoom && !this.isActive) {
            this.touchStartPoints = getTouchPoints(e);
            this.touchStartZoom = this.scope.getZoom();
            this.isActive = true;
        } else if ((!this.canRun(e) || !isZoom) && this.isActive) {
            this.isActive = false;
            this.prevTouchPoints = undefined;
        }

        this.prevTouchPoints = touchPoints;
    }

    private handle = (e: TouchEvent): void => {
        e.preventDefault();

        this.startOrStop(e);

        if (!this.isActive) {
            return;
        }

        const touchMovePoints: [Vec2, Vec2] = getTouchPoints(e);

        const startDistance = getDistance(this.touchStartPoints);
        const currentDistance = getDistance(touchMovePoints);
        const zoomDelta = Math.log(currentDistance / startDistance) / Math.log(2);

        const midpoint = getMidpoint(touchMovePoints);

        const midpointBeforeZoom = this.scope.unproject(midpoint);
        this.scope.setZoom(this.touchStartZoom + zoomDelta);
        const midpointAfterZoom = this.scope.unproject(midpoint);

        this.scope.setCenter(this.scope.getCenter().add(midpointBeforeZoom).sub(midpointAfterZoom));
        this.scope.fire('zoom');
    }

    private canRun(e: TouchEvent): boolean {
        if (e.touches.length !== 2) {
            return false;
        }

        const distance = getDistance([
            new Vec2(e.touches[0].clientX, e.touches[0].clientY),
            new Vec2(e.touches[1].clientX, e.touches[1].clientY),
        ]);

        return distance > minFingerDistance;
    }
}
