import { Scope } from '../Scope';
import { Vec2 } from '../vec2';
import { getDistance, getMidpoint, fingersAreTooClose } from '../utils';

export class TouchZoom {
    private scope: Scope;

    private touchStartZoom: number;
    private touchStartPoints: [Vec2, Vec2];

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

    private startStop(e: TouchEvent): void {
        if (this.canRun(e) && !this.isActive) {
            this.touchStartPoints = [
                new Vec2(e.touches[0].clientX, e.touches[0].clientY),
                new Vec2(e.touches[1].clientX, e.touches[1].clientY),
            ];

            this.touchStartZoom = this.scope.getZoom();

            this.isActive = true;
        } else if (!this.canRun(e) && this.isActive) {
            this.isActive = false;
        }
    }

    private handle = (e: TouchEvent): void => {
        e.preventDefault();

        this.startStop(e);

        if (!this.isActive) {
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

    private canRun(e: TouchEvent): boolean {
        return e.touches.length === 2 && !fingersAreTooClose(e);
    }
}
