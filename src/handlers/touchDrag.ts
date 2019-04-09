import { Scope } from '../scope';
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

        this.scope.getContainer().addEventListener('touchstart', this.onTouchStart);
        this.scope.getContainer().addEventListener('touchend', this.onTouchEnd);
        this.scope.getContainer().addEventListener('touchmove', this.onTouchMove);
    }

    private onTouchStart = (e: TouchEvent): void => {
        if (e.touches.length === 1) {
            this.start(e);
        } else {
            this.stop();
        }
    }

    private onTouchEnd = (): void => {
        this.stop();
    }

    private start(e: TouchEvent): void {
        if (!this.isActive) {
            const { clientX, clientY } = e.touches[0];
            this.touchStartCenter = this.scope.getCenter();
            this.touchStartPoint = new Vec2(clientX, clientY);

            this.isActive = true;
        }
    }

    private stop(): void {
        this.isActive = false;
    }

    private onTouchMove = (e: TouchEvent): void => {
        e.preventDefault();

        if (!this.isActive) {
            return;
        }

        const { clientX, clientY } = e.touches[0];
        const startPoint = this.scope.unproject(this.touchStartPoint);
        const point = this.scope.unproject(new Vec2(clientX, clientY));

        const newCenter = this.touchStartCenter.sub(point).add(startPoint);

        this.scope.setCenter(newCenter);
        this.scope.fire('drag');
    }
}
