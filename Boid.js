class Boid {
    /// constructor
    constructor(args) {
        this.w = 1080;
        this.acc = args.acc || createVector(0, 0);
        this.vec = args.vec || createVector(random(-1, 1), random(-1, 1));
        this.pos = args.pos || createVector(random(this.w), random(this.w));
        this.r = args.r || 4.0;
        this.maxSpeed = 3 || args.maxSpeed;
        this.maxForce = 0.05 || args.maxForce;
        this.minR = 400 || args.minR;
        this.R = args.R || this.minR;
        this.desiredseparation = args.desiredseparation || 20;
        this.clr = args.clr || color(0, 0, 0);
    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
    }

    applyForce(force) {
        this.acc.add(force);
    }

    flock(boids) {
        let sep = this.separate(boids); // Separation
        let ali = this.align(boids); // Alignment
        let coh = this.cohesion(boids); // Cohesion
        // Arbitrarily weight these forces
        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);
        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    update() {
        // Update velocity
        this.vec.add(this.acc);
        // Limit speed
        this.vec.limit(this.maxSpeed);
        this.pos.add(this.vec);
        // Reset accelertion to 0 each cycle
        this.acc.mult(0);
        this.R = lerp(this.R, this.minR, 0.01);
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.pos); // A vector pointing from the location to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.mult(this.maxSpeed);
        // Steering = Desired minus Velocity
        let steer = p5.Vector.sub(desired, this.vec);
        steer.limit(this.maxForce); // Limit to maximum steering force
        return steer;
    }

    render() {

        push();
        let phi = this.pos.x / this.w * TWO_PI;
        let theta = this.pos.y / this.w * TWO_PI;
        let x = this.R * cos(theta) * sin(phi);
        let y = this.R * sin(theta) * sin(phi);
        let z = this.R * cos(phi);
        translate(x, y, z);
        noStroke();
        fill(this.clr);
        sphere(lerp(this.r, this.r * 5, (this.R - this.minR) / 300));
        pop();
    }

    borders() {
        if (this.pos.x < 0) this.pos.x = this.w + 0;
        if (this.pos.y < 0) this.pos.y = this.w + 0;
        if (this.pos.x > this.w + 0) this.pos.x = 0;
        if (this.pos.y > this.w + 0) this.pos.y = 0;
    }

    separate(boids) {

        let steer = createVector(0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.pos, boids[i].pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < this.desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.pos, boids[i].pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.vec);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    align(boids) {
        let neighbordist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.pos, boids[i].pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].vec);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.vec);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    cohesion(boids) {
        let neighbordist = 50;
        let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.pos, boids[i].pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].pos); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum); // Steer towards the location
        } else {
            return createVector(0, 0);
        }
    }


}