# Hadoop Streaming
> 利用标准输入输出的方式，任意脚本都可以运行Hadoop程序
> 只要指定mapper，reducer即可

## 说一说map-reduce过程
> map-reduce过程总的来说是经过Mapper -> shuffle -> Reducer
### mapper
> mapper阶段是对本地存储的数据进行映射，设置一个映射函数，对每条数据进行映射函数
> 如果需要shuffle, 那么map阶段结束后数据是整体有序, 因为经过了shuffle中的sort过程
### shuffle
> 分为map端的 shuffle和reduce端的 shuffle

### map shuffle
> map shuffle分为parition, sort, spill, merge(On disk)四个过程
> partition: map的输出结果 <key, value>, 会根据key值经过partitioner函数计算partitionID
> map的输出结果经过partition过程后，会进入一个环形的数据结构中(kvBuffer),如果数据量超过了内存的80%(一个阈值，可以计算)，则启动溢写spill线程
> spill 线程会首先进行sort，按照partitionID和key进行二次排序
> spill 会将kvbuffer中的数据按照partitioner遍历，写到文件中，一个partitioner会生成一个segment段，如果设置了combiner，会在此时先将数据按照key进行合并，然后再写入文件，可以有效地减少溢写文件数量

> merge on disk
将磁盘上的disk进行合并
还是按照partition进行遍历，对每个partition，找出这个partition对应的segment，加入段列表，然后将segment分批进行归并排序，合并后的重新加入段列表，直至只剩下一个段，就可以写入最终的file.out，对应的索引也对应更新file.index

> reduce shuffle分为copy，mergeSort，group过程
> copy：表示从mapper中获取数据
> mergeSort: 一遍copy一遍sort，依然会出现溢写过程，溢写之后按照key值进行归并排序即可得到最终的结果

这是我自己加的
> group 按照key值 进行分组，将同一个key值的value加入到一个列表中，将数据进行计算

### reducer
Reducer的数据是<key, [value1, value2, value3, ...]>
在这上面运行reduce函数即可