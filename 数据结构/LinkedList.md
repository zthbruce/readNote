# 什么叫链表
> 链表是线性表的一种，线性表是用来存储有先后顺序的集合，是现实生活中非常常见的一种结构。
> 线性表存在两种存储方式：
* 顺序存储
* 链式存储
> 顺序存储采用相邻的内存空间存储线性结构，访问只需要知道头地址，然后根据索引和数据类型进行推算即可，故访问速度为O(1)。但插入和删除都会导致存储空间的不连续，故内存上空间需要做对应的平移，插入删除速度为O(N)。常用的数组就是采用顺序存储的。
> 链式存储的存储空间未必相邻，但是每个元素都会存在一个指针域，指针域会存储下一个元素的指针域，故在逻辑上是连续的。由于链式存储不需要连续的内存空间，故插入和删除的时间复杂度为O(1)。但访问元素的速度上，必须采用指针的遍历方式进行访问，故访问速度为O(N)。
> 链表是采用链式存储的线性表，链表一般有三种，单链表，双向链表，循环链表
> ListNode的特点是：可以有多个节点指向当前节点，但是当前节点只能
# 为什么要有链表
> HashMap，树，队列等数据结构都是利用链表实现
> 链表对于插入删除频繁的线性表非常适用
> 链表不需要连续的内存空间，特别是在做归并排序的时候占用内存小
> 实现动态数组

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
> 设置两个指针，slow, fast, fast比slow快K步，那么fast到达尾节点时，slow处于倒数第K个节点(最后一个节点为倒数第1个)
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
> 设置两个指针，slow, fast, fast每次走两步，slow每次走一步，当fast到达尾节点(或者倒数第二个节点)，slow正好处于中间节点（对于奇数个节点来说，中间节点只有一个，正好取之；对于偶数个节点来说，中间节点有两个，取前面那个即可)
    public ListNode midNode(ListNode head){
        // 异常情况
        if(head == null){
            return head;
        }
        // 设置快慢节点初始化
        ListNode slow = ListNode fast = head;
        // 条件中，前者针对奇数情况，后者针对偶数情况
        // 这种条件不是遍历，而是走到最后一个节点(或倒数第一个)即停
        while(fast.next != null && fast.next.next != null){ 
            fast = fast.next.next; // 走两步
            slow = slow.next; // 走一步
        }
        return slow; // 返回慢节点
    }

## 判断链表是否有环
> 这个原理类似于跑步，跑圈时如果一个速度比较快，一个速度比较慢，那么经过一段时间，速度快的必然会和速度慢的相遇
> 同上面一样，设置快慢指针，slow, fast, fast每次走两步，slow每次走一步
    public boolean hasCircle(ListNode head){
        // 异常判断, 可以归并到主逻辑里
        //if(head == null){
        //    return false;
        // }

        // 设置快慢节点初始化
        ListNode fast = head;
        ListNode slow = head;
        // 判断是否能遍历完，这是经验，存在node.next的一定要保证node不为空，node.next.next一定要保证node.next不为空
        while(fast != null && fast.next != null){
            fast = fast.next.next;
            slow = slow.next;
            // 当fast赶上slow时
            if(fast == slow){
                return true;
            }
        }
        // 如果到达尾节点，默认返回false
        return false;
    }

## 判断是否有环，有环返回环的入口
> 首先分析一下这道题，可以得出几个结论
1. 如果存在环，那么快节点fast和慢节点slow必然相遇
> 可由相对速度的方式理解，相当于慢节点slow不动，fast节点以速度v运动，在环里必然相遇
2. 如果相遇，必然是在慢节点运动的第一圈
> 假设slow的速度为v, fast的速度为2*v, slow到达环入口时，fast与slow的距离为s, 环的长度为l, 链表起点到环入口的长度为a,
fast相对于slow的速度为v, 那么追上slow的时间t = s / v <= l / v;
故追上时，slow在圈内走的路程为 v * t <= l; 即走的路程小于环长，故必然是在第一圈内就能追上
(实际上如果路程为环长，那么在入口处就能第一次相遇，说明环长l=a;反过来亦说明当l = a时，两者第一次相遇就在环入口
    l + a = 2 * v * t; 
    a = v * t ;
    => l = a; )
