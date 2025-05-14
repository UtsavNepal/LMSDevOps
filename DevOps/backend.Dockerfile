FROM python:3.10-slim-buster

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /API-PROJECT

COPY LMS/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
COPY LMS .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]