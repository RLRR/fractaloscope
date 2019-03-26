import { Scope } from '../Scope';
import { Vec2 } from '../vec2';

export class MouseDrag {
    private scope: Scope;

    private mouseDownCenter: Vec2;
    private mouseDownPoint: Vec2;

    constructor(scope: Scope) {
        this.scope = scope;

        this.mouseDownCenter = new Vec2(0, 0);
        this.mouseDownPoint = new Vec2(0, 0);

        this.scope.getContainer().addEventListener('mousedown', this.onMouseDown);
    }

    private onMouseDown = (e: MouseEvent): void => {
        e.preventDefault();

        if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
            this.mouseDownCenter = this.scope.getCenter();
            this.mouseDownPoint = new Vec2(e.clientX, e.clientY);

            this.scope.getContainer().classList.add('dragging');

            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        }
    }

    private onMouseUp = (e: MouseEvent): void => {
        e.preventDefault();

        this.scope.getContainer().classList.remove('dragging');

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    private onMouseMove = (e: MouseEvent): void => {
        e.preventDefault();

        const startPoint = this.scope.unproject(this.mouseDownPoint);
        const point = this.scope.unproject(new Vec2(e.clientX, e.clientY));

        const newCenter = this.mouseDownCenter.sub(point).add(startPoint);

        this.scope.setCenter(newCenter);
        this.scope.fire('drag');
    }
}
