from flask import Flask, request, jsonify
from config import Config
from database.operations import init_db, save_to_table, process_analysis_mode
from services.email_sender import init_mail, send_email_with_attachment
from services.excel_processor import *
from services.gpt_integration import process_with_gpt
from utils.file_handlers import allowed_file, save_uploaded_file
from io import StringIO
import pandas as pd
from flasgger import Swagger
from flask_cors import CORS
from utils.response import ApiResponse
from utils.upload_check import validate_file_count
from flask_mail import Mail, Message

import os

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
swagger = Swagger(app, template_file='swagger_config.yml')

# 初始化数据库和邮件
init_db(app)
init_mail(app)

@app.route('/')
def index():
    """
    根路径 - API 服务状态
    ---
    responses:
      200:
        description: API 服务正常运行
        examples:
          application/json:
            message: "Flask API is running"
            endpoints:
              - "/upload - 上传文件"
              - "/get_agg - 获取聚合数据"
              - "/send_email - 发送邮件"
              - "/process-with-gpt - GPT 处理"
            docs: "/apidocs/"
    """
    return jsonify({
        "message": "Flask API is running",
        "endpoints": [
            "/upload - 上传文件",
            "/get_agg - 获取聚合数据", 
            "/send_email - 发送邮件",
            "/process-with-gpt - GPT 处理"
        ],
        "docs": "/apidocs/"
    }), 200


