#!/bin/bash
# 批量执行 cli agent render
# 用法: bash scripts/batch-render.sh

CLI="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
PROJECT="/Users/bookerzhao/Projects/ai-mode-demo"
OUTPUT="$PROJECT/cli-agent-run"

# API 列表: skill api args
APIS=(
  # queue-skill
  "skills/queue-skill|getStoreQueueStatus|{\"storeId\":\"store_001\"}"
  "skills/queue-skill|takeQueueNumber|{\"storeId\":\"store_001\",\"partySize\":2,\"queueType\":\"dine_in\"}"
  "skills/queue-skill|getQueueProgress|{\"ticketId\":\"ticket_001\"}"
  # order-skill
  "skills/order-skill|searchRestaurants|{\"keyword\":\"\"}"
  "skills/order-skill|getMenuItems|{\"restaurantId\":\"rest_001\"}"
  "skills/order-skill|placeOrder|{\"restaurantId\":\"rest_001\",\"items\":[{\"itemId\":\"item_001\",\"name\":\"汉堡\",\"price\":25,\"quantity\":1}],\"deliveryAddress\":\"北京市朝阳区望京SOHO\",\"contactPhone\":\"13800138000\"}"
  # travel-skill
  "skills/travel-skill|planTrip|{\"destId\":\"dest_001\"}"
  "skills/travel-skill|getWeatherInfo|{\"destId\":\"dest_001\"}"
  "skills/travel-skill|getTravelTips|{}"
  # taxi-skill
  "skills/taxi-skill|callTaxi|{\"origin\":\"望京SOHO\",\"destination\":\"首都机场\",\"carType\":\"express\"}"
  "skills/taxi-skill|getTripStatus|{}"
  "skills/taxi-skill|getTripHistory|{}"
  # shopping-skill
  "skills/shopping-skill|searchProducts|{\"keyword\":\"\"}"
  "skills/shopping-skill|getProductDetail|{\"productId\":1}"
  "skills/shopping-skill|checkStoreStock|{\"productId\":1}"
  "skills/shopping-skill|placeOrder|{\"productId\":1,\"storeId\":101}"
  # bill-skill
  "skills/bill-skill|getBills|{}"
  "skills/bill-skill|payBill|{\"billId\":\"bill_001\"}"
  "skills/bill-skill|getPaymentHistory|{}"
  # party-skill
  "skills/party-skill|createParty|{\"title\":\"生日趴\",\"date\":\"2026-06-18\",\"time\":\"18:00\"}"
  "skills/party-skill|getRecommendations|{\"keyword\":\"\",\"type\":\"\"}"
  "skills/party-skill|inviteFriends|{\"partyId\":\"party_001\",\"keyword\":\"\"}"
  "skills/party-skill|getPartyDetails|{\"partyId\":\"party_001\"}"
  # hospital-skill
  "skills/hospital-skill|searchHospitals|{\"keyword\":\"\"}"
  "skills/hospital-skill|getAvailableSlots|{\"hospitalId\":\"hosp_001\",\"deptId\":\"dept_001\"}"
  "skills/hospital-skill|bookAppointment|{\"hospitalId\":\"hosp_001\",\"slotId\":\"slot_001\",\"deptId\":\"dept_001\",\"hospitalName\":\"协和医院\",\"deptName\":\"呼吸内科\",\"doctorName\":\"张医生\",\"doctorTitle\":\"主任医师\",\"date\":\"2026-06-15\",\"time\":\"09:00-09:30\",\"price\":50,\"patientName\":\"小明\",\"patientPhone\":\"13800138000\"}"
  "skills/hospital-skill|getMyAppointments|{}"
  # water-tracker
  "skills/water-tracker|addWaterRecord|{\"amountMl\":250,\"note\":\"晨起一杯水\"}"
  "skills/water-tracker|getWaterRecords|{\"days\":7}"
  # todolist-skill
  "skills/todolist-skill|getTodoList|{}"
  "skills/todolist-skill|addTodo|{\"title\":\"明天交周报\"}"
  "skills/todolist-skill|toggleTodo|{\"todoId\":\"todo_001\"}"
  "skills/todolist-skill|deleteTodo|{\"todoId\":\"todo_001\"}"
  # payment-skill
  "skills/payment-skill|queryPayment|{\"orderId\":\"order_001\"}"
  # drink-skill
  "skills/drink-skill|getRecommendedDrinks|{}"
  "skills/drink-skill|searchDrinks|{\"keyword\":\"拿铁\"}"
  "skills/drink-skill|selectDrink|{\"drinkId\":1}"
  "skills/drink-skill|confirmSku|{\"drinkId\":1,\"specs\":{\"temperature\":\"ice\",\"sugar\":\"normal\",\"cupSize\":\"medium\",\"toppings\":[]}}"
  "skills/drink-skill|getAddress|{}"
  "skills/drink-skill|saveAddress|{\"name\":\"小明\",\"phone\":\"13800138000\",\"detail\":\"北京市朝阳区望京SOHO T1\"}"
  "skills/drink-skill|confirmOrder|{\"orderId\":\"order_001\"}"
  "skills/drink-skill|payOrder|{\"orderId\":\"order_001\"}"
  "skills/drink-skill|getStoreStatus|{}"
)

