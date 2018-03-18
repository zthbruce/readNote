# Shuffle过程
## 为什么需要Shuffle
> Shuffle其实是个重新洗牌的意思，但在MR框架中更像是将杂乱的数据清洗成有规则的数据
## Hadoop MR VS Spark
> Hadoop 和 Spark都会有shuffle过程，其过程大同小异
### 相似点
> 都是将mapper(Spark里为ShuffleMap Task)的输出进行partition, 不同的partition发送给不同的reducer(Spark里面的reducer可能是下一个stage中的ShuffleMapTask，也可能是ResultTask)

### 差异
> Hadoop MR是Sort-based, 进入combine和reduce的records必须先sort,这样做的好处是可以处理大规模的数据，因为其输入数据可以通过外排序的方式得到排序(mapper先对每段数据做排序，然后reducer只需要只要对排序好的数据进行归并即可)
## Spark Shuffle
> Spark进行shuffle的时候分为两步，Shuffle Write 和 Shuffle Read
> 将Map端划分数据，持久化数据的过程称为Shuffle write, 将reducer端读入数据(fetch),aggregate数据的过程称为shuffle read
> 下面重点讲一讲shuffle read/write