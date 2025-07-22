from .models import db, TermData, ExtraData, CurrentData, PreviousData, BeforeCensusData
from collections import defaultdict
import pandas as pd
from io import StringIO


def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()


def save_excel_data(data_frame):
    # df = pd.read_csv(data_frame)
    # required_cols = {
    #     'RESIDENCY_GROUP_DESCR', 'ACADEMIC_YEAR', 'TERM', 'TERM_DESCR',
    #     'ACADEMIC_CAREER_DESCR', 'ACAD_PROG', 'ACADEMIC_PROGRAM_DESCR',
    #     'COURSE_ID', 'OFFER_NUMBER', 'FACULTY', 'FACULTY_DESCR',
    #     'SCHOOL', 'SCHOOL_NAME', 'COURSE_NAME', 'COURSE_CODE',
    #     'CATALOG_NUMBER', 'CRSE_ATTR', 'MASKED_ID'
    # }

    records = []
    print('----------------')
    for _, row in data_frame.iterrows():
        record = TermData(
            residency_group_descr=row['RESIDENCY_GROUP_DESCR'],
            academic_year=row['ACADEMIC_YEAR'],
            term=row['TERM'],
            term_descr=row['TERM_DESCR'],
            academic_career_descr=row['ACADEMIC_CAREER_DESCR'],
            acad_prog=row['ACAD_PROG'],
            academic_program_descr=row['ACADEMIC_PROGRAM_DESCR'],
            course_id=row['COURSE_ID'],
            offer_number=row['OFFER_NUMBER'],
            faculty=row['FACULTY'],
            faculty_descr=row['FACULTY_DESCR'],
            school=row['SCHOOL'],
            school_name=row['SCHOOL_NAME'],
            course_name=row['COURSE_NAME'],
            course_code=row['COURSE_CODE'],
            catalog_number=row['CATALOG_NUMBER'],
            crse_attr=row['CRSE_ATTR'],
            masked_id=row['MASKED_ID']
        )

        records.append(record)

    db.session.bulk_save_objects(records)
    db.session.commit()

def save_gender_data(data_frame):
    # df = pd.read_csv(data_frame)
    # required_cols = {
    #     'RESIDENCY_GROUP_DESCR', 'ACADEMIC_YEAR', 'TERM', 'TERM_DESCR',
    #     'ACADEMIC_CAREER_DESCR', 'ACAD_PROG', 'ACADEMIC_PROGRAM_DESCR',
    #     'COURSE_ID', 'OFFER_NUMBER', 'FACULTY', 'FACULTY_DESCR',
    #     'SCHOOL', 'SCHOOL_NAME', 'COURSE_NAME', 'COURSE_CODE',
    #     'CATALOG_NUMBER', 'CRSE_ATTR', 'MASKED_ID'
    # }

    records = []
    print('----------------')
    for _, row in data_frame.iterrows():
        record = ExtraData(
            residency_group_descr=row['RESIDENCY_GROUP_DESCR'],
            academic_year=row['ACADEMIC_YEAR'],
            term=row['TERM'],
            term_descr=row['TERM_DESCR'],
            academic_career_descr=row['ACADEMIC_CAREER_DESCR'],
            acad_prog=row['ACAD_PROG'],
            academic_program_descr=row['ACADEMIC_PROGRAM_DESCR'],
            course_id=row['COURSE_ID'],
            offer_number=row['OFFER_NUMBER'],
            faculty=row['FACULTY'],
            faculty_descr=row['FACULTY_DESCR'],
            school=row['SCHOOL'],
            school_name=row['SCHOOL_NAME'],
            course_name=row['COURSE_NAME'],
            course_code=row['COURSE_CODE'],
            gender=row['GENDER'],
            first_generation_ind = row['FIRST_GENERATION_IND'],
            atsi_desc = row['ATSI_DESC'],
            atsi_group = row['ATSI_GROUP'],
            regional_remote = row['REGIONAL_REMOTE'],
            ses = row['SES'],
            admission_pathway = row['ADMISSION_PATHWAY'],
            catalog_number=row['CATALOG_NUMBER'],
            crse_attr=row['CRSE_ATTR'],
            masked_id=row['MASKED_ID']
        )

        records.append(record)


    db.session.bulk_save_objects(records)
    db.session.commit()

def read_file_data(file):
    """读取单个文件的数据"""
    file.stream.seek(0)  # 重置文件流位置
    filename = file.filename.lower()
    
    if filename.endswith('.csv'):
        data = pd.read_csv(StringIO(file.stream.read().decode("utf-8")))
    elif filename.endswith(('.xlsx', '.xls')):
        data = pd.read_excel(file.stream)
    else:
        raise ValueError(f"Unsupported file format: {filename}")
    
    return data

def get_file_year(data):
    """从数据中提取年份"""
    if 'ACADEMIC_YEAR' not in data.columns:
        raise ValueError("ACADEMIC_YEAR column not found in file")
    
    # 获取最常见的年份值
    year = data['ACADEMIC_YEAR'].mode().iloc[0] if len(data['ACADEMIC_YEAR'].mode()) > 0 else data['ACADEMIC_YEAR'].iloc[0]
    return year

