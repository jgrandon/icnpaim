
DROP DATABASE icnpaim;
CREATE DATABASE icnpaim;

DROP TABLE LearningRouteData;
DROP TABLE LearningRouteSchema;
DROP TABLE Progress;
DROP TABLE Content;

CREATE TABLE Subject (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255) NOT NULL,
    bb_id INT
);

CREATE TABLE Unit (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255) NOT NULL,
    color varchar(255),
    position INT NOT NULL,
    bb_id INT NOT NULL,
    subject_id INT,
    evaluation_id INT, -- bb content_id
    CONSTRAINT FK_SubjectUnit
        FOREIGN KEY (subject_id) REFERENCES Subject(id)
);

CREATE TABLE Content (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	title varchar(255) NOT NULL,
    type varchar(255),
    url varchar(255) NOT NULL,
    unit_id INT,
    CONSTRAINT FK_UnitContent
        FOREIGN KEY (unit_id) REFERENCES Unit(id)
);

CREATE TABLE Student (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255),
    bb_id INT
);
INSERT INTO student (name, bb_id) VALUES ('John Doe', '123');

CREATE TABLE Progress (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    completed BOOLEAN DEFAULT FALSE,
    content_id INT,
    student_id INT,
    CONSTRAINT FK_ContentProgress
        FOREIGN KEY (content_id) REFERENCES Content(id),
    CONSTRAINT FK_StudentProgress
        FOREIGN KEY (student_id) REFERENCES Student(id),
	CONSTRAINT UQ_content_student
        UNIQUE (content_id, student_id)
);

CREATE TABLE Grade (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    grade float,
    bb_id INT,
    subject_id INT,
    student_id INT,
    CONSTRAINT FK_SubjectGrad
        FOREIGN KEY (subject_id) REFERENCES Subject(id),
    CONSTRAINT FK_StudentGrade
        FOREIGN KEY (student_id) REFERENCES Student(id)
);

CREATE TABLE LearningRouteSchema (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level INT NOT NULL,
    min_grade FLOAT NOT NULL,
    max_grade FLOAT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE, 
    unit_id INT,
    CONSTRAINT FK_UnitLearningRouteSchema
        FOREIGN KEY (unit_id) REFERENCES Unit(id)
    CONSTRAINT unique_lr_unit_level UNIQUE (unit_id, level)
);

CREATE TABLE LearningRouteSchema (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level INT NOT NULL,
    min_grade FLOAT NOT NULL,
    max_grade FLOAT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE, 
    unit_id INT,
    CONSTRAINT FK_UnitLearningRouteSchema
        FOREIGN KEY (unit_id) REFERENCES Unit(id),
    CONSTRAINT UQ_UnitId_Level 
        UNIQUE (unit_id, level)
);

CREATE TABLE LearningRouteData (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    position INT NOT NULL,
    learning_route_id INT,
    content_id INT,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT FK_LRDataLearningRSchema
        FOREIGN KEY (learning_route_id) REFERENCES LearningRouteSchema(id),
    CONSTRAINT FK_LRDataContent
        FOREIGN KEY (content_id) REFERENCES Content(id),
    CONSTRAINT UQ_LearningRouteId_ContentId
        UNIQUE (learning_route_id, content_id)
);