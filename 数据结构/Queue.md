# 队列
> 队列是一种特殊的线性表，符合先进先出的规律
# 为什么使用队列
> 队列符合现实生活中排队的概念，可用于一些局限先后顺序的场景
> 广度优先遍历：利用队列，将每一层的节点先入队，然后出队时，将子节点继续入队
> 

# 队列的常用算法
## 使用链表创建队列，便于扩充
## 使用数组进行运算时，一旦数组满了，就得进行扩容
// 链表结点
public class ListNode{
    int val;
    ListNode next; // 后驱节点
    public ListNode(int val){
        this.val = val;
    }
}
// 队列，需要头结点和尾节点
public class Queue{
    ListNode front; // 队首
    ListNode rear; // 队尾
    // 入队操作
    public void offer(int val){
        ListNode node = ListNode(val);
        // 更新队首
        if(front==null){
            front = node; // 头结点
        }
        // 更新队尾
        if(rear==null){
            rear = node;
        }
        else{
            rear.next = node;
            rear = node;
        }
    }

    // 出队操作
    public int poll(){
        if(front == null){
            return null;
        }
        else{
            ListNode node = front;
            front = front.next;
            return node.val;
        }   
    }
    // 取队首元素
    public int peek(){
        if(front == null){
            return null;
        }
        else{
            return front.val;
        }   
    }
}

## 使用两个栈实现队列
> 使用两个栈实现队列，实际上是利用stack1存储数据，stack2用于弹出数据，负负得正，顺序变为先进先出
import java.util.Stack;
public class Queue{
    // 声明两个栈
    private Stack<Integer> stack1 = new Stack<>();
    private Stack<Integer> stack2 = new Stack<>();

    // 入队
    public void offer(int data){
        stack1.push(data);
    }

    // 出队
    public int poll(){
        // 由stack2出队
        // 如果stack2为空，说明需要加入数据
        if(stack2.isEmpty()){
            while(!stack1.isEmpty()){
                stack2.push(stack1.pop()); // stack1弹栈进入stack2
            }
        }
        // 如果仍未空，说明为空队列
        if(stack2.isEmpty()){
            return null;
        }
        return stack2.pop(); // 将stack2弹栈
    }
    // 取队列首元素，只需将return stack2.pop();改为 return stack2.peek();
}

## 循环队列
> 循环队列采用数组作为底层结构，为避免空间的浪费，将rear, front根据size取模运算
> 循环队列最需要注意的就是边界条件：何时为空，何时为满
> 解决边界条件，空时不能出队，满时不能入队
> 解决方法有多种
(1)记录队列数目count
(2)若(rear + 1) % length == front 则为满，若rear = front，则为空
    public class ArrayQueue{
        int front;
        int rear;
        int count;
        int[] arr;
        public ArrayQueue(int size){
            this.arr = new int[size];
        }
        // 入队操作
        public boolean offer(int data){
            // 判断是否已经满了
            if(count == arr.length){
                return false;
            }
            // 如果没满
            arr[rear] = data;
            rear = (rear + 1) % arr.length;
            count++;
            return true;
        }
        // 出队操作
        public int poll(){
            // 判断是否为空
            if(count == 0){
                return null;
            }
            // 注意不管出队还是入队，此处都是+1
            int val = arr[front];
            front = (front + 1) % arr.length;
            count--;
            return val;
        }

        // 取队首元素
        public int peek(){
            // 判断是否为空
            if(count == 0){
                return null;
            }
            return arr[front];
        }

        // 取队列size
        public int size(){
            return count;
        }
    }