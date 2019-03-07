import { Scope } from '../Scope';
import { Vec2 } from '../vec2';

export class TouchDrag {
    private scope: Scope;

    private touchStartCenter: Vec2;
    private touchStartPoint: Vec2;

    constructor(scope: Scope) {
        this.scope = scope;

        this.touchStartCenter = new Vec2(0, 0);
        this.touchStartPoint = new Vec2(0, 0);

        this.scope.getContainer().addEventListener('touchstart', this.onTouchStart);
    }

    private onTouchStart = (e: TouchEvent): void => {
        e.preventDefault();

        if (e.touches.length !== 1) {
            return;
        }

        this.touchStartCenter = this.scope.getCenter();
        this.touchStartPoint = new Vec2(e.touches[0].clientX, e.touches[0].clientY);

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

        if (e.touches.length !== 1) {
            return;
        }

        const startPoint = this.scope.unproject(this.touchStartPoint);
        const point = this.scope.unproject(new Vec2(e.touches[0].clientX, e.touches[0].clientY));

        const newCenter = this.touchStartCenter.sub(point).add(startPoint);

        this.scope.setCenter(newCenter);
    }
}
