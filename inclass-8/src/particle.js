const random = (min=0, max=800) =>
    Math.random() * (max - min) + min

// default values
const particle = ({
    mass=random(5, 30),
    position=[random(), random()],
    velocity=[random(-0.1, 0.1), random(-0.1, 0.1)],
    acceleration=[0, 0]
} = {}) => {
    return {acceleration, velocity, position, mass}
}

const update = ({acceleration, velocity, position, mass}, delta, canvas) => {
    position = position.map(function (dimension, index) {
        //apply velocity changes
        return dimension + (delta  * velocity[index])
    })
    const updated_particle = particle({
        acceleration,
        position,
        velocity,
        mass
    })
    return updated_particle
}

export default particle

export { update }
