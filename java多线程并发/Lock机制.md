# 多线程锁
java多线程机制中，不得不说的就是锁机制，对于多线程并发运行的情况，锁是非常重要的。

## 为什么会出现锁
> 锁又称同步锁，其主要需求出现在多个线程同时更新某个变量时出现冲突，实现多线程并发时的同步，比如说访问某个变量(读一个列表，索引每次读完都会++)，或者说每次都出队一个元素用于使用(类似于消费者队列，可以采用blockQueue的方式进行实现，多线程出队时，必须保持操作同步)，可能这就是同步锁存在的意义。

## 锁功能架构
> 目前的线程同步锁分为两类，synchronized和Lock类。

> synchronized是java的关键字，是其内部实现的一种方式。

> Lock是java.util.cocurrent中的一个接口，其内部提供的接口为Lock、ReadWriteLock接口，对应接口的实现为ReentrantLock类、ReentrantReadWriteLock类。

## 锁功能对比
### synchronized
> 

### lock
> lock接口实际上是对synchronized的改进

## condition




