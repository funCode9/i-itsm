import React, { useState, useMemo } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel,
  InputAdornment, Chip, Avatar, Tooltip, IconButton, Pagination
} from '@mui/material';
import {
  Search, FilterList, TimerOutlined, PersonOutline, ArrowForwardIos
} from '@mui/icons-material';
import { StatusChip, PriorityChip, PriorityBar } from './StatusChip';

export default function IncidentQueueTable({
  incidents = [],
  title = "Incident Queue",
  subtitle,
  onSelectIncident,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Extract distinct categories and services from dataset
  const categories = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.category?.name).filter(Boolean))).sort();
  }, [incidents]);

  const services = useMemo(() => {
    return Array.from(new Set(incidents.map((i) => i.service?.name).filter(Boolean))).sort();
  }, [incidents]);

  // Filter incidents across 5 distinct search and categorization criteria
  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      !searchTerm ||
      inc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.incidentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || inc.category?.name === categoryFilter;
    const matchesService = serviceFilter === 'ALL' || inc.service?.name === serviceFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesService;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Table Header & Controls Toolbar */}
      <Box
        sx={{
          p: 2.2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.05rem',
              }}
            >
              {title}
            </Typography>
            <Chip
              label={`${filtered.length} tickets`}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.3 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Filter Toolbar */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search tickets, titles, IDs..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '0.8rem', width: { xs: 180, sm: 220 }, height: 34 },
            }}
          />

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            sx={{ fontSize: '0.78rem', height: 34, minWidth: 120 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="NEW">New</MenuItem>
            <MenuItem value="CLASSIFIED">Classified</MenuItem>
            <MenuItem value="ASSIGNED">Assigned</MenuItem>
            <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </Select>

          <Select
            size="small"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            sx={{ fontSize: '0.78rem', height: 34, minWidth: 110 }}
          >
            <MenuItem value="ALL">All Priorities</MenuItem>
            <MenuItem value="P1_CRITICAL">P1 Critical</MenuItem>
            <MenuItem value="P2_HIGH">P2 High</MenuItem>
            <MenuItem value="P3_MEDIUM">P3 Medium</MenuItem>
            <MenuItem value="P4_LOW">P4 Low</MenuItem>
          </Select>

          {categories.length > 0 && (
            <Select
              size="small"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              sx={{ fontSize: '0.78rem', height: 34, minWidth: 120 }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          )}

          {services.length > 0 && (
            <Select
              size="small"
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
              sx={{ fontSize: '0.78rem', height: 34, minWidth: 120 }}
            >
              <MenuItem value="ALL">All Services</MenuItem>
              {services.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </Box>

      {/* Table Content */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 140 }}>Incident ID</TableCell>
              <TableCell>Title & Summary</TableCell>
              <TableCell sx={{ width: 130 }}>Priority</TableCell>
              <TableCell sx={{ width: 120 }}>Status</TableCell>
              <TableCell sx={{ width: 160 }}>Assignee</TableCell>
              <TableCell sx={{ width: 140 }}>SLA Status</TableCell>
              <TableCell sx={{ width: 50 }} align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                  <Typography variant="body2">No matching incidents found in queue</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((inc) => (
                <TableRow
                  key={inc.id}
                  hover
                  onClick={() => onSelectIncident?.(inc)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  {/* ID with 4px left priority stripe */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriorityBar priority={inc.priority} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          color: '#4f85c8',
                          fontSize: '0.78rem',
                        }}
                      >
                        {inc.incidentNumber}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Title & Service */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.84rem',
                        lineHeight: 1.25,
                      }}
                    >
                      {inc.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.72rem',
                        display: 'block',
                        mt: 0.3,
                      }}
                    >
                      {inc.service?.name || 'General'} • {inc.category?.name || 'Unclassified'} • {new Date(inc.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <PriorityChip priority={inc.priority} showBar />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusChip status={inc.status} />
                  </TableCell>

                  {/* Assignee */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: inc.assignee ? '#4f85c8' : '#e2e8f0',
                          color: inc.assignee ? 'white' : '#64748b',
                        }}
                      >
                        {inc.assignee?.user?.fullName?.[0] || <PersonOutline sx={{ fontSize: 14 }} />}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                        {inc.assignee?.user?.fullName || 'Unassigned'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* SLA Countdown / Status */}
                  <TableCell>
                    {inc.sla ? (
                      <Chip
                        icon={<TimerOutlined sx={{ fontSize: '13px !important' }} />}
                        label={inc.sla.resolutionBreached ? 'Breached' : 'On Track'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          bgcolor: inc.sla.resolutionBreached ? '#fef2f2' : '#ecfdf5',
                          color: inc.sla.resolutionBreached ? '#b91c1c' : '#047857',
                          border: `1px solid ${inc.sla.resolutionBreached ? '#fecaca' : '#a7f3d0'}`,
                        }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>—</Typography>
                    )}
                  </TableCell>

                  {/* Arrow Action */}
                  <TableCell align="center">
                    <ArrowForwardIos sx={{ fontSize: 12, color: '#94a3b8' }} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #edf0f4' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
}