def sort_files_by_year(files):
    """根据年份对文件进行排序，返回 (data, filename, year) 的列表，按年份从小到大排序"""
    file_data_list = []
    
    for file in files:
        data = read_file_data(file)
        year = get_file_year(data)
        file_data_list.append((data, file.filename, year))
    
    # 按年份排序（从小到大）
    file_data_list.sort(key=lambda x: x[2])
    return file_data_list

def process_analysis_mode(analysis_mode, files):
    """根据分析模式处理文件"""
    results = {}
    
    if analysis_mode == 'default':
        # 默认模式：存储到当前数据表
        data = read_file_data(files[0])
        
        print(f"========== Default Mode ==========")
        print(f"FILE 1 (Current Data) - {files[0].filename}:")
        print(data.head())
        print(f"Shape: {data.shape}")
        print(f"Columns: {list(data.columns)}")
        print("=" * 50)
        
        save_to_table(data, 'current')
        results['processed_files'] = 1
        results['tables_updated'] = ['current_data']
        
    elif analysis_mode == 'yoy_comparison':
        # YoY对比模式：根据年份数据自动判断哪个是current，哪个是previous
        sorted_files = sort_files_by_year(files[:2])  # 只处理前两个文件
        
        # 按年份排序后：第一个是previous（年份较小），第二个是current（年份较大）
        previous_data, previous_filename, previous_year = sorted_files[0]
        current_data, current_filename, current_year = sorted_files[1]
        
        print(f"========== YoY Comparison Mode ==========")
        print(f"Previous Year Data (Year {previous_year}) - {previous_filename}:")
        print(previous_data.head())
        print(f"Shape: {previous_data.shape}")
        print(f"Columns: {list(previous_data.columns)}")
        print(f"\nCurrent Year Data (Year {current_year}) - {current_filename}:")
        print(current_data.head())
        print(f"Shape: {current_data.shape}")
        print(f"Columns: {list(current_data.columns)}")
        print("=" * 50)
        
        save_to_table(previous_data, 'previous')
        save_to_table(current_data, 'current')
        
        results['processed_files'] = 2
        results['tables_updated'] = ['previous_data', 'current_data']
        results['comparison_ready'] = True
        
    elif analysis_mode == 'census_day':
        # Census Day模式：第一个文件存到before census表，第二个存到当前表
        before_data = read_file_data(files[0])
        after_data = read_file_data(files[1])
        
        print(f"========== Census Day Mode ==========")
        print(f"FILE 1 (Before Census Day) - {files[0].filename}:")
        print(before_data.head())
        print(f"Shape: {before_data.shape}")
        print(f"Columns: {list(before_data.columns)}")
        print(f"\nFILE 2 (After Census Day) - {files[1].filename}:")
        print(after_data.head())
        print(f"Shape: {after_data.shape}")
        print(f"Columns: {list(after_data.columns)}")
        print("=" * 50)
        
        save_to_table(before_data, 'before_census')
        save_to_table(after_data, 'current')
        
        results['processed_files'] = 2
        results['tables_updated'] = ['before_census_data', 'current_data']
        results['census_analysis_ready'] = True
        
    elif analysis_mode == 'census_yoy':
        # Census Day + YoY模式：根据年份数据自动判断前两个文件哪个是previous，哪个是before_census，第三个文件为current
        # 处理前两个文件，按年份排序
        sorted_first_two = sort_files_by_year(files[:2])
        
        # 读取第三个文件（current data）
        current_data = read_file_data(files[2])
        
        # 按年份排序后：第一个是previous（年份较小），第二个是before_census（年份较大）
        previous_year_data, previous_filename, previous_year = sorted_first_two[0]
        before_census_data, before_filename, before_year = sorted_first_two[1]
        
        print(f"========== Census Day + YoY Mode ==========")
        print(f"Previous Year Data (Year {previous_year}) - {previous_filename}:")
        print(previous_year_data.head())
        print(f"Shape: {previous_year_data.shape}")
        print(f"Columns: {list(previous_year_data.columns)}")
        print(f"\nBefore Census Data (Year {before_year}) - {before_filename}:")
        print(before_census_data.head())
        print(f"Shape: {before_census_data.shape}")
        print(f"Columns: {list(before_census_data.columns)}")
        print(f"\nCurrent Year Data - {files[2].filename}:")
        print(current_data.head())
        print(f"Shape: {current_data.shape}")
        print(f"Columns: {list(current_data.columns)}")
        print("=" * 50)
        
        save_to_table(before_census_data, 'before_census')
        save_to_table(previous_year_data, 'previous')
        save_to_table(current_data, 'current')
        
        results['processed_files'] = 3
        results['tables_updated'] = ['before_census_data', 'previous_data', 'current_data']
        results['complex_analysis_ready'] = True
    
    return results

