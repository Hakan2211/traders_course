import BlogHeading from '@/components/mdx_components/blogHeading/blogHeading'
import QuoteComponent from '@/components/mdx_components/quoteComponent/quoteComponent'
import { VoiceoverPlayer } from '@/components/mdx_components/voiceover/voiceoverPlayer'
import {
  AlertDescription,
  AlertTitle,
  Alert,
} from '@/components/mdx_components/alertwrapper/alertWrapper'
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper'
import dynamic from '@/lib/dynamic'
import { Suspense } from 'react'
import {
  ImageGallery,
  ImageGalleryItem,
} from '@/components/mdx_components/imageGallery/imageGallery'

const SetupArsenalRenderer = dynamic(
  () => import('@/components/setup-arsenal/SetupArsenalRenderer'),
  { ssr: false },
)

const TimelineScrubber = dynamic(
  () =>
    import('@/components/setup-arsenal/TimelineScrubber').then(
      (mod) => mod.TimelineScrubber,
    ),
  { ssr: false },
)

const BrainModel = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/brain/BrainModelContainer'),
  { ssr: false },
)

const BrainExplorer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/BrainExplorer').then(
      (mod) => mod.BrainExplorer,
    ),
  { ssr: false },
)

const RaceAnimation = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/RaceAnimation').then(
      (mod) => mod.RaceAnimation,
    ),
  { ssr: false },
)

const HierarchyBuilding = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/HierarchyBuilding').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const DecisionFlowchart = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/DecisionFlowchart').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const BrainIdentifier = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/BrainIdentifier').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const AnatomyOfBlowUp = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/AnatomyOfBlowUp').then(
      (mod) => mod.AnatomyOfBlowUp,
    ),
  { ssr: false },
)

const TunnelVisionSimulation = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/TunnelVisionSimulation').then(
      (mod) => mod.TunnelVisionSimulation,
    ),
  { ssr: false },
)

const SignalDecoder = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/SignalDecoder').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const VagusHighway = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/VagusHighway').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const BreathingPacer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/BreathingPacer').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const SomaticMarkersExplorer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/SomaticMarkersExplorer').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

import VideoTest from '@/components/mdx_components/videoPlayer/videoTest'
import { VideoPlayerUI } from '@/components/mdx_components/videoPlayer/videoPlayerUI'
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper'
import FramerMotionTest from '@/components/mdx_components/2d_environment/framerMotionTest'
import P5Example from '@/components/mdx_components/2d_environment/p5Sketch/p5Example'
import { InteractiveDemo } from '@/components/mdx_components/2d_environment/p5Sketch/interactiveSplit'
import { CompressionExpansion } from '@/components/mdx_components/2d_environment/p5Sketch/compressionExpansion'
import TradingPyramid from '@/components/mdx_components/2d_environment/TradingPyramid'
import TradingCycleLoop from '@/components/mdx_components/2d_environment/TradingCycleLoop'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  GridList,
  GridListItem,
} from '@/components/mdx_components/gridList/GridList'
import {
  InfoGrid,
  InfoGridItem,
} from '@/components/mdx_components/gridList/InfoGrid'
import { Highlight } from '@/components/mdx_components/highlight/Highlight'
import { SurvivalHierarchy } from '@/components/mdx_components/survivalHierarchy/SurvivalHierarchy'
import { SurvivalCommandments } from '@/components/mdx_components/survivalCommandments/SurvivalCommandments'
import { CustomLink } from '@/components/mdx_components/customLink/CustomLink'
import { Math } from '@/components/mdx_components/math/Math'
import DecisionTree from '@/components/mdx_components/decisionTree/DecisionTree'
import ShortInterestDataPanel from '@/components/mdx_components/shortInterestPanel/ShortInterestDataPanel'
import DilutionChecklist from '@/components/mdx_components/dilutionChecklist/DilutionChecklist'
import Checklist from '@/components/mdx_components/checklist/Checklist'
import { FortressCommandCenter } from '@/components/mdx_components/fortressCommandCenter/FortressCommandCenter'
import { PersonalRiskPlanDownload } from '@/components/mdx_components/downloads/PersonalRiskPlanDownload'
const PredictionErrorSimulator = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PredictionErrorSimulator'),
  { ssr: false },
)

