import os
import math
import urllib.parse as urlparse
import psycopg2
import psycopg2.extras
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'geo_university_secret_key_2026'

# Configuration
UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
STUDENTS_PER_PAGE = 10
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_connection_params():
    """Parses database URL from .env file or environment variables."""
    db_url = os.environ.get('DATABASE_URL')
    if not db_url and os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    if key.strip() == 'DATABASE_URL':
                        db_url = val.strip()
                        break
    if not db_url:
        db_url = 'postgresql://postgres:postgres@localhost:5432/student_portal'
    
    url = urlparse.urlparse(db_url)
    dbname = url.path[1:]
    user = url.username
    password = url.password
    host = url.hostname
    port = url.port or 5432
    return dbname, user, password, host, port

def create_database_if_not_exists():
    """Connects to default postgres database and creates target database if not exists."""
    dbname, user, password, host, port = get_connection_params()
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user=user,
            password=password,
            host=host,
            port=port
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f"CREATE DATABASE {dbname}")
            print(f"PostgreSQL database '{dbname}' created successfully.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Database auto-creation check log/warning: {e}")

def get_db():
    """Creates a connection to the target PostgreSQL database."""
    dbname, user, password, host, port = get_connection_params()
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )
    return conn

# Helper functions for clean DB transactions
def query_db(query, args=(), one=False):
    """Executes a query and returns fetched records."""
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(query, args)
    rv = cur.fetchall()
    cur.close()
    conn.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """Executes a transaction query (INSERT, UPDATE, DELETE)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    conn.commit()
    cur.close()
    conn.close()

def count_db(query, args=()):
    """Executes a COUNT query and returns the integer result."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result[0] if result else 0

def init_db():
    """Ensures database exists and creates students table."""
    create_database_if_not_exists()
    try:
        execute_db('''
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                middle_name VARCHAR(100),
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                date_of_birth VARCHAR(50) NOT NULL,
                gender VARCHAR(20) NOT NULL,
                phone_number VARCHAR(50) NOT NULL,
                address TEXT NOT NULL,
                state_of_origin VARCHAR(100) NOT NULL,
                local_govt VARCHAR(100) NOT NULL,
                next_of_kin VARCHAR(255) NOT NULL,
                jamb_score INTEGER NOT NULL,
                image_filename VARCHAR(255) NOT NULL,
                admission_status VARCHAR(50) DEFAULT 'undecided',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("PostgreSQL students table initialized.")
    except Exception as e:
        print(f"Error during students table initialization: {e}")

# Run database initialization
init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/form', methods=['GET', 'POST'])
def student_form():
    # Preserve form data across validation errors
    form_data = {}

    if request.method == 'POST':
        # Retrieve form data
        first_name = request.form.get('first_name', '').strip()
        middle_name = request.form.get('middle_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip()
        date_of_birth = request.form.get('date_of_birth', '').strip()
        gender = request.form.get('gender', '').strip()
        phone_number = request.form.get('phone_number', '').strip()
        address = request.form.get('address', '').strip()
        state_of_origin = request.form.get('state', '').strip()
        local_govt = request.form.get('local-govt-area', '').strip()
        next_of_kin = request.form.get('next_of_kin', '').strip()
        jamb_score_str = request.form.get('jamb_score', '').strip()

        # Store form data so it can be sent back on error
        form_data = {
            'first_name': first_name,
            'middle_name': middle_name,
            'last_name': last_name,
            'email': email,
            'date_of_birth': date_of_birth,
            'gender': gender,
            'phone_number': phone_number,
            'address': address,
            'state_of_origin': state_of_origin,
            'local_govt': local_govt,
            'next_of_kin': next_of_kin,
            'jamb_score': jamb_score_str
        }

        # Backend Validation
        errors = []
        if not (first_name and last_name and email and date_of_birth and gender and phone_number and address and state_of_origin and local_govt and next_of_kin and jamb_score_str):
            errors.append("All fields except middle name are required.")

        try:
            jamb_score = int(jamb_score_str)
            if jamb_score < 6 or jamb_score > 54:
                errors.append("WASSCE Aggregate must be between 6 and 54.")
        except ValueError:
            errors.append("Invalid WASSCE Aggregate score format.")

        # Check for image file
        if 'image' not in request.files:
            errors.append("Profile image upload is required.")
        else:
            file = request.files['image']
            if file.filename == '':
                errors.append("No file selected for profile image.")
            elif not allowed_file(file.filename):
                errors.append("Allowed image formats are: PNG, JPG, JPEG, GIF.")

        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('form.html', form_data=form_data)

        # Check email uniqueness
        existing = query_db('SELECT id FROM students WHERE email = %s', (email,), one=True)
        if existing:
            flash("A student with this email address is already registered.", 'danger')
            return render_template('form.html', form_data=form_data)

        # Save file
        file = request.files['image']
        ext = file.filename.rsplit('.', 1)[1].lower()
        safe_email = secure_filename(email.replace('@', '_').replace('.', '_'))
        filename = f"{safe_email}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            execute_db('''
                INSERT INTO students (
                    first_name, middle_name, last_name, email, date_of_birth,
                    gender, phone_number, address, state_of_origin, local_govt,
                    next_of_kin, jamb_score, image_filename
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                first_name, middle_name, last_name, email, date_of_birth,
                gender, phone_number, address, state_of_origin, local_govt,
                next_of_kin, jamb_score, filename
            ))
            flash("Registration completed successfully!", "success")
            return redirect(url_for('students_index'))
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            flash(f"An error occurred while saving registration: {str(e)}", "danger")
            return render_template('form.html', form_data=form_data)

    return render_template('form.html', form_data=form_data)