def save_to_table(data, table_type):
    """将数据保存到指定的表"""
    from database.models import CurrentData, PreviousData, BeforeCensusData
    from database.operations import db
    
    # 清空目标表并获取目标模型
    if table_type == 'current':
        db.session.query(CurrentData).delete()
        target_model = CurrentData
        # CurrentData支持所有字段
        supports_extended_fields = True
    elif table_type == 'previous':
        db.session.query(PreviousData).delete()
        target_model = PreviousData
        # PreviousData只支持基础字段（2024年格式）
        supports_extended_fields = False
    elif table_type == 'before_census':
        db.session.query(BeforeCensusData).delete()
        target_model = BeforeCensusData
        # BeforeCensusData支持所有字段
        supports_extended_fields = True
    else:
        raise ValueError(f"Unknown table type: {table_type}")
    
    # 获取目标模型的所有列名（除了id）
    model_columns = [column.name for column in target_model.__table__.columns if column.name != 'id']
    
    # 插入新数据
    records = []
    for _, row in data.iterrows():
        # 基础字段映射
        record_data = {
            'residency_group_descr': row.get('RESIDENCY_GROUP_DESCR'),
            'academic_year': row.get('ACADEMIC_YEAR'),
            'term': row.get('TERM'),
            'term_descr': row.get('TERM_DESCR'),
            'academic_career_descr': row.get('ACADEMIC_CAREER_DESCR'),
            'acad_prog': row.get('ACAD_PROG'),
            'academic_program_descr': row.get('ACADEMIC_PROGRAM_DESCR'),
            'course_id': row.get('COURSE_ID'),
            'offer_number': row.get('OFFER_NUMBER'),
            'faculty': row.get('FACULTY'),
            'faculty_descr': row.get('FACULTY_DESCR'),
            'school': row.get('SCHOOL'),
            'school_name': row.get('SCHOOL_NAME'),
            'course_name': row.get('COURSE_NAME'),
            'course_code': row.get('COURSE_CODE'),
            'catalog_number': row.get('CATALOG_NUMBER'),
            'crse_attr': row.get('CRSE_ATTR'),
            'masked_id': row.get('MASKED_ID')
        }
        
        # 扩展字段映射（仅当目标表支持且数据中存在时）
        if supports_extended_fields:
            extended_field_mapping = {
                'gender': 'GENDER',
                'first_generation_ind': 'FIRST_GENERATION_IND',
                'atsi_desc': 'ATSI_DESC',
                'atsi_group': 'ATSI_GROUP',
                'regional_remote': 'REGIONAL_REMOTE',
                'ses': 'SES',
                'admission_pathway': 'ADMISSION_PATHWAY'
            }
            
            for db_field, excel_field in extended_field_mapping.items():
                if db_field in model_columns and excel_field in data.columns:
                    record_data[db_field] = row.get(excel_field)
        
        # 只保留目标模型实际支持的字段
        filtered_record_data = {k: v for k, v in record_data.items() if k in model_columns}
        
        record = target_model(**filtered_record_data)
        records.append(record)
    
    db.session.bulk_save_objects(records)
    db.session.commit()
    
    print(f"Saved {len(records)} records to {table_type} table")
    
    # 输出调试信息
    if supports_extended_fields:
        extended_fields_found = [field for field in ['GENDER', 'FIRST_GENERATION_IND', 'ATSI_DESC', 'ATSI_GROUP', 'REGIONAL_REMOTE', 'SES', 'ADMISSION_PATHWAY'] if field in data.columns]
        print(f"Extended fields detected in data: {extended_fields_found}")
    else:
        print(f"Table {table_type} supports basic fields only (2024 format)")


def participation_gender_data():
    # 示例聚合：按column1分组求平均值
    result_gender = db.session.query(
        ExtraData.gender,
        db.func.count().label('record_count')
    ).group_by(ExtraData.gender).all()

    # 1. 获取每个 faculty_descr 和 gender 的数量
    gender_counts = db.session.query(
        ExtraData.faculty_descr,
        ExtraData.gender,
        db.func.count(ExtraData.id).label("count")
    ).group_by(
        ExtraData.faculty_descr,
        ExtraData.gender
    ).all()

    # 2. 获取每个 faculty_descr 的总人数
    faculty_totals = db.session.query(
        ExtraData.faculty_descr,
        db.func.count(ExtraData.id).label("total_count")
    ).group_by(ExtraData.faculty_descr).all()

    # 3. 将数据组织成字典格式
    faculty_dict = {}

    # 填充每个 faculty_descr 下的 gender counts
    for faculty_descr, gender, count in gender_counts:
        if faculty_descr not in faculty_dict:
            faculty_dict[faculty_descr] = {"gender_counts": {}, "total_count": 0}
        faculty_dict[faculty_descr]["gender_counts"][gender] = count

    # 填充每个 faculty_descr 的 total_count
    for faculty_descr, total_count in faculty_totals:
        if faculty_descr in faculty_dict:
            faculty_dict[faculty_descr]["total_count"] = total_count

    # 4. 根据总人数排序，倒序排列
    sorted_faculty_list = sorted(
        faculty_dict.items(),
        key=lambda item: item[1]["total_count"],
        reverse=True
    )

    return {"participation by gender": [{"gender": r.gender, "count": r.record_count} for r in result_gender],
            "gender proportion in WIL":[
                                            {
                                                "faculty_descr": faculty_descr,
                                                "gender_counts": data["gender_counts"],
                                                "total_count": data["total_count"]
                                            }
                                            for faculty_descr, data in sorted_faculty_list
                                        ]
            }


