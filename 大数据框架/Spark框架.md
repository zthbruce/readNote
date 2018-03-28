# Spark框架
> spark是当前最流行的分布式计算框架
## 概览
> Spark集群上分为master节点和worker节点, 类似于hadoop的master和slave
  Master节点上常驻Master守护进程，负责管理全部Worker节点
  Worker节点上常驻Worker守护进程，负责master通信并管理
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



