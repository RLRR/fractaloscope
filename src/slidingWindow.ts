export class SlidingWindow {
    private size: number;
    private values: number[];

    constructor(size: number) {
        this.size = size;
        this.values = [];
    }

    public push(value: number): void {
        this.values.push(value);

        if (this.values.length > this.size) {
            this.values.shift();
        }
    }

    public getMean(): number {
        return this.values.reduce((sum, element) => sum + element) / this.values.length;
    }
}