> 设相遇时slow节点距环口的距离为b, 设slow走了n步，则fast走了2*n步
    则slow节点走的路程为 a + b = n
    此时fast节点走的路程为 a + b + k * l = 2*n
    可知 n = k * l = a + b;
    故如果此时slow从该相遇点继续走，走n步会继续回到该相遇点
    而fast以slow的步长从链表节点开始，走n步也会回到该相遇点
    这种情况只会在入口就相遇的情况下才会满足(如果入口不相遇，那么两者永远不会相遇，因为速度一致)
> 故结题思路为：
    从链表头结点开始，fast每次走2步，slow每次走1步，当两者相遇时，则确定链表有环。
    此时让fast回到链表头结点，每次走1步，当再次相遇时，相遇点即为链表入口。
> 代码如下:
    public ListNode getLoopPoint(ListNode head){
        // 异常检测， 点数小于三个以下的都不可能有环
        if(head == null || head.next == null || head.next.next == null){
            return null;
        }
        // 判断是否有环
        ListNode fast = head;
        ListNode slow = head;
        //ListNode meetPoint = null;
        while(fast != null && fast.next != null){
            fast = fast.next.next; // 走两步
            slow = slow.next;
            // 如果两者相遇, 循环结束
            if(slow == fast){
                break;
            }
        }
        // 如果已经结束了，而且两者不相等，说明没有环
        if(slow != fast){
            return null;
        }
        // 确定环入口
        fast = head; // 将fast重新回到head, 并且每次走一步
        // 直到相遇为止
        while(fast != slow){
            fast = fast.next;
            slow = slow.next;
        }
        return slow;
    }


## 判断链表是否相交(不带环)
> 首先，什么叫链表相交，对于单链表比较直观的就是Y型，因为链表只能有一个next，所以从相交点之后的节点是两个链表所共有。
> 解题思路：
1. 最简单的方法就是双重遍历，时间复杂度为O(N1*N2)
2. 引入数据结构HashMap，时间复杂度为O(N),空间复杂度为O(N),典型的用空间换取时间的做法,实际应用最多。
3. 如果将两个链表的头结点连起来，那么就会形成一个带环的链表，利用判断是否有环来确定是否相交，时间上是线性的，空间上是常数
4. 一旦相交之后，节点必然为公共节点，因为无环，所以存在尾节点，且尾节点必然相同，这是一个充分必要条件；时间复杂度O(N1+N2),空间复杂度O(1)
> 四种结题思路中，第四种最简单，效率最高，选取第四种实现
    public boolean isIntersectWithoutLoop(ListNode head1, ListNode head2){
        // 异常情况
        if(head1 == null || head2 == null){
            return false;
        }
        while(head1.next != null){
            head1 = head1.next; // 遍历
        }
        while(head2.next != null){
            head2 = head2.next;
        }
        return head1==head2;
    }

## 两个无环链表相交，给出相交节点
> 利用快慢指针的方法，设链表1的长度为L1, 链表2的长度为L2, 对于长的链表, 先走|L2-L1|步，然后两者同时遍历，第一次相等即为相交节点。
> 也可以判断环入口的方法，但是没有上述的方便
    public ListNode intersectNode(ListNode head1, ListNode head2){
        // 异常情况
        if(head1 == null || head2 == null){
            return null;
        }
        int length1 = 0;
        int length2 = 0;
        int dis = 0;
        ListNode cur1 = head1;
        ListNode cur2 = head2;
        ListNode fast = null;
        ListNode slow = null;
        // 遍历链表1, 计算链表的长度
        while(cur1 != null){
            cur1 = cur1.next;
            length1++;
        }
        // 遍历链表2, 计算链表的长度
        while(cur2 != null){
            cur2 = cur2.next;
            length2++;
        }
        // 设置快节点和慢节点以及距离
        if(length1 >= length2){
            fast = head1;
            slow = head2;
            dis = length1- length2;
        }
        else{
            fast = head2;
            slow = head1;
            dis = length2- length1;
        }
        // 快节点移动dis距离
        for(int i = dis; i > 0; i--){
            fast = fast.next;
        }
        // 一旦两链表对齐，最终必然会结束，即使没有交点，那么则同为null，循环仍然结束，且fast=null
        while(fast != slow){
            fast = fast.next;
            slow = slow.next;
        }
        return fast;
    }