# 已完成的跳过
SKIP="searchStores,getOrderStatus,searchDestinations,createPayment,estimateTrip"

mkdir -p "$OUTPUT/tmp"
TOTAL=${#APIS[@]}
DONE=0
FAIL=0

echo "=== 开始批量 render（共 $TOTAL 个API）==="
echo ""

for entry in "${APIS[@]}"; do
  IFS='|' read -r skill api args <<< "$entry"
  
  # 检查是否跳过
  if echo "$SKIP" | grep -q "$api"; then
    echo "[SKIP] $skill/$api (已存在)"
    continue
  fi
  
  DONE=$((DONE + 1))
  echo -n "[$DONE/$TOTAL] $skill/$api ... "
  
  # 执行 render，stdout 保存到临时文件
  # 使用 --port=0 让系统自动分配（每个命令独立 IDE 实例）
  "$CLI" agent render \
    --project="$PROJECT" \
    --skill="$skill" \
    --name="$api" \
    --args="$args" \
    --port=0 \
    2>/dev/null > "$OUTPUT/tmp/${api}_stdout.json"
  
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -ne 0 ]; then
    echo "❌ CLI退出码=$EXIT_CODE"
    FAIL=$((FAIL + 1))
    continue
  fi
  
  # 用 Python 解析 JSON 并提取 base64 截图
  python3 -c "
import json, base64, sys, os
try:
    with open('$OUTPUT/tmp/${api}_stdout.json') as f:
        data = json.load(f)
    status = data.get('status')
    snap = data.get('snapshotBase64')
    if not snap:
        et = data.get('elementTree', '')
        has_data = '成功' in et or 'store' in et or '¥' in et or '支付' in et
        print(f'⚠️ status={status}, element has data={has_data}')
        sys.exit(0)
    prefix = 'data:image/png;base64,'
    if snap.startswith(prefix):
        snap = snap[len(prefix):]
    n = len(snap)
    padding = (4 - n % 4) % 4
    if padding:
        snap += '=' * padding
    png = base64.b64decode(snap)
    out = '$OUTPUT/render-result.${api}.snapshot.png'
    with open(out, 'wb') as f:
        f.write(png)
    sz = os.path.getsize(out)
    print(f'✅ PNG ${sz}B')
except Exception as e:
    print(f'❌ 解析失败: {e}')
" 2>&1 || echo "❌ Python 解析异常"
done

echo ""
echo "=== 全部完成 ==="
echo "成功: $((DONE - FAIL))/$DONE"
echo "失败: $FAIL"
