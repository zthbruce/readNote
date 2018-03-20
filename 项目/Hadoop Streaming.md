# Hadoop Streaming
> 利用标准输入输出的方式，任意脚本都可以运行Hadoop程序
> 只要指定mapper，reducer即可

## 说一说map-reduce过程
> map-reduce过程总的来说是经过Mapper -> shuffle -> Reducer
### mapper
> mapper阶段是对本地存储的数据进行映射，设置一个映射函数，对每条数据进行映射函数
> 如果需要shuffle, 那么map阶段结束后数据是整体有序
### shuffle
> 分为map端的 shuffle和reduce端的 shuffle
### map shuffle
> map shuffle分为parition, sort, spill, merge(On disk)四个过程
> map的输出结果

### reducer
