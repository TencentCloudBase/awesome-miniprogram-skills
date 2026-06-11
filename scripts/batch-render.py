"""批量执行 cli agent render 并保存截图"""
import json, base64, os, subprocess, sys, time

CLI = "/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
PROJECT = "/Users/bookerzhao/Projects/ai-mode-demo"
OUTPUT = os.path.join(PROJECT, "cli-agent-run")
PORT = 57731  # 固定端口

# 定义所有需要执行的 API
# (skill_path, api_name, args_json)
APIS = [
    # ========== queue-skill ==========
    ("skills/queue-skill", "getStoreQueueStatus", '{"storeId":"store_001"}'),
    ("skills/queue-skill", "takeQueueNumber", '{"storeId":"store_001","partySize":2,"queueType":"dine_in"}'),
    ("skills/queue-skill", "getQueueProgress", '{"ticketId":"ticket_001"}'),

    # ========== order-skill ==========
    ("skills/order-skill", "searchRestaurants", '{"keyword":""}'),
    ("skills/order-skill", "getMenuItems", '{"restaurantId":"rest_001"}'),
    ("skills/order-skill", "placeOrder", '{"restaurantId":"rest_001","items":[{"itemId":"item_001","name":"汉堡","price":25,"quantity":1,"remark":""}],"deliveryAddress":"北京市朝阳区望京SOHO","contactPhone":"13800138000"}'),

    # ========== travel-skill ==========
    ("skills/travel-skill", "planTrip", '{"destId":"dest_001"}'),
    ("skills/travel-skill", "getWeatherInfo", '{"destId":"dest_001"}'),
    ("skills/travel-skill", "getTravelTips", '{}'),

    # ========== taxi-skill ==========
    ("skills/taxi-skill", "callTaxi", '{"origin":"望京SOHO","destination":"首都机场","carType":"express"}'),
    ("skills/taxi-skill", "getTripStatus", '{}'),
    ("skills/taxi-skill", "getTripHistory", '{}'),

    # ========== shopping-skill ==========
    ("skills/shopping-skill", "searchProducts", '{"keyword":""}'),
    ("skills/shopping-skill", "getProductDetail", '{"productId":1}'),
    ("skills/shopping-skill", "checkStoreStock", '{"productId":1}'),
    ("skills/shopping-skill", "placeOrder", '{"productId":1,"storeId":101}'),

    # ========== bill-skill ==========
    ("skills/bill-skill", "getBills", '{}'),
    ("skills/bill-skill", "payBill", '{"billId":"bill_001"}'),
    ("skills/bill-skill", "getPaymentHistory", '{}'),

    # ========== party-skill ==========
    ("skills/party-skill", "createParty", '{"title":"生日趴","date":"2026-06-18","time":"18:00","location":"望京","type":"朋友聚会","description":"一起吃火锅"}'),
    ("skills/party-skill", "getRecommendations", '{"keyword":"","type":""}'),
    ("skills/party-skill", "inviteFriends", '{"partyId":"party_001","keyword":""}'),
    ("skills/party-skill", "getPartyDetails", '{"partyId":"party_001"}'),

    # ========== hospital-skill ==========
    ("skills/hospital-skill", "searchHospitals", '{"keyword":""}'),
    ("skills/hospital-skill", "getAvailableSlots", '{"hospitalId":"hosp_001","deptId":"dept_001"}'),
    ("skills/hospital-skill", "bookAppointment", '{"hospitalId":"hosp_001","slotId":"slot_001","deptId":"dept_001","hospitalName":"协和医院","deptName":"呼吸内科","doctorName":"张医生","doctorTitle":"主任医师","date":"2026-06-15","time":"09:00-09:30","price":50,"patientName":"小明","patientPhone":"13800138000"}'),
    ("skills/hospital-skill", "getMyAppointments", '{}'),

    # ========== water-tracker ==========
    ("skills/water-tracker", "addWaterRecord", '{"amountMl":250,"note":"晨起一杯水"}'),
    ("skills/water-tracker", "getWaterRecords", '{"days":7}'),

    # ========== todolist-skill ==========
    ("skills/todolist-skill", "getTodoList", '{}'),
    ("skills/todolist-skill", "addTodo", '{"title":"明天交周报"}'),
    ("skills/todolist-skill", "toggleTodo", '{"todoId":"todo_001"}'),
    ("skills/todolist-skill", "deleteTodo", '{"todoId":"todo_001"}'),

    # ========== payment-skill ==========
    ("skills/payment-skill", "queryPayment", '{"orderId":"order_001"}'),

    # ========== drink-skill ==========
    ("skills/drink-skill", "getRecommendedDrinks", '{}'),
    ("skills/drink-skill", "searchDrinks", '{"keyword":"拿铁"}'),
    ("skills/drink-skill", "selectDrink", '{"drinkId":1}'),
    ("skills/drink-skill", "confirmSku", '{"drinkId":1,"specs":{"temperature":"ice","sugar":"normal","cupSize":"medium","toppings":[]}}'),
    ("skills/drink-skill", "getAddress", '{}'),
    ("skills/drink-skill", "saveAddress", '{"name":"小明","phone":"13800138000","detail":"北京市朝阳区望京SOHO T1"}'),
    ("skills/drink-skill", "confirmOrder", '{"orderId":"order_001"}'),
    ("skills/drink-skill", "payOrder", '{"orderId":"order_001"}'),
    ("skills/drink-skill", "getStoreStatus", '{}'),
]

