# 什么叫链表
> 链表是线性表的一种，线性表是用来存储有先后顺序的集合，是现实生活中非常常见的一种结构。
> 线性表存在两种存储方式：
* 顺序存储
* 链式存储
> 顺序存储采用相邻的内存空间存储线性结构，访问只需要知道头地址，然后根据索引和数据类型进行推算即可，故访问速度为O(1)。但插入和删除都会导致存储空间的不连续，故内存上空间需要做对应的平移，插入删除速度为O(N)。常用的数组就是采用顺序存储的。
> 链式存储的存储空间未必相邻，但是每个元素都会存在一个指针域，指针域会存储下一个元素的指针域，故在逻辑上是连续的。由于链式存储不需要连续的内存空间，故插入和删除的时间复杂度为O(1)。但访问元素的速度上，必须采用指针的遍历方式进行访问，故访问速度为O(N)。
> 链表是采用链式存储的线性表，链表一般有三种，单链表，双向链表，循环链表
# 为什么要有链表
> HashMap，树，队列等数据结构都是利用链表实现
> 链表对于插入删除频繁的线性表非常适用

# 怎么用链表
## 链表的实现
### 单链表
    public class ListNode{
        public int val;
        public ListNode next;
        // 构造函数, 没有函数类型
        public ListNode(int val){
            this.val = val;
            this.next = null;
        }
    }
### 双链表
    public class DListNode{
        public int val;
        public ListNode prev;
        public ListNode next;
        public DListNode(int val){
            this.val = val;
            this.prev = this.next = null;
        }
    }
## 链表反转
### 遍历链表
> 循环遍历求最后一个节点
    public ListNode iterate(ListNode head){
        ListNode lastNode = null;
        while(head != null){
            // 对节点的操作
            lastNode = head;
            head = head.next;
        }
        return lastNode;
    }
> 递归遍历求最后一个节点
    public ListNode iterate(ListNode head){
        if(head == null || head.next == null){
            return head;
        }
        // 对节点的操作
        ListNode next = head.next;
        lastNode = iterate(next);
        return lastNode;
    }

### 单链表
> 1->2->3->4->null => 4->3->2->1->null
> 遍历链表，然后将每个节点依次往前插, 插至prev的前面，然后将其更新为prev(前插法),最终返回prev作为头结点。短短的五行代码，仅供欣赏。遍历算法，关键在于终止条件。
> 该算法的本质是前插算法
    public ListNode reverse(ListNode head){
        ListNode prev = null;
        while(head != null){
            ListNode next = head.next;  // 先暂存下一个值, 此步至关重要
            head.next = prev; 
            prev = head;
            head = next;
        }
        return prev;
    }

> 递归算法，本质上也是用来遍历，关键在于何时返回，化繁为简，说起来多么容易，实则经过非常巧妙的构思
> 该算法的本质是后插算法
    public ListNode reverse(ListNode head){
        // 第一个条件是判断异常，第二个条件是递归结束条件
        if(head == null || head.next == null){
            return head;
        }
        // 代码本身是对于当前节点和next的交换
        ListNode next = head.next;
        ListNode newHead = reverse(next); 
        next.next = head;
        head.next = null;
        return newHead;
    }
### 双向链表
> 遍历链表，只要将链表的两个方向进行调换即可，逻辑上更简单, 只要遍历链表，最后那个节点就是头结点了，也是非常经典的代码
    public DListNode reverse(DListNode head){
        ListNode cur = null;
        while(head != null){
            cur = head; // 先保存下来
            head = head.next; // 遍历选型
            cur.next = cur.prev;
            cur.prev = head;
        }
        return cur;
    }

## 链表删除
> 链表删除，一般来说需要将节点的前向节点给出，还有一种是狸猫换太子的方法，将下一个节点复制过来，但这种方法不适合尾节点的删除
> O(1) 算法
    public void delete(node){
        // 边界条件
        if(node == null || node.next == null){
            return;
        }
        ListNode next = node.next;
        node.val = next.val;
        node.next = next.next;
    }

## 求链表倒数第K个节点
> 链表和数组有一个非常常用的技巧，快慢指针法
> 设置两个指针，p1, p2, p2比p1快K步，那么p2到达尾节点时，p1处于倒数第K个节点(最后一个节点为倒数第1个)
    public ListNode theKthNode(ListNode head, int k){
        // 边界条件
        if(k < 0 || head == null){
            return null;
        }
        // 初始化快慢指针
        ListNode fast = ListNode slow = head;
        // 快指针前进k-1步, 注意使用next时必须要有约束条件 fast.next != null, 这是常识
        for(int i = k - 1; i > 0 && fast.next != null; i--){
            fast = fast.next;
        }
        // K超过了链表的长度
        if(i > 0){
            return null;
        }
        // fast走到最后时，对应的slow就是倒数第K个节点
        while(fast.next != null){
            fast = fast.next;
            slow = slow.next;
        }
        return slow; 
    }

## 求链表的中间节点
