 # 航运
## 历史
1. GET /iron/shipping
var req = {
    start_date
}

2. GET /iron/shipping/lfl
var req = {
    routeID,
    start_date,
    end_date
}

3. GET /iron/shipping/trend
var req = {
    routeID,
    start_date,
    end_date
}

4. GET /iron/shipping/history (历史)
var req = {
    routeID,
    offset, 
    limit, 
    req_info.amount
}

5. GET /iron/shipping/detail (详情)
var req = {
    routeID,
    start_date,
    offset,
    limit,
    amount,
}


 ## 实时
6. GET /iron/shipping/realtime/status
无参数

