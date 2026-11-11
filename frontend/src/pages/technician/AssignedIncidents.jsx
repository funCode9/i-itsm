import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { RefreshOutlined } from '@mui/icons-material';
import Layout from '../../components/Layout';
import IncidentQueueTable from '../../components/IncidentQueueTable';
import IncidentDrawer from '../../components/IncidentDrawer';
import { technicianApi, incidentApi } from '../../api';

export default function AssignedIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const loadData = () => {
    setLoading(true);
    technicianApi.getMyIncidents()
      .then((r) => setIncidents(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout
      title="Assigned Incidents"
      breadcrumbs={['Technician', 'Assigned Tickets']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined />}
          onClick={loadData}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Refresh Queue
        </Button>
      }
    >
      <IncidentQueueTable
        incidents={incidents}
        title="Technician Assigned Queue"
        subtitle="Incidents requiring investigation, status progression, and official resolution"
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        loading={loading}
      />

      <IncidentDrawer
        open={Boolean(selectedIncident)}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onRefresh={() => {
          loadData();
          if (selectedIncident) {
            incidentApi.getById(selectedIncident.id).then((res) => setSelectedIncident(res.data)).catch(() => {});
          }
        }}
      />
    </Layout>
  );
}