const SynapticDownregulation = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/SynapticDownregulation'),
  { ssr: false },
)

const CasinoModeMeter = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/CasinoModeMeter/CasinoModeMeter'),
  { ssr: false },
)

const CycleOfDoom = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/CycleOfDoom').then(
      (mod) => mod.CycleOfDoom,
    ),
  { ssr: false },
)

const DecisionBattery = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/DecisionBattery/DecisionBattery').then(
      (mod) => mod.DecisionBattery,
    ),
  { ssr: false },
)

const PrefrontalBattery = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PrefrontalBattery/PrefrontalBatteryContainer').then(
      (mod) => mod.PrefrontalBatteryContainer,
    ),
  { ssr: false },
)

const DispositionSimulator = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/DispositionSimulator/DispositionSimulator').then(
      (mod) => mod.DispositionSimulator,
    ),
  { ssr: false },
)

const AsymmetrySlider = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/AsymmetrySlider/AsymmetrySlider').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const AnchorBreaker = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/AnchorBreaker/AnchorBreaker').then(
      (mod) => mod.AnchorBreaker,
    ),
  { ssr: false },
)

const HormonalLens = dynamic(
  () => import('@/components/mdx_components/cognitive_athlete/HormonalLens'),
  { ssr: false },
)

const PositionSizingCurve = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PositionSizingCurve'),
  { ssr: false },
)

const ShadowFloatRiskSimulator = dynamic(
  () =>
    import('@/components/mdx_components/shadowFloatRiskSimulator/ShadowFloatRiskSimulator'),
  { ssr: false },
)
const NeuralHighwayBuilder = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/NeuralHighwayBuilder/NeuralHighwayBuilder').then(
      (mod) => mod.NeuralHighwayBuilder,
    ),
  { ssr: false },
)
const HebbianClicker = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/HebbianClicker/HebbianClicker').then(
      (mod) => mod.HebbianClicker,
    ),
  { ssr: false },
)

const UrgeSurfTimer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/UrgeSurfTimer/UrgeSurfTimer').then(
      (mod) => mod.UrgeSurfTimer,
    ),
  { ssr: false },
)

const RealityCurve = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/RealityCurve/RealityCurve'),
  { ssr: false },
)

const PsychometricProfiler = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PsychometricProfiling/InteractiveTool').then(
      (mod) => mod.InteractiveTool,
    ),
  { ssr: false },
)

const ChronotypeOptimizer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PsychometricProfiling/ChronotypeOptimizer').then(
      (mod) => mod.ChronotypeOptimizer,
    ),
  { ssr: false },
)

const DopamineMatcher = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PsychometricProfiling/DopamineMatcher').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const NeuroAvatarBuilder = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/PsychometricProfiling/NeuroAvatarBuilder').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const RitualStackBuilder = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/FlowState/RitualStackBuilder').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const FlowCocktailMixer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/FlowState/FlowCocktailMixer').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const FlowStateChart = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/FlowStateChart').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const HRVMonitor = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/FlowState/HRVMonitor').then(
      (mod) => mod.HRVMonitor,
    ),
  { ssr: false },
)

const WindowOfTolerance = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/Resilience/WindowOfTolerance').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const ResilienceProtocol = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/Resilience/ResilienceProtocol').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const AllostaticLoadCalculator = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/Resilience/AllostaticLoadCalculator').then(
      (mod) => mod.AllostaticLoadCalculator,
    ),
  { ssr: false },
)

const SixSecondTrainer = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/AnatomyOfTrade/SixSecondTrainer').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const BioTelemetryDashboard = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/AnatomyOfTrade/BioTelemetryDashboard').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

const MasteryRadarAssessment = dynamic(
  () =>
    import('@/components/mdx_components/cognitive_athlete/AnatomyOfTrade/MasteryRadarAssessment').then(
      (mod) => mod.default,
    ),
  { ssr: false },
)

