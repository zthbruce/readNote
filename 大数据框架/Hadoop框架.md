# Hadoop框架
> hadoop的核心组件hdfs和map-reduce计算模型
## HDFS(Hadoop Distributed File System 分布式文件系统)
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

### DataNode(数据节点)
> 和普通的文件系统类似，hdfs也会把文件分块来存储。普通文件系统采用的磁盘块数据大小一般为512B，hdfs通常的数据块是128M。为什么数据块这么大呢，因为数据块较大可以增大数据的吞吐量，减少寻址的累计时间，假设寻址时间为10ms，磁盘传输速率为100M/s，那么获取相同大小的数据，必然是数据块越大可以减少寻址的次数。但是数据块太大也不好，块过大会导致任务数量过少，不利于并发度，降低作业的处理速度

>hdfs按块存储还有如下好处：
1. 文件可以任意大，也不用担心单个结点磁盘容量小于文件的情况
2. 简化了文件子系统的设计，子系统只存储文件块数据，而文件元数据则交由其它系统（NameNode）管理
3. 有利于备份和提高系统可用性，因为可以以块为单位进行备份，hdfs默认备份数量为3(备份)
4. 有利于负载均衡
### NameNode
> 为什么需要NameNode呢？因为当客户端请求一个文件或者存储一个文件时，我们必须知道要往哪个DataNode上取数据, 获取这些信息后，客户端再与这个DataNode交互，NameNode就是该信息的维护者

> NameNode维护的元信息
1. 文件名目录名以及他们之间的关系
2. 文件目录的所有者及其权限
3. 文件包括哪些文件块以及每个文件块的名

> 需要注意的是，NameNode元信息并不保存每个块的位置信息，这些信息会在NameNode启动时从各个DataNode获取并保存在内存中，放在内存中会减少查询时间。NameNode会通过心跳机制检查DataNode是否运行正常。NameNode只保存各个块的名称以及文件由哪些块组成

> 一般来说，一条元信息记录会占用200byte内存空间。假设块大小为64MB，备份数量是3 ，那么一个1GB大小的文件将占用16*3=48个文件块。如果现在有1000个1MB大小的文件，则会占用1000*3=3000个文件块（多个文件不能放到一个块中）。我们可以发现，如果文件越小，存储同等大小文件所需要的元信息就越多，所以，Hadoop更喜欢大文件。

> 运行NameNode会占用大量内存和I/O资源，一般NameNode不会存储用户数据或执行MapReduce任务。

> 元信息的持久化
在NameNode中存放元信息的文件是 fsimage。在系统运行期间所有对元信息的操作都保存在内存中并被持久化到另一个文件edits中。并且edits文件和fsimage文件会被SecondaryNameNode周期性的合并

> 为了简化系统的设计，Hadoop只有一个NameNode，这也就导致了hadoop集群的单点故障问题。因此，对NameNode节点的容错尤其重要，hadoop提供了如下两种机制来解决：
1. 将hadoop元数据写入到本地文件系统的同时再实时同步到一个远程挂载的网络文件系统（NFS）。(该方法就类似于在云端保存一份副本数据，以防本地故障导致数据丢失)
2. 运行一个secondary NameNode，它的作用是与NameNode进行交互，定期通过编辑日志文件合并命名空间镜像，当NameNode发生故障时它会通过自己合并的命名空间镜像副本来恢复。需要注意的是secondaryNameNode保存的状态总是滞后于NameNode，所以这种方式难免会导致丢失部分数据（后面会详细介绍）。

### SecondaryNameNode
> SecondaryNameNode不是NameNode的备份，而是负责将fsimage和edits文件定期合并，
edits文件存在的目的是为了提高系统的操作效率，NameNode在更新内存中的元信息之前都会先将操作写入edits文件。每次NameNode启动时，都会将fsimage和edits文件进行定期合并，为了防止edits文件过大，SecondartNameNode会负责定期将两者合并

> 合并步骤
1. 合并之前告知NameNode把所有的操作写到新的edites文件并将其命名为edits.new。
2. SecondaryNameNode从NameNode请求fsimage和edits文件
3. SecondaryNameNode把fsimage和edits文件合并成新的fsimage文件
4. NameNode从SecondaryNameNode获取合并好的新的fsimage并将旧的替换掉，并把edits用第一步创建的edits.new文件替换掉
5. 更新fstime文件中的检查点

### 数据备份
> hadoop通过数据备份的方式实现容错，有备而无患

> DataNode会通过心跳的方式定期的向NameNode发送自己节点上的Block 报告，这个报告中包含了DataNode节点上的所有数据块的列表