def year2year_faculty_data():
    term_results = db.session.query(
        TermData.faculty_descr,
        TermData.academic_year,
        db.func.count(TermData.id)
    ).group_by(TermData.faculty_descr, TermData.academic_year).all()

    # 2. 查询 2025 年数据（extra_data）
    extra_results = db.session.query(
        ExtraData.faculty_descr,
        ExtraData.academic_year,
        db.func.count(ExtraData.id)
    ).group_by(ExtraData.faculty_descr, ExtraData.academic_year).all()

    # 3. 合并结果
    combined = term_results + extra_results

    # 4. 构建数据结构 {faculty_descr: {year: count, ..., total: total_count}}
    faculty_map = defaultdict(lambda: defaultdict(int))

    for faculty_descr, year, count in combined:
        faculty_map[faculty_descr][str(year)] += count
        faculty_map[faculty_descr]['_total'] += count  # 用于排序

    # 5. 构造最终输出，并按总数倒序排序
    result = []
    for faculty_descr, year_counts in faculty_map.items():
        entry = {"faculty_descr": faculty_descr}
        # 排除 _total 字段，加入各年数据
        for year, count in year_counts.items():
            if year != "_total":
                entry[year] = count
        result.append((entry, year_counts['_total']))

    # 6. 按总人数降序排列
    result_sorted = sorted(result, key=lambda x: x[1], reverse=True)

    # 7. 去除排序辅助值，仅保留字典数据
    final_output = [entry for entry, _ in result_sorted]

    return final_output


def year2year_faculty_residency_data():
    term_results = db.session.query(
        TermData.faculty_descr,
        TermData.residency_group_descr,
        TermData.academic_year,
        db.func.count(TermData.id)
    ).group_by(
        TermData.faculty_descr,
        TermData.residency_group_descr,
        TermData.academic_year
    ).all()

    # 查询 extra_data 表
    extra_results = db.session.query(
        ExtraData.faculty_descr,
        ExtraData.residency_group_descr,
        ExtraData.academic_year,
        db.func.count(ExtraData.id)
    ).group_by(
        ExtraData.faculty_descr,
        ExtraData.residency_group_descr,
        ExtraData.academic_year
    ).all()

    combined = term_results + extra_results
    faculty_map = {}

    for faculty_descr, residency_descr, year, count in combined:
        year = str(year)
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {'_total': 0, 'residency_groups': {}}
        if residency_descr not in faculty_map[faculty_descr]['residency_groups']:
            faculty_map[faculty_descr]['residency_groups'][residency_descr] = {}
        faculty_map[faculty_descr]['residency_groups'][residency_descr][year] = \
            faculty_map[faculty_descr]['residency_groups'][residency_descr].get(year, 0) + count
        faculty_map[faculty_descr]['_total'] += count

    # 组装输出，按 faculty 总数降序排序
    result = []
    for faculty_descr, data in faculty_map.items():
        residency_list = []
        for residency_descr, years in data['residency_groups'].items():
            entry = {'residency_group_descr': residency_descr}
            entry.update(years)
            residency_list.append(entry)
        result.append({
            'faculty_descr': faculty_descr,
            'total': data['_total'],
            'residency_groups': residency_list
        })

    result.sort(key=lambda x: x['total'], reverse=True)
    return result


def equity_cohort_data():
    # 查询 extra_data 表中的聚合结果
    results = db.session.query(
        ExtraData.faculty_descr,
        ExtraData.first_generation_ind,
        db.func.count(ExtraData.id)
    ).group_by(
        ExtraData.faculty_descr,
        ExtraData.first_generation_ind
    ).all()

    # 构建数据结构 {faculty_descr: {first_generation_ind: count, ..., total: count}}
    faculty_map = {}

    for faculty_descr, first_gen_ind, count in results:
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {"total": 0}
        faculty_map[faculty_descr][first_gen_ind] = count
        faculty_map[faculty_descr]["total"] += count

    # 转为列表结构，准备排序
    result_first_generation = []
    for faculty_descr, values in faculty_map.items():
        row = {"faculty_descr": faculty_descr}
        row.update(values)
        result_first_generation.append(row)

    # 按总人数降序排序
    result_first_generation.sort(key=lambda x: x["total"], reverse=True)
    return {
            "first generation": result_first_generation,
            "ses": ses_data(),
            "atsi group": atsi_group_data(),
            "regional remote": regional_remote_data()
    }

