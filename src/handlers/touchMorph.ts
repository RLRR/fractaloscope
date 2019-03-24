import { Vec2 } from '../vec2';
import { Scope } from '../Scope';
import { morphSpeed } from '../constants';
import { getMidpoint, fingersAreTooClose } from '../utils';

export class TouchMorph {
    private scope: Scope;

    private touchStartSeed: Vec2;
    private touchStartPoint: Vec2;

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

    private startStop(e: TouchEvent): void {
        if (this.canRun(e) && !this.isActive) {
            this.touchStartSeed = this.scope.getSeed();
            this.touchStartPoint = getMidpoint([
                new Vec2(e.touches[0].clientX, e.touches[0].clientY),
                new Vec2(e.touches[1].clientX, e.touches[1].clientY),
            ]);

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
        const point = this.scope.unproject(getMidpoint([
            new Vec2(e.touches[0].clientX, e.touches[0].clientY),
            new Vec2(e.touches[1].clientX, e.touches[1].clientY),
        ]));

        const delta = point.sub(startPoint).mul(morphSpeed);
        const newSeed = this.touchStartSeed.add(delta);

        this.scope.setSeed(newSeed);
    }

    private canRun(e: TouchEvent): boolean {
        return e.touches.length === 2 && !fingersAreTooClose(e);
    }
}
