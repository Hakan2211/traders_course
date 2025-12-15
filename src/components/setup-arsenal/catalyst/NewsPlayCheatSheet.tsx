import React from 'react';
import TradingCheatSheet from '../TradingCheatSheet';
import { LessonData } from '../types';

const NewsPlayCheatSheet: React.FC = () => {
  const data: LessonData = {
    title: 'Setup Cheat Sheet',
    subtitle: 'News Play vs. Pop and Drop',
    longSetup: {
      title: 'News Play (Long)',
      type: 'long',
      badgeText: 'Catalyst/Momentum',
      details: [
        {
          label: 'Time of Day',
          value: '7:00 AM - 9:30 AM EST',
          highlightColor: 'yellow',
        },
        {
          label: 'Risk Level',
          value: 'Medium-High',
          isRisk: true,
          riskValue: 3,
        },
        {
          label: 'Success Rate',
          value: '60-80%',
          isProgress: true,
          progressValue: 70,
        },
        {
          label: 'Risk / Reward',
          value: '1:1.5 to 1:3',
          highlightColor: 'green',
        },
        {
          label: 'Float Preference',
          value: '1M - 10M shares',
          highlightColor: 'yellow',
        },
        {
          label: 'Required Catalyst',
          value: 'Material News (Phase 2/3, Contracts)',
          highlightColor: 'blue',
          fullWidth: true,
        },
      ],
      checklistTitle: 'Execution Checklist',
      checklist: [
        'Catalyst is MATERIAL (not fluff)',
        'Float is under 20M shares',
        'Volume is increasing pre-market',
        'Stop loss defined below entry candle',
        'Position size calculated for risk',
      ],
    },
    shortSetup: {
      title: 'Pop and Drop (Short)',
      type: 'short',
      badgeText: 'Reversal/Fade',
      details: [
        {
          label: 'Time of Day',
          value: '7:00 AM - 9:30 AM EST',
          highlightColor: 'yellow',
        },
        {
          label: 'Risk Level',
          value: 'High',
          isRisk: true,
          riskValue: 4,
        },
        {
          label: 'Success Rate',
          value: '70-80%',
          isProgress: true,
          progressValue: 75,
        },
        {
          label: 'Risk / Reward',
          value: '1:1 to 1:2',
          highlightColor: 'red',
        },
        {
          label: 'Float Preference',
          value: '1M - 10M shares',
          highlightColor: 'yellow',
        },
        {
          label: 'Required Catalyst',
          value: 'Fluffy / Weak News (PR Stunt)',
          highlightColor: 'red',
          fullWidth: true,
        },
      ],
      checklistTitle: 'Execution Checklist',
      checklist: [
        'Catalyst is FLUFF / WEAK',
        'Price rejected at resistance / lower high',
        'Volume declining on second push',
        'Stop loss above high of day',
        'Take profit quickly (fade logic)',
      ],
    },
  };

  return <TradingCheatSheet data={data} />;
};

export default NewsPlayCheatSheet;