import {
  TrendingUp,
  LandPlot,
  Repeat,
  FunctionSquare,
  Package,
  CircleDollarSign,
  Car,
  Home,
  Briefcase,
  Droplets,
  Building,
  Building2,
  BarChart,
  Bot,
  Scale,
  Target,
  Users,
  Waves,
  Globe,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Circle,
  Skull,
  X,
  BellRing,
  Medal,
  Flag,
  MessageCircleQuestion,
  Brain,
  AudioWaveform,
  Activity,
  Sprout,
  BrainCircuit,
  EggFried,
  Banana,
  Cherry,
  Croissant,
  Lollipop,
  Apple,
  Nut,
  Wheat,
  Drumstick,
  CookingPot,
  Candy,
  Coffee,
  Fish,
  Salad,
  Beef,
} from 'lucide-react'

const TestScene = dynamic(
  () => import('@/components/mdx_components/3d_lessons/example/TestScene'),
  { ssr: false },
)

const VideoPlayer = dynamic(
  () => import('@/components/mdx_components/videoPlayer/videoPlayer'),
  { ssr: false },
)

const AssetSpheres = dynamic(
  () => import('@/components/mdx_components/3d_lessons/module1/assetSpheres'),
  { ssr: false },
)

const MarketSizes = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/marketSizes/marketSizes'),
  { ssr: false },
)

const MarketDynamics = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/marketDynamics/marketDynamics'),
  { ssr: false },
)

const EquitiesNested = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/marketSizes/EquitiesNested'),
  { ssr: false },
)

const ShareCakeSlicer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/shareCakeSlicer/ShareCakeSlicer'),
  { ssr: false },
)

const VolumeRotation3D = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/VolumeRotationContainer'),
  { ssr: false },
)

const VolumeAtPriceContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/VolumeAtPriceContainer'),
  { ssr: false },
)

const CompressedCycle2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/magicMarketBox/CompressedCycle2DContainer'),
  { ssr: false },
)

const InteractiveFloat = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/interactiveFloat/InteractiveFloat'),
  { ssr: false },
)

const IntroductionContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/IntroductionContainer'),
  { ssr: false },
)

const ParticleModelContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/ParticleModelContainer'),
  { ssr: false },
)

const EnergyAndMotionContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/EnergyAndMotionContainer'),
  { ssr: false },
)

const EquilibriumAndPressureContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/EquilibriumAndPressureContainer'),
  { ssr: false },
)

const VerticalEcosystemContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/VerticalEcosystemContainer'),
  { ssr: false },
)

const MarketEcosystemContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/MarketEcosystemContainer'),
  { ssr: false },
)

const ShortingMechanismContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/ShortingMechanismContainer'),
  { ssr: false },
)

const BattleInsideBoxContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/BattleInsideBoxContainer'),
  { ssr: false },
)

const CompanyGalaxyContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/CompanyGalaxyContainer'),
  { ssr: false },
)

const VolumeAnatomyContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/VolumeAnatomyContainer'),
  { ssr: false },
)

const LiquidityHuntContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/LiquidityHuntContainer'),
  { ssr: false },
)

const VolumeAnatomy2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/VolumeAnatomy2DContainer'),
  { ssr: false },
)

const VPALens2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/VPALens2DContainer'),
  { ssr: false },
)

const ProfileShapeExplorer2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/ProfileShapeExplorer2DContainer'),
  { ssr: false },
)

const VWAPLaboratory2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/VWAPLaboratory2DContainer'),
  { ssr: false },
)

const CryptoEquitiesRotationContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/CryptoEquitiesRotationContainer'),
  { ssr: false },
)

const EconomicCycleRotationContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/EconomicCycleRotationContainer'),
  { ssr: false },
)

const MarketStatesVisualizerContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/MarketStatesVisualizerContainer'),
  { ssr: false },
)

const FalseVsFailedBreakout2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/FalseVsFailedBreakout2DContainer'),
  { ssr: false },
)

const DepthChart2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/DepthChart2DContainer'),
  { ssr: false },
)

const TapeReading2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/TapeReading2DContainer'),
  { ssr: false },
)

const OwnershipDilution2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/OwnershipDilution2DContainer'),
  { ssr: false },
)

const ToxicityScorecard2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/ToxicityScorecard2DContainer'),
  { ssr: false },
)

const DilutionImpact2DContainer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/p5Sketch/DilutionImpact2DContainer'),
  { ssr: false },
)

const TrendArchitectureContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/TrendArchitectureContainer'),
  { ssr: false },
)

const SupportResistanceMemoryContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/SupportResistanceMemoryContainer'),
  { ssr: false },
)

const OrderBook3DContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/OrderBook3DContainer'),
  { ssr: false },
)

const ExecutionStrategiesContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/ExecutionStrategiesContainer'),
  { ssr: false },
)

const DilutionBuybackContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/DilutionBuybackContainer'),
  { ssr: false },
)

const OfferingMechanicsContainer = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/OfferingMechanicsContainer'),
  { ssr: false },
)

const TraderGraveyard = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/graveyard/TraderGraveyard'),
  { ssr: false },
)

const RiskCalculator = dynamic(
  () => import('@/components/mdx_components/risk_management/RiskCalculator'),
  { ssr: false },
)

const CoinFlipGame = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/coin_flip_game/CoinFlipGame').then(
      (mod) => mod.CoinFlipGame,
    ),
  { ssr: false },
)

const PositionSizingCalculator = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/position_sizing/PositionSizingCalculator').then(
      (mod) => mod.PositionSizingCalculator,
    ),
  { ssr: false },
)

const PositionSizeImpactSphere = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/position_sizing/impact_sphere/PositionSizeImpactSphere'),
  { ssr: false },
)

const ATRStopCalculator = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/stop_loss/ATRStopCalculator').then(
      (mod) => mod.ATRStopCalculator,
    ),
  { ssr: false },
)

const TrailingStopVisualizer = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/stop_loss/TrailingStopVisualizer'),
  { ssr: false },
)

const StopHuntingSimulator = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/stop_loss/StopHuntingSimulator/StopHuntingSimulator'),
  { ssr: false },
)

const ProfitabilityLandscape = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/profitability_landscape/ProfitabilityLandscape'),
  { ssr: false },
)

const ProfitabilitySimulator = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/profitability_landscape/ProfitabilitySimulator'),
  { ssr: false },
)

const RUniverse = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/r_universe/RUniverse').then(
      (mod) => mod.RUniverse,
    ),
  { ssr: false },
)

const RDistributionBuilder = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/r_distribution/RDistributionBuilder').then(
      (mod) => mod.RDistributionBuilder,
    ),
  { ssr: false },
)

const MaeMfeScatterPlot = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/mae_mfe/MaeMfeScatterPlot'),
  { ssr: false },
)

const DrawdownCanyon = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/drawdown/DrawdownCanyon').then(
      (mod) => mod.DrawdownCanyon,
    ),
  { ssr: false },
)

const SisyphusScale = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/drawdown/SisyphusScale'),
  { ssr: false },
)

const StreakGenerator = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/drawdown/StreakGenerator'),
  { ssr: false },
)

const PortfolioHeatGame = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/portfolio_heat/PortfolioHeatGame'),
  { ssr: false },
)

const RiskConstellation = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/portfolio_heat/RiskConstellation').then(
      (mod) => mod.RiskConstellation,
    ),
  { ssr: false },
)

const VolatilityRegimeViz = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/volatility_regimes/VolatilityRegimeViz'),
  { ssr: false },
)

const FatTailDistribution = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/volatility_regimes/FatTailDistribution'),
  { ssr: false },
)

const TailRiskVisualizer = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/volatility_regimes/TailRiskVisualizer'),
  { ssr: false },
)

const RevengeSimulator = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/psychological_warfare/RevengeSimulator'),
  { ssr: false },
)

const MazeGame = dynamic(
  () =>
    import('@/components/mdx_components/risk_management/psychological_warfare/maze_game/MazeGame').then(
      (mod) => mod.MazeGame,
    ),
  { ssr: false },
)

const CatalystSimulator = dynamic(
  () => import('@/components/setup-arsenal/catalyst/CatalystSimulator'),
  { ssr: false },
)

const CatalystSimulator3D = dynamic(
  () =>
    import('@/components/setup-arsenal/catalyst/CatalystSimulatorContainer'),
  { ssr: false },
)

const CatalystXRaySimulator = dynamic(
  () => import('@/components/setup-arsenal/catalyst/CatalystXRaySimulator'),
  { ssr: false },
)

const MarketMakerGame = dynamic(
  () => import('@/components/setup-arsenal/catalyst/MarketMakerGame'),
  { ssr: false },
)

