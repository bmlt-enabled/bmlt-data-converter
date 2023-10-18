FROM busybox:1.36

RUN adduser -D website
WORKDIR /home/website
COPY . .
USER website
CMD ["busybox", "httpd", "-f", "-v", "-p", "8000"]