@app.route('/students')
def students_index():
    # Filters
    search_query = request.args.get('search', '').strip()
    gender_filter = request.args.get('gender', '').strip()
    status_filter = request.args.get('status', '').strip()
    jamb_filter = request.args.get('jamb', '').strip()
    page = request.args.get('page', 1, type=int)
    if page < 1:
        page = 1

    # Build WHERE clause
    where_clauses = []
    params = []

    if search_query:
        where_clauses.append('(first_name ILIKE %s OR last_name ILIKE %s OR middle_name ILIKE %s)')
        like_expr = f'%{search_query}%'
        params.extend([like_expr, like_expr, like_expr])

    if gender_filter:
        where_clauses.append('gender = %s')
        params.append(gender_filter)

    if status_filter:
        where_clauses.append('admission_status = %s')
        params.append(status_filter)

    if jamb_filter:
        try:
            jamb_val = int(jamb_filter)
            where_clauses.append('jamb_score <= %s')
            params.append(jamb_val)
        except ValueError:
            pass

    where_sql = ' AND '.join(where_clauses) if where_clauses else '1=1'

    # Count total matching records for pagination
    count_query = f'SELECT COUNT(*) FROM students WHERE {where_sql}'
    total_records = count_db(count_query, params)
    total_pages = max(1, math.ceil(total_records / STUDENTS_PER_PAGE))

    if page > total_pages:
        page = total_pages

    offset = (page - 1) * STUDENTS_PER_PAGE

    # Fetch paginated results
    data_query = f'SELECT * FROM students WHERE {where_sql} ORDER BY id DESC LIMIT %s OFFSET %s'
    students = query_db(data_query, params + [STUDENTS_PER_PAGE, offset])

    return render_template('index.html',
                           students=students,
                           page=page,
                           total_pages=total_pages,
                           total_records=total_records)

@app.route('/student/<int:student_id>')
def student_details(student_id):
    student = query_db('SELECT * FROM students WHERE id = %s', (student_id,), one=True)
    if not student:
        flash("Student record not found.", "danger")
        return redirect(url_for('students_index'))
    return render_template('details.html', student=student)

@app.route('/student/<int:student_id>/status', methods=['POST'])
def update_status(student_id):
    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    if new_status not in ['undecided', 'admitted', 'rejected']:
        return jsonify({'success': False, 'message': 'Invalid admission status.'}), 400

    student = query_db('SELECT id FROM students WHERE id = %s', (student_id,), one=True)
    if not student:
        return jsonify({'success': False, 'message': 'Student record not found.'}), 404

    try:
        execute_db('UPDATE students SET admission_status = %s WHERE id = %s', (new_status, student_id))
        return jsonify({'success': True, 'message': f'Status updated to {new_status}.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/student/<int:student_id>/delete', methods=['POST'])
def delete_student(student_id):
    """Deletes a student record and its uploaded image."""
    student = query_db('SELECT id, image_filename FROM students WHERE id = %s', (student_id,), one=True)
    if not student:
        flash("Student record not found.", "danger")
        return redirect(url_for('students_index'))

    try:
        # Delete the record from the database
        execute_db('DELETE FROM students WHERE id = %s', (student_id,))

        # Delete the uploaded image file
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], student['image_filename'])
        if os.path.exists(image_path):
            os.remove(image_path)

        flash("Student record deleted successfully.", "success")
    except Exception as e:
        flash(f"Error deleting student record: {str(e)}", "danger")

    return redirect(url_for('students_index'))

if __name__ == '__main__':
    app.run(debug=True)
