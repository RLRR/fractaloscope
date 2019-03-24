import { fingersAreTooClose, getMidpoint, getTouchPoints } from '../utils';
import { Scope } from '../Scope';
import { Vec2 } from '../vec2';

export class TouchDrag {
    private scope: Scope;

    private touchStartCenter: Vec2;
    private touchStartPoint: Vec2;

    private isActive: boolean;

    constructor(scope: Scope) {
        this.scope = scope;

        this.touchStartCenter = new Vec2(0, 0);
        this.touchStartPoint = new Vec2(0, 0);

        this.isActive = false;

        this.scope.getContainer().addEventListener('touchstart', this.handle);
        this.scope.getContainer().addEventListener('touchend', this.handle);
        this.scope.getContainer().addEventListener('touchmove', this.handle);
    }

    private startStop(e: TouchEvent): void {
        if (this.canRun(e) && !this.isActive) {
            this.touchStartCenter = this.scope.getCenter();
            this.touchStartPoint = this.getTouchPoint(e);

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

        const startPoint = this.scope.unproject(this.touchStartPoint);
        const point = this.scope.unproject(this.getTouchPoint(e));

        const newCenter = this.touchStartCenter.sub(point).add(startPoint);

        this.scope.setCenter(newCenter);
    }

    private canRun(e: TouchEvent): boolean {
        return e.touches.length === 1 || fingersAreTooClose(e);
    }

    private getTouchPoint(e: TouchEvent): Vec2 {
        if (e.touches.length === 1) {
            return new Vec2(e.touches[0].clientX, e.touches[0].clientY);
        }

        return getMidpoint(getTouchPoints(e));
    }
}