@app.route('/upload', methods=['POST'])
def upload_file():
    """
    上传 CSV 文件并解析为 DataFrame存入PostreSQL中
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: 要上传的 CSV 文件
      - name: file_type
        in: formData
        type: integer   
        required: true
        description: 文件类型标识（只能填1，2）1代表无gender字段的文件，2代表有gender的字段
    responses:
      200:
        description: File processed successfully
        examples:
          application/json:
            message: Parsed 100 rows
            columns: ["ID", "NAME", "AGE"]
      400:
        description: 缺失文件或文件格式错误
      500:
        description: 文件解析失败
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    load_type = int(request.form.get('file_type'))
    print(load_type)
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            # 保存文件
            file.stream.seek(0)
            stream = StringIO(file.stream.read().decode("utf-8"))
            data = pd.read_csv(stream)
            if load_type == 1:
                print('come here ')
                process_excel(data)
            elif load_type == 2:
                process_gender(data)
            # elif load_type == 0:
            #     process_excel(stream)
            #     process_gender(stream)
            # 处理Excel并返回聚合结果
            # aggregated_data = process_excel(stream)

            return ApiResponse.success({})
        except Exception as e:
            return ApiResponse.error(message=str(e), code = 500, result={})
    else:
        return ApiResponse.error(message="Invalid file type", code = 400, result={})


@app.route('/batch_upload', methods=['POST'])
def batch_upload():
    """
    批量上传文件用于不同分析模式
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: analysis_mode
        in: formData
        type: string
        required: true
        description: 分析模式（default/yoy_comparison/census_day/census_yoy）
      - name: files
        in: formData
        type: array
        items:
          type: file
        required: true
        description: 要上传的文件列表
    responses:
      200:
        description: 批量文件处理成功
      400:
        description: 参数错误或文件数量不匹配
      500:
        description: 批量处理失败
    """
    analysis_mode = request.form.get('analysis_mode')
    files = request.files.getlist('files')
    
    if not analysis_mode or not files:
        return ApiResponse.error(message="Missing analysis_mode or files", code=400, result={})
    
    try:
        print(f"🔍 BATCH UPLOAD DEBUG:")
        print(f"Analysis Mode: {analysis_mode}")
        print(f"Number of files: {len(files)}")
        print(f"File names: {[f.filename for f in files]}")
        
        # 验证文件数量是否符合分析模式要求
        if not validate_file_count(analysis_mode, len(files)):
            return ApiResponse.error(
                message=f"Invalid file count for {analysis_mode} mode", 
                code=400, 
                result={}
            )
        
        print(f"✅ File count validation passed, processing...")
        
        result = process_analysis_mode(analysis_mode, files)
        
        print(f"✅ Processing completed, result: {result}")
        
        return ApiResponse.success(result=result)
        
    except Exception as e:
        return ApiResponse.error(message=str(e), code=500, result={})

# 更新后的分析接口 - 使用当前数据表
@app.route('/par_gender_agg', methods=['GET'])
def participation_gender_aggregate():
    """
    获取性别参与度聚合数据 - 使用当前数据表
    ---
    responses:
      200:
        description: 成功获取聚合数据
        examples:
          application/json:
            message: "GPT processing complete"
            result: "聚合结果数据"
      500:
        description: 服务器内部错误
    """
    try:
        from database.operations import current_participation_gender_data
        result = current_participation_gender_data()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code=500, result={})

@app.route('/equity_cohort_agg', methods=['GET'])
def equity_cohort_aggregate():
    """
    获取公平性队列聚合数据 - 使用当前数据表
    ---
    responses:
      200:
        description: 成功获取聚合数据
        examples:
          application/json:
            message: "success"
            result: "聚合结果数据"
      500:
        description: 服务器内部错误
    """
    try:
        from database.operations import current_equity_cohort_data
        result = current_equity_cohort_data()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code = 500, result={})

@app.route('/cdev_agg', methods=['GET'])
def cdev_aggregate():
    """
    获取CDEV课程聚合数据 - 使用当前数据表
    ---
    responses:
      200:
        description: 成功获取聚合数据
        examples:
          application/json:
            message: "success"
            result: "聚合结果数据"
      500:
        description: 服务器内部错误
    """
    try:
        from database.operations import current_cdev_data
        result = current_cdev_data()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code = 500, result={})

# 新的对比分析接口
@app.route('/yoy_comparison', methods=['GET'])
def year_over_year_comparison():
    """
    年度对比分析 - 使用历史数据表和当前数据表
    ---
    responses:
      200:
        description: 成功获取年度对比数据
        examples:
          application/json:
            message: "success"
            result: "年度对比结果"
      500:
        description: 服务器内部错误
    """
    try:
        from database.operations import yoy_comparison_faculty_data
        result = yoy_comparison_faculty_data()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code = 500, result={})

@app.route('/census_comparison', methods=['GET'])
def census_day_comparison():
    """
    Census Day对比分析 - 使用before census表和当前数据表
    ---
    responses:
      200:
        description: 成功获取Census Day对比数据
        examples:
          application/json:
            message: "success"
            result: "Census Day对比结果"
      500:
        description: 服务器内部错误
    """
    try:
        from database.operations import census_comparison_data
        result = census_comparison_data()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code=500, result={})


@app.route('/census_gender_drop', methods=['GET'])
def census_gender_drop_analysis():
    """
    Census Day性别drop分析 - 根据term分析按faculty和gender分组的drop人数
    ---
    parameters:
      - name: term
        in: query
        type: string
        required: true
        description: 选择的term (Hexamester 1, Hexamester 4, Semester 1 Canberra, Semester 2 Canberra, Summer Term, Term 1, Term 2, Term 3)
        enum: [Hexamester 1, Hexamester 4, Semester 1 Canberra, Semester 2 Canberra, Summer Term, Term 1, Term 2, Term 3]
    responses:
      200:
        description: 成功获取Census Day性别drop分析数据
        examples:
          application/json:
            message: "success"
            result: 
              - faculty_descr: "Faculty of Engineering"
                term: "Term 1"
                total_before: 1000
                total_after: 800
                total_drop: 200
                total_drop_rate: 20.0
                gender_breakdown:
                  - gender: "F"
                    before_census: 400
                    after_census: 300
                    drop_count: 100
                    drop_rate: 25.0
                  - gender: "M"
                    before_census: 600
                    after_census: 500
                    drop_count: 100
                    drop_rate: 16.67
      400:
        description: 缺少term参数或参数无效
      500:
        description: 服务器内部错误
    """
    try:
        selected_term = request.args.get('term')
        
        if not selected_term:
            return ApiResponse.error(
                message="Missing 'term' parameter. Please provide a term from the available options", 
                code=400, 
                result={}
            )
        
        # 验证term参数
        valid_terms = [
            'Hexamester 1', 
            'Hexamester 4', 
            'Semester 1 Canberra', 
            'Semester 2 Canberra', 
            'Summer Term', 
            'Term 1', 
            'Term 2', 
            'Term 3'
        ]
        if selected_term not in valid_terms:
            return ApiResponse.error(
                message=f"Invalid term '{selected_term}'. Valid terms are: {', '.join(valid_terms)}", 
                code=400, 
                result={}
            )
        
        from database.operations import census_gender_drop_by_term_and_faculty
        result = census_gender_drop_by_term_and_faculty(selected_term)
        
        return ApiResponse.success(result=result)
        
    except Exception as e:
        return ApiResponse.error(message=str(e), code=500, result={})


# 保留旧接口用于向后兼容（但使用新的数据表）

@app.route('/y2y_faculty_agg', methods=['GET'])
def year2year_comparison_faculty_aggregate():
    """
    年度对比聚合数据（兼容接口）
    ---
    responses:
      200:
        description: 成功获取聚合数据
      500:
        description: 服务器内部错误
    """
    try:
        from database.operations import yoy_comparison_faculty_data
        result = yoy_comparison_faculty_data()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code = 500, result={})

@app.route('/y2y_faculty_residency_agg', methods=['GET'])
def year2year_comparison_faculty_residency_aggregate():
    """
    年度对比居住地聚合数据（兼容接口） - 暂时使用旧数据
    ---
    responses:
      200:
        description: 成功获取聚合数据
      500:
        description: 服务器内部错误
    """
    try:
        result = year2year_faculty_residency_agg_handle()
        return ApiResponse.success(result=result)
    except Exception as e:
        return ApiResponse.error(message=str(e), code = 500, result={})

@app.route('/send_email', methods=['POST'])
def send_email():
    """
    发送邮件
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: file_path
        in: formData
        type: file
        required: true
        description: 要发送的的 pdf 文件
      - name: email
        in: formData
        type: string
        required: true
        description: 要发送的email地址
    responses:
      200:
        description: 邮件发送成功
        examples:
          application/json:
            message: "Email sent successfully"
      400:
        description: 缺少必要参数
      500:
        description: 邮件发送失败
    """
    if 'file_path' not in request.files:
        return ApiResponse.error(message="No file part", code=400,result={})

    file = request.files.get('file_path')
    email = str(request.form.get('email'))
    if file.filename == '':
        return ApiResponse.error(message="No selected file", code=400,result={})
    try:
        if not email or not file:
            return ApiResponse.error(message="Missing email or file in request", code=400, result={})
        subject = 'Subject: Report Analysis'
        body = 'The analysis chart report is completed.'

        send_email_with_attachment(email, subject, body, file)

        return ApiResponse.success(result="Email sent successfully")
    except Exception as e:
        return ApiResponse.error(message=str(e), code = 500, result={})


@app.route('/process-with-gpt', methods=['POST'])
def process_gpt():
    """
    使用 GPT 处理文件
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: 要处理的文件
    responses:
      200:
        description: GPT 处理完成
        examples:
          application/json:
            message: "GPT processing complete"
            result: "GPT 处理结果"
      400:
        description: 缺少文件或文件格式错误
      500:
        description: GPT 处理失败
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            file_path = save_uploaded_file(file)
            gpt_response = process_with_gpt(file_path)

            return jsonify({
                "message": "GPT processing complete",
                "result": gpt_response
            }), 200
        except Exception as e:
            return ApiResponse.error(message=str(e), code = 500, result={})
    else:
        return ApiResponse.error(message="Invalid file type", code = 400, result={})

if __name__ == '__main__':
    app.run(debug=True, port=8088)