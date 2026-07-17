insert into subject (name, bb_id) values ('NeuroBiologia', '_89726_1');

INSERT INTO student (name, bb_id) VALUES ('John Doe', '123');

INSERT INTO Unit (name, description, color, position, bb_id, subject_id, evaluation_id, published)
VALUES (
'Unidad 1: Introducción a la Psicobiología y Celulas del Sistema Nervioso',
'Esta unidad sienta las bases conceptuales y examina los componentes fundamentales que permiten la comunicación en el cerebro.',
'#33CCFF', 1, 1, 1, 1, TRUE
), (
'Unidad 2: Anatomía Funcional del Sistema Nervioso',
'Un recorrido por la estructura macroscópica del sistema nervioso, vinculando la anatomía con las funciones conductuales.',
'blue', 2, 2, 1, 2, TRUE
), (
'Unidad 3: Sistemas Sensoriales, Motores y Neuroendocrinología',
'Estudio de cómo el organismo recibe información del entorno, ejecuta respuestas y se regula internamente a través de las hormonas.',
'purple', 3, 3, 1, 3, TRUE
), (
'Unidad 4: Bases Biológicas de los Procesos Psicológicos Complejos',
'Examen de cómo las redes neuronales y los sistemas biológicos subyacen a las funciones cognitivas y afectivas superiores.',
'orange', 4, 4, 1, 4, TRUE
);

INSERT INTO Content (title, description, type, url, unit_id)
VALUES ( '1.1. Concepto y método de la psicobiología' , 'Estudio de la relación entre la biología y la conducta, analizando cómo se aplica el método científico en las neurociencias.', 'Clase' , 'www.youtube.com',  1),
( '1.2. La neurona' , 'Análisis de la estructura neuronal (soma, dendritas, axón) y su clasificación morfológica y funcional como unidad básica del SN.', 'Clase' , 'www.youtube.com',  1),
( '1.3. Las células gliales' , 'Estudio de los tipos de glía (astrocitos, oligodendrocitos, microglia) y sus funciones esenciales de soporte, mielinización y defensa.', 'Clase' , 'www.youtube.com',  1),
( '1.4. Señales eléctricas de las neuronas' , 'Exploración de los fenómenos bioeléctricos: el potencial de membrana en reposo y la generación del potencial de acción.', 'Clase' , 'www.youtube.com',  1),
( '1.5. Transmisión sináptica' , 'Mecanismos de comunicación interneuronal mediante sinapsis eléctricas y químicas, liberación de neurotransmisores y activación de receptores.', 'Clase' , 'www.youtube.com',  1),
( '2.1. Organización general del Sistema Nervioso' , 'Distinción anatómica y funcional entre el Sistema Nervioso Central (SNC) y el Sistema Nervioso Periférico (somático y autónomo).', 'Clase' , 'www.youtube.com',  2),
( '2.2. Protección y soporte del SNC' , 'Estudio de los sistemas de amortiguación y defensa del cerebro y la médula: meninges, sistema ventricular y líquido cefalorraquídeo.', 'Clase' , 'www.youtube.com',  2),
( '2.3. El tronco encefálico y el cerebelo' , 'Análisis de las estructuras encargadas de las funciones vitales (respiración, ritmo cardíaco) y del control, equilibrio y coordinación motora.', 'Clase' , 'www.youtube.com',  2),
( '2.4. El diencéfalo y el sistema límbico' , 'Examen del tálamo e hipotálamo (homeostasis) y las estructuras del circuito de la emoción y la memoria (amígdala e hipocampo).', 'Clase' , 'www.youtube.com',  2),
( '2.5. La corteza cerebral' , 'Organización de la corteza en lóbulos (frontal, parietal, temporal, occipital) y la división entre áreas primarias y de asociación.', 'Clase' , 'www.youtube.com',  2),
( '3.1. Sistemas sensoriales (Visión y Audición)' , 'Procesamiento de estímulos externos desde los receptores periféricos hasta las cortezas sensoriales para construir la percepción.', 'Clase' , 'www.youtube.com',  3),
( '3.2. Sistemas somatosensorial y quimiosensorial' , 'Estudio de las vías biológicas del tacto, el dolor, el gusto y el olfato, y su impacto directo en el comportamiento adaptativo.', 'Clase' , 'www.youtube.com',  3),
( '3.3. Control del movimiento' , 'Integración neurobiológica de la ejecución motora: el papel de la corteza motora, los ganglios basales y las respuestas voluntarias e involuntarias.', 'Clase' , 'www.youtube.com',  3),
( '3.4. El sistema neuroendocrino' , 'Comprensión de la interacción del eje hipotálamo-hipófisis con las glándulas periféricas en la regulación del organismo.', 'Clase' , 'www.youtube.com',  3),
( '3.5. Hormonas y comportamiento' , 'Análisis del impacto de las hormonas en conductas específicas como la respuesta al estrés (eje HPA), la agresión y la conducta sexual.', 'Clase' , 'www.youtube.com',  3),
( '4.1. Aprendizaje y memoria' , 'Bases celulares de la memoria: plasticidad sináptica, potenciación a largo plazo (LTP) y el rol del hipocampo en la consolidación.', 'Clase' , 'www.youtube.com',  4),
( '4.2. Biología del sueño y ritmos biológicos' , 'Mecanismos del ciclo sueño-vigilia, funcionamiento del reloj biológico (núcleo supraquiasmático) y las fases del sueño (REM/no-REM).', 'Clase' , 'www.youtube.com',  4),
( '4.3. Neurobiología de la emoción y motivación' , 'El funcionamiento de los circuitos cerebrales de recompensa (vía dopaminérgica), el procesamiento del miedo y la regulación afectiva.', 'Clase' , 'www.youtube.com',  4),
( '4.4. Lenguaje y lateralización cerebral' , 'Estudio de la asimetría cerebral, especialización hemisférica y las áreas corticales implicadas en la producción y comprensión lingüística (Broca y Wernicke).', 'Clase' , 'www.youtube.com',  4),
( '4.5. Introducción a la psicopatología biológica' , 'Aproximación a las alteraciones neuroquímicas y estructurales que subyacen a trastornos como la depresión, la ansiedad y la esquizofrenia.', 'Clase' , 'www.youtube.com',  4);

INSERT INTO LearningRouteSchema (level, min_grade, max_grade, enabled, unit_id)
VALUES 
(1, 1.0, 4.0, true, 1),(2, 4.0, 5.5, true, 1),(3, 5.5, 7.0, true, 1),
(1, 1.0, 4.0, true, 2),(2, 4.0, 5.5, true, 2),(3, 5.5, 7.0, true, 2),
(1, 1.0, 4.0, true, 3),(2, 4.0, 5.5, true, 3),(3, 5.5, 7.0, true, 3),
(1, 1.0, 4.0, true, 4),(2, 4.0, 5.5, true, 4),(3, 5.5, 7.0, true, 4);

INSERT INTO LearningRouteData (learning_route_id, content_id, position, enabled)
VALUES 
(1, 1, 0, true),(1, 2, 1, true),(1, 3, 2, true),(1, 4, 3, true),(1, 5, 4, true),
(4, 6, 0, true),(4, 7, 1, true),(4, 8, 2, true),(4, 9, 3, true),(4, 10, 4, true),
(7, 11, 0, true),(7, 12, 1, true),(7, 13, 2, true),(7, 14, 3, true),(7, 15, 4, true),
(10, 16, 0, true),(10, 17, 1, true),(10, 18, 2, true),(10, 19, 3, true),(10, 20, 4, true);