def ses_data():
    results = db.session.query(
        ExtraData.faculty_descr,
        ExtraData.ses,
        db.func.count(ExtraData.id)
    ).group_by(
        ExtraData.faculty_descr,
        ExtraData.ses
    ).all()

    # 构建 faculty -> ses 分布映射
    faculty_map = {}

    for faculty_descr, ses_value, count in results:
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {"total": 0}
        faculty_map[faculty_descr][ses_value] = count
        faculty_map[faculty_descr]["total"] += count

    # 构建输出结果列表
    output = []
    for faculty_descr, values in faculty_map.items():
        row = {"faculty_descr": faculty_descr}
        row.update(values)
        output.append(row)

    # 按 total 倒序排序
    output.sort(key=lambda x: x["total"], reverse=True)
    return output

def atsi_group_data():
    results = db.session.query(
        ExtraData.faculty_descr,
        ExtraData.atsi_group,
        db.func.count(ExtraData.id)
    ).group_by(
        ExtraData.faculty_descr,
        ExtraData.atsi_group
    ).all()

    # 构建 faculty -> atsi_group 分布映射
    faculty_map = {}

    for faculty_descr, atsi_group_value, count in results:
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {"total": 0}
        faculty_map[faculty_descr][atsi_group_value] = count
        faculty_map[faculty_descr]["total"] += count

    # 构建输出结果列表
    output = []
    for faculty_descr, values in faculty_map.items():
        row = {"faculty_descr": faculty_descr}
        row.update(values)
        output.append(row)

    # 按 total 倒序排序
    output.sort(key=lambda x: x["total"], reverse=True)
    return output

def regional_remote_data():
    result_regional_remote = db.session.query(
        ExtraData.regional_remote,
        db.func.count().label('record_count')
    ).group_by(ExtraData.regional_remote).all()

    output = [{"regional_remote": r.regional_remote, "count": r.record_count} for r in result_regional_remote]
    return output

def cdev_data():
    # 查询以 CDEV 开头的课程
    results = db.session.query(
        ExtraData.course_code,
        ExtraData.course_name,
        ExtraData.residency_group_descr,
        db.func.count(ExtraData.id)
    ).filter(
        ExtraData.course_code.startswith("CDEV")
    ).group_by(
        ExtraData.course_code,
        ExtraData.course_name,
        ExtraData.residency_group_descr
    ).all()

    # 构建 course_code -> residency 分布映射
    course_map = {}

    for course_code, course_name, residency_descr, count in results:
        if course_code not in course_map:
            course_map[course_code] = {
                "course_code": course_code,
                "course_name": course_name,
                "total": 0,
                "residency_breakdown": []
            }
        course_map[course_code]["residency_breakdown"].append({
            "residency_group_descr": residency_descr,
            "count": count
        })
        course_map[course_code]["total"] += count

    # 转成列表并排序
    course_output = list(course_map.values())
    course_output.sort(key=lambda x: x["total"], reverse=True)

    return {
        "CDEV by Residency and Course": course_output,
        "CDEV by Gender": cdev_gender_data()
    }

def cdev_gender_data():
    # 查询以 CDEV 开头的课程，按 gender 分类
    results = db.session.query(
        ExtraData.course_code,
        ExtraData.gender,
        db.func.count(ExtraData.id)
    ).filter(
        ExtraData.course_code.startswith("CDEV")
    ).group_by(
        ExtraData.course_code,
        ExtraData.gender
    ).all()

    # 构建 course_code -> gender 分布映射
    course_map = {}

    for course_code, gender, count in results:
        if course_code not in course_map:
            course_map[course_code] = {
                "course_code": course_code,
                "total": 0,
                "gender_breakdown": []
            }
        course_map[course_code]["gender_breakdown"].append({
            "gender": gender,
            "count": count
        })
        course_map[course_code]["total"] += count

    # 转成列表并按 total 降序排序
    output = list(course_map.values())
    output.sort(key=lambda x: x["total"], reverse=True)

    return output


# 仿写上面逻辑，用ryan设计三张表来实现
def current_participation_gender_data():
    """使用当前数据表进行性别参与度分析"""
    # 示例聚合：按gender分组求count（按masked_id去重统计人数）
    result_gender = db.session.query(
        CurrentData.gender,
        db.func.count(db.func.distinct(CurrentData.masked_id)).label('record_count')
    ).filter(CurrentData.gender.isnot(None)).group_by(CurrentData.gender).all()

    # 1. 获取每个 faculty_descr 和 gender 的人数（按masked_id去重）
    gender_counts = db.session.query(
        CurrentData.faculty_descr,
        CurrentData.gender,
        db.func.count(db.func.distinct(CurrentData.masked_id)).label("count")
    ).filter(CurrentData.gender.isnot(None)).group_by(
        CurrentData.faculty_descr,
        CurrentData.gender
    ).all()

    # 2. 获取每个 faculty_descr 的总人数（按masked_id去重）
    faculty_totals = db.session.query(
        CurrentData.faculty_descr,
        db.func.count(db.func.distinct(CurrentData.masked_id)).label("total_count")
    ).filter(CurrentData.gender.isnot(None)).group_by(CurrentData.faculty_descr).all()

    # 3. 将数据组织成字典格式
    faculty_dict = {}

    # 填充每个 faculty_descr 下的 gender counts
    for faculty_descr, gender, count in gender_counts:
        if faculty_descr not in faculty_dict:
            faculty_dict[faculty_descr] = {"gender_counts": {}, "total_count": 0}
        faculty_dict[faculty_descr]["gender_counts"][gender] = count

    # 填充每个 faculty_descr 的 total_count
    for faculty_descr, total_count in faculty_totals:
        if faculty_descr in faculty_dict:
            faculty_dict[faculty_descr]["total_count"] = total_count

    # 4. 根据总人数排序，倒序排列
    sorted_faculty_list = sorted(
        faculty_dict.items(),
        key=lambda item: item[1]["total_count"],
        reverse=True
    )

    return {"participation by gender": [{"gender": r.gender, "count": r.record_count} for r in result_gender],
            "gender proportion in WIL": [
                {
                    "faculty_descr": faculty_descr,
                    "gender_counts": data["gender_counts"],
                    "total_count": data["total_count"]
                }
                for faculty_descr, data in sorted_faculty_list
            ]}

