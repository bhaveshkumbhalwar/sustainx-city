import { MOCK_AI_RECOMMENDATIONS, MOCK_HOTSPOTS } from '../../mock/operations.mock';
import { demoCoordForWard } from '../../mock/demoGeo';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import DataTable from '../../components/ui/DataTable';
import MapContainer from '../../components/maps/MapContainer';

export default function AdminAi() {
  const hotspotMarkers = MOCK_HOTSPOTS.map((h) => {
    const g = demoCoordForWard(h.ward);
    return {
      id: h.id,
      lat: g?.lat,
      lng: g?.lng,
      tone: h.severity === 'High' ? 'danger' : h.severity === 'Medium' ? 'warning' : 'success',
      popup: { title: h.location, desc: `${h.count} reports · ${h.wasteType}` },
    };
  });

  const hotspotColumns = [
    { key: 'id', label: 'ID' },
    { key: 'ward', label: 'Ward', render: (row) => `Ward ${row.ward}` },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'count', label: 'Reports', sortable: true },
    { key: 'wasteType', label: 'Type' },
    { key: 'severity', label: 'Severity', render: (row) => <Badge tone={row.severity === 'High' ? 'danger' : row.severity === 'Medium' ? 'warning' : 'success'}>{row.severity}</Badge> },
  ];

  return (
    <>
      <PageHeader title="AI Insights" subtitle="Assistance layer for operations teams." icon="cpu" />
      <Badge tone="warning" className="u-mb-1">Demo — illustrative rules-based recommendations, not a live ML model</Badge>

      <div className="u-grid-2">
        <SectionCard title="Recommendations" subtitle="Generated from operational heuristics">
          <div className="ai-cards">
            {MOCK_AI_RECOMMENDATIONS.map((r) => (
              <div key={r.id} className="ai-card">
                <Icon name={r.type === 'prediction' ? 'cpu' : r.type === 'trend' ? 'chart' : 'activity'} size={18} />
                <div className="ai-card-body">
                  <div className="ai-card-text">{r.title}</div>
                  <div className="ai-card-meta">
                    <Badge tone={r.severity === 'warning' ? 'warning' : 'info'}>{r.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Hotspot watch" subtitle="Frequently reported areas">
          <MapContainer markers={hotspotMarkers} title="Hotspot map" height={280} />
          <div className="u-mt-1">
            <DataTable columns={hotspotColumns} data={MOCK_HOTSPOTS} keyField="id" emptyTitle="No hotspots" />
          </div>
        </SectionCard>
      </div>
    </>
  );
}