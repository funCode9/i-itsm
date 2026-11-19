import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import IncidentQueueTable from '../../components/IncidentQueueTable';
import IncidentDrawer from '../../components/IncidentDrawer';
import { incidentApi } from '../../api';

export default function MyIncidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const loadData = () => {
    incidentApi.getMy()
      .then((r) => setIncidents(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout
      title="My Incidents"
      breadcrumbs={['Incidents', 'My Queue']}
    >
      <IncidentQueueTable
        incidents={incidents}
        title="My Incidents Queue"
        subtitle="Manage and track the lifecycle status of your submitted tickets"
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
