import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import api from '../services/api';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      login(data.access_token);
    } catch (err) {
      const errorMessage = 'Credenciais inválidas';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        padding: { xs: 2, sm: 3 },
        backgroundColor: '#f5f5f5',
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <Box
        sx={{
          width: '90%',
          maxWidth: 450,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          p: { xs: 3, sm: 5 },
          textAlign: 'center',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem' }, // Tamanho de fonte responsivo
            fontWeight: 'bold',
            mb: { xs: 2, sm: 4 },
          }}
        >
          Login Lumi Energia
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
           
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: { xs: 1, sm: 1.5 }, // Altura responsiva do botão
              fontSize: { xs: '0.9rem', sm: '1rem' }, // Tamanho da fonte do botão
              bgcolor: '#2e7d32',
              '&:hover': {
                bgcolor: '#1b5e20',
              },
              minWidth: { xs: '100px', sm: '150px' }, // Largura mínima do botão
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </form>
      </Box>
    </Box>
  );
}