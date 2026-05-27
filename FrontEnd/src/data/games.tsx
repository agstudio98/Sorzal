import { 
  Rocket, Hexagon, Sword, Ghost, Shield, Activity,
  Gamepad2, Zap, Target, Cpu, Dna, Boxes, 
  Orbit, Compass, Layers, Wind, Flame, Droplets,
  Cloud, Sun, Moon, Star, Heart, Zap as Flash,
  Bot, Binary, Code, Terminal, Box, Circle,
  Square, Triangle, Diamond, Share2, Maximize,
  X, Send, Trophy, Medal, MessageCircle
} from 'lucide-react';
import React from 'react';

export interface Game {
  id: string;
  title: string;
  category: 'Arcade' | 'Puzzle' | 'Acción' | 'Retro' | 'Estrategia' | 'Ritmo' | 'Todos';
  rating: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  path: string;
  bg: string;
  controls: {
    act: string;
    mov: string;
  };
}

export const GAMES_DATA: Game[] = [
  { 
    id: 'nebula', 
    title: 'NEBULA RUNNER', 
    category: 'Arcade', 
    rating: '4.9', 
    icon: <Rocket size={80} />, 
    color: 'text-blue-400', 
    description: 'Navega a través de campos de asteroides en esta carrera infinita por el cosmos.',
    path: '/games/nebula-runner/index.html',
    bg: 'from-blue-900/20 to-black',
    controls: { act: 'Evitar Asteroides', mov: 'Mouse Y (Seguir)' }
  },
  { 
    id: 'quantum', 
    title: 'QUANTUM HEX', 
    category: 'Puzzle', 
    rating: '4.7', 
    icon: <Hexagon size={80} />, 
    color: 'text-emerald-400', 
    description: 'Manipula la materia a nivel subatómico para resolver complejos enigmas geométricos.',
    path: '/games/quantum-hex/index.html',
    bg: 'from-emerald-900/20 to-black',
    controls: { act: 'Click (Flip Atom)', mov: 'Lógica' }
  },
  { 
    id: 'cyber', 
    title: 'CYBER BLADE', 
    category: 'Acción', 
    rating: '4.8', 
    icon: <Sword size={80} />, 
    color: 'text-rose-400', 
    description: 'Combate en un mundo distópico dominado por inteligencias artificiales rebeldes.',
    path: '/games/cyber-blade/index.html',
    bg: 'from-rose-900/20 to-black',
    controls: { act: 'Espacio / Click', mov: 'Reflejos' }
  },
  { 
    id: 'void', 
    title: 'VOID SHIFT', 
    category: 'Retro', 
    rating: '4.5', 
    icon: <Ghost size={80} />, 
    color: 'text-purple-400', 
    description: 'Un viaje nostálgico a las profundidades de un vacío digital pixelado.',
    path: '/games/void-shift/index.html',
    bg: 'from-purple-900/20 to-black',
    controls: { act: 'Cambiar Color', mov: 'Reflejos' }
  },
  { 
    id: 'orbital', 
    title: 'ORBITAL DEFENSE', 
    category: 'Estrategia', 
    rating: '4.6', 
    icon: <Shield size={80} />, 
    color: 'text-amber-400', 
    description: 'Construye y protege estaciones espaciales contra oleadas de invasores estelares.',
    path: '/games/orbital-defense/index.html',
    bg: 'from-amber-900/20 to-black',
    controls: { act: 'Crear Escudo', mov: 'Click (Dirección)' }
  },
  { 
    id: 'pulse', 
    title: 'PULSE DASH', 
    category: 'Ritmo', 
    rating: '4.9', 
    icon: <Activity size={80} />, 
    color: 'text-sky-400', 
    description: 'Sincroniza tus reflejos con el latido binario del universo Sorzal.',
    path: '/games/pulse-dash/index.html',
    bg: 'from-sky-900/20 to-black',
    controls: { act: 'Sincronizar Pulso', mov: 'D, F, J, K' }
  },
  // New Games
  {
    id: 'stellar-jump',
    title: 'STELLAR JUMP',
    category: 'Arcade',
    rating: '4.5',
    icon: <Orbit size={80} />,
    color: 'text-yellow-400',
    description: 'Salta entre plataformas gravitatorias en el vacío estelar.',
    path: '/games/stellar-jump/index.html',
    bg: 'from-yellow-900/20 to-black',
    controls: { act: 'Saltar (Click)', mov: 'Mouse X' }
  },
  {
    id: 'neon-clicker',
    title: 'NEON CLICKER',
    category: 'Puzzle',
    rating: '4.2',
    icon: <Target size={80} />,
    color: 'text-cyan-400',
    description: 'Atrapa todos los nodos de neón antes de que desaparezcan.',
    path: '/games/neon-clicker/index.html',
    bg: 'from-cyan-900/20 to-black',
    controls: { act: 'Click (Atrapar)', mov: 'Reflejos' }
  },
  {
    id: 'cyber-dodge',
    title: 'CYBER DODGE',
    category: 'Acción',
    rating: '4.7',
    icon: <Zap size={80} />,
    color: 'text-lime-400',
    description: 'Esquiva los rayos láser en un entorno de realidad virtual.',
    path: '/games/cyber-dodge/index.html',
    bg: 'from-lime-900/20 to-black',
    controls: { act: 'Esquivar', mov: 'Teclas flechas' }
  },
  {
    id: 'pixel-dash',
    title: 'PIXEL DASH',
    category: 'Retro',
    rating: '4.4',
    icon: <Boxes size={80} />,
    color: 'text-orange-400',
    description: 'Una carrera frenética en un mundo de 8 bits.',
    path: '/games/pixel-dash/index.html',
    bg: 'from-orange-900/20 to-black',
    controls: { act: 'Saltar', mov: 'Barra Espaciadora' }
  },
  {
    id: 'alpha-tactics',
    title: 'ALPHA TACTICS',
    category: 'Estrategia',
    rating: '4.8',
    icon: <Cpu size={80} />,
    color: 'text-indigo-400',
    description: 'Comanda tus unidades en un campo de batalla digital.',
    path: '/games/alpha-tactics/index.html',
    bg: 'from-indigo-900/20 to-black',
    controls: { act: 'Comandar', mov: 'Mouse' }
  },
  {
    id: 'rhythm-flow',
    title: 'RHYTHM FLOW',
    category: 'Ritmo',
    rating: '4.6',
    icon: <Wind size={80} />,
    color: 'text-pink-400',
    description: 'Fluye con la música en este viaje psicodélico.',
    path: '/games/rhythm-flow/index.html',
    bg: 'from-pink-900/20 to-black',
    controls: { act: 'Flow', mov: 'A, S, D, F' }
  },
  {
    id: 'cosmic-blast',
    title: 'COSMIC BLAST',
    category: 'Arcade',
    rating: '4.3',
    icon: <Flame size={80} />,
    color: 'text-red-400',
    description: 'Destruye las amenazas cósmicas con tu cañón de plasma.',
    path: '/games/cosmic-blast/index.html',
    bg: 'from-red-900/20 to-black',
    controls: { act: 'Disparar', mov: 'Mouse' }
  },
  {
    id: 'gravity-shift',
    title: 'GRAVITY SHIFT',
    category: 'Puzzle',
    rating: '4.7',
    icon: <Compass size={80} />,
    color: 'text-teal-400',
    description: 'Invierte la gravedad para superar obstáculos imposibles.',
    path: '/games/gravity-shift/index.html',
    bg: 'from-teal-900/20 to-black',
    controls: { act: 'Invertir (Click)', mov: 'Gravedad' }
  },
  {
    id: 'bio-hazard',
    title: 'BIO HAZARD',
    category: 'Acción',
    rating: '4.5',
    icon: <Dna size={80} />,
    color: 'text-green-400',
    description: 'Limpia la zona infectada de patógenos digitales.',
    path: '/games/bio-hazard/index.html',
    bg: 'from-green-900/20 to-black',
    controls: { act: 'Desinfectar', mov: 'WASD' }
  },
  {
    id: 'deep-blue',
    title: 'DEEP BLUE',
    category: 'Retro',
    rating: '4.2',
    icon: <Droplets size={80} />,
    color: 'text-blue-500',
    description: 'Explora las profundidades de un océano pixelado.',
    path: '/games/deep-blue/index.html',
    bg: 'from-blue-900/20 to-black',
    controls: { act: 'Bucear', mov: 'Flechas' }
  },
  {
    id: 'data-storm',
    title: 'DATA STORM',
    category: 'Estrategia',
    rating: '4.9',
    icon: <Cloud size={80} />,
    color: 'text-white',
    description: 'Gestiona el flujo de datos durante una tormenta solar.',
    path: '/games/data-storm/index.html',
    bg: 'from-slate-900/20 to-black',
    controls: { act: 'Gestionar', mov: 'Mouse' }
  },
  {
    id: 'solar-flare',
    title: 'SOLAR FLARE',
    category: 'Ritmo',
    rating: '4.4',
    icon: <Sun size={80} />,
    color: 'text-orange-300',
    description: 'Cosecha energía de las llamaradas solares al ritmo de la música.',
    path: '/games/solar-flare/index.html',
    bg: 'from-orange-900/20 to-black',
    controls: { act: 'Cosechar', mov: 'Espacio' }
  },
  {
    id: 'lunar-base',
    title: 'LUNAR BASE',
    category: 'Arcade',
    rating: '4.6',
    icon: <Moon size={80} />,
    color: 'text-indigo-200',
    description: 'Defiende tu base lunar de asteroides errantes.',
    path: '/games/lunar-base/index.html',
    bg: 'from-indigo-900/20 to-black',
    controls: { act: 'Disparar', mov: 'Mouse' }
  },
  {
    id: 'star-hunter',
    title: 'STAR HUNTER',
    category: 'Puzzle',
    rating: '4.3',
    icon: <Star size={80} />,
    color: 'text-yellow-200',
    description: 'Recolecta estrellas perdidas en constelaciones lejanas.',
    path: '/games/star-hunter/index.html',
    bg: 'from-yellow-900/20 to-black',
    controls: { act: 'Recolectar', mov: 'Lógica' }
  },
  {
    id: 'heart-beat',
    title: 'HEART BEAT',
    category: 'Acción',
    rating: '4.8',
    icon: <Heart size={80} />,
    color: 'text-red-500',
    description: 'Mantén el ritmo vital en un mundo de máquinas.',
    path: '/games/heart-beat/index.html',
    bg: 'from-red-900/20 to-black',
    controls: { act: 'Bombear', mov: 'Click' }
  },
  {
    id: 'bot-war',
    title: 'BOT WAR',
    category: 'Retro',
    rating: '4.5',
    icon: <Bot size={80} />,
    color: 'text-slate-400',
    description: 'Batalla clásica entre robots en arenas de 8 bits.',
    path: '/games/bot-war/index.html',
    bg: 'from-slate-900/20 to-black',
    controls: { act: 'Atacar', mov: 'WASD' }
  },
  {
    id: 'binary-code',
    title: 'BINARY CODE',
    category: 'Estrategia',
    rating: '4.7',
    icon: <Binary size={80} />,
    color: 'text-emerald-500',
    description: 'Descifra el código binario para salvar la red.',
    path: '/games/binary-code/index.html',
    bg: 'from-emerald-900/20 to-black',
    controls: { act: 'Descifrar', mov: 'Teclado' }
  },
  {
    id: 'code-breaker',
    title: 'CODE BREAKER',
    category: 'Ritmo',
    rating: '4.2',
    icon: <Code size={80} />,
    color: 'text-violet-400',
    description: 'Rompe las barreras de seguridad al compás de los bits.',
    path: '/games/code-breaker/index.html',
    bg: 'from-violet-900/20 to-black',
    controls: { act: 'Hackear', mov: 'Ritmo' }
  },
  {
    id: 'terminal-dash',
    title: 'TERMINAL DASH',
    category: 'Arcade',
    rating: '4.6',
    icon: <Terminal size={80} />,
    color: 'text-green-500',
    description: 'Corre a través del sistema de archivos evitando sectores dañados.',
    path: '/games/terminal-dash/index.html',
    bg: 'from-green-900/20 to-black',
    controls: { act: 'Saltar', mov: 'Enter' }
  },
  {
    id: 'box-stacker',
    title: 'BOX STACKER',
    category: 'Puzzle',
    rating: '4.4',
    icon: <Box size={80} />,
    color: 'text-amber-600',
    description: 'Apila cajas de datos con precisión milimétrica.',
    path: '/games/box-stacker/index.html',
    bg: 'from-amber-900/20 to-black',
    controls: { act: 'Soltar', mov: 'Barra Espaciadora' }
  },
  {
    id: 'circle-survive',
    title: 'CIRCLE SURVIVE',
    category: 'Acción',
    rating: '4.9',
    icon: <Circle size={80} />,
    color: 'text-sky-300',
    description: 'Sobrevive dentro del círculo mientras todo colapsa.',
    path: '/games/circle-survive/index.html',
    bg: 'from-sky-900/20 to-black',
    controls: { act: 'Moverse', mov: 'Mouse' }
  },
  {
    id: 'square-clash',
    title: 'SQUARE CLASH',
    category: 'Retro',
    rating: '4.1',
    icon: <Square size={80} />,
    color: 'text-rose-300',
    description: 'Duelo de cuadrados en una arena minimalista.',
    path: '/games/square-clash/index.html',
    bg: 'from-rose-900/20 to-black',
    controls: { act: 'Chocar', mov: 'WASD' }
  },
  {
    id: 'triangle-trip',
    title: 'TRIANGLE TRIP',
    category: 'Estrategia',
    rating: '4.3',
    icon: <Triangle size={80} />,
    color: 'text-amber-300',
    description: 'Guía a tu flota triangular a través de dimensiones paralelas.',
    path: '/games/triangle-trip/index.html',
    bg: 'from-amber-900/20 to-black',
    controls: { act: 'Navegar', mov: 'Mouse' }
  },
  {
    id: 'diamond-deluxe',
    title: 'DIAMOND DELUXE',
    category: 'Ritmo',
    rating: '4.5',
    icon: <Diamond size={80} />,
    color: 'text-blue-300',
    description: 'Recolecta diamantes en sintonía con las ondas sonoras.',
    path: '/games/diamond-deluxe/index.html',
    bg: 'from-blue-900/20 to-black',
    controls: { act: 'Recolectar', mov: 'Espacio' }
  },
  {
    id: 'orbit-defensor',
    title: 'ORBIT DEFENSOR',
    category: 'Arcade',
    rating: '4.7',
    icon: <Orbit size={80} />,
    color: 'text-purple-300',
    description: 'Protege tu órbita de escombros espaciales.',
    path: '/games/orbit-defensor/index.html',
    bg: 'from-purple-900/20 to-black',
    controls: { act: 'Bloquear', mov: 'Mouse Wheel' }
  },
  {
    id: 'layer-logic',
    title: 'LAYER LOGIC',
    category: 'Puzzle',
    rating: '4.6',
    icon: <Layers size={80} />,
    color: 'text-slate-200',
    description: 'Organiza las capas de información para descifrar el mensaje.',
    path: '/games/layer-logic/index.html',
    bg: 'from-slate-900/20 to-black',
    controls: { act: 'Mover Capas', mov: 'Arrastrar' }
  },
  {
    id: 'flash-dash',
    title: 'FLASH DASH',
    category: 'Acción',
    rating: '4.8',
    icon: <Flash size={80} />,
    color: 'text-yellow-500',
    description: 'Velocidad pura en túneles de fibra óptica.',
    path: '/games/flash-dash/index.html',
    bg: 'from-yellow-900/20 to-black',
    controls: { act: 'Turbo', mov: 'Click Izquierdo' }
  },
  {
    id: 'ghost-run',
    title: 'GHOST RUN',
    category: 'Retro',
    rating: '4.4',
    icon: <Ghost size={80} />,
    color: 'text-indigo-300',
    description: 'Escapa del laberinto digital antes de ser detectado.',
    path: '/games/ghost-run/index.html',
    bg: 'from-indigo-900/20 to-black',
    controls: { act: 'Sigilo', mov: 'Flechas' }
  },
  {
    id: 'trophy-hunter',
    title: 'TROPHY HUNTER',
    category: 'Estrategia',
    rating: '4.9',
    icon: <Trophy size={80} />,
    color: 'text-yellow-600',
    description: 'El desafío definitivo para los buscadores de gloria.',
    path: '/games/trophy-hunter/index.html',
    bg: 'from-yellow-900/20 to-black',
    controls: { act: 'Conquistar', mov: 'Estrategia' }
  },
  {
    id: 'medal-mission',
    title: 'MEDAL MISSION',
    category: 'Ritmo',
    rating: '4.3',
    icon: <Medal size={80} />,
    color: 'text-zinc-400',
    description: 'Completa misiones especiales para ganar medallas de honor.',
    path: '/games/medal-mission/index.html',
    bg: 'from-zinc-900/20 to-black',
    controls: { act: 'Completar', mov: 'Ritmo' }
  },
];
