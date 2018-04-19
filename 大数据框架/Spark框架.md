# Spark框架
> spark是当前最流行的基于内存的分布式计算框架
## 概览
> Spark集群上分为master节点和worker节点, 类似于hadoop的master和slave
> Spark的架构分为：master：中心调控,worker(其实指的是Executor/Container)：运行程序, driver：驱动程序SparkContext
  Master节点上常驻Master守护进程，负责管理全部Worker节点
  Worker节点上常驻Worker守护进程，负责master通信并管理(worker上运行的Executor为本质)
  Driver是驱动程序，能够创造SparkContext

> 每个Worker存在一个或多个ExecutorBackEnd进程，每一个进程都包含一个Exexutor对象，该对象拥有线程池，每个线程可以执行一个task

> Job: 由action触发的动作，一旦执行了action，就会生成一个Job，有多少action就有多少个Job

> Stage: 在宽依赖关系处就会断开依赖链，划分stage(宽依赖的地方就是需要shuffle的)
 stage之间是有相互依赖

> Task: 任务执行的最小单元，每个stage里面的task执行逻辑相同，只是喂给它的数据不同
所以task才是spark并发执行的单位

## 程序的执行内部逻辑
> 应用创建之后，driver会生成SparkContext, SparkContext会向Cluster Manager申请Executor资源，并把job分解成一系列可执行的task，然后将task分发到各个Executor运行，Executor在task执行完毕之后就返回给SparkContext

> 为了运行在集群上，SparkContext 可以连接至几种类型的 Cluster Manager（Standalone时为master，或者 Mesos，也可以使用 YARN），它们会分配应用的资源

### 申请Executor资源
> Spark向Cluster Manager申请资源的过程，整个过程如下:（以Standalone为例)
1. SparkContext创建TaskSchedulerImpl，SparkDeploySchedulerBackend和DAGScheduler
2. SparkDeploySchedulerBackend创建AppClient，并通过一些回调函数来得到Executor信息
3. AppClient向Master注册Application
4. Master收到RegisterApplication信息后，Master向Woker发送LaunchExecutor消息，同时向AppClient发送ExecutorAdded消息
5. Worker创建ExecutorRunner，并向Master发送ExecutorStateChanged的消息
6. ExecutorRunner创建CoarseGrainedSchedulerBackend
7. CoarseGrainedExecutorBackend向SparkDeploySchedulerBackend发送RegisterExecutor消息
8. CoarseGrainedExecutorBackend在接收到SparkDeploySchedulerBackend发送的RegisteredExecutor消息后，创建Executor

