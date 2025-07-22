def validate_file_count(analysis_mode, file_count):
    """验证文件数量是否符合分析模式要求"""
    requirements = {
        'default': 1,
        'yoy_comparison': 2,
        'census_day': 2,
        'census_yoy': 3
    }
    return file_count == requirements.get(analysis_mode, 1)