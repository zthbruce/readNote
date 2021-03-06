# java内存空间
> java的内存模型是jvm的重点，和数据结构的存储，GC回收关系极大，所以一个优秀的内存模型是jvm运行的关键
> 其中堆和栈是内存空间中最大最重要的两块内存空间
> 其他两块为堆和栈
## 堆
> 存放：堆内存用于存放有new创建的对象和数组。
> 空间回收：由java虚拟机自动垃圾

###GC
> 堆可以分成新生代和老年代。

> 新生代又可以划分为一个Eden区和两个Survivor(幸存区，包括from和to两个)。按照规定，新生的对象首先分配在Eden区。在GC中，Eden中的对象会被移动到survivor中，直到对象满足一定的年龄(定义为熬过minor GC的次数)，会被移动至老年代。

> 新生代和老年代的比例，默认是1:2(该值可以通过参数 –XX:NewRatio 来指定)，即默认一个Eden区，两个Old区

> 默认的，Eden : from : to = 8 : 1 : 1 ( 可以通过参数 –XX:SurvivorRatio 来设定 )，即： Eden = 8/10 的新生代空间大小，from = to = 1/10 的新生代空间大小。

#### GC的意义
1. 垃圾收集的出现解放了C++中手工对内存进行管理的大量繁杂工作，手工malloc,free不仅增加程序复杂度，还增加了bug数量。
2. 分代收集。即在新生代和老生代使用不同的收集方式。在垃圾收集上，目标主要有：加大系统吞吐量（减少总垃圾收集的资源消耗）；减少最大STW（Stop-The-World）时间；减少总STW时间。不同的系统需要不同的达成目标。而分代这一里程碑式的进步首先极大减少了STW，然后可以自由组合来达到预定目标。

#### 可达性检测
1. 引用计数：一种在jdk1.2之前被使用的垃圾收集算法，我们需要了解其思想。其主要思想就是维护一个counter，当counter为0的时候认为对象没有引用，可以被回收。缺点是无法处理循环引用。目前iOS开发中的一个常见技术ARC（Automatic Reference Counting）也是采用类似的思路。在当前的JVM中应该是没有被使用的。

2. 根搜算法：思想是从gc root根据引用关系来遍历整个堆并作标记，称之为mark，等会在具体收集器中介绍并行标记和单线程标记。之后回收掉未被mark的对象，好处是解决了循环依赖这种『孤岛效应』。这里的gc root主要指：
a.虚拟机栈(栈桢中的本地变量表)中的引用的对象
b.方法区中的类静态属性引用的对象
c.方法区中的常量引用的对象
d.本地方法栈中JNI的引用的对象

#### 整理策略
1. 复制：主要用在新生代的回收上，通过from区和to区的来回拷贝。需要特定的结构（也就是Young区现在的结构）来支持，对于新生成的对象来说，频繁的去复制可以最快的找到那些不用的对象并回收掉空间。所以说在JVM里YGC一定承担了最大量的垃圾清除任务。
2. 标记清除/标记整理：主要用在老生代回收上，通过根搜的标记然后清除或者整理掉不需要的对象。

> 为什么要这么做？
思考一下复制和标记清除/整理的区别，为什么新生代要用复制？因为对新生代来讲，一次垃圾收集要回收掉绝大部分对象，我们通过冗余空间的办法来加速整理过程（不冗余空间的整理操作要做swap，而冗余只需要做move）。同时可以记录下每个对象的『年龄』从而优化『晋升』操作使得中年对象不被错误放到老年代。而反过来老年代偏稳定，我们哪怕是用清除，也不会产生太多的碎片，并且整理的代价也并不会太大。

## 方法区
> 静态方法区被称为永久代，因为静态方法区的方法都得存活到程序结束。

## 栈

## 程序计数器

## 堆和栈的区别