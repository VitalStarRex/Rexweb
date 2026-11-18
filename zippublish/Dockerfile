FROM python:3.12-slim
WORKDIR /app
COPY app.py index.html ./
ENV DATA_DIR=/data PORT=8000
VOLUME /data
EXPOSE 8000
CMD ["python3", "app.py"]