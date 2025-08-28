import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Button, Card, CardContent, Grid, Box } from '@material-ui/core';
import { styles } from '../../common/styles/custom.js';
import parameters from '../../util/parameters';
import TestPage from './testPage.js';

const params = parameters.getInstance();

export default class CustomLtiApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jwtData: null,
      userInfo: null,
      courseInfo: null,
      loading: true
    };
  }

  componentDidMount() {
    fetch(`jwtPayloadData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(jwtPayload => {
        this.setState({
          jwtData: jwtPayload,
          userInfo: {
            name: jwtPayload.body.name || 'Usuario',
            email: jwtPayload.body.email || 'No disponible',
            roles: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/roles'] || []
          },
          courseInfo: {
            title: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/context']?.title || 'Curso',
            id: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/context']?.id || 'N/A'
          },
          loading: false
        });
      })
      .catch(error => {
        console.error('Error loading JWT data:', error);
        this.setState({ loading: false });
      });
  }

  handleReturnToLearn = () => {
    if (this.state.jwtData && this.state.jwtData.return_url) {
      window.location.href = this.state.jwtData.return_url;
    }
  };

  render() {
    const { userInfo, courseInfo, loading, jwtData } = this.state;

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6">Cargando aplicación...</Typography>
        </Box>
      );
    }

    const verified = jwtData?.verified ? (
      <Typography variant="body1" style={styles.passed}>
        ✓ Conexión verificada
      </Typography>
    ) : (
      <Typography variant="body1" style={styles.failed}>
        ✗ Error de verificación
      </Typography>
    );

    return (
      <div>
        <Typography variant="h3" gutterBottom color="primary">
          Mi Aplicación LTI Personalizada
        </Typography>
        
        <Typography variant="h6" gutterBottom color="textSecondary">
          Bienvenido a tu aplicación integrada con Blackboard Learn
        </Typography>

        {verified}

        <Grid container spacing={3} style={{ marginTop: '20px' }}>
          {/* Información del Usuario */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom color="primary">
                  👤 Información del Usuario
                </Typography>
                <Typography variant="body1">
                  <strong>Nombre:</strong> {userInfo?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {userInfo?.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Roles:</strong> {userInfo?.roles?.join(', ') || 'No especificado'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del Curso */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom color="primary">
                  📚 Información del Curso
                </Typography>
                <Typography variant="body1">
                  <strong>Título:</strong> {courseInfo?.title}
                </Typography>
                <Typography variant="body1">
                  <strong>ID:</strong> {courseInfo?.id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Área de Contenido Principal */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom color="primary">
                  🚀 Tu Aplicación Personalizada
                </Typography>
                <Typography variant="body1" paragraph>
                  Esta es tu aplicación React personalizada integrada con LTI 1.3. 
                  Aquí puedes agregar cualquier funcionalidad que necesites para tu integración con WordPress.
                </Typography>
                
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Funcionalidades disponibles:
                  </Typography>
                  <ul>
                    <li>Acceso a información del usuario autenticado</li>
                    <li>Información del curso actual</li>
                    <li>Integración segura con Blackboard Learn</li>
                    <li>Preparado para integración con WordPress</li>
                  </ul>
                </Box>

                {/* Área para tu contenido personalizado */}
                <Box mt={4} p={3} bgcolor="grey.100" borderRadius={2}>
                  <Typography variant="h6" gutterBottom>
                    💡 Área de Desarrollo
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <TestPage />
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Botones de Acción */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="center" mt={3}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReturnToLearn}
                size="large"
              >
                🔙 Volver a Blackboard Learn
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary"
                size="large"
                onClick={() => {
                  // Aquí puedes agregar funcionalidad adicional
                  alert('Funcionalidad personalizada - conectar con WordPress');
                }}
              >
                🔗 Conectar con WordPress
              </Button>
            </Box>
          </Grid>
        </Grid>
      </div>
    );
  }
}