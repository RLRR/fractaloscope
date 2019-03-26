import { Vec2 } from '../vec2';
import { Scope } from '../Scope';
import { morphSpeed } from '../constants';
import { getMidpoint, fingersAreTooClose, getTouchPoints, isZoomGesture } from '../utils';

export class TouchMorph {
    private scope: Scope;

    private touchStartSeed: Vec2;
    private touchStartPoint: Vec2;

    private prevTouchPoints?: [Vec2, Vec2];

    private isActive: boolean;

    constructor(scope: Scope) {
        this.scope = scope;

        this.touchStartPoint = new Vec2(0, 0);
        this.touchStartSeed = new Vec2(0, 0);

        this.isActive = false;

        this.scope.getContainer().addEventListener('touchstart', this.handle);
        this.scope.getContainer().addEventListener('touchend', this.handle);
        this.scope.getContainer().addEventListener('touchmove', this.handle);
    }

    private startOrStop(e: TouchEvent): void {
        const touchPoints = e.touches.length === 2
            ? getTouchPoints(e)
            : undefined;

        const isMorph = this.prevTouchPoints === undefined
            || touchPoints === undefined
            || !isZoomGesture(this.prevTouchPoints, touchPoints);

        if (this.canRun(e) && isMorph && !this.isActive) {
            this.touchStartSeed = this.scope.getSeed();
            this.touchStartPoint = getMidpoint(getTouchPoints(e));

            this.isActive = true;
        } else if ((!this.canRun(e) || !isMorph) && this.isActive) {
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

        const startPoint = this.scope.unproject(this.touchStartPoint);
        const point = this.scope.unproject(getMidpoint(getTouchPoints(e)));

        const delta = point.sub(startPoint).mul(morphSpeed);
        const newSeed = this.touchStartSeed.add(delta);

        this.scope.setSeed(newSeed);
        this.scope.fire('morph');
    }

    private canRun(e: TouchEvent): boolean {
        return e.touches.length === 2 && !fingersAreTooClose(e);
    }
}
