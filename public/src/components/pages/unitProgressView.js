import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  CardActions
} from '@material-ui/core';
import { 
  ArrowBack,
  PlayArrow, 
  CheckCircle, 
  OpenInNew,
  Assignment
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { openSnackbar } from '../page_objects/snackbar';

const styles = theme => ({
  root: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  headerCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3)
  },
  activityCard: {
    padding: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    borderRadius: theme.spacing(1),
    height: '100%',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[4]
    }
  },
  completedCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50'
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: theme.spacing(1)
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400
  },
  backButton: {
    marginBottom: theme.spacing(2)
  }
});

class UnitProgressView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unit: null,
      progress: null,
      loading: true,
      error: null,
      courseId: null,
      unitId: null,
      unitTitle: ''
    };
  }

  async componentDidMount() {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('courseId');
    const unitId = params.get('unitId');
    const unitTitle = params.get('unitTitle');

    if (!courseId || !unitId) {
      this.setState({ 
        error: 'Parámetros de unidad faltantes',
        loading: false 
      });
      return;
    }

    this.setState({ courseId, unitId, unitTitle });
    await this.loadUnitData(courseId, unitId);
  }

  loadUnitData = async (courseId, unitId) => {
    try {
      // Cargar datos de la unidad
      const unitsResponse = await fetch(`/api/courses/${courseId}/units/${unitId}`);
      console.log('UnitProgressView => loadUnitData => unitsResponse', unitsResponse)
      if (unitsResponse.ok) {
        console.log('UnitProgressView => loadUnitData => ok')
        const units = await unitsResponse.json();
        console.log('UnitProgressView => loadUnitData => units', units)
        const unit = units.find(u => u.id == unitId);
        
        if (unit) {
          this.setState({ unit });
        } else {
          throw new Error('Unidad no encontrada');
        }
      }

      // Cargar progreso
      const progressResponse = await fetch(`/api/v2/progress?courseId=${courseId}&unitId=${unitId}`);
      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        this.setState({ progress: progress[0] || null });
      }

      this.setState({ loading: false });
    } catch (error) {
      console.error('Error loading unit data:', error);
      this.setState({ 
        error: 'Error cargando datos de la unidad: ' + error.message,
        loading: false 
      });
    }
  };

  handleCardComplete = async (cardId) => {
    try {
      const response = await fetch('/api/v2/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          unitId: parseInt(this.state.unitId),
          completedCardId: cardId,
          courseId: parseInt(this.state.courseId)
        })
      });

      if (response.ok) {
        // Recargar progreso
        await this.loadUnitData(this.state.courseId, this.state.unitId);
        openSnackbar({ message: 'Actividad completada correctamente' });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      openSnackbar({ message: 'Error actualizando progreso' });
    }
  };

  getActivityTypeColor = (tipo) => {
    const colors = {
      video: '#e53e3e',
      lectura: '#3182ce',
      quiz: '#d69e2e',
      recurso: '#38a169',
      externo: '#805ad5'
    };
    return colors[tipo] || '#718096';
  };

  getCompletedCards = () => {
    if (!this.state.progress || !this.state.progress.meta?.completed_card_ids) return [];
    
    try {
      return typeof this.state.progress.meta.completed_card_ids === 'string' 
        ? JSON.parse(this.state.progress.meta.completed_card_ids)
        : this.state.progress.meta.completed_card_ids;
    } catch (e) {
      return [];
    }
  };

  goBack = () => {
    window.history.back();
  };

  render() {
    const { classes } = this.props;
    const { unit, progress, loading, error, unitTitle } = this.state;

    if (loading) {
      return (
        <div className={classes.loadingContainer}>
          <CircularProgress size={60} />
          <Typography variant="h6" style={{ marginLeft: 16 }}>
            Cargando progreso de la unidad...
          </Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className={classes.root}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={this.goBack}
            className={classes.backButton}
          >
            Volver al Dashboard
          </Button>
          <Card style={{ backgroundColor: '#ffebee' }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        </div>
      );
    }

    const cards = unit?.cards || [];
    const completedCards = this.getCompletedCards();
    const progressPercent = progress?.meta?.percent || 0;
    const completedCount = completedCards.length;
    const totalCards = cards.length;

    return (
      <div className={classes.root}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={this.goBack}
          className={classes.backButton}
          variant="outlined"
        >
          Volver al Dashboard
        </Button>

        {/* Header de la Unidad */}
        <Card className={classes.headerCard} elevation={4}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                <Assignment fontSize="large" />
                <Box>
                  <Typography variant="h4" component="h1">
                    {unitTitle || unit?.title?.rendered || unit?.title}
                  </Typography>
                  <Typography variant="subtitle1" style={{ opacity: 0.9 }}>
                    {completedCount} de {totalCards} actividades completadas
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" style={{ fontWeight: 'bold' }}>
                  {progressPercent}%
                </Typography>
                <Typography variant="body2" style={{ opacity: 0.9 }}>
                  Completado
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercent} 
              style={{ 
                height: 8, 
                borderRadius: 4, 
                marginTop: 16,
                backgroundColor: 'rgba(255,255,255,0.3)'
              }}
            />
          </CardContent>
        </Card>

        {/* Actividades */}
        <Typography variant="h5" style={{ marginBottom: 16, fontWeight: 600 }}>
          Actividades de la Unidad
        </Typography>

        {cards.length === 0 ? (
          <Card>
            <CardContent style={{ textAlign: 'center', padding: 32 }}>
              <Typography variant="h6" color="textSecondary">
                No hay actividades configuradas para esta unidad
              </Typography>
              <Typography variant="body2" color="textSecondary">
                El administrador debe configurar las actividades en WordPress
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {cards.map((card, index) => {
              const isCompleted = completedCards.includes(card.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={card.id}>
                  <Card 
                    className={`${classes.activityCard} ${isCompleted ? classes.completedCard : ''}`}
                    elevation={isCompleted ? 4 : 2}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 12 }}>
                        <Typography variant="h6" style={{ fontSize: 14, fontWeight: 600 }}>
                          Actividad {index + 1}
                        </Typography>
                        {isCompleted ? (
                          <CheckCircle style={{ color: '#4caf50', fontSize: 24 }} />
                        ) : (
                          <PlayArrow style={{ color: this.getActivityTypeColor(card.tipoActividad), fontSize: 24 }} />
                        )}
                      </Box>
                      
                      <Typography variant="h6" style={{ marginBottom: 12, fontSize: 16 }}>
                        {card.title}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 16 }}>
                        <Chip 
                          label={card.tipoActividad || 'actividad'} 
                          size="small"
                          style={{ 
                            backgroundColor: card.color || this.getActivityTypeColor(card.tipoActividad),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Peso: {card.peso || 1}
                        </Typography>
                      </Box>

                      {isCompleted && (
                        <Box 
                          style={{ 
                            backgroundColor: '#4caf50', 
                            color: 'white', 
                            padding: 8, 
                            borderRadius: 4,
                            textAlign: 'center',
                            marginBottom: 12
                          }}
                        >
                          <Typography variant="body2" style={{ fontWeight: 600 }}>
                            ✓ COMPLETADA
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions>
                      <Button
                        fullWidth
                        variant={isCompleted ? "outlined" : "contained"}
                        color="primary"
                        startIcon={<OpenInNew />}
                        onClick={() => {
                          if (card.url) {
                            window.open(card.url, '_blank');
                            if (!isCompleted) {
                              this.handleCardComplete(card.id);
                            }
                          }
                        }}
                      >
                        {isCompleted ? 'Revisar' : 'Comenzar'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(UnitProgressView);