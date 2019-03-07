import { Scope } from '../Scope';
import { Vec2 } from '../vec2';
import { getDistance, getMidpoint } from '../utils';

export class TouchZoom {
    private scope: Scope;

    private touchStartZoom: number;
    private touchStartPoints: [Vec2, Vec2];

    constructor(scope: Scope) {
        this.scope = scope;

        this.touchStartPoints = [new Vec2(0, 0), new Vec2(0, 0)];
        this.touchStartZoom = 0;

        this.scope.getContainer().addEventListener('touchstart', this.onTouchStart);
    }

    private onTouchStart = (e: TouchEvent): void => {
        e.preventDefault();

        if (e.touches.length !== 2) {
            return;
        }

        this.touchStartPoints = [
            new Vec2(e.touches[0].clientX, e.touches[0].clientY),
            new Vec2(e.touches[1].clientX, e.touches[1].clientY),
        ];

        this.touchStartZoom = this.scope.getZoom();

        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);
    }

    private onTouchEnd = (e: TouchEvent): void => {
        e.preventDefault();

        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    }

    private onTouchMove = (e: TouchEvent): void => {
        e.preventDefault();

        if (e.touches.length !== 2) {
            return;
        }

        const touchMovePoints: [Vec2, Vec2] = [
            new Vec2(e.touches[0].clientX, e.touches[0].clientY),
            new Vec2(e.touches[1].clientX, e.touches[1].clientY),
        ];

        const startDistance = getDistance(this.touchStartPoints);
        const currentDistance = getDistance(touchMovePoints);
        const zoomDelta = Math.log(currentDistance / startDistance) / Math.log(2);

        const midpoint = getMidpoint(touchMovePoints);

        const midpointBeforeZoom = this.scope.unproject(midpoint);
        this.scope.setZoom(this.touchStartZoom + zoomDelta);
        const midpointAfterZoom = this.scope.unproject(midpoint);

        this.scope.setCenter(this.scope.getCenter().add(midpointBeforeZoom).sub(midpointAfterZoom));
    }
}
