# LRU缓存
## 缓存
> 缓存实际上是一种广义的概念，在计算机存储层次结构中，第一层的存储器都可以看做是高一层的缓存。比如Cache是内存的缓存，内存是硬盘的缓存，硬盘是网络的缓存
### 缓存解决什么问题？
> 解决存储器性能和容量的矛盾问题。
> 程序按照固定的顺序读写连续内存空间中的数据，所以我们可以缓存哪些经常用到的数据，从而提高读写速度
> 缓存大小是固定的，它应该只保存最常被保存的哪些数据，从而提高读写效果
> 此处介绍一种的简单的缓存替换策略:LRU(Least Recently Used)


### LRU实现了什么功能
> 假设缓存的大小固定，初始状态为空，每发生一次读内存操作，首先查找待读取的数据是否存在于缓存中，若是，则缓存中返回数据，并将数据移动至最新;若否，则缓存未命中，从内存中读取数据，并把该数据添加到缓存中。向缓存添加数据，若缓存已满，则需要删除访问时间最早的那条数据。这就是LRU的基本缓存功能。

> 理想的LRU缓存的读写时间复杂度都是O(1)；
> 对于读效率比较高，最简单的数据结构为HashMap, 但是如果需要获取最早写入缓存的数据，则需要遍历缓存

> 所以遇到问题：就是如何设计一个既能按照时间顺序排序，又能随机访问O(1)的数据结构

> 如果要想时间有序，我们肯定会想到序列(数组和链表) 要想写入的效率为O(1), 自然是链表这种数据结构

> 将节点存入HashMap，并按照双向链表的方式连起来，这样既能访问，又能写入，之所以使用双向链表，原因在于如果访问的节点在中间，我们需要将其移动至最右边，如果私用单链表，就需要通过遍历的方式，获取前驱节点，然后移动至链表尾巴，双向链表有这个好处

> JAVA中已经实现了数据结构LinkedHashMap，就是实现了LRU缓存
public class LRUCacheSimple {

    /**
     * @param args
     */
    public static void main(String[] args) {
        LRUCacheSimple cache = new LRUCacheSimple(2);
        cache.put(1, 1);
        cache.put(2, 2);
        System.out.println(cache.get(1));
        cache.put(3, 3);
        System.out.println(cache.get(2));
        cache.put(4, 4);
        System.out.println(cache.get(1));
        System.out.println(cache.get(3));
        System.out.println(cache.get(4));
    }
    
    private LinkedHashMap<Integer, Integer> map;
    private final int capacity;
    public LRUCacheSimple(int capacity) {
        this.capacity = capacity;
        // 覆盖该方法即会自动删除最老的元素
        map = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true){
            protected boolean removeEldestEntry(Map.Entry eldest) {
                return size() > capacity;
            }
        };
    }
    public int get(int key) {
        return map.getOrDefault(key, -1);
    }
    public void put(int key, int value) {
        map.put(key, value);
    }

}
