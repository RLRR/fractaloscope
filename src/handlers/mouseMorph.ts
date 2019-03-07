import { Scope } from '../Scope';
import { Vec2 } from '../vec2';
import { morphSpeed } from '../constants';

export class MouseMorph {
    private scope: Scope;

    private mouseDownSeed: Vec2;
    private mouseDownPoint: Vec2;

    constructor(scope: Scope) {
        this.scope = scope;

        this.mouseDownSeed = new Vec2(0, 0);
        this.mouseDownPoint = new Vec2(0, 0);

        this.scope.getContainer().addEventListener('mousedown', this.onMouseDown);
        this.scope.getContainer().addEventListener('contextmenu', e => e.preventDefault());
    }

    private onMouseDown = (e: MouseEvent): void => {
        e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.button === 0 || e.button === 1 || e.button === 2) {
            this.mouseDownSeed = this.scope.getSeed();
            this.mouseDownPoint = new Vec2(e.clientX, e.clientY);

            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        }
    }

    private onMouseUp = (e: MouseEvent): void => {
        e.preventDefault();

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    private onMouseMove = (e: MouseEvent): void => {
        e.preventDefault();

        const startPoint = this.scope.unproject(this.mouseDownPoint);
        const point = this.scope.unproject(new Vec2(e.clientX, e.clientY));

        const delta = point.sub(startPoint).mul(morphSpeed);

        const newSeed = this.mouseDownSeed.add(delta)

        this.scope.setSeed(newSeed);
    }
}
