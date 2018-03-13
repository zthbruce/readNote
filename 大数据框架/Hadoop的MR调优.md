# MapReduce任务
## Hadoop的核心组件
### HDFS(Hadoop Distributed File System 分布式文件系统)
> 分布式的提供冗余备份的文件系统，可存储海量数据
> 为什么要设计HDFS呢？
1. 专门为存储超大文件而设计
2. 适用于流式的数据访问：适用于批处理的情况而不是交互处理，保证高吞吐量(单位时间内传输的数据量)
3. 容错性：完善的冗余备份机制
4. 支持简单的一致性模型：HDFS需要支持一次写入多次读取的模型，而且写入过程文件不会经常变化
5. 移动计算优于移动数据：HDFS提供了使应用计算移动到离它最近数据位置的接口
6. 兼容各种硬件和软件平台

> 不适合的场景
1. 大量小文件：文件的元数据都存储在NameNode内存中
2. 低延迟数据访问：hdfs是专门针对高数据量吞吐量设计
3. 多用户写入，任意修改文件

> hdfs框架
hdfs主要由3个组件构成，分别为NameNode, SecondaryNameNode, DataNode, HDFS是以master-slave模式运行，其中NameNode和SecondaryNameNode是在master上面运行，dataNode是在slave节点上

#### DataNode(数据节点)
> 和普通的文件系统类似，hdfs也会把文件分块来存储。普通文件系统采用的磁盘块数据大小一般为512B，hdfs通常的数据块是64M。为什么数据块这么大呢，因为数据块较大可以增大数据的吞吐量，减少寻址的累计时间，假设寻址时间为10ms，磁盘传输速率为100M/s，那么获取相同大小的数据，必然是数据块越大可以减少寻址的次数。但是数据块太大也不好，块过大会导致任务数量过少，不利于并发度，降低作业的处理速度

>hdfs按块存储还有如下好处：
1. 文件可以任意大，也不用担心单个结点磁盘容量小于文件的情况
2. 简化了文件子系统的设计，子系统只存储文件块数据，而文件元数据则交由其它系统（NameNode）管理
3. 有利于备份和提高系统可用性，因为可以以块为单位进行备份，hdfs默认备份数量为3(备份)
4. 有利于负载均衡
#### NameNode
> 为什么需要NameNode呢？因为当客户端请求一个文件或者存储一个文件时，我们必须知道要往哪个DataNode上取数据, 获取这些信息后，客户端再与这个DataNode交互，NameNode就是该信息的维护者

> NameNode维护的元信息
1. 文件名目录名以及他们之间的关系
2. 文件目录的所有者及其权限
3. 文件包括哪些文件块以及每个文件块的名

> 需要注意的是，NameNode元信息并不保存每个块的位置信息，这些信息会在NameNode启动时从各个DataNode获取并保存在内存中，放在内存中会减少查询时间。NameNode会通过心跳机制
检查DataNode是否运行正常。NameNode只保存各个块的名称以及文件由哪些块组成

> 一般来说，一条元信息记录会占用200byte内存空间。假设块大小为64MB，备份数量是3 ，那么一个1GB大小的文件将占用16*3=48个文件块。如果现在有1000个1MB大小的文件，则会占用1000*3=3000个文件块（多个文件不能放到一个块中）。我们可以发现，如果文件越小，存储同等大小文件所需要的元信息就越多，所以，Hadoop更喜欢大文件。

> 运行NameNode会占用大量内存和I/O资源，一般NameNode不会存储用户数据或执行MapReduce任务。
> 元信息的持久化
在NameNode中存放元信息的文件是 fsimage。在系统运行期间所有对元信息的操作都保存在内存中并被持久化到另一个文件edits中。并且edits文件和fsimage文件会被SecondaryNameNode周期性的合并

> 为了简化系统的设计，Hadoop只有一个NameNode，这也就导致了hadoop集群的单点故障问题。因此，对NameNode节点的容错尤其重要，hadoop提供了如下两种机制来解决：
1. 将hadoop元数据写入到本地文件系统的同时再实时同步到一个远程挂载的网络文件系统（NFS）。(该方法就类似于在云端保存一份副本数据，以防本地故障导致数据丢失)
2. 运行一个secondary NameNode，它的作用是与NameNode进行交互，定期通过编辑日志文件合并命名空间镜像，当NameNode发生故障时它会通过自己合并的命名空间镜像副本来恢复。需要注意的是secondaryNameNode保存的状态总是滞后于NameNode，所以这种方式难免会导致丢失部分数据（后面会详细介绍）。

#### SecondaryNameNode
> SecondaryNameNode不是NameNode的备份，而是负责将fsimage和edits文件定期合并，
edits文件存在的目的是为了提高系统的操作效率，NameNode在更新内存中的元信息之前都会先将操作写入edits文件。每次NameNode启动时，都会将fsimage和edits文件进行定期合并，为了防止edits文件过大，SecondartNameNode会负责定期将两者合并

> 合并步骤
1. 合并之前告知NameNode把所有的操作写到新的edites文件并将其命名为edits.new。
2. SecondaryNameNode从NameNode请求fsimage和edits文件
3. SecondaryNameNode把fsimage和edits文件合并成新的fsimage文件
4. NameNode从SecondaryNameNode获取合并好的新的fsimage并将旧的替换掉，并把edits用第一步创建的edits.new文件替换掉
5.更新fstime文件中的检查点
### MapReduce(计算框架)
> 