def yoy_comparison_faculty_data():
    """年度对比分析 - 使用历史表和当前表，包含residency breakdown"""
    # 查询历史数据（按masked_id去重统计人数，包含residency信息）
    previous_results = db.session.query(
        PreviousData.faculty_descr,
        PreviousData.residency_group_descr,
        PreviousData.academic_year,
        db.func.count(db.func.distinct(PreviousData.masked_id))
    ).group_by(
        PreviousData.faculty_descr, 
        PreviousData.residency_group_descr,
        PreviousData.academic_year
    ).all()

    # 查询当前数据（按masked_id去重统计人数，包含residency信息）
    current_results = db.session.query(
        CurrentData.faculty_descr,
        CurrentData.residency_group_descr,
        CurrentData.academic_year,
        db.func.count(db.func.distinct(CurrentData.masked_id))
    ).group_by(
        CurrentData.faculty_descr,
        CurrentData.residency_group_descr, 
        CurrentData.academic_year
    ).all()

    # 合并结果
    combined = previous_results + current_results

    faculty_map = {}

    for faculty_descr, residency_descr, year, count in combined:
        year_str = str(year)
        
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {
                '_total': 0, 
                'years': defaultdict(int), 
                'residency_groups': {}
            }
        
        if residency_descr not in faculty_map[faculty_descr]['residency_groups']:
            faculty_map[faculty_descr]['residency_groups'][residency_descr] = {}
        
        # 记录residency breakdown
        faculty_map[faculty_descr]['residency_groups'][residency_descr][year_str] = \
            faculty_map[faculty_descr]['residency_groups'][residency_descr].get(year_str, 0) + count
        
        # 累计年度总数和总计
        faculty_map[faculty_descr]['years'][year_str] += count
        faculty_map[faculty_descr]['_total'] += count

    # 构造最终输出，并按总数倒序排序
    result = []
    for faculty_descr, data in faculty_map.items():
        # 基础年度数据（用于第一张图）
        entry = {"faculty_descr": faculty_descr}
        entry.update(data['years'])
        
        # 添加residency breakdown（用于第二张图）
        residency_list = []
        for residency_descr, years in data['residency_groups'].items():
            residency_entry = {'residency_group_descr': residency_descr}
            residency_entry.update(years)
            residency_list.append(residency_entry)
        
        entry['residency_breakdown'] = residency_list
        result.append((entry, data['_total']))

    # 按总人数降序排列
    result_sorted = sorted(result, key=lambda x: x[1], reverse=True)

    # 去除排序辅助值，仅保留字典数据
    final_output = [entry for entry, _ in result_sorted]

    return final_output

def census_comparison_data():
    """Census Day对比分析 - 使用before census表和当前表"""
    # 查询before census数据（按masked_id去重统计人数）
    before_results = db.session.query(
        BeforeCensusData.faculty_descr,
        db.func.count(db.func.distinct(BeforeCensusData.masked_id)).label('before_count')
    ).group_by(BeforeCensusData.faculty_descr).all()

    # 查询after census（当前）数据（按masked_id去重统计人数）
    after_results = db.session.query(
        CurrentData.faculty_descr,
        db.func.count(db.func.distinct(CurrentData.masked_id)).label('after_count')
    ).group_by(CurrentData.faculty_descr).all()

    # 合并数据
    faculty_comparison = {}
    
    for faculty_descr, before_count in before_results:
        faculty_comparison[faculty_descr] = {
            'faculty_descr': faculty_descr,
            'before_census': before_count,
            'after_census': 0,
            'difference': 0
        }
    
    for faculty_descr, after_count in after_results:
        if faculty_descr not in faculty_comparison:
            faculty_comparison[faculty_descr] = {
                'faculty_descr': faculty_descr,
                'before_census': 0,
                'after_census': after_count,
                'difference': 0
            }
        else:
            faculty_comparison[faculty_descr]['after_census'] = after_count
    
    # 计算差异
    for faculty_data in faculty_comparison.values():
        faculty_data['difference'] = faculty_data['after_census'] - faculty_data['before_census']
        faculty_data['change_percentage'] = (
            (faculty_data['difference'] / faculty_data['before_census'] * 100) 
            if faculty_data['before_census'] > 0 else 0
        )
    
    # 按差异排序
    result = sorted(faculty_comparison.values(), key=lambda x: abs(x['difference']), reverse=True)
    
    return result