> 在Hadoop中，如果副本数量是3的情况下，Hadoop默认是这么存放的，把第一个副本放到机架的一个节点上，另一个副本放到同一个机架的另一个节点上，把最后一个节点放到不同的机架上。这种策略减少了跨机架副本的个数提高了写的性能，也能够允许一个机架失败的情况，算是一个很好的权衡。

> 副本的选择：优先选择最近的副本给请求者

> 安全模式
当 Hadoop的NameNode节点启动时，会进入安全模式阶段。在此阶段，DataNode会向NameNode上传它们数据块的列表，让 NameNode得到块的位置信息，并对每个文件对应的数据块副本进行统计。当最小副本条件满足时，即一定比例的数据块都达到最小副本数，系统就会退出安全模式，而这需要一定的延迟时间。当最小副本条件未达到要求时，就会对副本数不足的数据块安排DataNode进行复制，直至达到最小副本数。而在安全模式下，系统会处于只读状态，NameNode不会处理任何块的复制和删除命令

### HDFS中的沟通协议
> 所有的HDFS中的沟通协议都是基于tcp/ip协议，一个客户端通过指定的tcp端口与NameNode机器建立连接，并通过ClientProtocol协议与NameNode交互。而DataNode则通过DataNode Protocol协议与NameNode进行沟通。HDFS的RCP(远程过程调用)对ClientProtocol和DataNode Protocol做了封装。

> 按照HDFS的设计，NameNode不会主动发起任何请求，只会被动接受来自客户端或DataNode的请求。所以即使是获取数据时，client只会向NameNode发送请求，NameNode发送给client数据块的位置，然后client与DataNode进行交互，获取数据

### 可靠性保证
> 可以允许DataNode失败，DataNode会定期(默认3秒)向NameNode发送心跳，若NameNode在指定间隔中没有收到心跳，就认为此节点已经失败。此时，NameNode把失败节点的数据(从另外的副本节点获取)复制到另外一个健康的节点，保持了集群的副本数。

### hdfs文件读过程
>hdfs通过rpc调用NameNode获取文件块的位置信息，对于文件的每一个块，NameNode会返回含有该块副本的DataNode的节点地址，另外，客户端还会根据网络拓扑来确定它与每一个DataNode的位置信息，从离它最近的那个DataNode获取数据块的副本，最理想的情况是数据块就存储在客户端所在的节点上。

> hdfs发起请求的过程如下：
1. 客户端发起读请求
2. 客户端与NameNode得到文件的块及位置信息列表
3. 客户端直接和DataNode交互读取数据
4. 读取完成关闭连接

### hdfs文件写过程
> 
DistributedFileSystem会发送给NameNode一个RPC调用，在文件系统的命名空间创建一个新文件，在创建文件前NameNode会做一些检查，如文件是否存在，客户端是否有创建权限等，若检查通过，NameNode会为创建文件写一条记录到本地磁盘的EditLog，若不通过会向客户端抛出IOException。创建成功之后DistributedFileSystem会返回一个FSDataOutputStream对象，客户端由此开始写入数据。

> 过程如下：
1. 客户端在向NameNode请求之前先写入文件数据到本地文件系统的一个临时文件
2. 待临时文件达到数据块大小时开始向NameNode请求DataNode信息
3. NameNode在文件系统中创建文件并返回给客户端一个数据块及其对应的DateNode的地址列表
4. 客户端得到DateNode的地址将临时文件块flush到列表的第一个DataNode
5. NameNode提交这次文件创建，此时，文件在文件系统中可见

> flush的过程比较复杂，其步骤大致如下
1. 首先，第一个DataNode是以数据包(数据包一般4KB)的形式从客户端接收数据的，DataNode在把数据包写入到本地磁盘的同时会向第二个DataNode（作为副本节点）传送数据。
2. 在第二个DataNode把接收到的数据包写入本地磁盘时会向第三个DataNode发送数据包
3. 第三个DataNode开始向本地磁盘写入数据包。此时，数据包以流水线的形式被写入和备份到所有DataNode节点
4. 传送管道中的每个DataNode节点在收到数据后都会向前面那个DataNode发送一个ACK,最终，第一个DataNode会向客户端发回一个ACK
5. 当客户端收到数据块的确认之后，数据块被认为已经持久化到所有节点。然后，客户端会向NameNode发送一个确认
6. 如果管道中的任何一个DataNode失败，管道会被关闭。数据将会继续写到剩余的DataNode中。同时NameNode会被告知待备份状态，NameNode会继续备份数据到新的可用的节点
7. 数据块都会通过计算校验和来检测数据的完整性，校验和以隐藏文件的形式被单独存放在hdfs中，供读取时进行完整性校验