const NewsPlayCheatSheet = dynamic(
  () => import('@/components/setup-arsenal/catalyst/NewsPlayCheatSheet'),
  { ssr: false },
)

const OrbGapCheatSheet = dynamic(
  () => import('@/components/setup-arsenal/orb-gap/OrbGapCheatSheet'),
  { ssr: false },
)

const OrbGapSimulator = dynamic(
  () => import('@/components/setup-arsenal/orb-gap/OrbGapSimulator'),
  { ssr: false },
)

const DivergenceChart = dynamic(
  () => import('@/components/setup-arsenal/afternoon-breakout/DivergenceChart'),
  { ssr: false },
)

const AfternoonSimulationContainer = dynamic(
  () => import('@/components/setup-arsenal/afternoon-breakout/simulation'),
  { ssr: false },
)

const TradingLesson = dynamic(
  () => import('@/components/setup-arsenal/afternoon-breakout/TradingLesson'),
  { ssr: false },
)

const PanicVolumeVisualizer = dynamic(
  () =>
    import('@/components/setup-arsenal/parabolic-short/PanicVolumeVisualizer'),
  { ssr: false },
)

const ParabolicSimulator = dynamic(
  () => import('@/components/setup-arsenal/parabolic-short/ParabolicSimulator'),
  { ssr: false },
)

const SniperTrainer = dynamic(
  () => import('@/components/setup-arsenal/first-green-day/SniperTrainer'),
  { ssr: false },
)

const MarketMagicBox = dynamic(
  () => import('@/components/setup-arsenal/first-green-day/MarketMagicBox'),
  { ssr: false },
)

const CycleChart = dynamic(
  () =>
    import('@/components/setup-arsenal/first-green-day/CycleChart').then(
      (mod) => mod.CycleChart,
    ),
  { ssr: false },
)

const TradingCheatSheet = dynamic(
  () =>
    import('@/components/setup-arsenal/first-green-day/TradingCheatSheet').then(
      (mod) => mod.TradingCheatSheet,
    ),
  { ssr: false },
)

const AnatomyOfTheTurn = dynamic(
  () => import('@/components/setup-arsenal/parabolic-short/AnatomyOfTheTurn'),
  { ssr: false },
)

const ParabolicPanicOverview = dynamic(
  () =>
    import('@/components/setup-arsenal/parabolic-short/ParabolicPanicOverview'),
  { ssr: false },
)

const ScenarioVisualizer = dynamic(
  () =>
    import('@/components/setup-arsenal/overextended-gap-up-short/ScenarioVisualizer'),
  { ssr: false },
)

const WashoutSimulator = dynamic(
  () =>
    import('@/components/setup-arsenal/overextended-gap-up-short/WashoutSimulator').then(
      (mod) => mod.WashoutSimulator,
    ),
  { ssr: false },
)

const OverextendedGapTradingCheatSheet = dynamic(
  () =>
    import('@/components/setup-arsenal/overextended-gap-up-short/TradingCheatSheet'),
  { ssr: false },
)

const VisualChart = dynamic(
  () =>
    import('@/components/setup-arsenal/overextended-gap-up-short/VisualChart'),
  { ssr: false },
)

const CycleOfDesperation = dynamic(
  () =>
    import('@/components/setup-arsenal/reverse-split-long-short/CycleOfDesperation'),
  { ssr: false },
)

const PatienceTrainer = dynamic(
  () =>
    import('@/components/setup-arsenal/reverse-split-long-short/PatienceTrainer'),
  { ssr: false },
)

const FloatCalculator = dynamic(
  () =>
    import('@/components/setup-arsenal/reverse-split-long-short/FloatCalculator').then(
      (mod) => mod.FloatCalculator,
    ),
  { ssr: false },
)

const ReverseSplitLesson = dynamic(
  () =>
    import('@/components/setup-arsenal/reverse-split-long-short/ReverseSplitLesson'),
  { ssr: false },
)

const VwapMagnetSimulation = dynamic(
  () =>
    import('@/components/setup-arsenal/vwap-bounce-rejection/VwapMagnetSimulation'),
  { ssr: false },
)

const MoatVisualizer = dynamic(
  () =>
    import('@/components/setup-arsenal/vwap-bounce-rejection/MoatVisualizer'),
  { ssr: false },
)