def census_gender_drop_by_term_and_faculty(selected_term):
    """
    根据选择的term分析census前后按faculty和gender分组的drop人数
    
    Args:
        selected_term (str): 前端选择的term，格式如 'term1', 'term2', 'term3'
    
    Returns:
        list: 按faculty和gender分组的drop分析数据
    """

    db_term_format = selected_term
    if not db_term_format:
        return []
    
    # 查询before census数据（按faculty、gender和term过滤，按masked_id去重统计）
    before_results = db.session.query(
        BeforeCensusData.faculty_descr,
        BeforeCensusData.gender,
        db.func.count(db.func.distinct(BeforeCensusData.masked_id)).label('before_count')
    ).filter(
        BeforeCensusData.term_descr.like(f'%{db_term_format}%')
    ).group_by(
        BeforeCensusData.faculty_descr,
        BeforeCensusData.gender
    ).all()

    # 查询after census数据（按faculty、gender和term过滤，按masked_id去重统计）
    after_results = db.session.query(
        CurrentData.faculty_descr,
        CurrentData.gender,
        db.func.count(db.func.distinct(CurrentData.masked_id)).label('after_count')
    ).filter(
        CurrentData.term_descr.like(f'%{db_term_format}%')
    ).group_by(
        CurrentData.faculty_descr,
        CurrentData.gender
    ).all()

    # 构建数据结构 {faculty: {gender: {before: 0, after: 0}}}
    faculty_gender_data = {}
    
    # 处理before census数据
    for faculty_descr, gender, before_count in before_results:
        if faculty_descr not in faculty_gender_data:
            faculty_gender_data[faculty_descr] = {}
        if gender not in faculty_gender_data[faculty_descr]:
            faculty_gender_data[faculty_descr][gender] = {'before_census': 0, 'after_census': 0}
        faculty_gender_data[faculty_descr][gender]['before_census'] = before_count

    # 处理after census数据
    for faculty_descr, gender, after_count in after_results:
        if faculty_descr not in faculty_gender_data:
            faculty_gender_data[faculty_descr] = {}
        if gender not in faculty_gender_data[faculty_descr]:
            faculty_gender_data[faculty_descr][gender] = {'before_census': 0, 'after_census': 0}
        faculty_gender_data[faculty_descr][gender]['after_census'] = after_count

    # 构建最终结果
    result = []
    for faculty_descr, gender_data in faculty_gender_data.items():
        faculty_result = {
            'faculty_descr': faculty_descr,
            'term': selected_term,
            'gender_breakdown': []
        }
        
        total_before = 0
        total_after = 0
        
        for gender, counts in gender_data.items():
            before_count = counts['before_census']
            after_count = counts['after_census'] 
            drop_count = before_count - after_count
            drop_rate = (drop_count / before_count * 100) if before_count > 0 else 0
            
            gender_result = {
                'gender': gender,
                'before_census': before_count,
                'after_census': after_count,
                'drop_count': drop_count,
                'drop_rate': round(drop_rate, 2)
            }
            
            faculty_result['gender_breakdown'].append(gender_result)
            total_before += before_count
            total_after += after_count
        
        # 添加faculty总计
        faculty_result['total_before'] = total_before
        faculty_result['total_after'] = total_after
        faculty_result['total_drop'] = total_before - total_after
        faculty_result['total_drop_rate'] = round(
            (faculty_result['total_drop'] / total_before * 100) if total_before > 0 else 0, 2
        )
        
        result.append(faculty_result)
    
    # 按总drop人数降序排序
    result.sort(key=lambda x: x['total_drop'], reverse=True)
    
    return result


# 更新现有的分析函数，让它们使用当前数据表
def current_equity_cohort_data():
    """使用当前数据表进行公平性队列分析"""
    # 查询当前数据表中的聚合结果（按masked_id去重统计人数）
    results = db.session.query(
        CurrentData.faculty_descr,
        CurrentData.first_generation_ind,
        db.func.count(db.func.distinct(CurrentData.masked_id))
    ).filter(CurrentData.first_generation_ind.isnot(None)).group_by(
        CurrentData.faculty_descr,
        CurrentData.first_generation_ind
    ).all()

    # 构建数据结构 {faculty_descr: {first_generation_ind: count, ..., total: count}}
    faculty_map = {}

    for faculty_descr, first_gen_ind, count in results:
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {"total": 0}
        faculty_map[faculty_descr][first_gen_ind] = count
        faculty_map[faculty_descr]["total"] += count

    # 转为列表结构，准备排序
    result_first_generation = []
    for faculty_descr, values in faculty_map.items():
        row = {"faculty_descr": faculty_descr}
        row.update(values)
        result_first_generation.append(row)

    # 按总人数降序排序
    result_first_generation.sort(key=lambda x: x["total"], reverse=True)
    
    return {
        "first generation": result_first_generation,
        "ses": current_ses_data(),
        "atsi group": current_atsi_group_data(),
        "regional remote": current_regional_remote_data()
    }

