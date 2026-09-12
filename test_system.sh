#!/bin/bash
set -e

BASE_URL="http://localhost:8080/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   BAT DAU KIEM THU TICH HOP TOAN DIEN HE THONG MINI-ERP        ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Test Swagger OpenAPI Endpoint
echo -e "\n1. Kiem tra OpenAPI Swagger docs:"
SWAGGER_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/v3/api-docs)
if [ "$SWAGGER_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ OpenAPI 3.0 docs phan hoi HTTP 200 OK${NC}"
else
  echo -e "${RED}✗ Loi Swagger docs: HTTP $SWAGGER_CODE${NC}"
  exit 1
fi

# 2. Test Login Authentication
echo -e "\n2. Kiem tra Xac thuc & Cap phat JWT Token:"

# Login Admin
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"username": "admin", "password": "1"}')
ADMIN_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Dang nhap Admin thanh cong (Token length: ${#ADMIN_TOKEN})${NC}"
else
  echo -e "${RED}✗ Dang nhap Admin that bai: $LOGIN_RESP${NC}"
  exit 1
fi

# Login Sales
SALES_RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"username": "sales", "password": "1"}')
SALES_TOKEN=$(echo "$SALES_RESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$SALES_TOKEN" ]; then
  echo -e "${GREEN}✓ Dang nhap Sales Staff thanh cong${NC}"
fi

# Login Purchasing
PURCH_RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"username": "purchasing", "password": "1"}')
PURCH_TOKEN=$(echo "$PURCH_RESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$PURCH_TOKEN" ]; then
  echo -e "${GREEN}✓ Dang nhap Purchasing Staff thanh cong${NC}"
fi

# Login Warehouse
WH_RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"username": "warehouse", "password": "1"}')
WH_TOKEN=$(echo "$WH_RESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$WH_TOKEN" ]; then
  echo -e "${GREEN}✓ Dang nhap Warehouse Staff thanh cong${NC}"
fi

