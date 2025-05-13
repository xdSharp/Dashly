import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface NeuralBackgroundProps {
  className?: string;
  darkMode?: boolean;
  density?: number;
  speed?: number;
  opacity?: number;
  color?: string;
  linesColor?: string;
  interactive?: boolean;
}

export function NeuralBackground({ 
  className, 
  darkMode = true, 
  density = 100, 
  speed = 1.2, 
  opacity = 0.35,
  color,
  linesColor,
  interactive = true
}: NeuralBackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  
  // Мемоизируем опции частиц, чтобы предотвратить постоянные перерисовки
  const particlesOptions = useMemo(() => {
    return {
      fullScreen: false,
      fpsLimit: 60, // Увеличиваем лимит FPS для более плавной анимации
      particles: {
        number: {
          value: density,
          density: {
            enable: true,
            value_area: 1000
          }
        },
        color: {
          value: color || (darkMode ? "#ffffff" : "#1e40af") // Более темный синий для светлой темы
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: darkMode ? opacity : opacity * 2, // Значительно повышаем непрозрачность в светлой теме
          random: true,
          anim: {
            enable: true,
            speed: 0.1, // Снижаем скорость анимации прозрачности
            opacity_min: darkMode ? 0.1 : 0.4, // Гораздо более заметный минимум для светлой темы
            sync: false
          }
        },
        size: {
          value: darkMode ? 3 : 4, // Увеличиваем размер частиц в светлой теме
          random: true,
          anim: {
            enable: true,
            speed: 1, // Скорость анимации размера
            size_min: darkMode ? 0.5 : 1, // Более заметный минимум для светлой темы
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: linesColor || (darkMode ? "#4f86d6" : "#3b82f6"), // Более яркий синий для линий в светлой теме
          opacity: darkMode ? opacity : opacity * 2.5, // Значительно повышаем непрозрачность линий в светлой теме
          width: darkMode ? 1 : 2 // Удваиваем толщину линий в светлой теме
        },
        move: {
          enable: true,
          speed: speed,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "window",
        events: {
          onhover: {
            enable: interactive,
            mode: "grab"
          },
          onclick: {
            enable: interactive,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 180,
            line_linked: {
              opacity: 0.8
            }
          },
          bubble: {
            distance: 400,
            size: 5,
            duration: 2,
            opacity: 0.8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: false, // Отключаем для оптимизации производительности
      background: {
        color: "transparent",
        image: "",
        position: "50% 50%",
        repeat: "no-repeat",
        size: "cover"
      }
    };
  }, [darkMode, density, speed, opacity, color, linesColor, interactive]);

  return (
    <Particles
      id="neural-particles"
      className={`fixed inset-0 z-0 pointer-events-auto ${className || ""}`}
      init={particlesInit}
      options={particlesOptions}
    />
  );
} 