def current_ses_data():
    """当前数据表的SES分析"""
    results = db.session.query(
        CurrentData.faculty_descr,
        CurrentData.ses,
        db.func.count(db.func.distinct(CurrentData.masked_id))
    ).filter(CurrentData.ses.isnot(None)).group_by(
        CurrentData.faculty_descr,
        CurrentData.ses
    ).all()

    # 构建 faculty -> ses 分布映射
    faculty_map = {}

    for faculty_descr, ses_value, count in results:
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {"total": 0}
        faculty_map[faculty_descr][ses_value] = count
        faculty_map[faculty_descr]["total"] += count

    # 构建输出结果列表
    output = []
    for faculty_descr, values in faculty_map.items():
        row = {"faculty_descr": faculty_descr}
        row.update(values)
        output.append(row)

    # 按 total 倒序排序
    output.sort(key=lambda x: x["total"], reverse=True)
    return output

def current_atsi_group_data():
    """当前数据表的ATSI分析"""
    results = db.session.query(
        CurrentData.faculty_descr,
        CurrentData.atsi_group,
        db.func.count(db.func.distinct(CurrentData.masked_id))
    ).filter(CurrentData.atsi_group.isnot(None)).group_by(
        CurrentData.faculty_descr,
        CurrentData.atsi_group
    ).all()

    # 构建 faculty -> atsi_group 分布映射
    faculty_map = {}

    for faculty_descr, atsi_group_value, count in results:
        if faculty_descr not in faculty_map:
            faculty_map[faculty_descr] = {"total": 0}
        faculty_map[faculty_descr][atsi_group_value] = count
        faculty_map[faculty_descr]["total"] += count

    # 构建输出结果列表
    output = []
    for faculty_descr, values in faculty_map.items():
        row = {"faculty_descr": faculty_descr}
        row.update(values)
        output.append(row)

    # 按 total 倒序排序
    output.sort(key=lambda x: x["total"], reverse=True)
    return output

def current_regional_remote_data():
    """当前数据表的地区分析"""
    result_regional_remote = db.session.query(
        CurrentData.regional_remote,
        db.func.count(db.func.distinct(CurrentData.masked_id)).label('record_count')
    ).filter(CurrentData.regional_remote.isnot(None)).group_by(CurrentData.regional_remote).all()

    output = [{"regional_remote": r.regional_remote, "count": r.record_count} for r in result_regional_remote]
    return output

def current_cdev_data():
    """使用当前数据表进行CDEV分析"""
    # 查询以 CDEV 开头的课程（按masked_id去重统计人数）
    results = db.session.query(
        CurrentData.course_code,
        CurrentData.course_name,
        CurrentData.residency_group_descr,
        db.func.count(db.func.distinct(CurrentData.masked_id))
    ).filter(
        CurrentData.course_code.startswith("CDEV")
    ).group_by(
        CurrentData.course_code,
        CurrentData.course_name,
        CurrentData.residency_group_descr
    ).all()

    # 构建 course_code -> residency 分布映射
    course_map = {}

    for course_code, course_name, residency_descr, count in results:
        if course_code not in course_map:
            course_map[course_code] = {
                "course_code": course_code,
                "course_name": course_name,
                "total": 0,
                "residency_breakdown": []
            }
        course_map[course_code]["residency_breakdown"].append({
            "residency_group_descr": residency_descr,
            "count": count
        })
        course_map[course_code]["total"] += count

    # 转成列表并排序
    course_output = list(course_map.values())
    course_output.sort(key=lambda x: x["total"], reverse=True)

    return {
        "CDEV by Residency and Course": course_output,
        "CDEV by Gender": current_cdev_gender_data()
    }

def current_cdev_gender_data():
    # 查询以 CDEV 开头的课程，按 course_code 和 gender 分类
    try:
        print("Starting current_cdev_gender_data function")
        
        # 查询以 CDEV 开头的课程，按 course_code 和 gender 分组统计
        query = db.session.query(
            CurrentData.course_code,
            CurrentData.gender,
            db.func.count(CurrentData.masked_id).label('count')
        ).filter(
            CurrentData.course_code.like('CDEV%'),
            CurrentData.gender.isnot(None)
        ).group_by(
            CurrentData.course_code,
            CurrentData.gender
        ).all()
        
        print(f"Query results: {query}")
        
        # 构建 course_code -> gender 分布映射
        course_map = {}
        
        for course_code, gender, count in query:
            if course_code not in course_map:
                course_map[course_code] = {
                    "course_code": course_code,
                    "total": 0,
                    "gender_breakdown": []
                }
            course_map[course_code]["gender_breakdown"].append({
                "gender": gender,
                "count": count
            })
            course_map[course_code]["total"] += count
        
        # 转换为列表并按 total 降序排序
        result = list(course_map.values())
        result.sort(key=lambda x: x["total"], reverse=True)
        
        print(f"Final result: {result}")
        return result
    except Exception as e:
        print(f"Error in current_cdev_gender_data: {e}")
        return []