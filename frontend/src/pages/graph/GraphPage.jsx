import React from 'react';
import { colors } from '../../constants/colors';

// Placeholder - will use existing GraphExplorer component
export default function GraphPage() {
  return (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
        Entity Graph
      </h2>
      <p style={{ color: colors.textSecondary }}>
        Interactive knowledge graph visualization
      </p>
    </div>
  );
}
