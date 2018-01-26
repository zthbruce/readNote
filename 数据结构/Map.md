# 什么叫Map
> Map是一种关联数组的结构，叫字典或者键值对
> JAVA中常用的有HashMap, HashTable, TreeMap(保持Key值有序)
# 为什么要用Map
> 线性表可以描述现实中的线性结构，树可以描述显示生活中的层次结构，而为了描述映射关系，我们需要一种能描述Key-Value的数据结构
> Map在查询，增加，删除上的效率都很高，时间复杂度为O(Buckets.size),Buckets表示槽, 如果只有一个槽，HashMap就退化到了简单的链表结构，复杂度为O(N)

# JAVA的HashMap原码解读
## 什么叫HashMap
> HashMap是一种基于Hash Table(哈希表)的Map，哈希表也叫关联数组，key值经过一个Hash函数得到一个槽(Buckets)的索引，里面保存着我们需要的实际值，而Key值由实际值计算而来。
> ![](pic/hash_table.png)
> HashMap是非常实用的一种数据结构，可以极大的减少查询的时间复杂度。
> 实用Hash表必须要实用相同
## 