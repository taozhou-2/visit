from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class TermData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    residency_group_descr = db.Column(db.String(100))
    academic_year = db.Column(db.Integer)
    term = db.Column(db.Integer)
    term_descr = db.Column(db.String(100))
    academic_career_descr = db.Column(db.String(100))
    acad_prog = db.Column(db.Integer)
    academic_program_descr = db.Column(db.String(100))
    course_id = db.Column(db.Integer)
    offer_number = db.Column(db.Integer)
    faculty = db.Column(db.String(100))
    faculty_descr = db.Column(db.String(100))
    school = db.Column(db.String(100))
    school_name = db.Column(db.String(100))
    course_name = db.Column(db.String(100))
    course_code = db.Column(db.String(100))
    catalog_number = db.Column(db.Integer)
    crse_attr = db.Column(db.String(100))
    masked_id = db.Column(db.String(100))



class ExtraData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    residency_group_descr = db.Column(db.String(100))
    academic_year = db.Column(db.Integer)
    term = db.Column(db.Integer)
    term_descr = db.Column(db.String(100))
    academic_career_descr = db.Column(db.String(100))
    acad_prog = db.Column(db.Integer)
    academic_program_descr = db.Column(db.String(100))
    course_id = db.Column(db.Integer)
    offer_number = db.Column(db.Integer)
    faculty = db.Column(db.String(100))
    faculty_descr = db.Column(db.String(100))
    school = db.Column(db.String(100))
    school_name = db.Column(db.String(100))
    course_name = db.Column(db.String(100))
    course_code = db.Column(db.String(100))
    gender = db.Column(db.String(100))
    first_generation_ind = db.Column(db.String(100))
    atsi_desc = db.Column(db.String(100))
    atsi_group = db.Column(db.String(100))
    regional_remote = db.Column(db.String(100))
    ses = db.Column(db.String(100))
    admission_pathway = db.Column(db.String(100))
    catalog_number = db.Column(db.Integer)
    crse_attr = db.Column(db.String(100))
    masked_id = db.Column(db.String(100))


# 三张主要数据表的设计
# Ryan设计的三张表格形式
# 对应了四种upload方式
# 1. 默认上传一个最新的文件
# 2. 上传两个文件，一个before，一个after，用于Census Day的分析
# 3. 上传两个文件，一个before，一个after，用于YoY的分析
# 4. 上传两个文件，一个before，一个after，用于Census Day的分析和YoY的分析

class CurrentData(db.Model):
    """当前/最新数据表 - 默认上传和大部分分析都用这张表"""
    id = db.Column(db.Integer, primary_key=True)
    
    residency_group_descr = db.Column(db.String(100))
    academic_year = db.Column(db.Integer)
    term = db.Column(db.Integer)
    term_descr = db.Column(db.String(100))
    academic_career_descr = db.Column(db.String(100))
    acad_prog = db.Column(db.Integer)
    academic_program_descr = db.Column(db.String(100))
    course_id = db.Column(db.Integer)
    offer_number = db.Column(db.Integer)
    faculty = db.Column(db.String(100))
    faculty_descr = db.Column(db.String(100))
    school = db.Column(db.String(100))
    school_name = db.Column(db.String(100))
    course_name = db.Column(db.String(100))
    gender = db.Column(db.String(100))
    first_generation_ind = db.Column(db.String(100))
    atsi_desc = db.Column(db.String(100))
    atsi_group = db.Column(db.String(100))
    regional_remote = db.Column(db.String(100))
    ses = db.Column(db.String(100))
    admission_pathway = db.Column(db.String(100))
    course_code = db.Column(db.String(100))
    catalog_number = db.Column(db.Integer)
    crse_attr = db.Column(db.String(100))
    masked_id = db.Column(db.String(100))

class BeforeCensusData(db.Model):
    """Census Day之前数据表 - 用于Census Day对比分析"""
    id = db.Column(db.Integer, primary_key=True)
    
    residency_group_descr = db.Column(db.String(100))
    academic_year = db.Column(db.Integer)
    term = db.Column(db.Integer)
    term_descr = db.Column(db.String(100))
    academic_career_descr = db.Column(db.String(100))
    acad_prog = db.Column(db.Integer)
    academic_program_descr = db.Column(db.String(100))
    course_id = db.Column(db.Integer)
    offer_number = db.Column(db.Integer)
    faculty = db.Column(db.String(100))
    faculty_descr = db.Column(db.String(100))
    school = db.Column(db.String(100))
    school_name = db.Column(db.String(100))
    course_name = db.Column(db.String(100))
    gender = db.Column(db.String(100))
    first_generation_ind = db.Column(db.String(100))
    atsi_desc = db.Column(db.String(100))
    atsi_group = db.Column(db.String(100))
    regional_remote = db.Column(db.String(100))
    ses = db.Column(db.String(100))
    admission_pathway = db.Column(db.String(100))
    course_code = db.Column(db.String(100))
    catalog_number = db.Column(db.Integer)
    crse_attr = db.Column(db.String(100))
    masked_id = db.Column(db.String(100))

class PreviousData(db.Model):
    """历史数据表 - 用于年度对比分析"""
    id = db.Column(db.Integer, primary_key=True)
    
    residency_group_descr = db.Column(db.String(100))
    academic_year = db.Column(db.Integer)
    term = db.Column(db.Integer)
    term_descr = db.Column(db.String(100))
    academic_career_descr = db.Column(db.String(100))
    acad_prog = db.Column(db.Integer)
    academic_program_descr = db.Column(db.String(100))
    course_id = db.Column(db.Integer)
    offer_number = db.Column(db.Integer)
    faculty = db.Column(db.String(100))
    faculty_descr = db.Column(db.String(100))
    school = db.Column(db.String(100))
    school_name = db.Column(db.String(100))
    course_name = db.Column(db.String(100))
    course_code = db.Column(db.String(100))
    catalog_number = db.Column(db.Integer)
    crse_attr = db.Column(db.String(100))
    masked_id = db.Column(db.String(100))