### Job分解成task,分发给Executor
1. DAGScheduler接收用户提交的job
> 用户提交Job后，SparkContext通过runJob()调用DAGScheduler的runJob()。在runJob()中，调用submitJob来提交Job，然后等待Job的运行结果。
2. DAGScheduler将job分解成stage
> 首先每个job自动产生一个finalStage
> submitStage函数递归得到整个stage DAG，如果所有stage完成则调用submitMissingTasks(()把每个stage拆分成可运行的task。
3. DAGScheduler把每个stage拆分为可并行计算的task， 并将所有task提交到TaskSchedulerImpl
> submitMissingTasks产生出与partition数量相等的task，并封装成TaskSet，提交给TaskSchedulerImpl
> TaskSchedulerImpl的submitTasks将TaskSet封装成TaskSetManager，放入调度器（schedulableBuilder）等待调度（Spark有两种调度方式：FIFO和Fair。注意只调度同一SparkContext下的任务）。之后调用SparkDeploySchedulerBackend的reviveOffers()。TaskSetManager主要用来调度一个TaskSet内的task，比如，为给定的executor分配一个task。
4. SparkDeploySchedulerBackend调用Executor执行task
> 首先通过resourceOffers得到在哪个Executor运行哪个task的信息，然后调用launchTasks向Executor发送task
5. CoarseGrainedExecutorBackend在接收到LaunchTask后，调用Executor的launchTask运行task。
> Executor的内部是一个线程池，每一个提交的task都会包装为TaskRunner交由threadpool执行。
> 在TaskRunner中，task.run()真正运行每个task的任务
> 最终，每个task的运行都会调用iterator()来迭代计算RDD。下面是以ShufflerMapTask为例，rdd.iterator(partition, context)会从根partition来计算这个task的输出partition。

## Spark 逻辑执行，物理执行
> Spark执行包括job的生成，stage的生成，task的生成
> job通过actio触发，job由Stage组成

> Stage有两个子类，ShuffleMapStage、ResultStage，FinalStage就是ResultStage类型
> 整个 computing chain 根据数据依赖关系自后向前建立，遇到 ShuffleDependency 后形成 stage。在每个 stage 中，每个 RDD 中的 compute() 调用 parentRDD.iter() 来将 parent RDDs 中的 records 一个个 fetch 过来

### job提交
1. rdd.action() 会调用 DAGScheduler.runJob(rdd, processPartition, resultHandler) 来生成 job。
2. runJob() 会首先通过rdd.getPartitions()来得到 finalRDD 中应该存在的 partition 的个数和类型：Array[Partition]。然后根据 partition 个数 new 出来将来要持有 result 的数组 Array[Result](partitions.size)。
3. 最后调用 DAGScheduler 的runJob(rdd, cleanedFunc, partitions, allowLocal, resultHandler)来提交 job。cleanedFunc 是 processParittion 经过闭包清理后的结果，这样可以被序列化后传递给不同节点的 task。
4. DAGScheduler 的 runJob 继续调用submitJob(rdd, func, partitions, allowLocal, resultHandler) 来提交 job。
5. submitJob() 首先得到一个 jobId，然后再次包装 func，向 DAGSchedulerEventProcessActor 发送 JobSubmitted 信息，该 actor 收到信息后进一步调用dagScheduler.handleJobSubmitted()来处理提交的 job。之所以这么麻烦，是为了符合事件驱动模型。
6. handleJobSubmmitted() 首先调用 finalStage = newStage() 来划分 stage，然后submitStage(finalStage)。由于 finalStage 可能有 parent stages，实际先提交 parent stages，等到他们执行完，finalStage 需要再次提交执行。再次提交由 handleJobSubmmitted() 最后的 submitWaitingStages() 负责。

### stage划分
1. 该方法在 new Stage() 的时候会调用 finalRDD 的 getParentStages()。
2. getParentStages() 从 finalRDD 出发，反向 visit 逻辑执行图，遇到 NarrowDependency 就将依赖的 RDD 加入到 stage，遇到 ShuffleDependency 切开 stage，并递归到 ShuffleDepedency 依赖的 stage。
3. 一个 ShuffleMapStage（不是最后形成 result 的 stage）形成后，会将该 stage 最后一个 RDD 注册到MapOutputTrackerMaster.registerShuffle(shuffleDep.shuffleId, rdd.partitions.size)，这一步很重要，因为 shuffle 过程需要 MapOutputTrackerMaster 来指示 ShuffleMapTask 输出数据的位置。

### stage和task提交
1. 确定stage的missingParentStages，使用getMissingParentStages(stage),如果parentStages都执行过了，getMissingParentStages的执行结果为空

2. 如果missingParentStage不为空，那么先递归提交missing的parent Stages, 将自己加入waitingStages里面，等到parent stage都执行完了，才会触发waitingStages里面的stage

3. 如果 missingParentStages 为空，说明该 stage 可以立即执行，那么就调用submitMissingTasks(stage, jobId)来生成和提交具体的 task。如果 stage 是 ShuffleMapStage，那么 new 出来与该 stage 最后一个 RDD 的 partition 数相同的 ShuffleMapTasks。如果 stage 是 ResultStage，那么 new 出来与 stage 最后一个 RDD 的 partition 个数相同的 ResultTasks。一个 stage 里面的 task 组成一个 TaskSet，最后调用taskScheduler.submitTasks(taskSet)来提交一整个 taskSet。

4. 这个 taskScheduler 类型是 TaskSchedulerImpl，在 submitTasks() 里面，每一个 taskSet 被包装成 manager: TaskSetMananger，然后交给schedulableBuilder.addTaskSetManager(manager)。schedulableBuilder 可以是 FIFOSchedulableBuilder 或者 FairSchedulableBuilder 调度器。submitTasks() 最后一步是通知backend.reviveOffers()去执行 task，backend 的类型是 SchedulerBackend。如果在集群上运行，那么这个 backend 类型是 SparkDeploySchedulerBackend。

5. SparkDeploySchedulerBackend 是 CoarseGrainedSchedulerBackend 的子类，backend.reviveOffers()其实是向 DriverActor 发送 ReviveOffers 信息。SparkDeploySchedulerBackend 在 start() 的时候，会启动 DriverActor。DriverActor 收到 ReviveOffers 消息后，会调用launchTasks(scheduler.resourceOffers(Seq(new WorkerOffer(executorId, executorHost(executorId), freeCores(executorId))))) 来 launch tasks。scheduler 就是 TaskSchedulerImpl。scheduler.resourceOffers()从 FIFO 或者 Fair 调度器那里获得排序后的 TaskSetManager，并经过TaskSchedulerImpl.resourceOffer()，考虑 locality 等因素来确定 task 的全部信息 TaskDescription。

6. DriverActor 中的 launchTasks() 将每个 task 序列化，如果序列化大小不超过 Akka 的 akkaFrameSize，那么直接将 task 送到 executor 那里执行executorActor(task.executorId) ! LaunchTask(new SerializableBuffer(serializedTask))

## Spark shuffle过程
> 见Shuffle过程.md

# Spark和Hadoop的区别
## Hadoop解决了什么问题？
> Hadoop解决了大数据(一台机器已经无法存储，一台机器已经无法在要求的时间内进行处理)的可靠存储和计算处理
## hadoop的核心组件
1. HDFS(分布式文件系统)，在PC组成的集群上提供高可靠的文件存储
2. MapReduce(分布式计算模型)
3. Yarn(资源管理器), 详见Yarn框架
## hadoop的局限和不足
1. 抽象层次低，需要手工编写代码
2. 只提供Map和Reduce，表达能力欠缺
3. 一个Job只有Map和Reduce两个阶段，复杂计算需要大量的job，job之间的依赖需要自己处理
例如MR中的Join操作，就需要较为复杂的逻辑, 给每条记录设置一个表名字段，然后reduce过程，根据表名分成两个数组，对数组进行笛卡尔积运算
## spark解决了什么问题
> Spark是个分布式计算框架，提供了一系列方便的算子
1. 封装程度高，提供了很多常用的算子
2. 数据优先在内存中计算(内存装不下则存至磁盘)，提高计算速度
3. DAG_Scheduler会解决RDD之间的依赖关系
4. Spark容错性：
    (1) linage:通过数据的血缘关系，重新执行一遍之前的操作
    (2) CheckPoint: 数据持久化

## spark和hadoop的区别和联系
### 区别
1. Spark是一个内存计算框架，数据优先在内存中存储
2. Spark的性能高，可操作性强
3. Spark的执行速度要比hadoop快上10-100倍
### 联系
1. Spark没有文件系统，大量数据处理时基于hadoop的HDFS文件系统
2.  目前都可以使用Yarn作为资源调度

## Spark内存解析
> 任何Spark的进程都是一个JVM进程，JVM堆空间下Spark的内存分配情况
### 内存模型
![Spark内存模型](pic/内存模型)
> 默认情况下，Spark进程的堆空间大小为512mb，同时为了避免OOM，仅允许使用90%的堆空间作为safe堆(Spark处理OOM的方式);
> 20%的safe堆作为shuffle的内存使用，60%的safe堆作为数据缓存，剩余20%应该用于代码计算的内存
> Storage中20%作为Unroll(展开的意思: 将序列化的数据进行展开)
> Spark作为一个内存计算工具，会将数据存储在内存中，但实际上Spark并非完全的内存工具，只不过把内存当成LRU缓存的方式处理;
> 实际上也可以理解，因为大数据量不可能在内存中全部存储，必然会有淘汰机制来进行

#### Spark中能缓存多少数据？ 
> 可以统计Executor的堆大小， 乘以safeFraction * memoryFraction, 默认是54%

#### Spark Shuffle的内存
> spark.shuffle.safetyFraction的默认值是0.8,  spark.shuffle.memoryFraction的默认值是0.2
> 所以默认为16%的内存空间可以使用作为shuffle，怎么使用该内存呢？
> 该部分内存使用ShuffleMemoryManager来管理.
> 但是通常spark会使用这块内存用于shuffle中一些别的任务，当执行shuffle时，有时对数据进行排序，当进行排序时，需要缓冲排完序后的数据（注意不能改变LRU缓冲中的数据，因为后面可能要重用），这样就需要大量的RAM存储排完序后的数据块，当没有足够的内存用于排序，参考外排的实现，可以一块一块的排序，然后最终合并。

#### Unroll内存
> 该内存量的计算如下：
spark.storage.memoryFraction * spark.storage.safetyFraction * spark.storage.unrollFraction

> 当我们需要在内存展开数据块的时候使用，那么为什么需要展开呢？因为spark允许以序列化和非序列化两种方式存储数据，序列化后的数据无法直接使用，所以使用时必须要展开。该部分内存占用缓存的内存，所以如果需要内存用于展开数据时，如果这个时候内存不够，那么Spark LRU缓存中的数据会删除一些Eldest的数据块(类似于LRU缓存的机制)



## Spark 广播变量
### 为什么使用广播变量
> 为什么会出现广播变量，因为在实际操作中，很可能存在算子函数，需要传入外部变量，默认情况下，Spark会将该变量复制n份，通过网络传输到各个task中去，那么如果一个较大的变量(100M)分发到每个task时，通常task数目巨大，会带来巨大的网络I/O开销，而且每个Executor(对应一个jvm进程)会由于内存消耗过大导致GC频繁，导致性能下降。
> 使用广播变量，对于大变量来说，每个Executor中会缓存一份副本，内部的task会共享该副本,这样做的好处，减少网络IO, 降低Executor内存占用，降低GC的频率

> 这其中有个优化的点：Join操作时如果两边一边是大表一边是小表的话，则可以用广播变量代替小表，每次只需要map，而不需要Shuffle(shuffle的I/O,网络I/O开销都很大)

### 广播变量怎么实现？
> 将变量从Driver发送到Executor(或者Executor到Executor)，而且至多发送一次。

> 广播变量的实现机制一般有两种，一种是httpBroadCast，另一种是TorrentBroadcast，TorrentBroadcastk可以解决单点网络瓶颈问题。


## 分区器
> 分区器是用来计算该数据<k, v>将会被分到哪个分区，每个分区对应一个task。其功能有二：
1. 由于partitionNum决定了Shuffle 过程之后的ShuffleRDD的个数，即决定了reducer的个数
2. 确定每条数据会被分到哪个分区

> Spark内置存在两种分区器: HashPartitioner 和 RangePartitioner。当然用户也可以编写自己的Partitioner，只要实现
> 继承该抽象类，然后实现getPartitions方法
abstract class Partitioner extends Serializable {
  def numPartitions: Int
  def getPartition(key: Any): Int
}
### 哈希分区器
> 取键值的hashCode, 除以子RDD的个数取余即可
> 哈希分区器
class HashPartitioner(partitions: Int) extends Partitioner {
  def numPartitions: Int = partitions

  def getPartition(key: Any): Int = key match {
    case null => 0
    case _ => Utils.nonNegativeMod(key.hashCode, numPartitions)
  }

  override def equals(other: Any): Boolean = other match {
    case h: HashPartitioner =>
      h.numPartitions == numPartitions
    case _ =>
      false
  }

  override def hashCode: Int = numPartitions
}

> 优点： 计算速度快

> 缺点： 不关心键值的分布情况，导致数据倾斜的概率较大

### Range Partitioner(范围分区器)
> 乍一想范围分区的思想和Hash分区的思想，就是两种思想：一种是序列映射(满足同余关系)，一种是范围分区(满足一定大小关系，如桶排序就是一种范围分区)
> 使用范围分区器，有以下好处：
1. 范围分区器将争取将所有分区都获得较均匀的数据，减少数据倾斜问题。
2. 分区内数据的上界都是有序的(Spark的orderByKey就是采用这种方式进行)

> Spark的范围分区器需要完成两个功能：
1. 根据父 RDD 的数据特征，确定子 RDD 分区的边界
2. 形成一个键值对，使得查找的时候进行

> 要完成对应的功能，就得解决很多问题：
首先， 怎么确定子RDD分区的边界？
> 数据量这么大，我们不可能遍历一遍总数据集，统计学家很厉害，发明了抽样的概念，然后建立了一套在抽样上的理论；
> 所以，经验可知，我们需要进行数据采样，来确定边界点的划分(实际上，采样观察数据也是解决数据倾斜的一种手段)；

#### Spark1.1之前
#### 样本量
那么首先应该考虑的就是采多少合适？Spark是怎么解决的？

> 样本量太小则不具有代表性，样本量太大则会导致，采样，排序的时间过长。

> Spark的采样量由子RDD的分区数决定，平均每个分区20个点
    val maxSampleSize = partitionNum * 20

#### 单分区采样个数
> 上面确定了总采样个数，那么具体数据得从父Stage的RDD中采样啊，那么就涉及到每个父分区怎么采样？

> 当然最简单的思路就是每个分区平均分配，但这显然是不合适的，因为父RDD中未必是分布均匀的，既然分布不均匀，那么数据量大的分区自然应该抽取更多的数据，否则很容易偏了，而且数据量少的分区甚至都达不到平均数。

> 采样个数为每个分区内数据量乘以一个比例Frac，那么就会解决对应的问题
  val rddSize = rdd.count() // 计数
  val frac = math.min(maxSampleSize / math.max(rddSize, 1), 1.0)

> frac就是采样样本量 / 父RDD的总数据量，由此可见，必须遍历一遍父RDD, 然后统计数目

#### 采样算法
> 采样比例确定了之后，利用Spark的采样函数取了数据之后，再进行排序即可

> 采样会对RDD数据各进行一次遍历(开销很大啊)

#### 确定边界
> 边界确定也非常简单，就是将排序后的采样点，按照长度(sampleSize / (partitionNum - 1))确定对应的位置，然后将对应的位置取出作为(partitionNum - 1)个边界点
val bounds = new Array[K](partitions - 1)
for (i <- 0 until partitions - 1) {
  val index = (rddSample.length - 1) * (i + 1) / partitions
  bounds(i) = rddSample(index)
}


### 1.4之后
> 实际上，上面的的分区方法，实际上开销很大，而且效率不高:
> 需要遍历一遍父RDD进行count， 再次采样又会遍历一遍父RDD，如果使用SortByKey算子，那么还需要进行归并(再遍历一遍数据集);
> 遍历的次数太多了，我们需要进行优化。

> 优化的思路，主要是减少遍历的次数：
> 前面说，数据未必是分布均匀的，所以得根据数据量大小来计算，但是，数据也未必就不是均匀的啊，如果数据比较均匀，完全可以每个分区的采样比例相同啊，这样的话，就完全没必要遍历父RDD统计其个数了。

> 假设数据在每个分区均匀分区，每个分区取相同的数目，同时统计每个分区的实际数据量，判断是否出现数据偏移，再对个别分区进行重新分配

#### 样本总量
> 依然是每个子分区20个数据点，但是存在上界1000000个点
  val maxSampleSize = partitionNum * 20 
#### 单分区采样数 
> 理论上，每个分区的采样数是 sampleSize / rdd.partitions.size；
> 但是实际操作时却取了理论值的三倍
val sampleSizePerPartition = math.ceil(3.0 * sampleSize / rdd.partitions.size).toInt

> 数据值在3倍平均值以上的需要重新分配，否则则不再调整；

> 为什么要这么做呢？
> 我猜测是为了解决数据偏移的问题，如果数据量大于平均值的三倍，那么就会进行重新分配(如果直接取平均值，不行么？只要判断是不是当前的三倍即可啊，这一步为什么呢，好像有点多次一举，难道是为了减少计算量，这里算一次即可？)

解答：这也是为了减缓数据分布的偏移，因为数据量少的分区，可能达不到3倍平均，所以加大上限(3倍平均采样size)，所以可以给数据量大的更多的样本量

#### 采样算法
> 在确定单个分区的采样个数之后，即可进行采样，但是发现我们并不知道每个分区的数据量，所以我们也无法知道采样比例。
> 如果先进行遍历获得数目，那么和老版本就一模一样了，这里我们就需要引入新的思想(水塘抽样，牛人真多啊)

1. 水塘抽样
> 水塘抽样是一种在线抽样法，能在不知道样本总数或者数据无法载入内存的情况下进行等概率抽样
val (numItems, sketched) = RangePartitioner.sketch(rdd.map(_._1), sampleSizePerPartition)

> numItems表示RDD的数据总数，sketched 是一个迭代器，每个元素是一个三元组 (idx, n, sample)，其中 idx 是分区编号，n 是分区的数据个数（而不是采样个数），sample 是一个数组，存储该分区采样得到的样本数据。
水塘抽样会被问！！！

2. 抽样调整
> 到这里，抽样还没有完成，还有抽样调整，将按比例应该抽取数据量(即按照原先比例的抽法)大于3倍平均值的进行重新抽样，表明此时发生了数据偏移，这表明需要更多的抽样数据，应该进行重新取样
那么抽样率应该怎么算呢？ 和之前的算法一样 sampleSize / numItems, 采样数/总点数,
然后采用sample进行抽样。

> 采样后的每一个样本以及该样本采样时候的采样间隔（1 / 采样率，记为 weight）都会放到 candidates 数组中。采样过程到此结束。
(采样间隔用于计算后面的分隔点)

> 权重越大，采样率越小，说明样本量越大，那么其样本包含的点就应该比较多才对，

> 祭上代码如下：
>
val fraction = math.min(sampleSize / math.max(numItems, 1L), 1.0)
val candidates = ArrayBuffer.empty[(K, Float)]
val imbalancedPartitions = mutable.Set.empty[Int]

sketched.foreach { case (idx, n, sample) =>
  /* I: 应该采样的数据比实际采样的数据要大 */
  if (fraction * n > sampleSizePerPartition) {
    imbalancedPartitions += idx
  } else {
    // The weight is 1 over the sampling probability.
    val weight = (n.toDouble / sample.size).toFloat
    for (key <- sample) {
      candidates += ((key, weight))
    }
  }
}
if (imbalancedPartitions.nonEmpty) {
  // Re-sample imbalanced partitions with the desired sampling probability.
  val imbalanced = new PartitionPruningRDD(rdd.map(_._1), imbalancedPartitions.contains)
  val seed = byteswap32(-rdd.id - 1)
    val reSampled = imbalanced.sample(withReplacement = false, fraction, seed).collect()
  val weight = (1.0 / fraction).toFloat
  candidates ++= reSampled.map(x => (x, weight))
}

#### 边界确定
> 因为每个分区的采样率不同，所以其实每个分区采样的间隔也不应该相同(厉害，这是为了保证每个分区内的数据能够更加均匀)；
>
    def determineBounds[K : Ordering : ClassTag](
        candidates: ArrayBuffer[(K, Float)],
        partitions: Int): Array[K] = {
      val ordering = implicitly[Ordering[K]]
      val ordered = candidates.sortBy(_._1)
      val numCandidates = ordered.size
      val sumWeights = ordered.map(_._2.toDouble).sum
      val step = sumWeights / partitions
      var cumWeight = 0.0
      var target = step
      val bounds = ArrayBuffer.empty[K]
      var i = 0
      var j = 0
      var previousBound = Option.empty[K]
      while ((i < numCandidates) && (j < partitions - 1)) {
        val (key, weight) = ordered(i)
        cumWeight += weight
        if (cumWeight > target) {
          // Skip duplicate values.
          if (previousBound.isEmpty || ordering.gt(key, previousBound.get)) {
            bounds += key
            target += step
            j += 1
            previousBound = Some(key)
          }
        }
        i += 1
      }
      bounds.toArray
    }

> 先排序，后采样

#### 快速定位
> 无论是新版本还是老版本的范围分区器，使用的定位方法都是一样的。范围分区器的定位实现在 getPartition 方法内，若边界的数量小于 128，则直接遍历，否则使用二叉查找法来查找合适的分区编号。

> 祭上代码如下：
  def getPartition(key: Any): Int = {
    val k = key.asInstanceOf[K]
    var partition = 0
    if (rangeBounds.length <= 128) {
      // If we have less than 128 partitions naive search
      while (partition < rangeBounds.length && ordering.gt(k, rangeBounds(partition))) {
        partition += 1
      }
    } else {
      // Determine which binary search method to use only once.
      partition = binarySearch(rangeBounds, k)
      // binarySearch either returns the match location or -[insertion point]-1
      if (partition < 0) {
        partition = -partition-1
      }
      if (partition > rangeBounds.length) {
        partition = rangeBounds.length
      }
    }
    if (ascending) {
      partition
    } else {
      rangeBounds.length - partition
    }
  }

> 有序数组，利用二分数组找出，找出比目标大的那个点的位置即可(目标大，取left)



## 水塘抽样
### 什么是水塘抽样：实现了什么功能？
> 首先，水塘抽样也是一种随机抽样的方法，而且不放回(不会重复抽)
水塘抽样，实现了功能：

> 给定一个数据流，这个数据流的长度很大或者未知。并且对该数据流中的数据只能访问一次，实现数据的随机抽样。

> 我们先来回忆一个问题：有N张彩票，只有一张是中奖的，大家依次抽奖，抽完后不放回，那么每个人中奖的概率是一样的吗？
  我们来看，第一个人中奖的概率是 1 / N;
  第二个人中奖的概率是基于第一个人不中奖的概率，设事件A表示第一个人不中奖，B表示第二个人中奖，
  则P(AB)= (N-1)/N * (1/(N-1)) = 1 / N;
  第k个人中奖意味着
  1. 前面k-1个人均没有中奖，说明彩票位于后N-K张中，其概率为(N-K) / N
  2. 第k个人中奖了，这样的概率为1 / (N-K) 
  所以其中的概率为 (N-K) / N * (1 / (N - K)) = 1 / N
  所以不管抽奖的先后，其中奖的概率都是一样的，不存在后面的比前面的概率更大的说法

### 单点抽样
> 假设只抽一个数据时，(这个抽样抽象起来类似于抽奖的过程)
> 通过遍历一遍数据，来进行抽样的话，可以采用后者替换前者的方法：
  具体算法为： 在取第n个数据的时候，如果取一个随机数[0, 1]之间，概率小于 1/n的话则更新抽样点，否则不更新；
  那么最后每个元素会以等概率返回

> 抽象出的问题就是：对于n(n>=1)，每次以1/i(i表示当前遍历了多少个元素)的概率决定是否替换选中元素直到n，最终每个元素被选中的概率为1/n

> 证明方式：设第i个元素设为i, i<=n, 那么它最终被选中的概率是：
     (1/i) * (i / (i+1)) * ((i+1)/(i+2)) * ... * ((n-1)/(n)) = 1 / n
    即表示在第i轮被选取，然后之后的元素都没有被选取，才会出现i被选中，这就是该事件的概率
  

> 计算上，如果考虑了浮点数的比较的话，可以采用整数的方式[1, n]中，如果取到1，(概率为 1/n) 则更新抽样点，否则不更新

### 水塘抽样
> 水塘抽样其实是在单点抽样的基础上，将一个点扩展到了k个点，这k个点就叫一个池(水塘)
> 其算法为：
  取第n个数据时，随机生成一个[0, 1]的概率值p，如果p小于k/n，则替换池中任意一个数。大于k/n则不更新池中的数，直至数据流结束，返回池中的k个数。

> 对 n<k的情况，不需要讨论，自然全部入池，这也是程序的初始化部分
> 抽象出来的问题为：对于n(n>=k)，每次以k/i(i表示当前第i轮)的概率决定是否将其放入池中，替换池中任意元素，那么每个元素进入池的概率相等均为k/n

> 证明方式：
  > 设第i个元素设为i，则i最终被选中的事件为：
  > i被选中，等价于说，第i轮被选中，然后之后元素没有被选中或者之后有元素被选中，但是没有替换i

  > 故i最后被选中的概率 = i被选中的概率 * [后面没有元素被选中 + 后面元素被选中但是i没被替换]

  P = k / i * ( (i+1-k) / (i+1) + k /(i+1) * (k-1)/ k ) * ((i+1-k) / (i+1) + k /(i+1) * (k-1)/ k) + ...
      * ((n-k) / n + k / n * (k-1)/k) 
    = (k / i) * (i / (i+1)) * ((i+1)/(i+2)) * ... ((n-1)/n)
    =  k / n
  证明结束

> 能在单点抽样的基础上，进行推广，确实有点厉害，佩服佩服

> java实现：
import java.util.Random;
public int[] poolSample(int[] s, k){
  // as
  assert s == null: "请输入正确数组"
  int[] K = new int[k];
  // init
  int i = 0;
  for(i = 0; i < s.length && i < k.length; i++){
    K[i] = s[i];
  }

  // 水池抽样
  for(; i < s.length; i++){
    // 随机抽取一个元素，和k进行比较
    int randNumber = rand.nextInt(i); // 生成0到i-1的一个数
    // 如果可以替换
    if(randNumber + 1 <= k){
      K[randNumber] = s[i]; // 进行替换即可
    }
  }
}

## Spark
> 之所以说Spark是基于内存的分布式计算模型，是因为Executor是个java进程，Executor中90%的safe heap中，有60%作为cache，20%用于shuffle，20%用于计算。可以将数据先缓存在内存里面，下次再用到就不需要进行hdfs的读取了(源头)(类似于一个LRU缓存，但如果溢出了还是会溢写磁盘的。我猜想其内存的计算应该是这个意思)

## Spark容错机制：Cache和CheckPoint
> 