# 已完成的跳过（截至今天16:46，且已确认是WeCard后的新截图）
SKIP = {"searchStores", "getOrderStatus", "searchDestinations", "createPayment", "estimateTrip"}

def decode_snapshot(raw_output, api_name):
    """从 render 输出 JSON 中提取并保存截图"""
    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError:
        return False, "JSON解析失败"
    
    status = data.get("status")
    if status != "ok":
        return False, f"status={status}"
    
    snap = data.get("snapshotBase64")
    if not snap:
        return False, "无 snapshotBase64"
    
    # 去掉 data URI 前缀
    prefix = "data:image/png;base64,"
    if snap.startswith(prefix):
        snap = snap[len(prefix):]
    
    # 修正 base64 padding
    n = len(snap)
    padding = (4 - n % 4) % 4
    if padding:
        snap += "=" * padding
    
    try:
        png_data = base64.b64decode(snap)
        out_path = os.path.join(OUTPUT, f"render-result.{api_name}.snapshot.png")
        with open(out_path, "wb") as f:
            f.write(png_data)
        return True, f"PNG {len(png_data)}B"
    except Exception as e:
        return False, f"base64解码失败: {e}"


def render_api(skill, api, args_str):
    """执行 cli agent render"""
    cmd = [
        CLI, "agent", "render",
        "--project", PROJECT,
        "--skill", skill,
        "--name", api,
        "--args", args_str,
        "--port", str(PORT)
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd=PROJECT)
        if result.returncode != 0:
            return None, f"CLI退出码={result.returncode}, stderr={result.stderr[:200]}"
        return result.stdout, None
    except subprocess.TimeoutExpired:
        return None, "超时120s"
    except Exception as e:
        return None, str(e)


def main():
    os.makedirs(OUTPUT, exist_ok=True)
    
    results = []
    failed = []
    
    # 先做一次空 render 启动 IDE
    print("=== 启动 IDE 服务... ===")
    _, err = render_api("skills/queue-skill", "getStoreQueueStatus", '{"storeId":"test"}')
    if err:
        print(f"  IDE 启动失败: {err}")
    
    total = len([a for a in APIS if a[1] not in SKIP])
    done = 0
    start = time.time()
    
    for skill, api, args in APIS:
        if api in SKIP:
            print(f"[SKIP] {skill}/{api} (已存在)")
            continue
        
        done += 1
        elapsed = time.time() - start
        eta = (elapsed / done) * total if done > 0 else 0
        print(f"[{done}/{total}] {skill}/{api}... ", end="", flush=True)
        
        stdout, err = render_api(skill, api, args)
        if err:
            print(f"❌ {err}")
            results.append((skill, api, False, err))
            failed.append((skill, api, err))
            continue
        
        ok, msg = decode_snapshot(stdout, api)
        if ok:
            print(f"✅ {msg}")
            results.append((skill, api, True, msg))
        else:
            print(f"⚠️ {msg}")
            results.append((skill, api, False, msg))
            failed.append((skill, api, msg))
    
    print("\n" + "=" * 60)
    print(f"完成: {len([r for r in results if r[2]])}/{len(results)} 成功")
    if failed:
        print(f"\n失败列表 ({len(failed)}):")
        for skill, api, reason in failed:
            print(f"  ❌ {skill}/{api}: {reason}")
    else:
        print("\n全部成功! 🎉")

if __name__ == "__main__":
    main()
