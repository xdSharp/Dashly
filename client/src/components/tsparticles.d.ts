// Это файл объявления типов для tsparticles, который предотвращает ненужные перерисовки

import { Container, Engine, ISourceOptions } from "tsparticles-engine";

declare module "react-tsparticles" {
  export interface IParticlesProps {
    id?: string;
    width?: string;
    height?: string;
    options?: ISourceOptions;
    url?: string;
    params?: ISourceOptions;
    style?: React.CSSProperties;
    className?: string;
    canvasClassName?: string;
    container?: React.RefObject<Container>;
    init?: (engine: Engine) => Promise<void>;
    loaded?: (container: Container) => Promise<void>;
  }

  // Экспортируем компонент Particles с улучшенной производительностью
  export default function Particles(props: IParticlesProps): JSX.Element;
}

declare module "tsparticles-slim" {
  export function loadSlim(engine: Engine): Promise<void>;
} 