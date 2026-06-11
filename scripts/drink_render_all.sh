#!/bin/bash
# Drink-skill render all APIs script - properly handles sequential renders
CLI="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
PROJECT="/Users/bookerzhao/Projects/ai-mode-demo"
OUTPUT_DIR="cli-agent-run"

mkdir -p "$OUTPUT_DIR"

run_render() {
    local apiName="$1"
    local args="$2"
    local tmpfile="/tmp/rr_${apiName}.json"
    
    echo "=== $apiName ==="
    
    # Run render, capture both stdout and stderr
    "$CLI" agent render --project="$PROJECT" --skill="skills/drink-skill" --name="$apiName" --args="$args" --port=0 --timeout=180000 > "$tmpfile" 2>&1
    
    # Parse and save snapshot
    python3 -c "
import json, base64
try:
    with open('$tmpfile') as f:
        data = json.load(f)
    snap = data.get('snapshotBase64', '')
    if snap and snap.startswith('data:image/png;base64,'):
        b64 = snap[22:].strip()
        padding = (4 - len(b64) % 4) % 4
        if padding:
            b64 += '=' * padding
        path = '$OUTPUT_DIR/render-result.$apiName.snapshot.png'
        with open(path, 'wb') as f:
            f.write(base64.b64decode(b64))
        print('OK - ' + str(len(base64.b64decode(b64))) + ' bytes')
    else:
        status = data.get('status', 'N/A')
        print('FAIL - status=' + str(status) + ', has snapshot=' + str(bool(snap)))
except Exception as e:
    print('FAIL - ' + str(e))
" 2>&1
    
    # Wait for IDE to fully release
    sleep 5
}

# Sequential execution with delay between each
run_render "getRecommendedDrinks" '{}'
run_render "searchDrinks" '{"keyword":"拿铁"}'
run_render "selectDrink" '{"drinkId":1}'
run_render "confirmSku" '{"drinkId":1,"specs":{"temperature":"ice","sugar":"normal","cupSize":"medium","toppings":[]}}'
run_render "getAddress" '{}'
run_render "saveAddress" '{"name":"小明","phone":"13800138000","detail":"北京市朝阳区望京SOHO T1"}'
run_render "confirmOrder" '{"orderId":"order_001"}'
run_render "payOrder" '{"orderId":"order_001"}'
run_render "getStoreStatus" '{}'

echo "=== All done ==="
ls -la cli-agent-run/render-result.*.snapshot.png 2>/dev/null
