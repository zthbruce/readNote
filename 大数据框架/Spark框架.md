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
> 
