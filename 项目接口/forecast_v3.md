# gogo_v3版本项目预测模块接口
## 进口
1. 中国进口每周预测
GET /iron/import/forecast
var req = {
    swap: 0/1 (是否旋转)
}
var res = {
    data:{
        part:{
            [{
                region_id,
                product_id,
                v1,
                v2,
                v3,
                v4
            },....
            ]
        }
        all:{
            [{
                product_id,
                v1,
                v2,
                v3,
                v4
            },....
            ]
        }
    }
}


2. 中国进口预测趋势(按照周为单位，往前推52周，往后推4周)
GET /iron/import/forecast/trend
var req = {
    type = 'region'/'product'/'ALL'  (区域/产品/全部)
}

var res = {
    data:{
            t1:[{
                date_week,
                week,
                volume
            }, ...],
            t2:[{
                date_week,
                week,
                volume
            }, ...]
        ]   
    }
}

3. 中国进口预测同比(显示今年所有周)
GET  /iron/import/forecast/lfl

var req = {
    type = 'region'/'product'/'ALL'  (区域/产品/全部)
}

var res = {
    data:{
        current_year: {
            t1: [{
                date_week,
                week,
                volume
            }, ...], 
            t2:[{
                date_week,
                week,
                volume
            }, ...], 
            t3: [{
                date_week,
                volume
            }, ...]}
        last_year:{t1: [v1, v2, v3, v4, ...], t2:[v1, v2, v3, ...], t3: [v1, v2, ...]}
    }
}


4. 中国进口详情
GET  /iron/import/forecast/voyage

var req = {
    region_id,
    offset,
    limit,
    amount:0/1(需要)
}

var res = {
    data:{
        shipName,
        departureTime,
        departurePortID,
        departureCountry,
        arrivalTime,
        arrivalRegionID,
        arrivalCountry,
        grade,
        DWT,
        remainMileage,
        remainDuration
    } 
}

## 出口
5. 出口到中国每周预测
GET /iron/export/forecast
var req = {
    swap: 0/1 (是否旋转)
}
var res = {
    data:{
        part:{
            [{
                region_id,
                product_id,
                v1,
                v2,
                v3,
                v4
            },....
            ]
        }
        all:{
            [{
                product_id,
                v1,
                v2,
                v3,
                v4
            },....
            ]
        }
    }
}

6. 出口到中国预测趋势
GET /iron/export/forecast/trend
var req = {
    type = 'country'/'product'/'ALL'  (区域/产品/全部)
}

var res = {
    data:{
            t1:[{
                date_week,
                week,
                volume
            }, ...],
            t2:[{
                date_week,
                week,
                volume
            }, ...]
        ]   
    }
}

7. 出口到中国预测同比
GET  /iron/export/forecast/lfl

var req = {
    type = 'country'/'product'/'ALL'  (国家/产品/全部)
}

var res = {
    data:{
        current_year: {
            t1: [{
                date_week,
                week,
                volume
            }, ...], 
            t2:[{
                date_week,
                week,
                volume
            }, ...], 
            t3: [{
                date,
                date_week,
                volume
            }, ...]}
        last_year:{t1: [v1, v2, v3, v4, ...], t2:[v1, v2, v3, ...], t3: [v1, v2, ...]}
    }
}

8. GET  /iron/export/forecast/voyage
var req = {
    from_ISO3(出口国),
    offset,
    limit,
    amount:0/1(需要)
}

var res = {
    data:{
        shipName,
        departureTime,
        departurePortID,
        departureCountry,
        arrivalTime,
        arrivalRegionID,
        arrivalCountry,
        grade,
        DWT,
        remainMileage,
        remainDuration
    } 
}



