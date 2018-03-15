# 导入函数库
import jqdata
import talib

# 初始化函数，设定基准等等
def initialize(context):
    # # 选取股票：选取市值较高的股票
    df = get_fundamentals(query(
        valuation.code
    ))
    # .order_by(
    #     # 按市值降序排列
    #     valuation.market_cap.desc()
    # ).limit(
    #     300
    # ))
    g.security = list(df['code'])
    
    g.high_limit_percent = 1.095
    g.low_limit_percent = 0.95
    # g.security = list(get_all_securities(['stock']).index)
    # 要操作的股票：浦发银行
    # g.security = ['600325.XSHG']
    # g.security = ['600000.XSHG','603861.XSHG', '600332.XSHG', '000040.XSHE', '300149.XSHE']
    # 设定沪深300作为基准
    set_benchmark('000300.XSHG')
    # 开启动态复权模式(真实价格)
    # set_option('use_real_price', True)
    # 输出内容到日志 log.info()
    log.info('初始函数开始运行且全局只运行一次')
    # 过滤掉order系列API产生的比error级别低的log
    # log.set_level('order', 'error')
    g.top = {} # 记录top值
    
    ### 股票相关设定 ###
    # 股票类每笔交易时的手续费是：买入时佣金万分之三，卖出时佣金万分之三加千分之一印花税, 每笔交易佣金最低扣5块钱
    # set_order_cost(OrderCost(close_tax=0.0003, open_commission=0.001, close_commission=0.0007, min_commission=5), type='stock')
    set_order_cost(OrderCost(close_tax=0, open_commission=0, close_commission=0, min_commission=0), type='stock')
    # 将滑点设为0
    set_slippage(FixedSlippage(0))
    ## 运行函数（reference_security为运行时间的参考标的；传入的标的只做种类区分，因此传入'000300.XSHG'或'510300.XSHG'是一样的）
    #run_daily(market_open, time='open', reference_security='000300.XSHG')  
     