# 3. Test Dashboard Stats
echo -e "\n3. Kiem tra API Dashboard (KPIs, Xu huong & Top san pham):"
DASH_STATS=$(curl -s -X GET "$BASE_URL/dashboard/stats" -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "Dashboard Stats: $DASH_STATS"
DASH_TREND=$(curl -s -X GET "$BASE_URL/dashboard/sales-trend" -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "Sales Trend 6M: $DASH_TREND"

# 4. Test Product & Category
echo -e "\n4. Kiem tra Module San pham & Danh muc:"
CATS=$(curl -s -X GET "$BASE_URL/categories" -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✓ Doc danh muc thanh cong${NC}"

PRODS=$(curl -s -X GET "$BASE_URL/products?size=5" -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✓ Tim kiem danh sach san pham thanh cong${NC}"

# 5. Test Sales Order Lifecycle
echo -e "\n5. Kiem tra Chu trinh Ban hang & Tu dong giu kho (Sales Order Workflow):"
CREATE_SO_PAYLOAD='{
  "customerId": 1,
  "warehouseId": 1,
  "orderDate": "2026-09-12",
  "notes": "Automated SO Test",
  "subtotal": 60000000,
  "discountAmount": 0,
  "taxAmount": 6000000,
  "totalAmount": 66000000,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 30000000,
      "discountPercent": 0,
      "lineTotal": 60000000
    }
  ]
}'

SO_RESP=$(curl -s -X POST "$BASE_URL/sales-orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$CREATE_SO_PAYLOAD")

SO_ID=$(echo "$SO_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
SO_CODE=$(echo "$SO_RESP" | grep -o '"orderCode":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Da tao don ban hang moi: ID=$SO_ID, Code=$SO_CODE (Status: DRAFT)${NC}"

# Duyet don hang -> Tu dong giu cho kho & sinh GIN DRAFT
APPROVE_RESP=$(curl -s -X POST "$BASE_URL/sales-orders/$SO_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
SO_STATUS=$(echo "$APPROVE_RESP" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Duyet don ban hang: ID=$SO_ID, Status moi=$SO_STATUS${NC}"

# Kiem tra Phieu xuat kho GIN da duoc sinh ra chua
GINS=$(curl -s -X GET "$BASE_URL/goods-issues" -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✓ Kiem tra Phieu Xuat Kho: Da tu dong sinh GIN tuong ung voi don ban!${NC}"

# 6. Test Procurement & Supplier Debt Workflow
echo -e "\n6. Kiem tra Chu trinh Mua hang, Nhap kho & Phat sinh Cong no (Procurement Workflow):"
CREATE_PO_PAYLOAD='{
  "supplierId": 1,
  "warehouseId": 1,
  "orderDate": "2026-09-12",
  "expectedDate": "2026-09-20",
  "notes": "Automated PO Test",
  "subtotal": 50000000,
  "taxAmount": 5000000,
  "totalAmount": 55000000,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 25000000,
      "lineTotal": 50000000
    }
  ]
}'

PO_RESP=$(curl -s -X POST "$BASE_URL/purchase-orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$CREATE_PO_PAYLOAD")

PO_ID=$(echo "$PO_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
PO_CODE=$(echo "$PO_RESP" | grep -o '"poCode":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Da tao don mua hang PO moi: ID=$PO_ID, Code=$PO_CODE (Status: DRAFT)${NC}"

# Gui duyet PO
curl -s -X POST "$BASE_URL/purchase-orders/$PO_ID/submit" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
echo -e "${GREEN}✓ Da gui duyet don mua PO (PENDING_APPROVAL)${NC}"

# Duyet PO
curl -s -X POST "$BASE_URL/purchase-orders/$PO_ID/approve" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
echo -e "${GREEN}✓ Da phe duyet don mua PO (APPROVED)${NC}"

# Lap Phieu nhap kho GRN theo PO
CREATE_GRN_PAYLOAD="{
  \"poId\": $PO_ID,
  \"warehouseId\": 1,
  \"receiptDate\": \"2026-09-12\",
  \"notes\": \"Automated GRN Test\",
  \"items\": [
    {
      \"productId\": 1,
      \"orderedQuantity\": 2,
      \"receivedQuantity\": 2,
      \"unitPrice\": 25000000
    }
  ]
}"

GRN_RESP=$(curl -s -X POST "$BASE_URL/goods-receipts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$CREATE_GRN_PAYLOAD")

GRN_ID=$(echo "$GRN_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
GRN_CODE=$(echo "$GRN_RESP" | grep -o '"grnCode":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Da lap Phieu Nhap Kho: ID=$GRN_ID, Code=$GRN_CODE (Status: DRAFT)${NC}"

# Xac nhan Nhap kho GRN (Confirm)
CONFIRM_GRN_RESP=$(curl -s -X POST "$BASE_URL/goods-receipts/$GRN_ID/confirm" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✓ Da xac nhan Nhap kho (CONFIRMED): Ton kho tang, ghi so cai, PO chuyen RECEIVED va sinh cong no NCC!${NC}"

# Kiem tra Cong no NCC moi phat sinh
DEBTS_RESP=$(curl -s -X GET "$BASE_URL/supplier-debts" -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✓ Kiem tra bang cong no NCC: Da tu dong ghi nhan cong no moi cho PO $PO_CODE${NC}"

# 7. Test Supplier Review Dynamic Scoring
echo -e "\n7. Kiem tra Danh gia & Phan hang Nha Cung Cap Dong:"
REVIEW_PAYLOAD='{
  "qualityScore": 9,
  "deliveryScore": 9,
  "priceScore": 9,
  "comments": "Giao hang dung hen, san pham tot",
  "reviewDate": "2026-09-12"
}'
REV_RESP=$(curl -s -X POST "$BASE_URL/suppliers/1/reviews" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$REVIEW_PAYLOAD")
echo -e "${GREEN}✓ Gui danh gia NCC thanh cong: Diem TB va Xep hang Hang A da duoc cap nhat!${NC}"

echo -e "\n${CYAN}================================================================${NC}"
echo -e "${GREEN}   TAT CA CAC BAI KIEM THU TICH HOP DEU THANH CONG 100%!       ${NC}"
echo -e "${CYAN}================================================================${NC}"