const SoftStopSimulator = dynamic(
  () =>
    import('@/components/setup-arsenal/vwap-bounce-rejection/SoftStopSimulator').then(
      (mod) => mod.SoftStopSimulator,
    ),
  { ssr: false },
)

const VwapTradingCheatSheet = dynamic(
  () =>
    import('@/components/setup-arsenal/vwap-bounce-rejection/TradingCheatSheet'),
  { ssr: false },
)

const LiquidityTrapSim = dynamic(
  () => import('@/components/setup-arsenal/liquidity-play/LiquidityTrapSim'),
  { ssr: false },
)

const LiquidityExecutionSim = dynamic(
  () =>
    import('@/components/setup-arsenal/liquidity-play/LiquidityExecutionSim'),
  { ssr: false },
)

const LiquidityPlayChart = dynamic(
  () => import('@/components/setup-arsenal/liquidity-play/LiquidityPlayChart'),
  { ssr: false },
)

const LiquidityLesson = dynamic(
  () =>
    import('@/components/setup-arsenal/liquidity-play-setup/LiquidityLesson'),
  { ssr: false },
)

const EpisodicOutcomes = dynamic(
  () => import('@/components/setup-arsenal/episodic-pivot/EpisodicOutcomes'),
  { ssr: false },
)

const EarningsGapSimulator = dynamic(
  () => import('@/components/setup-arsenal/earnings-play/EarningsGapSimulator'),
  { ssr: false },
)

const LessonCheatSheet = dynamic(
  () => import('@/components/setup-arsenal/earnings-play/LessonCheatSheet'),
  { ssr: false },
)

const Signature = dynamic(
  () => import('@/components/mdx_components/signature/Signature'),
  { ssr: false },
)

const WebsiteSetupGuide = dynamic(
  () =>
    import('@/components/mdx_components/personal_website/WebsiteSetupGuide'),
  { ssr: false },
)

