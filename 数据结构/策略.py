# 导入函数库
import jqdata
import numpy as np
import pandas as pd
import talib
import datetime as dt

# 初始化函数，设定要操作的股票、基准等等
def initialize(context):
    # 选取股票：选取市值较高的股票
    df = get_fundamentals(query(
        valuation.code
    ).order_by(
        # 按市值降序排列
        valuation.market_cap.desc()
    ).limit(
        300
    ))
    g.security = list(df['code'])
    # 记录每只股票的回撤最高点
    g.top = {}
    # g.security = ['000001.XSHE']
    # 设定沪深300作为基准
    set_benchmark('000300.XSHG')
    # 开启动态复权模式(真实价格)
    set_option('use_real_price', True)
    # initial log info
    log.info('初始函数开始运行且全局只运行一次')
    # 股票类每笔交易时的手续费是：买入时佣金千分之一，卖出时佣金万分之七加万分之三印花税, 每笔交易佣金最低扣5块钱
    set_order_cost(OrderCost(close_tax=0.0003, open_commission=0.001, close_commission=0.0007, min_commission=5), type='stock')
    

# 每个单位时间(如果按天回测,则每天调用一次,如果按分钟,则每分钟调用一次)调用一次
def handle_data(context, data):
        # MACD参数：短周期，长周期，MACD周期
        short_win = 15
        long_win = 60
        macd_win = 9
        # 止盈策略
        # 收益率下跌-2%则卖出
        # 止损策略
        # 单笔投资损失超过2%，则将该投资的股票全部沽空
        # 做空单位：订单，交易，股票？
        for security in context.portfolio.positions.keys():
            # 当前的标
            current_positions = context.portfolio.positions[security]
            # 近似的初始价格
            init_cost = current_positions.avg_cost
            # 更新回撤最高点值
            if security not in g.top:
                g.top[security] = (init_cost, 0)
            else:
                ## 更新top值
                # 算法1, top值为出现过最大的峰值
                if current_positions.price  > g.top[security]:
                    g.top[security] = (current_positions.price, 0)
                # # 算法2, top值为出现过的第一个峰值
                # # 如果出现递减, 则更新top值
                # history_price = attribute_history(security, 2, '1d', ['close'], df=False)['close']
                # price = history_price[0]
                # last_price = history_price[1]
                # if price < last_price and g.top[security][1] is not 1:
                #     g.top[security] = (last_price, 1)
                # # 算法3, top值为出现过的最后一个峰值
                # # 如果出现递增，则更新top值
                # history_price = attribute_history(security, 2, '1d', ['close'], df=False)['close']
                # price = history_price[0]
                # last_price = history_price[1]
                # if price  > last_price:
                #     g.top[security] = (price, 0)
            
            # 止盈
            # 如果当前价格比top低
            # 且处于收益的状态
            # 且收益减少额2%
            if (g.top[security][0] - init_cost) / init_cost >= 0.1  and (g.top[security][0] - current_positions.price) / init_cost >= 0.02:
                order_target(security, 0)
                log.info("selling %s" % (security))
            # 止损: 亏损2%
            if (current_positions.price / init_cost) <= 0.98:
                order_target(security, 0)
                log.info("selling %s" % (security))
                
        log.info("Today's positionNum %s" % len(context.portfolio.positions.keys()))
        # 当前剩余资金
        cash = context.portfolio.available_cash
         # 如果还有钱即可进行交易
        if cash > 0:
            log.info("Today's Cash %s" % (cash))
            # 记录出现买入信号的股票(security, close)
            optional_list = []
            # 当前时间
            today = context.current_dt
            # 往前推90天
            start_date = context.run_params.start_date - dt.timedelta(days=90)
            # 遍历股票进行计算
            for security in g.security:
                # 获取股票价
                close_price = get_price(security, start_date= start_date , end_date = today, frequency='daily', fields=['close'])
                #close_price = attribute_history(security, 90, '1d', ['close'],df=False)
                close_price_array = array(close_price['close'])
                # log.info("Today's array %s" % (close_price_array))
                # 计算MACD
                macd_tmp = talib.MACD(close_price_array,fastperiod = short_win, slowperiod = long_win, signalperiod = macd_win)
                DIF = macd_tmp[0]
                DEA = macd_tmp[1]
                # MACD = macd_tmp[2]
                # 买入策略
                # MACD(15, 60, 9), 昨日DIF<昨日DEA, 今日DIF >= 今日DEA
                # 今日DEA>0
                # 今日DIF>昨日DIF, 今日DEA>昨日DEA
                if(DIF[-2] < DEA[-2] and DIF[-1] >= DEA[-1] and 
                DEA[-1]>0 and 
                DIF[-1] > DIF[-2] and DEA[-1] > DEA[-2]):
                    optional_list.append((security, close_price_array[-1]))

            # 按照收盘价进行排序，优先买入便宜的股票
            optional_list.sort(key = lambda l: l[1])
            
            # 遍历信号股票下单
            # 投资金额为当前可用cash的20%
            use_cash = cash * 0.2
            for security, close in optional_list:
                current_cash = context.portfolio.available_cash
                # 如果所剩余不足20%
                if current_cash < use_cash:
                    use_cash = current_cash
                # 下单
                order_value(security, use_cash)
                log.info("Buying %s" % (security))
## 收盘后运行函数  
def after_market_close(context):
    log.info(str('函数运行时间(after_market_close):'+str(context.current_dt.time())))
    #得到当天所有成交记录
    trades = get_trades()
    for _trade in trades.values():
        log.info('成交记录：'+str(_trade))