### hdfs文件删除过程
> hdfs删除的过程如下
1. 一开始删除文件，NameNode只是重命名被删除的文件到/trash目录，因为重命名操作只是元信息的变动，所以整个过程非常快。在/trash中文件会被保留一定间隔的时间（可配置，默认是6小时），在这期间，文件可以很容易的恢复，恢复只需要将文件从/trash移出即可。
2. 当指定的时间到达，NameNode将会把文件从命名空间中删除
3. 标记删除的文件块释放空间，HDFS文件系统显示空间增加

### rpc框架
> 了解RPC框架，rpc的意思是远程调用，两台服务器A,B，A想调用B上提供的函数/方法，由于不在一个内存空间，必须通过网络来表达调用的语意和传递的参数
1. 解决通讯的问题，通过在客户端和服务端简历TCP连接
2. 解决寻址的问题，A服务器告诉底层的RPC框架，如何连接到B服务器的特定端口，方法的名称是什么，才能完成调用，比如基于Web服务协议栈的RPC，就要提供一个endpoint URI
3. 当A服务器发起远程调用，方法的参数通过网络协议传递，由于网络协议传递的都是二进制，所以参数必须要序列化，将序列化后的参数传给服务器B
4. B服务器收到请求后，需要对参数进行反序列化(序列化的反操作)，恢复内存中的表达式，然后调用方法，获得返回结果数据
5. A服务器将结果数据序列化之后，发送给服务器A，服务器A再进行反序列化，恢复为内存中的形式，交给服务器A上的应用


## MapReduce
> MapReduce 本身是一种编程模型，用于大规模数据的分布式计算
> 该模型的架构上，大致分为三个步骤，Map -> Shuffle -> Reduce，从时间顺序来说，大致分为5个阶段
> 输入分片（input split）、map阶段、shuffle阶段和reduce阶段。
> 官方给出的流程图如下：
![map-reduce](pic/Map-Reduce.png)
### 输入分片(数据分区)：进行map计算之前，会根据输入文件的hdfs block进行分区，通常来说，一个block的数据会在一个分区里面
    可以利用paritioner进行重新分区，使每个分区的数据分布均匀
    MapReduce调优方向1(减少数据倾斜，使数据分布尽量均匀)

### map阶段：mapper函数(映射器)对本机存储的数据进行函数映射，map阶段是否会进行排序呢？
如果map之后需要进行reduce，那么map阶段会进行排序，如果没有的话，则不会进行排序直接写入hdfs中。
因为本质上，map shuffle才是完成排序的阶段。


### Shuffle阶段
>shuffle阶段简单来说就是重新分区的意思，将处于相同分区的数据fetch到一个partition里面，然后重新Sort一下再提 供给reducer. >Shuffle阶段横跨map阶段和reduce阶段，分为Map Shuffle 和 Reduce Shuffle两个阶段
#### Map Shuffle(对应Spark中的Shuffle Write)
> Map阶段的shuffle过程是对Map结果进行分区，排序，分割，然后将属于同一分区的输出合并在一起并写在磁盘上，最终得到一个分区有序的文件。分区有序的意思是map输出的key/value按照分区进行排列，具有相同partition的存储在一起，partition内的按照key值升序排列
1. Partition
> 对于map输出的每一个键值对，系统都会给定一个partitioner， partition值计算默认是通过hash值 % Reducer个数得到。partition对应处理该数据的reducer
> 如果默认情况下，数据集在分区内的分布很不均匀，或者说我们需要满足某一规律的key值数据放在一个Reduce阶段处理，则需要自己编写Partitioner进行分区。但是必须保证，相同key值的键值对分发到同一个Reducer。这是Map Reduce的调优方向。

2. Collector
> Map输出的结果是由Collector处理的，每个Map任务不断将键值对输出到内存中一个环形的数据结构中。使用环形数据结构，目的是为了更有效的利用内存空间，在内存中放置尽可能多的数据(数据优先放在内存中，处理速度快)
> 数据结构是个字节数组，叫Kvbuffer，名如其义，里面不仅存放数据，还存放索引数据，给放置索引数据的取余叫kvmeta，包含一个四元组
(key的位置，value的位置，partition值，value的长度)，两者位于两个区域，区域的分界点初始为0，每一次spill都会更新分界点.
> KvBuffer是内存中的结构，随着数据的输入，KVBuffer中的数据总有不够用的一天，这是Spill过程就会触发了
> 关于Spill触发的条件，也就是Kvbuffer用到什么程度开始Spill，还是要讲究一下的。如果把Kvbuffer用得死死的，一点缝都不剩的时候再开始Spill，那Map任务就需要等Spill完成腾出空间之后才能继续写数据；如果Kvbuffer只是满到一定程度，比如80%的时候就开始Spill，那在Spill的同时，Map任务还能继续写数据，如果Spill够快，Map可能都不需要为空闲空间而发愁。两利相衡取其大，一般选择后者。Spill的门限可以通过io.sort.spill.percent，默认是0.8
> spill这个重要的过程是由Spill线程承担，spill线程干的活叫SortAndSpill,顾名思义，在Spill之前还进行Sort操作
(此过程受争议，Spark1.2.0之前为Hash-Based，之后默认设为Sort-Based)

