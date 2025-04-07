import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, FormControl, MenuItem, Select, InputLabel, SelectChangeEvent, Alert, Snackbar, IconButton, Tooltip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Cliente {
  id: string;
  num_cliente: string;
  nome: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Fatura {
  id: string;
  cliente_id: string;
  mes_referencia: string;
  energia_eletrica_kwh: string;
  energia_eletrica_valor: string;
  energia_scee_kwh: string;
  energia_scee_valor: string;
  energia_compensada_kwh: string;
  energia_compensada_valor: string;
  contrib_ilum_pub_municipal: string;
  consumo_energia_eletrica_kwh: string;
  valor_total_sem_gd: string;
  total_a_pagar: string;
  pdf_path: string | null;
  numero_instalacao: string;
  data_vencimento: string;
  cliente: Cliente;
}

export default function FaturasPage() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [clienteId, setClienteId] = useState('');
  const [mesReferencia, setMesReferencia] = useState('');
  
  // Lista de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Upload de arquivos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);

  const fetchFaturas = async () => {
    try {
      setLoading(true);
      
      // Construir parâmetros de consulta
      const params = {};
      if (clienteId) params.clienteId = clienteId;
      if (mesReferencia) params.mesReferencia = mesReferencia;
      
      // Obter dados de faturas da API
      const response = await api.get('/faturas', { params });
      
      if (response.data && response.data.data && response.data.data.data) {
        setFaturas(response.data.data.data);
      }
    } catch (err) {
      setError('Erro ao carregar faturas');
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
    fetchFaturas();
    fetchClientes();
  }, []);
  
  // Função para aplicar filtros
  const handleApplyFilters = () => {
    fetchFaturas();
  };
  
  // Função para limpar filtros
  const handleClearFilters = () => {
    setClienteId('');
    setMesReferencia('');
    fetchFaturas();
  };
  
  // Função para lidar com a mudança de cliente
  const handleClienteChange = (event: SelectChangeEvent) => {
    setClienteId(event.target.value);
  };

  // Função para download da fatura
  const handleDownload = async (fatura: Fatura) => {
    try {
      // Adicionar ID da fatura ao estado de download
      setDownloadingIds(prev => [...prev, fatura.id]);
      
      // Fazer requisição para a API usando a rota /fatura/download/:id
      const response = await api.get(`/faturas/download/${fatura.id}`, {
        responseType: 'blob' // Importante para receber o arquivo como blob
      });
      
      // Criar URL do blob para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Criar elemento de link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura_${fatura.cliente.num_cliente}_${fatura.mes_referencia}.pdf`);
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar a URL do objeto
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao fazer download da fatura:', err);
      setError('Não foi possível fazer o download da fatura. Tente novamente mais tarde.');
      setOpenSnackbar(true);
    } finally {
      // Remover ID da fatura do estado de download
      setDownloadingIds(prev => prev.filter(id => id !== fatura.id));
    }
  };
  
  // Função para abrir o seletor de arquivos
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Função para processar o upload de arquivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      
      // Adicionar cada arquivo ao FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      // Enviar para a API
      const response = await api.post('/faturas/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadSuccess(true);
      setOpenSnackbar(true);
      
      // Recarregar a lista de faturas após o upload bem-sucedido
      fetchFaturas();
    } catch (err) {
      console.error('Erro ao fazer upload de arquivos:', err);
      setUploadError('Falha ao processar os arquivos. Por favor, tente novamente.');
      setOpenSnackbar(true);
    } finally {
      setUploading(false);
      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Função para fechar o Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      p: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      overflow: 'auto',
      minHeight: '100%',
      flexGrow: 1,
      margin: 0
    }}>
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          Biblioteca de Faturas
        </Typography>
        
        <Box>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf"
          />
          <Tooltip title="Fazer upload de faturas">
            <IconButton 
              color="primary" 
              onClick={handleUploadClick}
              disabled={uploading}
              sx={{ mr: 1 }}
            >
              <UploadFileIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadClick}
            disabled={uploading}
            startIcon={<UploadFileIcon />}
            size="small"
          >
            {uploading ? 'Enviando...' : 'Upload de Faturas'}
          </Button>
        </Box>
      </Box>
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={uploadError ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {uploadError || 'Arquivos processados com sucesso!'}
        </Alert>
      </Snackbar>

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
          label="Mês de Referência"
          placeholder="MMM/AAAA"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
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

      <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Nº Cliente</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Nº Instalação</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Mês Referência</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Data Vencimento</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Consumo (kWh)</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Valor Total (R$)</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faturas.length > 0 ? (
              faturas.map((fatura) => (
                <TableRow key={fatura.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fatura.cliente.num_cliente}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fatura.numero_instalacao}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fatura.mes_referencia}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fatura.data_vencimento}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {parseFloat(fatura.consumo_energia_eletrica_kwh).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {parseFloat(fatura.total_a_pagar).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      onClick={() => handleDownload(fatura)}
                      disabled={downloadingIds.includes(fatura.id)}
                      startIcon={downloadingIds.includes(fatura.id) ? <CircularProgress size={16} /> : null}
                    >
                      {downloadingIds.includes(fatura.id) ? 'Baixando...' : 'Download PDF'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">Nenhuma fatura encontrada</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}