// src/utils/particles.js
import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';

const CustomParticles = React.memo(() => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
            // No custom plugins or shapes needed
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = (container) => {
        console.log('Particles loaded:', container);
    }

    const options = useMemo(
        () => ({
            background: {
                color: {
                    value: "#0d47a1", // Dark blue background
                },
            },
            fpsLimit: 60, // Balanced FPS for performance
            interactivity: {
                events: {
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                    onHover: {
                        enable: true,
                        mode: "repulse",
                    },
                    resize: true,
                },
                modes: {
                    push: {
                        quantity: 4,
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4,
                    },
                },
            },
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        area: 800,
                    },
                },
                color: {
                    value: ["#ff0000", "#ffffff", "#ffeb3b"], // Red, White, Yellow (Pokéball and Pikachu colors)
                },
                shape: {
                    type: ["circle", "triangle", "star"], // Multiple shapes for variety
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.5,
                        opacity_min: 0.3,
                        sync: false,
                    },
                },
                size: {
                    value: { min: 3, max: 7 },
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        size_min: 3,
                        sync: false,
                    },
                },
                links: {
                    enable: true,
                    distance: 120,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "bounce",
                    },
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200,
                    },
                },
            },
            detectRetina: true,
        }),
        [],
    );

    return init ? (
        <Particles
            id='tsparticles'
            loaded={particlesLoaded}
            options={options}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
            }}
        />
    ) : null;
});

export default CustomParticles;
