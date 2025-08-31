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
  CircularProgress,
  Snackbar
} from '@material-ui/core';
import { 
  School, 
  Assignment, 
  PlayArrow, 
  CheckCircle, 
  Refresh,
  TrendingUp,
  OpenInNew
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { openSnackbar } from '../page_objects/snackbar';

const styles = theme => ({
  root: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginBottom: theme.spacing(3)
  },
  courseCard: {
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    border: '2px solid transparent',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
      borderColor: theme.palette.primary.main
    }
  },
  selectedCourse: {
    borderColor: theme.palette.primary.main,
    backgroundColor: '#f0f7ff'
  },
  unitCard: {
    marginBottom: theme.spacing(2),
    transition: 'all 0.2s ease'
  },
  activityCard: {
    padding: theme.spacing(1.5),
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    borderRadius: theme.spacing(1),
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
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  cardIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20
  },
  gradeChip: {
    fontWeight: 600
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
      error: null
    };
  }

  async componentDidMount() {
    try {
      await this.loadUserData();
      await this.loadCourses();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.setState({ 
        error: 'Error cargando el dashboard: ' + error.message, 
        loading: false
      });
    }
  }

  loadUserData = async () => {
    try {
      const response = await fetch('/api/me');
      if (!response.ok) {
        throw new Error(`Failed to load user data: ${response.status}`);
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
        console.warn('Courses API not available yet');
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
        openSnackbar({ message: 'Progreso actualizado correctamente' });
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
        // Recargar notas después del refresh
        const gradesResponse = await fetch(`/api/courses/${this.state.selectedCourse.id}/grades`);
        if (gradesResponse.ok) {
          const grades = await gradesResponse.json();
          this.setState({ grades });
        }
      } else {
        openSnackbar({ message: 'Error actualizando progreso' });
        openSnackbar({ message: 'Notas actualizadas desde el LMS' });
        console.error('Failed to refresh grades');
      }
        openSnackbar({ message: 'Error actualizando notas desde el LMS' });
    } catch (error) {
      console.error('Error refreshing grades:', error);
      openSnackbar({ message: 'Error de conexión' });
      openSnackbar({ message: 'Error de conexión con el LMS' });
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
      return typeof unitProgress.meta.completed_card_ids === 'string' 
        ? JSON.parse(unitProgress.meta.completed_card_ids)
        : unitProgress.meta.completed_card_ids;
    } catch (e) {
      return [];
    }
  };

  render() {
    const { classes } = this.props;
    const { user, courses, selectedCourse, units, grades, loading, refreshingGrades, error } = this.state;

    if (loading) {
      return (
        <div className={classes.loadingContainer}>
          <CircularProgress size={60} />
          <Typography variant="h6" style={{ marginLeft: 16 }}>
            Cargando dashboard...
          </Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className={classes.root}>
          <Card style={{ marginBottom: 16, backgroundColor: '#ffebee' }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className={classes.root}>
        {/* Header de Bienvenida */}
        <Card className={classes.welcomeCard} elevation={4}>
          <CardContent>
            <Box display="flex" alignItems="center" style={{ gap: 16 }}>
              <School fontSize="large" />
              <Box>
                <Typography variant="h4" component="h1">
                  ¡Bienvenido, {user?.name || 'Estudiante'}!
                </Typography>
                <Typography variant="subtitle1" style={{ opacity: 0.9 }}>
                  {selectedCourse ? selectedCourse.title : 'Plataforma de Aprendizaje ICNPAIM'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Cursos */}
        {courses.length > 0 && (
          <>
            <Typography variant="h5" className={classes.sectionTitle}>
              <Assignment className={classes.cardIcon} />
              Mis Cursos
            </Typography>
            
            <Grid container spacing={3}>
              {courses.map(course => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card 
                    className={`${classes.courseCard} ${selectedCourse?.id === course.id ? classes.selectedCourse : ''}`}
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
          </>
        )}

        {/* Unidades y Cards */}
        {selectedCourse && (
          <>
            <Typography variant="h5" className={classes.sectionTitle}>
              <TrendingUp className={classes.cardIcon} />
              Unidades - {selectedCourse.title}
            </Typography>

            {units.length === 0 ? (
              <Card>
                <CardContent className={classes.emptyState}>
                  <Typography variant="h6" color="textSecondary">
                    No hay unidades disponibles para este curso
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Las unidades se crearán automáticamente cuando el administrador configure el contenido
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              units.map(unit => {
                const cards = unit.cards || [];
                const completedCards = this.getCompletedCards(unit.id);
                const progress = this.getProgressForUnit(unit.id);

                return (
                  <Card key={unit.id} className={classes.unitCard} elevation={3}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
                        <Typography variant="h6">{unit.title?.rendered || unit.title}</Typography>
                        <Chip 
                          label={`${progress}% completado`} 
                          color={progress === 100 ? 'primary' : 'default'}
                          className={classes.gradeChip}
                        />
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        className={classes.progressBar}
                        color="primary"
                      />

                      {cards.length > 0 && (
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
                                    elevation={isCompleted ? 3 : 1}
                                  >
                                    <CardContent style={{ padding: 12 }}>
                                      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 8 }}>
                                        {isCompleted ? (
                                          <CheckCircle style={{ color: '#4caf50', fontSize: 20 }} />
                                        ) : (
                                          <PlayArrow style={{ color: this.getActivityTypeColor(card.tipoActividad), fontSize: 20 }} />
                                        )}
                                        <OpenInNew style={{ fontSize: 16, color: '#666' }} />
                                      </Box>
                                      <Typography variant="body2" style={{ fontWeight: 500, marginBottom: 4 }}>
                                        {card.title}
                                      </Typography>
                                      <Chip 
                                        label={card.tipoActividad || 'actividad'} 
                                        size="small"
                                        style={{ 
                                          backgroundColor: card.color || this.getActivityTypeColor(card.tipoActividad),
                                          color: 'white',
                                          fontSize: 10
                                        }}
                                      />
                                    </CardContent>
                                  </Card>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}

        {/* Notas */}
        {selectedCourse && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" className={classes.sectionTitle}>
              <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
                <School className={classes.cardIcon} />
                Mis Notas
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={refreshingGrades ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                onClick={this.refreshGrades}
                disabled={refreshingGrades}
              >
                {refreshingGrades ? 'Actualizando...' : 'Actualizar desde LMS'}
              </Button>
            </Box>

            <Card elevation={3}>
              <TableContainer>
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
                          <Box className={classes.emptyState}>
                            <Typography variant="body2" color="textSecondary">
                              No hay notas disponibles. Haz clic en "Actualizar desde LMS" para sincronizar.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      grades.map((grade, index) => {
                        const scoreGiven = grade.meta?.score_given || 0;
                        const scoreMaximum = grade.meta?.score_maximum || 100;
                        const percentage = scoreMaximum > 0 ? Math.round((scoreGiven / scoreMaximum) * 100) : 0;
                        const timestamp = grade.meta?.timestamp ? new Date(grade.meta.timestamp).toLocaleDateString() : 'N/A';

                        return (
                          <TableRow key={index} hover>
                            <TableCell>{grade.meta?.activity_title || grade.title?.rendered || 'Actividad'}</TableCell>
                            <TableCell align="center">{scoreGiven}</TableCell>
                            <TableCell align="center">{scoreMaximum}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={`${percentage}%`}
                                color={percentage >= 70 ? 'primary' : percentage >= 50 ? 'default' : 'secondary'}
                                size="small"
                                className={classes.gradeChip}
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
            </Card>
          </>
        )}

        {/* Estado sin curso seleccionado */}
        {!selectedCourse && courses.length > 0 && (
          <Card>
            <CardContent className={classes.emptyState}>
              <Typography variant="h6" color="textSecondary">
                Selecciona un curso arriba para ver las unidades y tu progreso
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Estado sin cursos */}
        {courses.length === 0 && !error && (
          <Card>
            <CardContent className={classes.emptyState}>
              <Typography variant="h6" color="textSecondary">
                Configurando tu experiencia de aprendizaje...
              </Typography>
              {user && (
                <Box style={{ marginTop: 16 }}>
                  <Typography variant="body2" color="textSecondary">
                    Usuario: {user.name}<br />
                    {user.context?.title && `Curso: ${user.context.title}`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(DashboardView);