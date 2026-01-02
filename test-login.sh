#!/bin/bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+998996983806","password":"XOJISAID.13.13"}' \
  -v
