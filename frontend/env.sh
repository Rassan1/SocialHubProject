#!/bin/sh
echo "window._env_ = {" > /usr/share/nginx/html/env.js
echo "  REACT_APP_API_URL: \"${REACT_APP_API_URL:-http://localhost:8000/api}\"" >> /usr/share/nginx/html/env.js
echo "};" >> /usr/share/nginx/html/env.js
