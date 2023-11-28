class Flock {
    /// constructor
    constructor(args) {
        this.boids = [];
        this.maxLength = args.maxLength || 80;
    }

    /// method
    run() {
        this.boids.forEach(b => {
            b.run(this.boids);
        })

        this.boids.splice(0, this.boids.length - this.maxLength);
    }

    addBoid(b) {
        this.boids.push(b);
    }
}