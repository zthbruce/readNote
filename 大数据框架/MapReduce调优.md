# MapReduce调优
## 调优目标
>  均衡利用资源, 不偏科，调优架构主要包括
1. CPU
2. 内存
3. 磁盘IO
4. 网络IO
> 磁盘IO和网络IO和Shuffle过程的联系很大


## 常见资源瓶颈
> 怎么调优：关键找到程序运行的瓶颈在哪
> 然后才能对症下药
### CPU
> CPU是Map-Reduce的计算环节的关键资源(如DBSCAN聚类，每个分区都进行DBSCAN聚类)
> 计算密集型代码是高CPU占用的原因，
> 高CPU占用是一种瓶颈，这往往是代码低效率的使用CPU引起的
> 低CPU占用的情况，往往是由任务数不足或者数据倾斜严重引起的，导致集群计算资源的浪费

### 内存
> 任务的内存和配置不匹配(往往是配置过低的内存，导致内存不足)，引起任务失败
> 严格来说，对于含有r个core的worker，设task的内存使用上界为m，那么 r * m <= 配置的内存

### 网络带宽占用(网络I/O)
> 高带宽占用说明大量数据在节点间传输(不同的机器之间交换数据通过网络：Socket连接或者Jetty连接)
> 高带宽占用通常发生在Shuffle过程的read/copy阶段
> 最终结果输出到HDFS中时亦会出现

### 磁盘I/O
> 磁盘I/O是Map-Reduce中最重要的资源
> 磁盘I/O是非常容易出现的瓶颈
> 任何可以缩减数据大小的手段都会提升整体效率

## 定位瓶颈(出现瓶颈的位置)
### 磁盘I/O
1. Map输入阶段
> ，数据源的读取会消耗磁盘I/O，如果磁盘I/O不够快，计算资源会造成大量闲置(相当于大家都在等磁盘读取结束)
> 大多出现在数据量巨大但计算简单的任务上

> 特征指标
 Map阶段的读取量
 Map阶段的HDFS读取量

2. Map的Shuffle阶段的记录溢写造成的巨大I/O
> 在Shuffle阶段，一旦写入的数据量> KVBuffer * 0.8，则会导致溢写
> 不恰当的map配置会导致溢写次数过多，比如说KVBuffer的内存量过小和阈值过小，导致溢写了大量的中间文件
> 中间文件会在合并过程中，读回来然后再写进去，如果文件个数过多的话，会导致Merge过程中读写轮数会变多，导致磁盘I/O消耗大
> 特征指标
 Map阶段的中间文件读取量(接近于reduce写入量为佳)
 Map阶段的中间文件写入量(接近于reduce写入量为佳)
 Map阶段的溢写次数(过高则会出问题)

3. Reduce阶段的Shuffle也会溢写，情况和2类似
4. Reduce输出阶段导致磁盘I/O很大
### 网络I/O
1. Reduce阶段的copy阶段
> map输出量大导致的网络I/O带宽占用很高
2. Reduce输出量过大(写入HDFS，需要先写入本地，当本地文件达到一定大小时，向NameNode请求写入)
> 特征指标
 Map阶段的中间文件写入量
 Reduce阶段的中间文件写入量

### CPU配置不当引起的并行处理低效
> 分配的Core数比实际core数要小，会导致core资源的闲置


### 数据倾斜导致的长尾Reducer
> 由于key值分布不均匀，导致部分reduce任务时间很多，部分reduce任务时间很长
> 数据倾斜问题是个很严重的问题，一般通过Spark_UI定位

### 内存不足
> 内存不足可能导致任务被挂起，陷入停止响应的状态
> 特征指标：内存占用
> 可能会导致的错误
java.lang.OutOfMemoryError: Java heap space

## 常见瓶颈调优
1. Map阶段输入阶段巨大的I/O
> 压缩源数据

2. Map Shuffle阶段的溢写过多导致的磁盘I/O
> 提高缓存空间(KV Buffer)的内存量和阈值

3. Map Shuffle输出量大导致网络磁盘巨大I/O
> 压缩Map输出
> 引入combiner(本地的reducer)，提前合并一下， 减少数据量

4. Reduce输出量大造成的网络磁盘巨大I/O
> 压缩任务输出
> 调整HDFS的冗余复制数(HDFS为了保证容错性，提供了冗余备份机制(DataNode一般会赋值三份保存))

5. 内存设置不当
> 小心估计单个task所需内存的上限，使得每个task分到的内存足以运行即可(太多会导致资源浪费(task数减少)，太少导致线程挂起，失去响应)

6. 并行处理低效
> 设置合理的Mapper和reducer的数目(spark里面设置executor 和 core 的数目)
> 调整map task 和reduce task的数目

7. 数据倾斜问题
> 设置更合理的partitioner，使得数据分布更加均匀(类似于)

## Spark常用的参数配置
1. num-executors
> 设置Spark作业总共要用多少个Executor进程来执行
> Executor内部是个线程池，每个task都会被封装成TaskRunner交由线程池处理
> 每个Executor的并发度由Executor的core数目决定

> 注意点：
> 该参数的值最好是worker的整数倍，便于分配Executor

2. executor-memory
> 每个executor分配的内存
> 这个需要小心的计算，该内存量和executor-cores决定了每个core能分到多少内存

> 注意点：
> Executor的内存主要分三块：
(1) task执行代码的内存，包括读入数据占得内存，默认占20%
(2) shuffle过程的read阶段，拉取上一个stage的task输出，然后进行聚合操作，默认占20%
(3) RDD持久化的使用，占总内存60%

3. executor-cores
> Executor进程的CPU core数量
> 这个参数决定了每个Executor进程并行执行task线程的能力, 因为每个core才是执行task的基本单位

4. driver-memory
> 驱动程序所需内存
> 如果需要利用collect等算子时，需要将数据全部拉至driver内存中，则需要提高该参数的值

5. spark.default.parallelism
> 设置每个stage的默认task数；
> 不设置会导致Spark根据底层HDFS的block数量来设置task的数量，默认一个HDFS block对应一个tasks

## 数据倾斜问题
> 背景(解决数据倾斜问题)
> 因为stage的结束时间取决于stage中最后一个task的执行，所以任务的执行速度取决于最大的那个任务
> 数据倾斜问题是非常重要的问题，倾斜严重时会导致执行效率很低

### 如何定位该瓶颈
> 绝大多数task执行得都非常快，但个别task执行极慢。如：1000个任务，998个都在1分钟内执行完了，剩余2个task却要两个小时
> 原本能够正常执行的Spark作业, 突然发生了OOM错误(堆空间溢出)
### 调优

