import {
  Shirt,
  Smartphone,
  Coffee,
  MessageSquareWarning,
  Utensils,
  Mail,
  TrafficCone,
  BrainCircuit,
  Repeat,
  Newspaper,
  CloudLightning,
} from 'lucide-react';
import { Task, TaskCost } from './types';

export const INITIAL_BATTERY = 100;

export const AVAILABLE_TASKS: Task[] = [
  {
    id: 'outfit',
    name: 'Pick OOTD',
    description: 'Deciding what to wear from scratch',
    cost: TaskCost.MEDIUM,
    icon: Shirt,
    category: 'routine',
  },
  {
    id: 'twitter',
    name: 'Scroll Twitter',
    description: 'Reading hot takes and outrage',
    cost: TaskCost.HIGH,
    icon: Smartphone,
    category: 'mental',
  },
  {
    id: 'argument',
    name: 'Morning Argument',
    description: 'Conflict with spouse or family',
    cost: TaskCost.EXTREME,
    icon: MessageSquareWarning,
    category: 'social',
  },
  {
    id: 'breakfast-auto',
    name: 'Same Breakfast',
    description: 'Eating the usual automated meal',
    cost: TaskCost.ZERO,
    icon: Repeat,
    category: 'routine',
  },
  {
    id: 'breakfast-decide',
    name: 'Decide Breakfast',
    description: 'Thinking about what to cook',
    cost: TaskCost.LOW,
    icon: Utensils,
    category: 'routine',
  },
  {
    id: 'email',
    name: 'Check Work Email',
    description: 'Processing external demands',
    cost: TaskCost.MEDIUM,
    icon: Mail,
    category: 'mental',
  },
  {
    id: 'traffic',
    name: 'Bad Traffic',
    description: 'Stressful commute with decisions',
    cost: TaskCost.HIGH,
    icon: TrafficCone,
    category: 'routine',
  },
  {
    id: 'news',
    name: 'Read The News',
    description: 'Absorbing global negativity',
    cost: TaskCost.MEDIUM,
    icon: Newspaper,
    category: 'mental',
  },
  {
    id: 'anxiety',
    name: 'Worry Loop',
    description: 'Ruminating on future events',
    cost: TaskCost.EXTREME,
    icon: CloudLightning,
    category: 'mental',
  },
  {
    id: 'meditate',
    name: 'Meditate',
    description: 'Clearing the mind (Restorative)',
    cost: TaskCost.ZERO,
    icon: BrainCircuit,
    category: 'mental',
  },
];

export const STATUS_THRESHOLDS = {
  OPTIMAL: 80,
  WARNING: 50,
  CRITICAL: 0,
};
