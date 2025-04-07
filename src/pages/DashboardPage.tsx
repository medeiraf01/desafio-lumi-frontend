import { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, Button, CircularProgress, FormControl, MenuItem, Select, InputLabel, SelectChangeEvent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const [energyData, setEnergyData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    consumoTotal: 0,
    energiaCompensada: 0,
    valorTotalSemGD: 0,
    economiaGD: 0
  });
  
  // Filtros
  const [clienteId, setClienteId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Lista de clientes
  interface Cliente {
    id: string;
    num_cliente: string;
    nome: string | null;
    createdAt: string;
    updatedAt: string;
  }
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Construir parâmetros de consulta
      const params = {};
      if (clienteId) params.clienteId = clienteId;
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;
      
      // Obter dados do dashboard principal
      const dashboardResponse = await api.get('/dashboard', { params });
      
      // Extrair dados do dashboard
      const { data } = dashboardResponse.data;
      setDashboardData({
        consumoTotal: data.consumoTotal,
        energiaCompensada: data.energiaCompensada,
        valorTotalSemGD: data.valorTotalSemGD,
        economiaGD: data.economiaGD
      });
      
      // Obter dados de energia da API
      const energyResponse = await api.get('/dashboard/energy', { params });
      if (energyResponse.data && energyResponse.data.data) {
        setEnergyData(energyResponse.data.data.data);
      }
      
      // Obter dados financeiros da API
      const financialResponse = await api.get('/dashboard/financial', { params });
      console.log('Dados financeiros:', financialResponse.data.data.data);
      if (financialResponse.data && financialResponse.data.data) {
        setFinancialData(financialResponse.data.data.data);
      }
      
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar clientes da API
  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await api.get('/customer');
      if (response.data && response.data.data) {
        setClientes(response.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchDashboardData();
    fetchClientes();
  }, []);
  
  // Função para aplicar filtros
  const handleApplyFilters = () => {
    fetchDashboardData();
  };
  
  // Função para limpar filtros
  const handleClearFilters = () => {
    setClienteId('');
    setDataInicio('');
    setDataFim('');
    fetchDashboardData();
  };
  
  // Função para lidar com a mudança de cliente
  const handleClienteChange = (event: SelectChangeEvent) => {
    setClienteId(event.target.value);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        padding: { xs: 2, sm: 3 },
        backgroundColor: '#f5f5f5',
        margin: 0,
        overflow: 'auto',
        minHeight: '100%',
        flexGrow: 1,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
        Dashboard de Consumo
      </Typography>
      
      {/* Filtros */}
      <Box sx={{ 
        width: '100%', 
        mb: 3, 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 2
      }}>
        <FormControl size="small" sx={{ width: { xs: '100%', sm: '200px' } }}>
          <InputLabel id="cliente-select-label">Número do Cliente</InputLabel>
          <Select
            labelId="cliente-select-label"
            value={clienteId}
            onChange={handleClienteChange}
            label="Número do Cliente"
            disabled={loadingClientes}
          >
            <MenuItem value=""><em>Selecione</em></MenuItem>
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.id}>
                {cliente.num_cliente}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Data Início (MM/YYYY)"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          placeholder="MM/YYYY"
          size="small"
          sx={{ width: { xs: '100%', sm: '200px' } }}
        />
        <TextField
          label="Data Fim (MM/YYYY)"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          placeholder="MM/YYYY"
          size="small"
          sx={{ width: { xs: '100%', sm: '200px' } }}
        />
        <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
          <Button 
            variant="contained" 
            onClick={handleApplyFilters}
            size="small"
          >
            Aplicar
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            size="small"
          >
            Limpar
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        height: '100%',
        width: '100%',
        margin: '0 auto'
      }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Consumo Total</Typography>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {dashboardData.consumoTotal.toLocaleString('pt-BR')} kWh
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        height: '100%',
        width: '100%',
        margin: '0 auto'
      }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Energia Compensada</Typography>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {dashboardData.energiaCompensada.toLocaleString('pt-BR')} kWh
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        height: '100%',
        width: '100%',
        margin: '0 auto'
      }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Valor Total sem GD</Typography>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              R$ {dashboardData.valorTotalSemGD.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        height: '100%',
        width: '100%',
        margin: '0 auto'
      }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Economia GD</Typography>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              R$ {Math.abs(dashboardData.economiaGD).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {dashboardData.economiaGD < 0 && ' (negativo)'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            overflow: 'auto',
            width: '100%',
            margin: '0 auto'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Consumo vs Compensação</Typography>
            <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, display: 'flex', justifyContent: 'center' }}>
              <BarChart width={window.innerWidth < 600 ? 300 : 500} height={window.innerWidth < 600 ? 250 : 300} data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumo" fill="#8884d8" />
                <Bar dataKey="compensada" fill="#82ca9d" />
              </BarChart>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            overflow: 'auto',
            width: '100%',
            margin: '0 auto'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Evolução Financeira</Typography>
            <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, display: 'flex', justifyContent: 'center' }}>
              <LineChart width={window.innerWidth < 600 ? 300 : 500} height={window.innerWidth < 600 ? 250 : 300} data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
                <Line type="monotone" dataKey="economia" stroke="#82ca9d" />
              </LineChart>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}