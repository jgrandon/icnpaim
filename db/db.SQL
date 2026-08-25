
DROP DATABASE icnpaim;
CREATE DATABASE icnpaim;

DROP TABLE LearningRouteData;
DROP TABLE LearningRouteSchema;
DROP TABLE Progress;
DROP TABLE Content;
DROP TABLE Grade;
DROP TABLE Student;
DROP TABLE Unit;
DROP TABLE Subject;

CREATE TABLE Subject (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255) NOT NULL,
    bb_id varchar(255) NOT NULL
);

/* need this for report */
CREATE TABLE Subject_Student (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_id INT,
    student_id INT,
    last_access DATE DEFAULT CURRENT_DATE,
    CONSTRAINT FK_Subject_SubjectStudent
        FOREIGN KEY (subject_id) REFERENCES Subject(id),
    CONSTRAINT FK_Student_SubjectStudent
        FOREIGN KEY (student_id) REFERENCES Student(id),
	CONSTRAINT UQ_subject_student
        UNIQUE (subject_id, student_id)
);


CREATE TABLE Unit (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255) NOT NULL,
    description varchar(255),
    color varchar(255),
    position INT NOT NULL,
    expires_at BIGINT,
    free_progress BOOLEAN NOT NULL DEFAULT false,
    published BOOLEAN NOT NULL DEFAULT false,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    subject_id INT NOT NULL,
    evaluation_name varchar(255) DEFAULT '',
    evaluation_id varchar(255) DEFAULT NULL, -- bb content_id
    CONSTRAINT FK_SubjectUnit
        FOREIGN KEY (subject_id) REFERENCES Subject(id)
);

CREATE TABLE Content (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	title varchar(255) NOT NULL,
    description varchar(255),
    type varchar(255),
    url varchar(255) NOT NULL,
    bb_content_id varchar(255) default NULL,
    unit_id INT,
    CONSTRAINT FK_UnitContent
        FOREIGN KEY (unit_id) REFERENCES Unit(id)
);

CREATE TABLE Student (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255),
    bb_id varchar(255) NOT NULL
);

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
    bb_id varchar(255) NOT NULL,
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
        FOREIGN KEY (unit_id) REFERENCES Unit(id),
    CONSTRAINT UQ_UnitId_Level UNIQUE (unit_id, level)
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