## 判断两个链表是否相交（综合版)(链表可以带环)
> 如果链表带环，那么第三种方法和第四种方法都不能使用
> 试想，如果带环的话，该环必然是两个链表的公共节点，通过这个特性做文章
> 只需取环内一点，判断是否属于另一个链表
至于取环内一点，则只需改造一下hasCircle函数即可
    public ListNode circleNode(ListNode head){
        // 异常判断, 可以归并到主逻辑里
        //if(head == null){
        //    return false;
        // }
        // 设置快慢节点初始化
        ListNode fast = ListNode slow = head;
        // 判断是否能遍历完，这是经验，存在node.next的一定要保证node不为空，node.next.next一定要保证node.next不为空
        while(fast != null && fast.next != null){
            fast = fast.next.next;
            slow = slow.next;
            // 当fast赶上slow时
            if(fast == slow){
                return fast;
            }
        }
        // 如果到达尾节点，默认返回false
        return null;
    }
    // 是否相交
    public boolean isIntersect(ListNode head1, ListNode head2){
        // 取环内节点
        ListNode circleNode1 = circleNode(head1);
        ListNode circleNode2 = circleNode(head2);
        //// 一个带环一个不带环，可以归并到最后一行上面
        //if((circleNode1 == null && circleNode2 != null) || (circleNode1 == null && circleNode2 != null)){
        //    return false;
        //}
        // 两个都不带环
        if(circleNode1 == null && circleNode2 == null){
            return isIntersectWithoutLoop(head1, head2); // 判断无环
        }
        // 两个都带环
        // 绕其中一环一圈
        if(circleNode1 != null && circleNode2 != null){
            ListNode tmp = circleNode1.next;
            // 转一圈
            while(tmp != circleNode1){
                if(tmp == circleNode2){
                    return true;
                }
                tmp = tmp.next; // 遍历tmp
            }
        }
        return false;
    }


## 两个有序链表进行归并排序
> 归并排序是针对两个有序链表，比较对应节点，将较小的节点归并到
> 遍历算法, 先将头结点取出，然后之后将节点挂到后头
    public ListNode mergeSort(ListNode head1, ListNode head2){
        // 异常情况
        // 如果链表1为空
        if(head1 == null){
            return head2;
        }
        // 如果链表2为空
        if(head2 == null){
            return head1;
        }
        // 定义头结点
        ListNode newHead;
        if(head1.val > head2.val){
            newHead = head2;
            head2 = head2.next; // 谁小谁前进一步
        }
        else{
            newHead = head1;
            head1 = head1.next; // 谁小谁前进一步
        }
        ListNode cur = newHead;
        // 遍历链表, 当两者都没结束时
        while(head1 != null && head2!=null){
            if(head1.val < head2.val){
                cur.next = head1;
                cur = head1;
                head1 = head1.next;
            }
            else{
                cur.next = head2;
                cur = head2;
                head2 = head2.next;
            } 
        }
        // 
        ListNode tmpHead;
        // 如果链表1结束，则将链表2的剩余部分加上即可
        if(head1 == null){
            tmpHead = head2;
        }else{
            tmpHead = head1;
        }
        // 遍历剩余的部分加上即可
        cur.next = tmpHead;
        return newHead;
    }
> 递归算法，递归算法写起来非常的优雅，递归算法最重要的是终止条件
    public ListNode mergeSort(ListNode head1, ListNode head2){
        // 异常判断与终止条件
        // 一旦有一个链表已经结束了，那么递归结束
        if(head1 == null){
            return head2;
        }
        if(head2 == null){
            return head1;
        }
        ListNode head = null; // 最好写上初始化
        // 比较两个节点, 小者往前走
        if(head1.val < head2.val){
            head = head1;
            head.next = mergeSort(head1.next, head2);
        }
        else{
            head = head2;
            head.next = mergeSort(head1, head2.next);
        }
        return head;
    }