const COMPONENT_MAP = {
  h1: (props) => <BlogHeading level={1} {...props} />,
  h2: (props) => <BlogHeading level={2} {...props} />,
  h3: (props) => <BlogHeading level={3} {...props} />,
  QuoteComponent,
  VoiceoverPlayer,
  Alert,
  AlertTitle,
  AlertDescription,
  CanvasWrapper,
  TestScene,
  Suspense,
  VideoPlayer,
  VideoPlayerUI,
  VideoTest,
  ImageGallery,
  ImageGalleryItem,
  BrainModel,
  BrainExplorer,
  RaceAnimation,
  HierarchyBuilding,
  DecisionFlowchart,
  BrainIdentifier,
  AnatomyOfBlowUp,
  TunnelVisionSimulation,
  SignalDecoder,
  VagusHighway,
  BreathingPacer,
  SomaticMarkersExplorer,
  EnvironmentWrapper,
  FramerMotionTest,
  P5Example,
  InteractiveDemo,
  CompressionExpansion,
  TradingPyramid,
  TradingCycleLoop,
  AssetSpheres,
  MarketSizes,
  MarketDynamics,
  EquitiesNested,
  ShareCakeSlicer,
  InteractiveFloat,
  IntroductionContainer,
  ParticleModelContainer,
  EnergyAndMotionContainer,
  EquilibriumAndPressureContainer,
  VerticalEcosystemContainer,
  MarketEcosystemContainer,
  ShortingMechanismContainer,
  BattleInsideBoxContainer,
  CompanyGalaxyContainer,
  VolumeAnatomyContainer,
  VolumeAtPriceContainer,
  LiquidityHuntContainer,
  VolumeRotation3D,
  CompressedCycle2DContainer,
  VolumeAnatomy2DContainer,
  VPALens2DContainer,
  ProfileShapeExplorer2DContainer,
  VWAPLaboratory2DContainer,
  CryptoEquitiesRotationContainer,
  EconomicCycleRotationContainer,
  MarketStatesVisualizerContainer,
  FalseVsFailedBreakout2DContainer,
  DepthChart2DContainer,
  TapeReadingContainer: TapeReading2DContainer,
  OwnershipDilution2DContainer,
  ToxicityScorecard2DContainer,
  DilutionImpact2DContainer,
  TrendArchitectureContainer,
  SupportResistanceMemoryContainer,
  OrderBook3DContainer,
  ExecutionStrategiesContainer,
  DilutionBuybackContainer,
  OfferingMechanicsContainer,
  TraderGraveyard,
  RiskCalculator,
  CoinFlipGame,
  PositionSizingCalculator,
  PositionSizeImpactSphere,
  ATRStopCalculator,
  TrailingStopVisualizer,
  StopHuntingSimulator,
  ProfitabilityLandscape,
  ProfitabilitySimulator,
  RUniverse,
  RDistributionBuilder,
  MaeMfeScatterPlot,
  DrawdownCanyon,
  SisyphusScale,
  StreakGenerator,
  PortfolioHeatGame,
  RiskConstellation,
  VolatilityRegimeViz,
  FatTailDistribution,
  TailRiskVisualizer,
  RevengeSimulator,
  MazeGame,
  CatalystSimulator,
  CatalystSimulator3D,
  CatalystXRaySimulator,
  MarketMakerGame,
  NewsPlayCheatSheet,
  OrbGapCheatSheet,
  OrbGapSimulator,
  DivergenceChart,
  AfternoonSimulationContainer,
  TradingLesson,
  AnatomyOfTheTurn,
  PanicVolumeVisualizer,
  ParabolicSimulator,
  ParabolicPanicOverview,
  SniperTrainer,
  MarketMagicBox,
  CycleChart,
  TradingCheatSheet,
  ScenarioVisualizer,
  WashoutSimulator,
  OverextendedGapTradingCheatSheet,
  VisualChart,
  CycleOfDesperation,
  PatienceTrainer,
  FloatCalculator,
  ReverseSplitLesson,
  VwapMagnetSimulation,
  MoatVisualizer,
  SoftStopSimulator,
  VwapTradingCheatSheet,
  LiquidityTrapSim,
  LiquidityExecutionSim,
  LiquidityPlayChart,
  LiquidityLesson,
  EpisodicOutcomes,
  EarningsGapSimulator,
  LessonCheatSheet,
  SetupArsenalRenderer,
  TimelineScrubber,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  GridList,
  GridListItem,
  InfoGrid,
  InfoGridItem,
  Highlight,
  SurvivalHierarchy,
  SurvivalCommandments,
  CustomLink,
  Math,
  DecisionTree,
  ShortInterestDataPanel,
  PredictionErrorSimulator,
  SynapticDownregulation,
  CasinoModeMeter,
  CycleOfDoom,
  DecisionBattery,
  PrefrontalBattery,
  DispositionSimulator,
  AsymmetrySlider,
  AnchorBreaker,
  HormonalLens,
  PositionSizingCurve,
  ShadowFloatRiskSimulator,
  DilutionChecklist,
  Checklist,
  FortressCommandCenter,
  PersonalRiskPlanDownload,
  Signature,
  NeuralHighwayBuilder,
  HebbianClicker,
  UrgeSurfTimer,
  RealityCurve,
  PsychometricProfiler,
  NeuroAvatarBuilder,
  RitualStackBuilder,
  FlowCocktailMixer,
  FlowStateChart,
  HRVMonitor,
  WindowOfTolerance,
  ResilienceProtocol,
  AllostaticLoadCalculator,
  SixSecondTrainer,
  BioTelemetryDashboard,
  MasteryRadarAssessment,
  ChronotypeOptimizer,
  DopamineMatcher,
  TrendingUp,
  LandPlot,
  Repeat,
  FunctionSquare,
  Package,
  CircleDollarSign,
  Car,
  Home,
  Briefcase,
  Droplets,
  Building,
  Building2,
  BarChart,
  Bot,
  Scale,
  Target,
  Users,
  Waves,
  Globe,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Circle,
  Skull,
  X,
  BellRing,
  Medal,
  Flag,
  MessageCircleQuestion,
  Brain,
  AudioWaveform,
  Activity,
  Sprout,
  BrainCircuit,
  EggFried,
  Banana,
  Cherry,
  Croissant,
  Lollipop,
  Apple,
  Nut,
  Wheat,
  Drumstick,
  CookingPot,
  Candy,
  Coffee,
  Fish,
  Salad,
  Beef,
  WebsiteSetupGuide,
}

export default COMPONENT_MAP