3. Sort
当Spill触发后，SortAndSpill先把KvBuffer中的数据按照partition值，key值进行二次排序，使得最终的结果是按照partition进行聚集，同一partition的key值升序排列

4. Spill
> spill线程为这次Spill过程创建一个磁盘文件：类似于spil1l2.out的文件。Spill把kvbuffer中的数据按照partition进行溢写，直到遍历完所有的partition。 一个partition在文件中称为segment(段)。在这个过程中如果用户配置了combiner,那么在写之前会调用combineAndSpill,对结果做进一步合并之后再写出。
所有的partition对应的数据都放在这个文件里，虽然是顺序存放的，但如何知道在这个文件中的起始位置，以供读取呢？有一个三元组索引这时就出场，三元组包括(起始位置，原始数据长度，压缩之后的数据长度)，一个partition对应一个三元组。
> combiner：combiner其实就是一个本地的reducer，当mapper生成的数据过多时，带宽会成为瓶颈，combiner将本地的key值聚合，实现一次合并，减少本地文件数目，最大限度的减少提高网络IO效率。
MapReduce调优方向2(使用combiner优化IO瓶颈)
但是combiner操作是有风险的，使用它的原则是combiner的输入不会影响到reduce计算的最终输入，例如：如果计算只是求总数，最大值，最小值可以使用combiner，但是做平均值计算使用combiner的话，最终的reduce计算结果就会出错。
5. Merge
> map的任务如果数据量很大，可能会进行好几次Spill,out文件和index文件回产生很多，分布在不同的磁盘上，这时需要把这些文件合并成一个大文件。所以最终把这些文件进行合并的Merge登场，称为merge on disk
> Merge过程通过扫描所有本地目录，将数据文件和索引文件的路径存储在一个数组里面。如果内存足够的话，可以将路径保存在内存中，省去全盘扫描这一步
> 为merge过程创建一个file.out和file.out.index的文件用来存储最终的输出文件。同样按照partition进行遍历。对于某个partition来说，从索引列表中查出所有索引信息，将对应的segment插入到段列表中。然后对这个partition对应的所有Segment进行合并，合并成一个segment。具体过程会分批的进行合并，将第一批的segment进行归并排序(因为已经排序，所以此处也可以采用最小堆的方式进行合并)，输出到一个临时segment，然后重新加入段列表，再进行第二批，直至只存在一个segment，就将segment输出到file.out，索引文件也随之更新。最终的索引文件仍然输出到index文件。

> 至此，Map Shuffle已经结束

#### Reduce Shuffle(对应Spark的Shuffle Read)
> 在Reduce端，shuffle主要分为复制Map输出，排序两个阶段
1. Copy(对应Spark中的fetch)
> Reduce任务通过HTTP向各个Map任务拖取所需要的数据。Reduce会定期向JobTracker获取Map的输出位置，一旦拿到输出位置，Reduce任务就会从此输出对应的TaskTracker上复制输出到本地，而不会等到所有的Map任务结束。
2. Merge Sort
> reduce这边的merge sort是针对不同的Map上的key值和在一块未必是有序的情况，因为MapShuffle中的Merge之后，同一个Map必然是有序的，所以这里的mergeSort实际上就是归并排序的归并过程，归并之后即为整体有序的。Reduce端的排序就是一个逐渐合并的过程
> 一般Reduce是一边copy一边sort，即copy和sort两个阶段是重叠而不是完全分开的。
> 这个过程中，也会出现溢写的情况，所有如果定义过combiner，此处也会生效
3. Group
Sort完成之后进行分组，分组调用默认的GroupingComparator组件
最终Reduce shuffle过程会输出一个整体有序且分好组的数据块。

### Reduce阶段
> 喂给Reducer的数据是<key, [value1, value2, value3, ...]>，后者是一个可迭代的对象，为了reduce函数的实现
> 即reduce方法接收到的是同一个key的一组value，这也是Hadoop 已经实现好的分组功能



## hadoop yarn
> hadoop 集群
