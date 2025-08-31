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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@material-ui/core';
import { 
  School, 
  Assignment, 
  PlayArrow, 
  CheckCircle, 
  Refresh,
  TrendingUp 
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    padding: theme.spacing(3),
    // Ocultar el header del dashboard demo
    '& .MuiAppBar-root': {
      display: 'none !important'
    },
    '& .MuiDrawer-root': {
      display: 'none !important'
    },
    '& .Dashboard-appBarSpacer-13': {
      display: 'none !important'
    }
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3)
  },
  courseCard: {
    height: '100%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8]
    }
  },
  unitCard: {
    marginBottom: theme.spacing(2)
  },
  activityCard: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'scale(1.02)',
      borderColor: theme.palette.primary.main
    }
  },
  completedCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1)
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  },
  errorCard: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  debugInfo: {
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: '12px'
  }
});

class DashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      courses: [],
      selectedCourse: null,
      units: [],
      grades: [],
      progress: [],
      loading: true,
      refreshingGrades: false,
      error: null,
      debugInfo: null
    };
  }

  async componentDidMount() {
    try {
      await this.loadUserData();
      await this.loadCourses();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.setState({ 
        error: 'Error cargando el dashboard', 
        loading: false,
        debugInfo: error.message 
      });
    }
  }

  loadUserData = async () => {
    try {
      const response = await fetch('/api/me');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load user data: ${response.status} - ${errorText}`);
      }
      const user = await response.json();
      this.setState({ user });
    } catch (error) {
      console.error('Error loading user:', error);
      throw error;
    }
  };

  loadCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        console.warn('Courses API not available yet, showing basic info');
        this.setState({ courses: [], loading: false });
        return;
      }
      const courses = await response.json();
      this.setState({ courses, loading: false });
      
      // Auto-seleccionar primer curso si existe
      if (courses.length > 0) {
        this.selectCourse(courses[0]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Silently fail and show basic dashboard
      this.setState({ courses: [], loading: false });
    }
  };

  selectCourse = async (course) => {
    this.setState({ selectedCourse: course, units: [], grades: [], progress: [] });
    
    try {
      // Cargar unidades
      const unitsResponse = await fetch(`/api/courses/${course.id}/units`);
      if (unitsResponse.ok) {
        const units = await unitsResponse.json();
        this.setState({ units });
      }

      // Cargar notas
      const gradesResponse = await fetch(`/api/courses/${course.id}/grades`);
      if (gradesResponse.ok) {
        const grades = await gradesResponse.json();
        this.setState({ grades });
      }

      // Cargar progreso
      const progressResponse = await fetch(`/api/progress?courseId=${course.id}`);
      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        this.setState({ progress });
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    }
  };

  handleCardComplete = async (unitId, cardId) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          unitId,
          completedCardId: cardId,
          courseId: this.state.selectedCourse.id
        })
      });

      if (response.ok) {
        // Recargar progreso
        const progressResponse = await fetch(`/api/progress?courseId=${this.state.selectedCourse.id}`);
        if (progressResponse.ok) {
          const progress = await progressResponse.json();
          this.setState({ progress });
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  refreshGrades = async () => {
    this.setState({ refreshingGrades: true });
    try {
      const response = await fetch('/api/grades/refresh', {
        method: 'POST'
      });

      if (response.ok) {
        const grades = await response.json();
        this.setState({ grades });
      } else {
        console.error('Failed to refresh grades');
      }
    } catch (error) {
      console.error('Error refreshing grades:', error);
    } finally {
      this.setState({ refreshingGrades: false });
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

  getProgressForUnit = (unitId) => {
    const unitProgress = this.state.progress.find(p => p.meta && p.meta.unit_id == unitId);
    return unitProgress ? (unitProgress.meta.percent || 0) : 0;
  };

  getCompletedCards = (unitId) => {
    const unitProgress = this.state.progress.find(p => p.meta && p.meta.unit_id == unitId);
    if (!unitProgress || !unitProgress.meta.completed_card_ids) return [];
    
    try {
      return JSON.parse(unitProgress.meta.completed_card_ids);
    } catch (e) {
      return [];
    }
  };

  render() {
    const { classes } = this.props;
    const { user, courses, selectedCourse, units, grades, loading, refreshingGrades, error, debugInfo } = this.state;

    if (loading) {
      return (
        <div className={classes.loadingContainer}>
          <CircularProgress size={60} />
        </div>
      );
    }


    return (
      <div className={classes.root}>
        {/* Header de Bienvenida */}
        <Card className={classes.welcomeCard}>
          <CardContent>
            <Box display="flex" alignItems="center" style={{ gap: 16 }}>
              <School fontSize="large" />
              <Box>
                <Typography variant="h4" component="h1">
                  ¡Bienvenido, {user?.name || 'Estudiante'}!
                </Typography>
                <Typography variant="subtitle1" style={{ opacity: 0.9 }}>
                  {selectedCourse ? selectedCourse.title : 'Selecciona un curso para comenzar'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Cursos */}
        <Typography variant="h5" className={classes.sectionTitle}>
          <Assignment style={{ marginRight: 8 }} />
          Mis Cursos
        </Typography>
        
        <Grid container spacing={3}>
          {courses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card 
                className={classes.courseCard}
                onClick={() => this.selectCourse(course)}
                elevation={selectedCourse?.id === course.id ? 8 : 2}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {course.meta?.lms_context_label || 'Curso'}
                  </Typography>
                  {selectedCourse?.id === course.id && (
                    <Chip 
                      label="Seleccionado" 
                      color="primary" 
                      size="small" 
                      style={{ marginTop: 8 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Unidades y Cards */}
        {selectedCourse && (
          <>
            <Typography variant="h5" className={classes.sectionTitle}>
              <TrendingUp style={{ marginRight: 8 }} />
              Unidades - {selectedCourse.title}
            </Typography>

            {units.map(unit => {
              const cards = unit.cards || [];
              const completedCards = this.getCompletedCards(unit.id);
              const progress = this.getProgressForUnit(unit.id);

              return (
                <Card key={unit.id} className={classes.unitCard}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
                      <Typography variant="h6">{unit.title}</Typography>
                      <Chip 
                        label={`${progress}% completado`} 
                        color={progress === 100 ? 'primary' : 'default'}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      className={classes.progressBar}
                    />

                    <Box style={{ marginTop: 16 }}>
                      <Grid container spacing={1}>
                        {cards.map(card => {
                          const isCompleted = completedCards.includes(card.id);
                          return (
                            <Grid item xs={12} sm={6} md={3} key={card.id}>
                              <Card 
                                className={`${classes.activityCard} ${isCompleted ? classes.completedCard : ''}`}
                                onClick={() => {
                                  if (card.url) {
                                    window.open(card.url, '_blank');
                                    if (!isCompleted) {
                                      this.handleCardComplete(unit.id, card.id);
                                    }
                                  }
                                }}
                              >
                                <CardContent style={{ padding: 12 }}>
                                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                                    {isCompleted ? (
                                      <CheckCircle style={{ color: '#4caf50', fontSize: 20 }} />
                                    ) : (
                                      <PlayArrow style={{ color: this.getActivityTypeColor(card.tipoActividad), fontSize: 20 }} />
                                    )}
                                    <Typography variant="body2" style={{ fontWeight: 500 }}>
                                      {card.title}
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label={card.tipoActividad || 'actividad'} 
                                    size="small"
                                    style={{ 
                                      backgroundColor: card.color || this.getActivityTypeColor(card.tipoActividad),
                                      color: 'white',
                                      fontSize: 10,
                                      marginTop: 4
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}

        {/* Notas */}
        {selectedCourse && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" className={classes.sectionTitle}>
              <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
                <School style={{ marginRight: 8 }} />
                Mis Notas
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={refreshingGrades ? <CircularProgress size={20} /> : <Refresh />}
                onClick={this.refreshGrades}
                disabled={refreshingGrades}
              >
                {refreshingGrades ? 'Actualizando...' : 'Actualizar desde LMS'}
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Actividad</strong></TableCell>
                    <TableCell align="center"><strong>Nota</strong></TableCell>
                    <TableCell align="center"><strong>Máximo</strong></TableCell>
                    <TableCell align="center"><strong>Porcentaje</strong></TableCell>
                    <TableCell align="center"><strong>Fecha</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No hay notas disponibles. Haz clic en "Actualizar desde LMS" para sincronizar.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    grades.map((grade, index) => {
                      const scoreGiven = grade.meta?.score_given || 0;
                      const scoreMaximum = grade.meta?.score_maximum || 100;
                      const percentage = scoreMaximum > 0 ? Math.round((scoreGiven / scoreMaximum) * 100) : 0;
                      const timestamp = grade.meta?.timestamp ? new Date(grade.meta.timestamp).toLocaleDateString() : 'N/A';

                      return (
                        <TableRow key={index}>
                          <TableCell>{grade.meta?.activity_title || 'Actividad'}</TableCell>
                          <TableCell align="center">{scoreGiven}</TableCell>
                          <TableCell align="center">{scoreMaximum}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${percentage}%`}
                              color={percentage >= 70 ? 'primary' : percentage >= 50 ? 'default' : 'secondary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{timestamp}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Estado sin curso seleccionado */}
        {!selectedCourse && courses.length > 0 && (
          <Box textAlign="center" style={{ marginTop: 32 }}>
            <Typography variant="h6" color="textSecondary">
              Selecciona un curso arriba para ver las unidades y tu progreso
            </Typography>
          </Box>
        )}

        {/* Estado sin cursos */}
        {courses.length === 0 && !error && (
          <Box textAlign="center" style={{ marginTop: 32 }}>
            <Typography variant="h6" color="textSecondary">
              Configurando tu experiencia de aprendizaje...
            </Typography>
            {user && (
              <Box style={{ marginTop: 16 }}>
                <Typography variant="body2" color="textSecondary">
                  Usuario: {user.name}<br />
                  Curso: {user.context?.title || 'Cargando...'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(DashboardView);