def handle_data(context, data):
        # 设定均线窗口长度
        n1 = 12
        n2 = 26
        ma = {}
        # 记录
        # 卖出过程
        # 对持有的仓
        for security in context.portfolio.positions.keys():
            # 近似的初始价格
            # init_cost = current_positions.avg_cost
            # 更新回撤最高点值
            # if security not in g.top:
            #     g.top[security] = (init_cost, 0)
            # else:
            # 如果当前有持仓
            # if security in g.top:
            if security == '601360.XSHG':
                security = '601313.XSHG'
            # 当前的标
            current_positions = context.portfolio.positions[security]
            
            # 如果用开仓价
            init_cost = current_positions.avg_cost
            # 初始买的价格
            # init_cost = g.top[security][1]
            
            # 昨日信息
            last_info = attribute_history(security, 1, '1d', ['close', 'high'],df=False)
            
            # 昨日收盘价
            last_close = last_info['close'][0]
            
            # 昨日high
            # last_high = last_info['high'][0]
            # 止盈
            # 如果当前价格比top低
            # 且处于收益的状态
            # 超过5%
            # 且收益减少额3%
            high = 0.2
            down = 0.1
            if ( (g.top[security][0] - init_cost) / init_cost >= high
                and (g.top[security][0] - last_close) / g.top[security][0] >= down
             and current_positions.total_amount > 0):
                log.info("止盈: selling %s %s股, 昨日最高点%s, 昨日收盘价%s, 开仓价%s" % (security, current_positions.total_amount, g.top[security][0], last_close, init_cost))
                order_target(security, 0)
                if current_positions.total_amount <= 0:
                    del g.top[security] #清理
                
            stop_loss = 0.2
            # 止损: 亏损5%
            if ((last_close - init_cost) / init_cost) <= -stop_loss and current_positions.total_amount> 0:
                log.info("止损selling %s %s股， 昨日收盘价%s, 开仓价%s" % (security, current_positions.total_amount, last_close, init_cost))
                order_target(security, 0)
                if current_positions.total_amount <= 0:
                    del g.top[security] #清理
            
            ## 更新top值
            # 算法1, top值为出现过最大的峰值
            if security in g.top and last_close > g.top[security][0]:
                g.top[security] = (last_close, init_cost)
                
                # # 均线叉
                # # 历史价格
                # close_data = attribute_history(security, n2+2, '1d', ['close'],df=False)
                # # 昨日五日均线
                # ma_n1_1 = close_data['close'][-n1:-1].mean()
                # # 前日五日均线
                # ma_n1_2 = close_data['close'][(-n1-1):-2].mean()
                
                # # 昨日十日均线
                # ma_n2_1 = close_data['close'][-n2:-1].mean()
                # # 前日十日均线
                # ma_n2_2 = close_data['close'][(-n2-1):-2].mean()
                # ma[security] = (ma_n1_1, ma_n1_2, ma_n2_1, ma_n2_2)
                
                # # 满足卖出条件
                # if  (ma_n1_2 >=  ma_n2_2 
                #     and ma_n1_1 < ma_n2_1 # 短线向下穿过
                #     and  ma_n1_1 <= ma_n1_2 # 递减
                #     and ma_n2_1 <= ma_n2_2 # 递减
                #     and current_positions.closeable_amount> 0):
                #     order_target(security, 0)
                #     log.info("Selling %s" % (security))
                
        cash = context.portfolio.total_value 
        if context.portfolio.available_cash > 0:
            log.info("Today's available_cash %s" % (context.portfolio.available_cash))
            # 记录出现买入信号的股票(security, close)
            optional_list = []
            # 历史价格
            # close_data = attribute_history(security, n2+2, '1d', ['close'],df=False)
            # 对应股票买入
            for security in g.security:
                if security in ma:
                    ma_info = ma[security]
                    ma_n1_1  = ma_info[0]
                    ma_n1_2 = ma_info[1]
                    ma_n2_1 = ma_info[2]
                    ma_n2_2 = ma_info[3]
                else:
                    # 历史价格
                    close_data = attribute_history(security, n2+2, '1d', ['close', 'volume'],df=False)
                    # 昨日五日均线
                    ma_n1_1 = close_data['close'][-n1:].mean()
                    # 前日五日均线
                    ma_n1_2 = close_data['close'][(-n1-1):-1].mean()
                    
                    # 昨日十日均线
                    ma_n2_1 = close_data['close'][-n2:].mean()
                    # 前日十日均线
                    ma_n2_2 = close_data['close'][(-n2-1):-1].mean()
                # 昨日收盘价
                # last_price = close_data['close'][-1]
                # # 前天的收盘价
                # last_2_prcie = close_data['close'][-2]
                # 取得当前的现金
                # cash = context.portfolio.available_cash
                # log.info('昨日收盘价 %s' %  last_price )
                # # 绘制五日均线价格
                # record(ma_fast = ma_n1_1)
                # # 绘制十日均线价格
                # record(ma_slow = ma_n2_1)
                # log.info("ma_fast_1: %s, ma_slow_1: %s, ma_fast_2: %s, ma_slow_2: %s" % (ma_n1_1, ma_n2_1, ma_n1_2, ma_n2_2))
                last_factor = attribute_history(security, 1, '1d', ['close', 'factor'],df=False)['factor'][0]
                # high_limit = 
                # 如果满足买入条件
                if (ma_n1_2 <= ma_n2_2 and 
                    ma_n1_1 >= ma_n2_1 and # 短线向上穿过
                    ma_n1_1 >= ma_n1_2 and # 递增
                    ma_n2_1 >= ma_n2_2):  # 递增
                    # and close_data['volume'][-1] >= close_data['volume'][-2]): # 昨日成交量>前日成交量
                    
                    optional_list.append((security, get_current_data()[security].day_open / last_factor))
                    #order_value(security, cash)
                
                # log.info("股票 %s 昨日收盘价 %s, 今日开盘价 %s" %(security, close_data['close'][-1], get_current_data()[security].day_open))        
            # 按照收盘价进行排序，优先买入便宜的股票
            optional_list.sort(key = lambda l: l[1])
            log.info(optional_list)
            percent = 0.05
            # 遍历信号股票下单
            # 投资金额为当前可用cash的5%
            use_cash = cash * percent
            for security, open in optional_list:
                current_cash = context.portfolio.available_cash
                # # 没钱买一手，那么就退出
                if current_cash / open < 100:
                    break
                # 如果所剩余不足20%
                if current_cash < use_cash:
                    use_cash = current_cash
                # 历史价格
                # 按下单
                # last_info = attribute_history(security, 1, '1d', ['high', 'factor'],df=False)
                last_info = attribute_history(security, 1, '1d', ['close', 'factor'],df=False)
                # last_high = last_info['high'][0]
                last_close = last_info['close'][0]
                last_factor = last_info['factor'][0]
                log.info('%s 开盘价: %s ' % (security, open))
                order_value(security, use_cash)
                if security not in g.top and security in context.portfolio.positions.keys():
                    # 两个字段：1. 昨日收盘价 2. 交易价格(复权之后的价格)
                    g.top[security] = (last_close, open * last_factor)
                    log.info("Buying %s, 开仓价%s, 复权系数%s" % (security, open, last_factor))
                
## 收盘后运行函数  
def after_market_close(context):
    log.info(str('函数运行时间(after_market_close):'+str(context.current_dt.time())))
    #得到当天所有成交记录
    trades = get_trades()
    for _trade in trades.values():
        log.info('成交记录：'+str(_trade))
    log.info('一天结束')
    log.info('##############################################################')
